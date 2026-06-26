require('dotenv').config();
const express    = require('express');
const cors       = require('cors');
const helmet     = require('helmet');
const rateLimit  = require('express-rate-limit');
const path       = require('path');
const { Pool }   = require('pg');
const jwt        = require('jsonwebtoken');
const bcrypt     = require('bcryptjs');
const multer     = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

const app  = express();
const PORT = process.env.PORT || 3000;

/* ── DB ── */
const connectionString = process.env.DATABASE_URL;
const pool = new Pool({
  connectionString,
  ssl:
    connectionString.startsWith("postgres://localhost") ||
    connectionString.startsWith("postgresql://localhost") ||
    connectionString.includes("@localhost:") ||
    connectionString.includes("@127.0.0.1:")
      ? false
      : { rejectUnauthorized: false },
});

/* ── Cloudinary ── */
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD,
  api_key:    process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

/* ── Multer → Cloudinary ── */
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder:          'mdb-site',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation:  [{ width: 1600, quality: 'auto', fetch_format: 'auto' }],
  },
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

/* ── Security ── */
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc:  ["'self'"],
      scriptSrc:   ["'self'", "'unsafe-inline'", "cdnjs.cloudflare.com", "fonts.googleapis.com"],
      styleSrc:    ["'self'", "'unsafe-inline'", "fonts.googleapis.com"],
      fontSrc:     ["'self'", "fonts.gstatic.com"],
      /* FIX: Cloudinary URLs use res.cloudinary.com — keep full hostname.
         Added https: as a broad fallback in case your cloud subdomain differs. */
      imgSrc:      ["'self'", "data:", "blob:", "images.unsplash.com", "res.cloudinary.com", "https://res.cloudinary.com"],
      connectSrc:  ["'self'", "https://wa.me", "https://api.whatsapp.com"],
    },
  },
}));

/* General rate limit for all routes */
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 300 }));

/* Tighter limit specifically for auth routes to prevent brute-force */
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20 });

app.use(cors({ origin: process.env.ALLOWED_ORIGIN || '*' }));
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

/* ── Static files ── */
app.use('/public', express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname)));

/* ── Sitemaps / robots ── */
app.get('/sitemap.xml', (_req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'sitemap.xml'));
});
app.get('/robots.txt', (_req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'robots.txt'));
});

