# Campus Transport — Complete Project Overview

> **One document with everything.** Read this, then we build.

---

## 1. The Problem

- **Campus size:** ~1.5 km radius
- **Transport options:**
  - **Buggies** — cheap, electric, shared, fixed routes (like buses) — limited in number
  - **Autos/Rickshaws** — higher cost, roam freely — ~40–50 on campus
- **Pain points:**
  - Students can't see where buggies or autos are → take autos (expensive) by default
  - Auto drivers can't find waiting passengers
  - Passengers either want rides **within campus** or **outside campus** (main gate)

---

## 2. The Solution

A real-time map system:
- **Passengers** see autos, buggies, and other waiting passengers (green = within, blue = outside)
- **Auto drivers** see passengers, share their location, confirm pickups/drops
- **Buggy drivers** share location and report which route they're on (A or B)

---

## 3. Platform Summary

| Platform | Users | Technology |
|----------|-------|------------|
| **Website** | Passengers (view + mark "I'm waiting") | React + Vite + Leaflet + Tailwind |
| **Mobile app** | Auto drivers | Flutter |
| **Mobile app** | Buggy drivers | Flutter (same app, different mode) |

**URLs / entry points:**
- `/` or `/passenger` → Passenger web
- App: Mode selector → Auto driver OR Buggy driver

---

## 4. Tech Stack

| Layer | Technology |
|-------|------------|
| Passenger web | React, Vite, Leaflet, Tailwind |
| Driver app | Flutter |
| Backend | **Elixir + Phoenix** + PostgreSQL + Phoenix Channels |
| Map | OpenStreetMap |
| Hosting (web) | Vercel |
| Hosting (backend) | Fly.io / Render / Railway |

---

## 5. Architecture

```
                    ┌─────────────────────────────┐
                    │  Backend (Elixir + Phoenix)  │
                    │  - Phoenix (REST API)        │
                    │  - PostgreSQL (Ecto)         │
                    │  - Phoenix Channels (realtime)│
                    └──────────────┬───────────────┘
                                  │
              ┌───────────────────┼───────────────────┐
              │                   │                   │
              ▼                   ▼                   ▼
    ┌─────────────────┐ ┌─────────────┐ ┌─────────────┐
    │ Passenger Web    │ │ Driver App   │ │ Driver App   │
    │ (React)          │ │ Auto mode   │ │ Buggy mode   │
    │                  │ │ (Flutter)   │ │ (Flutter)    │
    └─────────────────┘ └─────────────┘ └─────────────┘
```

All clients connect via WebSocket (Phoenix Channels). Location updates flow in real time.

---

## 6. Data Model

### Autos
| Field | Type | Description |
|-------|------|-------------|
| id | string (UUID) | Unique, generated on first open |
| lat | number | Latitude |
| lng | number | Longitude |
| state | `'available'` \| `'booked'` | Empty or carrying passengers |
| passengerCount | 0 \| 1 \| 2 \| 3 | When booked |
| lastUpdated | timestamp | For cleanup / stale detection |

### Buggies
| Field | Type | Description |
|-------|------|-------------|
| id | string (UUID) | Unique |
| lat | number | Latitude |
| lng | number | Longitude |
| route | `'A'` \| `'B'` | Which path they're on |
| lastUpdated | timestamp | For cleanup |

### Passengers
| Field | Type | Description |
|-------|------|-------------|
| id | string (UUID) | Unique, generated when they mark "I'm waiting" |
| lat | number | Latitude |
| lng | number | Longitude |
| type | `'within'` \| `'outside'` | Green or blue |
| lastUpdated | timestamp | For cleanup — remove if stale (e.g. 15 min) |

**Cleanup rules:**
- Passenger closes tab → heartbeat stops → remove after timeout
- Auto/Buggy: remove if no update for e.g. 5 min (they went offline)

---

## 7. Phoenix Channel Events

