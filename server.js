require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "cdnjs.cloudflare.com", "fonts.googleapis.com"],
      styleSrc: ["'self'", "'unsafe-inline'", "fonts.googleapis.com"],
      fontSrc: ["'self'", "fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "images.unsplash.com"],
      connectSrc: ["'self'", "https://wa.me", "https://api.whatsapp.com"],
    },
  },
}));

app.use(cors({ origin: process.env.ALLOWED_ORIGIN || '*' }));
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use('/public', express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname)));
app.get('/sitemap.xml', (_req, res) => {res.sendFile(path.join(__dirname, 'public', 'sitemap.xml'));});
app.get('/robots.txt', (_req, res) => {res.sendFile(path.join(__dirname, 'public', 'robots.txt'));});
app.get('*', (_req, res) => {res.sendFile(path.join(__dirname, 'index.html'));});

app.listen(PORT, () => {
  console.log('\n');
  console.log('  ┌─────────────────────────────────────────────┐');
  console.log('  │  🏛️  MODERN DESIGNERS & BUILDERS            │');
  console.log('  │  Premium Architecture & Construction         │');
  console.log(`  │  Server running → http://localhost:${PORT}      │`);
  console.log('  └─────────────────────────────────────────────┘');
  console.log('\n');
});