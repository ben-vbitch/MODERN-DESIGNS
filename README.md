# 🏛️ Modern Designers & Builders
### Premium Architectural & Construction Website

> **Stack:** HTML5 · CSS3 (custom, no framework) · Vanilla JS · GSAP 3 · Node.js · Express

---

## Project Structure

```
modern-designers-builders/
├── index.html              # Full single-page website
├── server.js               # Express backend (static + contact API)
├── package.json
├── .env.example            # Copy to .env and configure
└── public/
    ├── css/
    │   └── styles.css      # ~940 lines — full premium UI
    └── js/
        └── main.js         # ~300 lines — GSAP, cursor, slider, form
```

---

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Configure environment (optional — for email)
cp .env.example .env
# Edit .env with your SMTP credentials

# 3. Start the server
npm start          # production
npm run dev        # development (nodemon hot-reload)

# 4. Open your browser
# → http://localhost:3000
```

---

## Features

| Feature | Detail |
|---|---|
| **Hero** | Fullscreen cinematic photo, Ken Burns effect, CSS line-reveal title, architectural canvas grid |
| **Navigation** | Glassmorphism fixed nav, scroll-spy active links, animated mobile menu |
| **About** | Asymmetric split layout, clip-path image, floating badge |
| **Services** | 3×2 premium card grid, hover glow + border sweep + icon animation |
| **Projects** | Masonry grid, filter by category (GSAP fade), cinematic hover overlay |
| **Stats** | Animated counters, radial gradient backdrop, feature marquee |
| **Process** | 3×2 timeline with perspective connector line, stagger reveal |
| **Testimonials** | Glassmorphism cards, auto-sliding, touch swipe, keyboard nav |
| **Contact** | Split layout, form → `/api/contact` API, Nodemailer email dispatch |
| **Footer** | Dark grid texture, social icons, multi-column nav |
| **Cursor** | Custom gold ring + dot with smooth lerp, hover expand state |
| **Animations** | GSAP ScrollTrigger reveals, parallax hero, CSS keyframe title |
| **Responsive** | Fully responsive — mobile, tablet, desktop |

---

## Customising

### Company details
Edit `index.html` — search for placeholders:
- `+91 XXXXX XXXXX` → real phone number
- `contact@moderndesignersbuilders.in` → real email
- `Palakkad, Kerala` → your actual address

### Colours
All colour tokens are CSS custom properties at the top of `styles.css` — change once, updates everywhere:
```css
:root {
  --gold:   #C9A84C;   /* primary accent */
  --copper: #B87333;   /* secondary accent */
  --black:  #070707;   /* page background */
  /* … */
}
```

### Images
Replace Unsplash URLs in `index.html` with your actual project photographs.

### Email
Set `SMTP_USER`, `SMTP_PASS`, and `CONTACT_EMAIL` in `.env`.
For Gmail, generate an App Password at https://myaccount.google.com/apppasswords

---

## Production Deployment

```bash
# Set environment
NODE_ENV=production

# Run with PM2 (recommended)
npm install -g pm2
pm2 start server.js --name mdb-website
pm2 save
```

---

*Precision · Elegance · Innovation*
