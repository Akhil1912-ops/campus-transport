# ngrok Setup — Access from Phone with HTTPS

**ngrok does NOT change your code.** It only creates a secure tunnel to your local server. Your app stays the same.

## One-time setup

1. **Sign up** at [ngrok.com](https://ngrok.com) (free).
2. **Get your auth token** from the dashboard: https://dashboard.ngrok.com/get-started/your-authtoken
3. **Install ngrok** — choose one:
   - **Option A (recommended):** Download from [ngrok.com/download](https://ngrok.com/download) — Windows zip, extract, add to PATH
   - **Option B:** `npm install -g ngrok`
4. **Add your token:**
   ```powershell
   ngrok config add-authtoken YOUR_TOKEN_HERE
   ```

## Run (each time you want phone access)

1. **Terminal 1** — Backend:  
   `cd phoenix_backend && mix phx.server`

2. **Terminal 2** — Frontend:  
   `cd passenger-web && npm run dev`

3. **Terminal 3** — Tunnel:  
   `cd passenger-web && npm run tunnel`  
   (or `ngrok http 5173`)

4. Copy the **HTTPS** URL ngrok shows (e.g. `https://a1b2c3.ngrok-free.app`).

5. Open that URL on your phone. Location will work because it's real HTTPS.
