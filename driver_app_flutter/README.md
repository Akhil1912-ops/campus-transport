# Buggy Driver App (Flutter)

Native mobile app for campus buggy drivers. Uses **geolocator** for accurate GPS and **phoenix_socket** for real-time backend sync.

## Requirements

- [Flutter SDK](https://docs.flutter.dev/get-started/install) (3.19+)
- Android device or emulator
- Phoenix backend running (`mix phx.server`)

## Setup

1. **Install Flutter**: https://docs.flutter.dev/get-started/install/windows — add `flutter/bin` to PATH.

2. **Generate platform files** (first time only):
   ```bash
   cd c:\Users\Akhil\campus-transport\driver_app_flutter
   flutter create . --org com.campustransport --platforms android
   ```
   This creates the Android project. Our `lib/` and `pubspec.yaml` are kept.

3. **Add location permission** — After `flutter create`, add to `android/app/src/main/AndroidManifest.xml` inside `<manifest>`:
   ```xml
   <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION"/>
   <uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION"/>
   ```
   (geolocator may add these automatically; add manually if location fails.)

   - Set `backendUrl` to your computer's IP (e.g. `http://192.168.1.5:4000`)
   - Phone and computer must be on same WiFi

5. **Install dependencies**:
   ```bash
   cd driver_app_flutter
   flutter pub get
   ```

## Run

```bash
cd driver_app_flutter
flutter run
```

Connect an Android device via USB (with USB debugging enabled) or start an emulator. The app will install and launch.

## Usage

1. Ensure Phoenix backend is running
2. Open app → choose Route A (Blue) or Route B (Red)
3. Tap **Start driving** → allow location permission
4. Your buggy appears on the passenger map in real time
5. Tap **Stop driving** when done

## Location accuracy

Uses **geolocator** with `LocationAccuracy.high` (Fused Location Provider on Android) for 2–10 m accuracy. Updates sent every 15 seconds with distance-based filtering (10 m) when moving.
