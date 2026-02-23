# Driver App — Tech Stack & Reasoning

> Why each technology was chosen for the auto/buggy driver mobile app.

---

## 1. Overview

| Layer | Our choice | Alternative |
|-------|------------|-------------|
| Framework | Flutter | React Native, Kotlin/Swift |
| Map | flutter_map | google_maps_flutter |
| Map tiles | OpenStreetMap | Google Maps (API key) |
| Background location | background_location OR flutter_background_geolocation | geolocator |
| Realtime | phoenix_socket | — |
| State | Provider / Riverpod | Bloc, GetX |
| Build | flutter build apk | EAS Build, Codemagic |

---

## 2. Framework: Flutter

### What it does
- Cross-platform app (Android + iOS from one codebase)
- Renders UI with Skia/Impeller (no native bridge)
- Compiles Dart to native ARM code (AOT)

### Reasoning
- **Performance:** Flutter generally outperforms React Native in benchmarks — better animation handling, memory use, FPS
- **Architecture:** No JavaScript bridge; direct native rendering. React Native uses JS → native bridge which adds overhead
- **Background:** Strong packages for background location (critical for drivers)
- **Compilation:** AOT = faster startup, lower battery than JIT (React Native Hermes)

### Benchmarks (2024)
| Metric | Flutter | React Native |
|--------|---------|--------------|
| Bulk animations | Better | — |
| Memory usage | Lower | — |
| ListView 1000 items | Better FPS | — |

Source: [Flutter vs React Native benchmarks](https://blog.stackademic.com/flutter-vs-react-native-performance-benchmarks-you-cant-miss-158e918ae97a)

### Alternatives
- **React Native:** Bigger dev pool, same language as web — but worse background location story
- **Kotlin (Android) + Swift (iOS):** Best performance, full control — but two codebases

---

## 3. Map: flutter_map + OpenStreetMap

### What it does
- Renders campus map with markers (passengers, other autos/buggies)
- Pan, zoom, user location
- Leaflet-style API (same concept as web Leaflet)

### Reasoning
- **Free:** No API key, no billing
- **Consistency:** Same tile source (OSM) as passenger website
- **Lightweight:** Raster tiles = good performance for our use (dots on map)
- **Open source:** BSD license

### Alternatives

| Library | Pros | Cons |
|---------|------|------|
| **flutter_map** | Free, OSM, Leaflet-like | Basic features |
| **google_maps_flutter** | Rich features, polished | API key, usage limits, paid at scale |
| **Mapbox (mapbox_gl)** | Vector tiles, fast | Paid |

For drivers viewing dots on campus, flutter_map is sufficient and keeps cost at zero.

---

## 4. Background Location: The Critical Choice

Drivers need GPS updates **while the app is minimised or screen is off**. This is the hardest requirement.

### Option A: background_location (Free)

| Aspect | Details |
|--------|---------|
| **Cost** | Free, open-source |
| **Android** | Uses FusedLocationProvider, foreground service |
| **iOS** | CoreLocation, background modes |
| **Features** | Distance filter, real-time updates |
| **Maintenance** | Active on pub.dev |

**Good for:** Campus project, no budget, proof of concept.

### Option B: flutter_background_geolocation (Paid)

| Aspect | Details |
|--------|---------|
| **Cost** | **$399–$749** for Android release (free in debug) |
| **Features** | Motion detection (accelerometer/gyro), auto start/stop when moving vs stationary, geofencing, battery optimization |
| **Battery** | Best — only records when device is moving |
| **Quality** | Production-grade, used by Uber-like apps |

**Good for:** Production app, budget available, need best battery life.

### Option C: geolocator (Foreground only)

| Aspect | Details |
|--------|---------|
| **Cost** | Free |
| **Limitation** | **Not built for background.** Works when app is in foreground. |
| **Use case** | Passenger app, or driver app kept open on dashboard |

**Not suitable** if drivers minimize the app.

### Recommendation

| Scenario | Choice |
|----------|--------|
| Campus project, no budget | **background_location** (free) |
| Production app, can pay | **flutter_background_geolocation** |
| Driver keeps app open on dashboard | **geolocator** (simplest) |

---

## 5. Realtime: phoenix_socket

### What it does
- Connects to Phoenix Channels over WebSocket
- Join channel, push events, listen for broadcasts
- Reconnect on disconnect

### Choice
- **phoenix_socket** — Dart package for Phoenix Channels
- Used in [Flutter + Phoenix tutorials](https://petal.build/blog/Building-a-Real-time-Counter-App-with-Phoenix-Channels-Phoenix-PubSub-and-Flutter)
- API similar to JavaScript `phoenix` package

### Usage (conceptual)
```dart
final socket = PhoenixSocket('wss://your-backend.com/socket/websocket');
await socket.connect();

final channel = socket.addChannel(topic: 'transport:app');
channel.join();

channel.messages.listen((message) {
  if (message.event == 'auto_updated') { /* update map */ }
});

channel.push('location_update', {'lat': lat, 'lng': lng, 'type': 'auto'});
```

---

## 6. State Management

### Options
- **Provider** — Simple, official recommendation, good for our scope
- **Riverpod** — Improved Provider, type-safe, testable
- **Bloc** — Event-driven, more boilerplate
- **GetX** — Easiest, but less structured

### Recommendation
- **Riverpod** or **Provider** — both fine for map state, connection state, driver mode

---

## 7. Build & Distribution

### Android
- `flutter build apk` — produces APK, share via link or USB
- No Play Store required initially
- Or: `flutter build appbundle` for Play Store later

### iOS
- Requires Mac + Xcode + Apple Developer ($99/year)
- `flutter build ios` — produces IPA
- Can delay if Android-first

---

## 8. Summary: Best for Our Use Case?

| Criteria | Our choice | Best performer? | Note |
|----------|------------|-----------------|------|
| Framework | Flutter | Yes | Beats React Native for our needs |
| Map | flutter_map | Good enough | Free, consistent with web |
| Tiles | OSM | Yes | Free |
| Background location | background_location | No (paid one is better) | Free option; paid = best battery |
| Realtime | phoenix_socket | Yes | Only real option for Phoenix |
| State | Riverpod/Provider | — | Both solid |

---

## 9. Cost Summary

| Component | Cost |
|-----------|------|
| Flutter | Free |
| flutter_map | Free |
| OpenStreetMap | Free |
| phoenix_socket | Free |
| background_location | Free |
| flutter_background_geolocation | **$399+** (Android release) |
| Google Maps API | Free tier, then paid |
| Apple Developer | $99/year (for iOS) |

**With free stack:** $0 for Android.  
**With best background GPS:** ~$399 one-time.  
**With iOS:** +$99/year when you add it.

---

## 10. Final Stack

### Chosen Stack
```
Flutter + flutter_map + OpenStreetMap + background_location + phoenix_socket + Riverpod
```

**Background location:** background_location (free) — confirmed.
