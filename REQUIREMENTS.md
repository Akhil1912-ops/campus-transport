# Campus Transport App — Requirements Document

> **Campus:** ~1.5 km radius  
> **Problem:** Students can't find buggies (cheap) or autos. Auto drivers can't find waiting passengers.  
> **Solution:** Real-time map showing demand (passengers) and supply (autos, buggies).

---

## Platform Structure

| User Type | Platform | Purpose |
|-----------|----------|---------|
| **Passengers** | Web page | See map, autos, mark "I'm waiting", toggle to see buggies |
| **Auto drivers** | Flutter app | Share location, see passengers, confirm pickups/drops |
| **Buggy drivers** | Flutter app | Share location, report which route they're on |
| **Anyone** | Same web page | View buggy locations (toggle) — no login needed |

**Note:** Passengers use web; drivers use native Flutter app for better background GPS.

---

## How We Know Driver vs Passenger

**Proposed:** Different URLs / entry points:
- `campus-transport.com` or `/passenger` → Passenger mode (default)
- `campus-transport.com/driver/auto` → Auto driver mode
- `campus-transport.com/driver/buggy` → Buggy driver mode

User lands on the right page. No login. No confusion.

---

## Passenger Flow (Web)

1. Open passenger page → See campus map (OpenStreetMap)
2. See **autos** as moving dots (live GPS)
3. See **passengers** as dots:
   - **Green** = wants ride within campus
   - **Blue** = wants ride outside campus (outside main gate)
4. To appear as a passenger:
   - Press "I'm waiting for auto"
   - Choose: Within campus (green) OR Outside campus (blue)
   - Dot appears at their location
5. Dot disappears when:
   - They close the tab/app
   - They press "I got the auto"
   - Auto driver confirms pickup (every 30s poll)
6. **Buggy view:** Toggle to see buggies instead of/alongside autos (separate section or overlay)
7. **No login** — anonymous. Anyone with link can use.

---

## Auto Driver Flow

1. Open driver/auto page → Share location (GPS)
2. See map with:
   - Their own location
   - All passenger dots (green/blue)
   - Other autos (optional — to avoid crowding)
3. Driver physically goes to passenger — no in-app booking, just visual
4. **Every 30 seconds** — prompt: "Did you get a pickup?"
   - **No** → Nothing changes
   - **Yes** → Ask: "How many passengers? (1, 2, or 3)"
   - Auto shows as **booked** (different color or icon showing people count)
5. **Every 30 seconds** (when booked) — prompt: "Did you drop them?"
   - **Yes** → Auto back to available/empty
6. **~40–50 autos** on campus

---

## Buggy Driver Flow

1. Open driver/buggy page → Share location
2. **Every 45 seconds** — prompt: "Which route are you traveling?"
   - Route A or Route B (2 paths exist, they intersect)
   - Buggy can switch routes on return trip
3. **~5 buggies** on campus

---

## Buggy Passenger View

- Toggle to show buggies on map
- See buggy locations (dots)
- Route info (A or B) if we have path data
- **Phase 1:** Just dots + route label. Path drawing later if we get coordinates.

---

## Auto States on Map

| State | How it looks |
|-------|--------------|
| Available (MT) | Default color / empty icon |
| Booked | Different color OR icon with people (1, 2, or 3) |

---

## Technical Decisions

- **Map:** OpenStreetMap (Leaflet or similar)
- **Tracking:** Phone GPS for everyone (Phase 1)
- **Auth:** None — anonymous
- **Real-time:** Own backend with Socket.io for live updates

---

## Open Questions / Later

1. **Buggy route paths:** Do we have coordinates for Route A and Route B? Or just labels for now?
2. **Campus boundary:** Do we need to draw campus outline or "outside gate" area on map?
3. **Scale:** 40–50 autos, 5 buggies, unknown passengers — need efficient real-time updates

---

## Summary: What We're Building

1. **Passenger web page:** Map + auto dots + passenger dots (green/blue) + toggle for buggies
2. **Auto driver page:** Map + share location + 30s pickup/drop prompts + booked state
3. **Buggy driver page:** Map + share location + 45s route selection
4. **Real-time backend** to sync all locations and states

---

*Ready to start building when you approve this spec.*
