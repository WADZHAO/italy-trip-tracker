# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` — start Vite dev server on port 3000 (auto-opens browser)
- `npm run build` — production build to `dist/`
- `npm run preview` — preview the production build

There are no tests, no linter, and no type checker configured. Don't invent commands for them.

## Architecture

This is a **single-page React + Vite PWA** for tracking a personal Italy trip. The entire app is one self-contained component file — there is no router, no state management library, no CSS files, and no component library.

### The monolith: `src/components/ItalyTripTracker.jsx`

~950 lines containing every screen, sub-component, and helper. The root `ItalyTripTracker` component owns all top-level state (`tripName`, `tripDates`, `heroPhotos`, `schedule`, `expenses`, `packingList`, `journalEntries`, `themeId`) and threads it down as props. The five tabs (Trip / Schedule / Expenses / Packing / Journal) are rendered conditionally based on a `tab` index — there is no routing.

When adding a new feature, expect to extend this file rather than create new ones. Only split a piece out if it grows large enough to obscure the file's structure.

### Theming

All visual styling lives in inline `style={{...}}` props (no Tailwind, no CSS modules, no styled-components). Colors come from the `THEMES` object at the top of `ItalyTripTracker.jsx`. Components receive the active theme as a `T` prop and pull tokens like `T.accent`, `T.bgCard`, `T.textSoft`. Helper factories `mkCard(T)`, `mkLbl(T)`, `mkInp(T)`, `mkPill(T, on)` build common style objects from the theme.

When adding a new theme, it must define every key the existing themes have — partial themes will break components that read missing tokens. When adding a component, accept `T` as a prop and use the helpers rather than hard-coding colors.

### Persistence

State is auto-saved to `localStorage` under the key `italy-trip-data` (see `loadData` / `saveData` near the bottom of the file). The root component loads on mount and writes on every state change after `loaded` flips true. There is no backend, no API, no auth — losing localStorage means losing the trip data.

When adding new top-level state, add it to both the `loadData` hydration block and the `saveData` dependency array, or it won't persist.

### External services (no API keys)

- `api.open-meteo.com` — current weather, called from `useWeather` after a `navigator.geolocation` prompt
- `nominatim.openstreetmap.org` — reverse-geocoding lat/lon to a city name

Both are free and keyless. Be mindful of Nominatim's usage policy if adding more calls.

### PWA

`public/sw.js` is a minimal service worker (network-first, falls back to cache) registered from `src/main.jsx`. `public/manifest.json` declares the app for "Add to Home Screen". The viewport is locked to `maximum-scale=1.0` and the layout is capped at `maxWidth: 480` — this app is mobile-first and assumes a phone-sized viewport.

## Conventions specific to this repo

- New UI: inline styles using the `T` theme tokens and `mk*` helpers, not new CSS files.
- Currency: amounts are stored in EUR; the `EUR_TO_USD` constant (top of file) is the only conversion. USD is display-only.
- Dates: stored as `YYYY-MM-DD` strings; `todayStr()` and `diffDays(a, b)` helpers exist near the top.
- Lists with reordering use the `reorder(arr, from, to)` helper.
