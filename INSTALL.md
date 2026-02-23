# Installation — Campus Transport

## Backend (Phoenix)

```cmd
cd c:\Users\Akhil\campus-transport\phoenix_backend
mix deps.get
mix ecto.create
mix phx.server
```

Requires: **Elixir**, **Erlang**, **PostgreSQL**. See phoenix_backend/POSTGRES_SETUP.md.

## Passenger Web (Phase 2)

Requires: **Node.js** (v18+).

1. Start the Phoenix backend first (see above).
2. In a new terminal:

```cmd
cd c:\Users\Akhil\campus-transport\passenger-web
npm install
npm run dev
```

3. Open http://localhost:5173

The site proxies `/socket` and `/api` to the Phoenix server (localhost:4000).

## Driver App (Phase 3)

Native Flutter app for buggy drivers. Requires **Flutter SDK** and **Android device/emulator**.

1. Install Flutter: https://docs.flutter.dev/get-started/install
2. Start the Phoenix backend first.
3. In a new terminal:

```cmd
cd c:\Users\Akhil\campus-transport\driver_app_flutter
flutter create . --org com.campustransport --platforms android
flutter pub get
flutter run
```

4. Edit `lib/config.dart` — set `backendUrl` to your computer's IP so the phone can reach the backend.
