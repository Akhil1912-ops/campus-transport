# Campus Transport – Cloud Deployment Guide

Step-by-step guide to deploy the Phoenix backend, passenger web, and update the driver app for cloud.

---

## 1. Database (Neon – Free Tier)

1. Go to [neon.tech](https://neon.tech) and sign up
2. Create a new project
3. In the project dashboard, copy the connection string (looks like `postgresql://user:pass@host/dbname?sslmode=require`)
4. You’ll use this as `DATABASE_URL` in Render

---

## 2. Phoenix Backend (Render)

### Prerequisites

- GitHub account  
- Code pushed to a GitHub repo (e.g. `campus-transport`)

### Steps

1. Go to [render.com](https://render.com) and sign up / log in
2. **New → Web Service**
3. Connect your GitHub repo and select it
4. Configure:
   - **Name:** `campus-transport-backend` (or any name)
   - **Root Directory:** `phoenix_backend`
   - **Environment:** `Elixir`
   - **Build Command:** `./build.sh`
   - **Start Command:** `_build/prod/rel/phoenix_backend/bin/server`

5. Environment variables (set in Render dashboard):

   | Key             | Value                                      |
   |-----------------|--------------------------------------------|
   | `DATABASE_URL`  | Your Neon connection string (from step 1) |
   | `SECRET_KEY_BASE` | Run locally: `mix phx.gen.secret`        |

6. Make `build.sh` executable before pushing (if on Windows, run in Git Bash or WSL):

   ```bash
   git update-index --chmod=+x phoenix_backend/build.sh
   ```

7. Deploy; Render will build and run the app
8. After deploy, note the URL (e.g. `https://campus-transport-backend.onrender.com`)

---

## 3. Passenger Web (Netlify or Cloudflare Pages)

### Option A: Netlify

1. Go to [netlify.com](https://netlify.com) and sign up
2. **Add new site → Import an existing project**
3. Connect GitHub and select the repo
4. Configure:
   - **Base directory:** `passenger-web`
   - **Build command:** `npm run build`
   - **Publish directory:** `passenger-web/dist`
5. Add environment variable:
   - **Variable:** `VITE_SOCKET_URL`
   - **Value:** `https://YOUR_BACKEND.onrender.com/socket` (use your Render URL)

### Option B: Cloudflare Pages

1. Go to [pages.cloudflare.com](https://pages.cloudflare.com)
2. **Create a project → Connect to Git**
3. Select repo and configure:
   - **Build command:** `cd passenger-web && npm run build`
   - **Build output directory:** `passenger-web/dist`
4. **Settings → Environment variables**:
   - `VITE_SOCKET_URL` = `https://YOUR_BACKEND.onrender.com/socket`

---

## 4. Driver App (Flutter)

Update the backend URL before building for production:

1. Edit `driver_app_flutter/lib/config.dart`:

```dart
const String backendUrl = 'https://YOUR_BACKEND.onrender.com';
```

2. Build and run:

```bash
cd driver_app_flutter
flutter build apk   # for Android
# or
flutter build ios   # for iOS (macOS required)
```

3. (Optional) Distribute via [Firebase App Distribution](https://firebase.google.com/docs/app-distribution) or [GitHub Releases](https://docs.github.com/en/repositories/releasing-projects-on-github)

---

## 5. CORS (if needed)

If the backend rejects requests from the passenger web domain, enable CORS in the Phoenix app. The project already includes the `corsica` package. Check `lib/phoenix_backend/application.ex` or the router for CORS setup and allow your Netlify/Cloudflare domain.

---

## Summary Checklist

- [ ] Neon database created, `DATABASE_URL` copied
- [ ] Render web service created, env vars set, deployed
- [ ] Passenger web deployed with correct `VITE_SOCKET_URL`
- [ ] Driver app `config.dart` updated and APK/IPA built
- [ ] CORS configured for passenger web domain
