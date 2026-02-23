# Location Tracking Technology Research
## Campus Buggy / Fleet Tracking — Technical Analysis

---

## 1. Location technologies (accuracy & battery)

| Technology | Accuracy | Battery | Best for | Notes |
|------------|----------|---------|----------|-------|
| **GPS / GNSS** | 2–10 m (standard) | High drain | Outdoor, open areas | Standard on phones. Cold start ~30 s. |
| **Dual-frequency RTK** | 1–3 cm | Very high | Survey, precision | Newer Android phones (Pixel 5+, Galaxy S22+). Needs dual GNSS. |
| **Fused Location Provider** | 0–100 m | Medium | General tracking | Google API: GPS + Wi‑Fi + cell. Best default choice on Android. |
| **Network provider** | 100–500 m | Low | Approximate only | Wi‑Fi/cell only. Not suitable for route-level tracking. |

**Recommendation for campus buggies:** Use **Fused Location Provider** (or platform equivalent). Accuracy of 2–10 m is enough for route-level tracking; dual-frequency RTK is unnecessary for this use case.

---

## 2. Mobile frameworks for location

### Flutter (Dart)

- **geolocator** – maps to Android Fused Location and iOS Core Location.
- **fused_location** – direct Android FusedLocationProviderClient, more control.
- High accuracy options (`LocationAccuracy.best`, `highAccuracy`).
- Strong cross‑platform support (Android, iOS).

### React Native / Expo (JavaScript)

- **expo-location** – works in Expo Go, limited accuracy controls.
- Known accuracy issues (often 40+ m initially).
- Workarounds: enable network provider, retries, `Accuracy.BestForNavigation`.
- **react-native-background-geolocation** – better accuracy and background; not Expo-compatible (native modules).

### Native (Kotlin / Swift)

- Full access to Fused Location Provider (Android) and Core Location (iOS).
- Best control over accuracy, background updates, and battery.
- Highest implementation effort.

**Conclusion for your project:**  
For **best accuracy and reliability**, **Flutter with geolocator (or fused_location on Android)** is preferable. Expo/React Native with `expo-location` is fine for prototypes but has limitations in accuracy and background tracking.

---

## 3. Location accuracy techniques

| Technique | Purpose | Notes |
|-----------|---------|-------|
| **High accuracy mode** | Better GPS | More battery use. |
| **Enable network provider** | Faster first fix | GPS + Wi‑Fi + cell. |
| **Distance-based updates** | Fewer updates when stationary | Use `distanceInterval` (e.g. ~10–20 m). |
| **Pre-warming GPS** | Faster cold start | Brief location request before first use. |
| **Retry until threshold** | Reduce weak readings | Poll until accuracy < 10 m, then use. |

---

## 4. Backend communication (streaming location)

| Protocol | Latency | Battery | Complexity | Best for |
|----------|---------|---------|------------|----------|
| **WebSocket** | Low | Good | Medium | Browser, mobile, real-time dashboards |
| **MQTT** | Low | Better for IoT | Higher (broker) | Many devices, unreliable networks |
| **HTTP polling** | High | Poor | Low | Simple cases, not real-time |
| **Server-Sent Events (SSE)** | Low | Good | Low | One-way server → client |

**Recommendation:**  
Your Phoenix backend already uses WebSockets. For a few buggies, **WebSocket** is appropriate: low latency, works with existing infrastructure, and simple for mobile clients.

---

## 5. Update frequency and battery

| Interval | Battery impact | Use case |
|----------|----------------|----------|
| 1–5 s | Very high | Live navigation |
| **10–15 s** | High | Fleet / buggy tracking |
| 30–60 s | Medium | Less frequent updates |
| 2–5 min | Low | Occasional check-ins |

**Recommendation for campus buggies:**  
- **15 s** (as in your current setup) or **10 s** for a smoother map.
- Use **distance-based updates** (e.g. every 10–20 m) when moving, to reduce updates when the buggy is parked.
- Use a **foreground service** on Android so background updates are not throttled.

---

## 6. Platform specifics

### Android

- **Background limits:** Background updates can be throttled to a few per hour.
- **Foreground service:** Required for continuous tracking; shows persistent notification.
- **Permissions:** `ACCESS_FINE_LOCATION`, `ACCESS_COARSE_LOCATION`, and `ACCESS_BACKGROUND_LOCATION` for background.

### iOS

- **Background modes:** Use `location` in `UIBackgroundModes`.
- **Always vs WhenInUse:** `WhenInUse` is simpler; `Always` needs justification for App Store review.
- **Core Location:** Same API as most Flutter/RN plugins.

---

## 7. Recommended stack for campus buggy tracking

| Component | Recommendation |
|-----------|----------------|
| **Framework** | **Flutter** (if possible) for better location handling and battery behavior. |
| **Location API** | **geolocator** (or **fused_location** on Android for more control). |
| **Accuracy** | `LocationAccuracy.high` or `best`. |
| **Update strategy** | Every **10–15 s** + optional distance filter (e.g. 10 m). |
| **Transport** | **WebSocket** (Phoenix channels, as you already have). |
| **Background** | Foreground service on Android, background location on iOS when needed. |

---

## 8. Current Expo app vs Flutter

| Aspect | Current (Expo) | With Flutter |
|--------|----------------|---------------|
| Accuracy | Often 40+ m, needs workarounds | Typically better (Fused Location / Core Location) |
| Background | Limited in Expo Go | Supported via native plugins |
| Dev setup | No Flutter install | Requires Flutter SDK |
| Time to implement | Already done | New codebase |
| Best for | Quick prototype, testing | Production, long-term use |

---

## Summary

- **Technology:** Fused Location Provider (or equivalent) with high-accuracy settings.
- **Framework:** Flutter (geolocator / fused_location) preferred over Expo for accuracy and background.
- **Transport:** WebSocket (Phoenix channels).
- **Update rate:** 10–15 s; optionally combine with distance-based updates.
- **Battery:** Use distance intervals, avoid sub‑5 s polling, and use a foreground service on Android for continuous tracking.