/* ══════════════════════════════════════════════════
   DB INIT
══════════════════════════════════════════════════ */
async function initDB() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS admins (
      id       SERIAL PRIMARY KEY,
      email    TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS site_content (
      id         SERIAL PRIMARY KEY,
      page       TEXT NOT NULL,
      section    TEXT NOT NULL,
      type       TEXT NOT NULL,
      value      TEXT NOT NULL,
      updated_at TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(page, section)
    );
  `);

  const exists = await pool.query(
    'SELECT id FROM admins WHERE email=$1',
    [process.env.ADMIN_EMAIL]
  );
  if (!exists.rows.length) {
    const hash = await bcrypt.hash(process.env.ADMIN_PASSWORD, 12);
    await pool.query(
      'INSERT INTO admins(email,password) VALUES($1,$2)',
      [process.env.ADMIN_EMAIL, hash]
    );
    console.log('✓ Admin seeded:', process.env.ADMIN_EMAIL);
  }

  console.log('✓ DB ready');
}

/* ══════════════════════════════════════════════════
   AUTH MIDDLEWARE
══════════════════════════════════════════════════ */
function authMiddleware(req, res, next) {
  const header = req.headers.authorization || '';
  const token  = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'No token' });
  try {
    req.admin = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
}

/* ══════════════════════════════════════════════════
   AUTH ROUTES
══════════════════════════════════════════════════ */
app.post('/api/admin/login', authLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ error: 'Email and password required' });

    const result = await pool.query('SELECT * FROM admins WHERE email=$1', [email]);
    const admin  = result.rows[0];
    if (!admin) return res.status(401).json({ error: 'Invalid credentials' });

    const ok = await bcrypt.compare(password, admin.password);
    if (!ok)  return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign(
      { id: admin.id, email: admin.email, role: 'admin' },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );
    res.json({ token });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/admin/verify', authMiddleware, (req, res) => {
  res.json({ ok: true, email: req.admin.email });
});

/* ══════════════════════════════════════════════════
   CONTENT ROUTES
══════════════════════════════════════════════════ */
app.get('/api/content/:page', async (req, res) => {
  try {
    const { page } = req.params;
    const result = await pool.query(
      'SELECT section, type, value FROM site_content WHERE page=$1',
      [page]
    );
    const map = {};
    result.rows.forEach(r => { map[r.section] = { type: r.type, value: r.value }; });
    res.json(map);
  } catch (err) {
    console.error('Content fetch error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/content', authMiddleware, async (req, res) => {
  try {
    const { page, section, type, value } = req.body;
    if (!page || !section || !type || value === undefined)
      return res.status(400).json({ error: 'Missing fields' });

    await pool.query(`
      INSERT INTO site_content(page, section, type, value, updated_at)
      VALUES($1,$2,$3,$4,NOW())
      ON CONFLICT(page,section) DO UPDATE
        SET type=$3, value=$4, updated_at=NOW()
    `, [page, section, type, value]);

    res.json({ ok: true });
  } catch (err) {
    console.error('Content save error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

/* ── Image upload ──
   FIX 1: multer-storage-cloudinary exposes the URL as req.file.path in
   older versions and req.file.secure_url (or req.file.url) in newer ones.
   We fall back through all three so it works regardless of package version.
   FIX 2: server now returns { ok, url } so the client can read data.url. */
app.post('/api/upload', authMiddleware, upload.single('image'), async (req, res) => {
  try {
    const { page, section } = req.body;

    if (!req.file)         return res.status(400).json({ error: 'No file uploaded' });
    if (!page || !section) return res.status(400).json({ error: 'Missing page/section' });

    /* multer-storage-cloudinary version compatibility */
    const url = req.file.secure_url || req.file.path || req.file.url;

    if (!url) {
      console.error('[MDB Upload] Cloudinary file object has no URL:', req.file);
      return res.status(500).json({ error: 'Upload succeeded but could not read URL from Cloudinary response' });
    }

    await pool.query(`
      INSERT INTO site_content(page, section, type, value, updated_at)
      VALUES($1,$2,'image',$3,NOW())
      ON CONFLICT(page,section) DO UPDATE
        SET type='image', value=$3, updated_at=NOW()
    `, [page, section, url]);

    /* FIX: return 'url' key so client code (data.url) works correctly */
    res.json({ ok: true, url });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ error: 'Server error during upload' });
  }
});

app.delete('/api/content', authMiddleware, async (req, res) => {
  try {
    const { page, section } = req.body;
    if (!page || !section)
      return res.status(400).json({ error: 'Missing page/section' });

    await pool.query(
      'DELETE FROM site_content WHERE page=$1 AND section=$2',
      [page, section]
    );
    res.json({ ok: true });
  } catch (err) {
    console.error('Content delete error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

/* ══════════════════════════════════════════════════
   CATCH-ALL — serves index.html from root
══════════════════════════════════════════════════ */
app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

/* ── Global error handler — always returns JSON for API routes ── */
app.use((err, req, res, _next) => {
  console.error('Unhandled error:', err);
  if (req.path.startsWith('/api/')) {
    return res.status(500).json({ error: 'Server error' });
  }
  res.status(500).sendFile(path.join(__dirname, 'index.html'));
});

/* ── START ── */
initDB().then(() => {
  app.listen(PORT, () => {
    console.log('\n');
    console.log('  ┌─────────────────────────────────────────────┐');
    console.log('  │  🏛️  MODERN DESIGNERS & BUILDERS            │');
    console.log('  │  Premium Architecture & Construction         │');
    console.log(`  │  Server running → http://localhost:${PORT}      │`);
    console.log('  └─────────────────────────────────────────────┘');
    console.log('\n');
  });
}).catch(err => {
  console.error('DB init failed:', err);
  process.exit(1);
});