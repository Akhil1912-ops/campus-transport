# Passenger Website — Tech Stack & Reasoning

> Why each technology was chosen for the passenger-facing web app.

---

## 1. Overview

| Layer | Our choice | Alternative considered |
|-------|------------|------------------------|
| Framework | React | Vue, Svelte, SolidJS |
| Build tool | Vite | Webpack, Turbopack |
| Map library | Leaflet | MapLibre GL, OpenLayers |
| Map tiles | OpenStreetMap | Mapbox (paid), Stadia (free) |
| Styling | Tailwind CSS | Plain CSS, styled-components |
| Realtime client | Phoenix (`phoenix` npm) | phoenix-channels, phoenix-websocket |
| Hosting | Vercel | Netlify, Cloudflare Pages |

---

## 2. Framework: React

### What it does
- Component-based UI
- State management for map markers, connection state, modals
- Large ecosystem of map integrations

### Reasoning
- **Ecosystem:** Biggest community, most map examples (react-leaflet), most Stack Overflow answers
- **Phoenix integration:** `use-phoenix-channel` and `phoenix` npm work well with React
- **Jobs/tutorials:** If you hand off or hire, React is the easiest to find
- **Performance:** Not the fastest in benchmarks, but fine for our use case (map + ~250 markers)

### Benchmarks (js-framework-benchmark 2024)
| Framework | Create 1K rows (ops/sec) | Startup | Bundle |
|-----------|--------------------------|---------|--------|
| SolidJS | 42.8 | 28ms | — |
| Svelte 5 | 39.5 | 32ms | 15 KB |
| Vue 4 | 31.2 | 45ms | 38 KB |
| **React 19** | **28.4** | **52ms** | **45 KB** |

**Honest:** Svelte and SolidJS are faster. React was chosen for ecosystem and familiarity, not raw speed.

### If we wanted best performance
- **Svelte 5** or **SolidJS** — smaller bundles, faster startup
- Trade-off: fewer map examples, smaller ecosystem

---

## 3. Build Tool: Vite

### What it does
- Bundles React for production
- Dev server with hot reload (HMR)
- Handles imports, TypeScript, etc.

### Reasoning
- **Speed:** ~1–2s cold start vs Webpack's 20s+
- **HMR:** 50–200ms vs Webpack's 500–2000ms
- **Production:** Uses Rollup, ~420ms builds (vs Webpack ~3.7s)
- **Config:** Minimal — works out of the box for React

### Benchmarks (from build tool comparisons)
| Tool | Cold start | HMR | Prod build |
|------|------------|-----|------------|
| Vite | 1–2s | 50–200ms | ~420ms |
| Webpack | 20s+ | 500–2000ms | ~3.7s |
| Turbopack | <1s | 10ms | Still maturing |

**Turbopack** is faster but tied to Next.js — we're not using Next.js.

---

## 4. Map: Leaflet + OpenStreetMap

### What it does
- Renders the campus map
- Displays autos, buggies, passengers as markers
- Handles pan, zoom, click

### Reasoning

**Leaflet:**
- **Simplicity:** Easiest API of the main map libs
- **Downloads:** ~2.78M weekly on npm — most used
- **Plugins:** react-leaflet for React integration
- **Size:** Lightweight for tile-based maps
- **Performance:** Good for basic maps and hundreds of markers

**OpenStreetMap tiles:**
- **Cost:** Free, no API key
- **Quality:** Good enough for a 1.5 km campus
- **Legal:** Open license

### Alternatives

| Library | Pros | Cons |
|---------|------|------|
| **MapLibre GL** | Vector tiles, 3D, faster rendering | More complex, heavier |
| **OpenLayers** | Very feature-rich, GIS-focused | Steep learning curve |
| **Mapbox** | Polished, great UX | Paid after free tier |

For dots on a campus map, Leaflet is sufficient and simplest.

---

## 5. Styling: Tailwind CSS

### What it does
- Utility classes (e.g. `flex`, `p-4`, `bg-green-500`)
- Responsive design (`md:block`, `sm:hidden`)
- No separate CSS files for most styling

### Reasoning
- **Speed:** Build UI quickly without writing custom CSS
- **Consistency:** Design tokens (colors, spacing) built-in
- **Bundle:** Purges unused classes in production
- **Responsive:** Easy mobile-first layout for passengers on phones
- **Map overlay:** Simple to style buttons, modals, toggles over the map

### Alternative
- Plain CSS — more control, more verbose
- Tailwind fits a dashboard/map-style app well

---

## 6. Realtime: Phoenix JavaScript Client

### What it does
- Connects to Phoenix Channels over WebSocket
- Join transport channel, send/receive events
- Reconnect on disconnect

### Choice
- **`phoenix`** npm package — official client from the Phoenix team
- Used in Phoenix's own docs and examples
- Works in browser, supports WebSocket + long-polling fallback

### Usage (conceptual)
```js
import { Socket } from "phoenix"

const socket = new Socket("/socket", { params: {} })
socket.connect()

const channel = socket.channel("transport:app", {})
channel.join()
channel.on("auto_updated", (payload) => { /* update map */ })
channel.push("location_update", { lat, lng, type: "passenger" })
```

---

## 7. Hosting: Vercel

### What it does
- Hosts static React build
- CDN, HTTPS, custom domain

### Reasoning
- **Free tier:** Enough for a campus project
- **Deploy:** Git push → auto deploy
- **Speed:** Edge CDN, low latency

### Alternative
- Netlify — similar
- Cloudflare Pages — also solid
- All are fine for this app

---

## 8. Summary: Best for Our Use Case?

| Criteria | Our choice | Best performer? | Reason |
|----------|------------|-----------------|--------|
| Framework | React | Svelte/SolidJS | React: ecosystem, map examples |
| Build | Vite | Vite | Yes — fast and simple |
| Map | Leaflet | MapLibre (vector) | Leaflet: simpler, enough for dots |
| Tiles | OSM | OSM | Yes — free and sufficient |
| Styling | Tailwind | Tailwind | Yes — fast iteration |
| Realtime | phoenix | phoenix | Only real option for Phoenix |
| Hosting | Vercel | Vercel/Netlify | Yes — both are strong |

---

## 9. Optional Upgrades (If We Prioritize Performance)

1. **React → Svelte 5** — smaller bundle, faster startup (if we’re okay learning Svelte)
2. **Leaflet → MapLibre GL** — vector tiles, smoother rendering (if we need smoother maps)
3. **Tailwind → Tailwind** — already a good fit; no change needed

---

## 10. Final Stack

```
React 19 + Vite + Leaflet + OpenStreetMap + Tailwind + phoenix (npm)
```

- **React:** Ecosystem and map integrations
- **Vite:** Fast dev and build
- **Leaflet + OSM:** Free, simple campus map
- **Tailwind:** Quick UI and responsive layout
- **phoenix:** Connects to our Phoenix backend
