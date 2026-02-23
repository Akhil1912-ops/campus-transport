/**
 * Geolocation helper. Browsers REQUIRE HTTPS (or localhost) for geolocation on mobile.
 * On http:// from a phone, the permission dialog will NEVER appear — it fails silently.
 */

export type LocationResult = { ok: true; lat: number; lng: number } | { ok: false; message: string }

export function isSecureContext(): boolean {
  return typeof window !== 'undefined' && window.isSecureContext
}

export function hasGeolocation(): boolean {
  return typeof navigator !== 'undefined' && 'geolocation' in navigator
}

export function getPosition(): Promise<LocationResult> {
  return new Promise((resolve) => {
    if (!hasGeolocation()) {
      resolve({ ok: false, message: 'Geolocation not supported by this device.' })
      return
    }

    if (!isSecureContext()) {
      resolve({
        ok: false,
        message: 'Location requires HTTPS. Use https:// in the URL (not http://). Example: https://YOUR_IP:5173',
      })
      return
    }

    navigator.geolocation.getCurrentPosition(
      (p) => resolve({ ok: true, lat: p.coords.latitude, lng: p.coords.longitude }),
      (err: GeolocationPositionError) => {
        const messages: Record<number, string> = {
          1: 'Location permission denied. Tap "Allow" when the browser asks, or enable it in site settings.',
          2: 'Could not get your position. Check that GPS/Location is turned on.',
          3: 'Location request timed out. Try again.',
        }
        resolve({
          ok: false,
          message: messages[err.code] ?? err.message ?? 'Could not get location.',
        })
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    )
  })
}
