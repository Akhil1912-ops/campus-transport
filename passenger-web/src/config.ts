/**
 * App configuration.
 * Change CAMPUS_CENTER to your campus coordinates [lat, lng].
 * SOCKET_URL: dev uses /socket (proxy). Prod uses Render backend.
 */
export const CAMPUS_CENTER: [number, number] = [19.1334, 72.9137] // IIT Bombay, Powai
export const CAMPUS_ZOOM = 16
const isDev = import.meta.env.DEV
export const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL ||
  (isDev ? '/socket' : 'https://campus-transport-backend.onrender.com/socket')
export const CHANNEL = 'transport:app'