### Client → Server (handle_in)
| Event | Payload | Who sends |
|-------|---------|-----------|
| `register_auto` | `{ id?, lat, lng, state?, passenger_count? }` | Auto driver |
| `register_buggy` | `{ id?, lat, lng, route }` | Buggy driver |
| `register_passenger` | `{ id?, lat, lng, type }` | Passenger |
| `location_update` | `{ type, id, lat, lng, ... }` | Any |
| `auto_pickup` | `{ id, passenger_count }` | Auto driver |
| `auto_drop` | `{ id }` | Auto driver |
| `passenger_done` | `{ id }` | Passenger ("I got the auto") |

### Server → All clients (broadcast)
| Event | Payload |
|-------|---------|
| `state` | Full snapshot `{ autos, buggies, passengers }` |
| `auto_updated` | Single auto |
| `buggy_updated` | Single buggy |
| `passenger_added` | Single passenger |
| `passenger_removed` | `{ id }` |
| `auto_removed` | `{ id }` |
| `buggy_removed` | `{ id }` |

---

## 8. User Flows

### Passenger (Web)
1. Open `/` → Map centered on campus
2. See autos (dots), passengers (green/blue)
3. Click "I'm waiting" → Choose within/outside → Dot appears
4. Dot stays until: close tab, click "I got the auto", or driver confirms pickup
5. Toggle "Show buggies" → See buggy dots + route labels

### Auto driver (App)
1. Open app → Select "Auto driver"
2. Grant location permission → Start sharing GPS (including background)
3. See map: passengers (green/blue), other autos
4. Every 30s: "Did you get a pickup?" → No: continue / Yes: enter 1–3 passengers
5. When booked: every 30s "Did you drop them?" → Yes: back to available

### Buggy driver (App)
1. Open app → Select "Buggy driver"
2. Grant location → Start sharing
3. Every 45s: "Which route? A or B" → Select
4. Route choice broadcast to all

---

## 9. Map Display

| Entity | Visual |
|--------|--------|
| Passenger (within) | Green dot |
| Passenger (outside) | Blue dot |
| Auto (available) | Default color / empty icon |
| Auto (booked) | Different color or icon with 1–3 people |
| Buggy | Distinct icon, route label (A/B) |

---

## 10. Build Order

### Phase 1: Backend
1. Phoenix project setup
2. Ecto + PostgreSQL schema (autos, buggies, passengers)
3. Phoenix Channel for transport (join, handle_in, broadcast)
4. REST endpoint: `GET /api/state` (initial full state)
5. Cleanup job: remove stale passengers/vehicles

### Phase 2: Passenger Website
1. React + Vite + Tailwind
2. Leaflet map, center on campus
3. Socket.io client, subscribe to state
4. Render autos, passengers, buggies
5. "I'm waiting" button + modal (within/outside)
6. "I got the auto" button
7. Toggle: show/hide buggies

### Phase 3: Driver App (Flutter)
1. Flutter project
2. Mode: Auto vs Buggy
3. Map (flutter_map + OpenStreetMap)
4. Location permission + background_location (background tracking)
5. phoenix_socket for Phoenix Channels
6. Auto: 30s pickup/drop dialogs
7. Buggy: 45s route selection
8. Build APK for Android

### Phase 4: Polish
- Error handling, reconnection
- Stale data cleanup tuning
- Campus coordinates config
- Deploy backend + web

---

## 11. Project Structure

```
campus-transport/
├── backend/           # Elixir + Phoenix + Ecto + Channels
├── passenger-web/     # React + Vite
├── driver-app/        # Flutter
├── REQUIREMENTS.md
├── TECH_STACK.md
└── PROJECT_OVERVIEW.md (this file)
```

---

## 12. What You Need Before We Start

| Item | Status |
|------|--------|
| Elixir 1.15+ installed | Required |
| Erlang/OTP 25+ | Required (comes with Elixir) |
| PostgreSQL (local or cloud) | Required |
| Flutter SDK | Required for app |
| Campus coordinates | Can use placeholder |
| Git repo | Optional but recommended |

---

**Ready to build. Start with backend.**
