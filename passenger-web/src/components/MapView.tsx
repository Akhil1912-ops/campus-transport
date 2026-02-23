import { useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import { CAMPUS_CENTER, CAMPUS_ZOOM } from '../config'
import type { Auto, Buggy, Passenger } from '../hooks/useTransportChannel'

function CenterOnUser({ position }: { position: { lat: number; lng: number } | null }) {
  const map = useMap()
  useEffect(() => {
    if (position) map.flyTo([position.lat, position.lng], CAMPUS_ZOOM)
  }, [position, map])
  return null
}

function createColoredIcon(color: string, size = 12) {
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="width:${size}px;height:${size}px;border-radius:50%;background:${color};border:2px solid #fff;box-shadow:0 1px 3px rgba(0,0,0,0.3)"></div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2]
  })
}

const AUTO_AVAILABLE = createColoredIcon('#22c55e') // green
const AUTO_BOOKED = createColoredIcon('#f59e0b')   // amber
const PASSENGER_WITHIN = createColoredIcon('#10b981', 14)  // emerald green
const PASSENGER_OUTSIDE = createColoredIcon('#3b82f6', 14) // blue
const BUGGY_ICON = createColoredIcon('#8b5cf6', 11)        // purple

type Props = {
  autos: Record<string, Auto>
  buggies: Record<string, Buggy>
  passengers: Record<string, Passenger>
  showBuggies: boolean
  userPosition: { lat: number; lng: number } | null
}

function AutoMarkers({ autos }: { autos: Record<string, Auto> }) {
  return (
    <>
      {Object.values(autos).map((auto) => {
        if (auto.lat == null || auto.lng == null) return null
        const icon = auto.state === 'booked' ? AUTO_BOOKED : AUTO_AVAILABLE
        return (
          <Marker key={auto.id} position={[auto.lat, auto.lng]} icon={icon}>
            <Popup>
              Auto {auto.state === 'booked' ? `(booked, ${auto.passengerCount ?? 0} passengers)` : '(available)'}
            </Popup>
          </Marker>
        )
      })}
    </>
  )
}

function BuggyMarkers({ buggies }: { buggies: Record<string, Buggy> }) {
  return (
    <>
      {Object.values(buggies).map((buggy) => {
        if (buggy.lat == null || buggy.lng == null) return null
        return (
          <Marker key={buggy.id} position={[buggy.lat, buggy.lng]} icon={BUGGY_ICON}>
            <Popup>Buggy (Route {buggy.route ?? '?'})</Popup>
          </Marker>
        )
      })}
    </>
  )
}

function PassengerMarkers({ passengers }: { passengers: Record<string, Passenger> }) {
  return (
    <>
      {Object.values(passengers).map((p) => {
        if (p.lat == null || p.lng == null) return null
        const isWithin = (p.type ?? 'within') === 'within'
        const icon = isWithin ? PASSENGER_WITHIN : PASSENGER_OUTSIDE
        return (
          <Marker key={p.id} position={[p.lat, p.lng]} icon={icon}>
            <Popup>{isWithin ? 'Within campus' : 'Outside campus'}</Popup>
          </Marker>
        )
      })}
    </>
  )
}

export function MapView({ autos, buggies, passengers, showBuggies, userPosition }: Props) {
  const initialCenter = userPosition ?? CAMPUS_CENTER
  return (
    <MapContainer
      center={initialCenter}
      zoom={CAMPUS_ZOOM}
      style={{ height: '100%', width: '100%' }}
      scrollWheelZoom
    >
      <CenterOnUser position={userPosition} />
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <AutoMarkers autos={autos} />
      <PassengerMarkers passengers={passengers} />
      {showBuggies && <BuggyMarkers buggies={buggies} />}
    </MapContainer>
  )
}
