import { useMemo, useEffect } from 'react'
import { MapContainer, Polyline, Marker, useMap } from 'react-leaflet'
import L from 'leaflet'
import { BUGGY_ROUTE } from '../config/buggy-route'
import { snapToPolyline } from '../utils/route-snap'
import type { Buggy } from '../hooks/useTransportChannel'
import '../styles/BuggyMapView.css'

function createBuggyIcon(route: string) {
  const color = route === 'blue' ? '#3b82f6' : '#ef4444'
  return L.divIcon({
    className: 'buggy-marker',
    html: `
      <div style="
        width:20px;height:20px;
        border-radius:50%;
        background:${color};
        border:2px solid white;
        box-shadow:0 2px 4px rgba(0,0,0,0.3);
      "></div>
    `,
    iconSize: [20, 20],
    iconAnchor: [10, 10]
  })
}

function FitBounds({ points }: { points: [number, number][] }) {
  const map = useMap()
  useEffect(() => {
    if (points.length < 2) return
    const bounds = L.latLngBounds(points)
    map.fitBounds(bounds, { padding: [16, 16], maxZoom: 18 })
  }, [map, points])
  return null
}

function createStopIcon(name: string) {
  return L.divIcon({
    className: 'stop-marker-with-label',
    html: `
      <div class="stop-marker-wrapper">
        <div class="stop-dot"></div>
        <span class="stop-label">${name}</span>
      </div>
    `,
    iconSize: [140, 24],
    iconAnchor: [6, 6]
  })
}

type Props = {
  buggies: Record<string, Buggy>
}

export function BuggyMapView({ buggies }: Props) {
  const { segments, stops } = BUGGY_ROUTE

  // Build full polyline for snapping and bounds
  const fullPolyline = useMemo(() => {
    const points: [number, number][] = []
    for (const seg of segments) {
      for (const stopId of seg.stops) {
        const s = stops[stopId]
        if (s) points.push([s.lat, s.lng])
      }
    }
    return points
  }, [segments, stops])

  // Segment polylines for drawing
  const segmentPaths = useMemo(() => {
    return segments.map((seg) =>
      seg.stops.map((id) => stops[id]).filter(Boolean).map((s) => [s.lat, s.lng] as [number, number])
    )
  }, [segments, stops])

  const realBuggies = useMemo(
    () =>
      Object.values(buggies)
        .filter((b) => b.lat != null && b.lng != null)
        .map((b) => ({
          ...b,
          snapped: snapToPolyline([b.lat!, b.lng!], fullPolyline) as [number, number]
        })),
    [buggies, fullPolyline]
  )

  return (
    <div className="buggy-map-wrapper">
      <MapContainer
        center={[19.14, 72.92]}
        zoom={15}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={false}
        doubleClickZoom={false}
        touchZoom={false}
        dragging={false}
        zoomControl={false}
        attributionControl={false}
        keyboard={false}
        boxZoom={false}
      >
        <FitBounds points={fullPolyline} />

        {/* Route lines */}
        {segmentPaths.map((path, i) => {
          if (path.length < 2) return null
          const color = segments[i].color
          return (
            <Polyline
              key={i}
              positions={path}
              pathOptions={{
                color,
                weight: 6,
                opacity: 0.9
              }}
            />
          )
        })}

        {/* Stop markers with labels */}
        {Object.entries(stops).map(([id, s]) => (
          <Marker
            key={id}
            position={[s.lat, s.lng]}
            icon={createStopIcon(s.name)}
          />
        ))}

        {/* Real buggies from driver app */}
        {realBuggies.map((b) => (
          <Marker
            key={b.id}
            position={b.snapped}
            icon={createBuggyIcon(b.route === 'red' ? 'red' : 'blue')}
          />
        ))}
      </MapContainer>

      {/* Legend */}
      <div className="buggy-map-legend">
        <span className="legend-item">
          <span className="legend-dot" style={{ background: '#3b82f6' }} /> Route A
        </span>
        <span className="legend-item">
          <span className="legend-dot" style={{ background: '#ef4444' }} /> Route B
        </span>
        <span className="legend-item">
          <span className="legend-dot" style={{ background: '#6366f1' }} /> Common
        </span>
      </div>
    </div>
  )
}
