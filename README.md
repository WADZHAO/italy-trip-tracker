# 🇮🇹 Italy Trip Tracker

A personal trip companion app for tracking your Italy adventure — schedule, expenses, packing, journal, and more.

Built with React + Vite. Works as a Progressive Web App (PWA) on iPhone and Android.

## Features

- **Trip Dashboard** — Emergency numbers, photo carousel, daily/total spend, spending insights
- **Schedule** — Day-by-day itinerary with booking details (confirmation #, address, phone, URL), editable and reorderable
- **Expenses** — Track spending in EUR + USD, quick-add buttons, category breakdown, editable entries
- **Packing List** — Organized by category with select-all, add items inline, progress tracking
- **Journal** — Photo memories with city/date tags, editable entries, reorderable
- **Photo Carousel** — Multi-photo upload with crop tool, infinite scroll, auto-advance
- **6 Color Themes** — Sand & Amber, Positano Pink, Capri Coastline, Amalfi Sunset, Tuscan Villa, Venetian Gold
- **Persistent Storage** — All data auto-saves to localStorage
- **PWA Ready** — Add to home screen for app-like experience
- **Weather** — Live temperature and city from geolocation

## Getting Started

### Prerequisites
- Node.js 18+ installed

### Install & Run
```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production
```bash
npm run build
```

Output goes to `dist/` folder.

## Deploy

### Vercel (recommended)
1. Push to GitHub
2. Go to [vercel.com](https://vercel.com) → New Project → Import your repo
3. Framework: Vite → Deploy
4. Your app is live at `your-project.vercel.app`

### Netlify
1. Push to GitHub
2. Go to [netlify.com](https://netlify.com) → Add new site → Import from Git
3. Build command: `npm run build` / Publish directory: `dist`
4. Deploy

## PWA / Add to Home Screen

On iPhone Safari:
1. Open your deployed URL
2. Tap the Share button (⬆️)
3. Tap "Add to Home Screen"
4. Your app now has its own icon and runs fullscreen

**Note:** Replace `public/icon-192.png` and `public/icon-512.png` with your custom app icon.

## Customizing

### Replace the Avatar/Logo
1. Generate your logo image (Midjourney, Gemini, etc.)
2. Save it to `src/assets/logo.png`
3. Update the `CoupleAvatar` component in `src/components/ItalyTripTracker.jsx` to use `<img>` instead of SVG

### Add More Themes
Edit the `THEMES` object at the top of `ItalyTripTracker.jsx`. Each theme needs: `bg`, `bgCard`, `cream`, `sand`, `border`, `accent`, `accentLt`, `ocean`, `oceanLt`, `text`, `textMid`, `textSoft`, `green`, `heroGrad`, `todayBg`, `todayBorder`, `totalBg`, `totalBorder`.

### Edit with Claude Code
```bash
# Install Claude Code
npm install -g @anthropic-ai/claude-code

# Navigate to your project
cd italy-trip-tracker

# Start Claude Code
claude

# Then just describe what you want:
# "Add a currency converter tab"
# "Change the quick-add coffee price to €4"
# "Make the couple avatar's hat blue"
```

## Project Structure

```
italy-trip-tracker/
├── public/
│   ├── manifest.json      # PWA manifest
│   ├── sw.js              # Service worker
│   ├── icon-192.png       # App icon (replace with yours)
│   └── icon-512.png       # App icon large (replace with yours)
├── src/
│   ├── components/
│   │   └── ItalyTripTracker.jsx   # Main app (all-in-one)
│   └── main.jsx           # Entry point
├── index.html
├── vite.config.js
├── package.json
└── README.md
```

## Tech Stack

- **React 18** — UI framework
- **Vite** — Build tool
- **Lora + Nunito** — Google Fonts
- **localStorage** — Data persistence
- **Open-Meteo API** — Weather (free, no key needed)
- **OpenStreetMap Nominatim** — Reverse geocoding (free)

## License

Personal use. Built with ❤️ and Claude.

---

*Buon viaggio!* 🇮🇹✈️
