# Campus Transport — Tech Stack

## Final Stack

| Layer | Technology |
|-------|------------|
| Backend | Elixir + Phoenix + PostgreSQL + Phoenix Channels |
| Passenger web | React + Vite + Leaflet + Tailwind (Phase 2) |
| Driver app | Flutter + flutter_map + background_location (Phase 3) |
| Map | OpenStreetMap |
| Hosting (web) | Vercel |
| Hosting (backend) | Fly.io / Render / Railway |

## Backend
- Phoenix (REST + Channels)
- PostgreSQL (Ecto)
- In-memory TransportState for real-time data

## Passenger Web (Phase 2)
- React, Vite, Leaflet, Tailwind
- Phoenix JavaScript client (`phoenix` npm) for Channels

## Driver App (Phase 3)
- Flutter, flutter_map, background_location, phoenix_socket
