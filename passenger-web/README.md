# Campus Transport — Passenger Web

React + Vite passenger app for the campus transport system. Shows autos, buggies, and waiting passengers on a map. No login required.

## Run

1. Start the Phoenix backend: `cd phoenix_backend && mix phx.server`
2. Start this app: `npm run dev`
3. Open http://localhost:5173

## Access from phone (ngrok — HTTPS for location)

1. With backend and frontend running, open a **third terminal**
2. Run: `npm run tunnel` (or `npx ngrok http 5173`)
3. Use the HTTPS URL ngrok shows (e.g. `https://abc123.ngrok-free.app`) on your phone
4. Location works over ngrok's HTTPS — no code changes

## Features

- **Map:** OpenStreetMap, centered on campus
- **Autos:** Green (available) / amber (booked)
- **Passengers:** Green (within campus) / blue (outside campus)
- **Buggies:** Purple dots (toggle on/off)
- **"I'm waiting"** — choose within/outside, your dot appears
- **"I got the auto"** — removes your dot

## Config

Edit `src/config.ts` to change:
- `CAMPUS_CENTER` — [lat, lng] for your campus
- `CAMPUS_ZOOM` — map zoom level
- `SOCKET_URL` — Phoenix socket path (default `/socket`, proxied in dev)
