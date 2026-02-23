/**
 * App configuration.
 * Change CAMPUS_CENTER to your campus coordinates [lat, lng].
 * SOCKET_URL: in dev uses proxy (/socket). In prod, set VITE_SOCKET_URL at build.
 */
export const CAMPUS_CENTER: [number, number] = [19.1334, 72.9137] // IIT Bombay, Powai
export const CAMPUS_ZOOM = 16
export const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL || '/socket'
export const CHANNEL = 'transport:app'
