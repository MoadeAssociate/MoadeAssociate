# MOADE Associates — Official Website

> **Reimagining Legal Support & Strategy for Growth in Africa**  
> A bespoke, modern web presence for **MOADE Associates**, a leading virtual commercial legal practice and consulting firm based in Lekki, Lagos, Nigeria.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/xamorite/moade-associates)

---

## 🏛️ About MOADE Associates

MOADE Associates helps businesses, creatives, and entrepreneurs build the legal systems and structures they need to grow strategically and sustainably. The firm provides forward-thinking counsel across corporate law, intellectual property, startups, media/entertainment, and dispute resolution.

- **Location:** Lekki, Lagos, Nigeria
- **Operating Hours:** Monday – Friday, 10:00 AM – 4:00 PM (WAT)
- **Direct Channels:** WhatsApp (`+234 815 338 0312`) · Phone (`0816 552 8752`) · Email (`admin@moadeassociates.com`)

---

## ✨ Features

- **Architectural Editorial Design**: Styled with a tailored palette (`#5DE1E6` cyan, `#F5F2EC` paper, `#EFDAC7` peach, `#202226` deep ink) and Plus Jakarta Sans typography.
- **Client Trust & Practice Showcase**:
  - Interactive multi-brand testimonial carousel featuring Cobalt, Squared Lab, Ahava, Gaise Baba, BME, Numio, and more.
  - Comprehensive Practice Area directory with accessible accordion deep-dives.
  - Interactive dynamic metric counters ("30+ Years of Experience", "50+ Retained Clients", "₦1.2B+ In Asset Value").
- **Consultation Gateway**: Direct booking and structured consultation request form with seamless WhatsApp integration.
- **Mobile-First UX**: Dedicated ergonomic floating quick-action bar with safe-area inset protection for mobile visitors.
- **Production-Ready Performance**: Zero-runtime CSS compiled via Tailwind CSS v4, optimized responsive assets, semantic WCAG AA accessible markup.

---

## 🛠️ Tech Stack

- **Markup**: Semantic HTML5 (accessible landmarks, schema-ready metadata)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) via `@tailwindcss/cli`
- **JavaScript**: Vanilla ES6+ (`app.js`) — lightweight, zero third-party framework overhead
- **Deployment**: [Vercel](https://vercel.com) with automated continuous deployment & caching headers

---

## 🚀 Local Development

### Prerequisites
- [Node.js](https://nodejs.org/) (v20.0.0 or later)
- npm (v10 or later)

### Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/xamorite/moade-associates.git
   cd moade-associates
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start Tailwind in watch mode:**
   ```bash
   npm run dev
   ```

4. **Serve locally:**
   In another terminal, start a local HTTP server:
   ```bash
   npx serve .
   # or
   python3 -m http.server 8080
   ```
   Open `http://localhost:8080` or `http://localhost:3000` in your browser.

---

## 📦 Build for Production

Compile minified CSS for deployment:
```bash
npm run build
```
The output file is written to `dist/styles.css`.

---

## ☁️ Vercel Deployment

This project is pre-configured for Vercel with [`vercel.json`](vercel.json):
```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "buildCommand": "npm run build",
  "outputDirectory": ".",
  "cleanUrls": true
}
```

Whenever you push commits to GitHub, Vercel automatically runs `npm run build` and deploys the update to your live domain.

---

## 📄 License
Private & Proprietary © MOADE Associates. All rights reserved.
