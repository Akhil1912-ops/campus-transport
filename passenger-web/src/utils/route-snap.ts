/**
 * Snap a point (lat, lng) to the nearest point on a polyline.
 * Used to place buggies on the route line from raw GPS.
 */

export function snapToPolyline(
  point: [number, number],
  polyline: [number, number][]
): [number, number] {
  if (polyline.length === 0) return point
  if (polyline.length === 1) return polyline[0]

  let best: [number, number] = polyline[0]
  let bestDist = Infinity

  for (let i = 0; i < polyline.length - 1; i++) {
    const a = polyline[i]
    const b = polyline[i + 1]
    const proj = projectPointOnSegment(point, a, b)
    const d = distSq(point, proj)
    if (d < bestDist) {
      bestDist = d
      best = proj
    }
  }
  return best
}

function projectPointOnSegment(
  p: [number, number],
  a: [number, number],
  b: [number, number]
): [number, number] {
  const [px, py] = p
  const [ax, ay] = a
  const [bx, by] = b
  const abx = bx - ax
  const aby = by - ay
  let t = ((px - ax) * abx + (py - ay) * aby) / (abx * abx + aby * aby)
  t = Math.max(0, Math.min(1, t))
  return [ax + t * abx, ay + t * aby]
}

function distSq(a: [number, number], b: [number, number]): number {
  const dx = a[0] - b[0]
  const dy = a[1] - b[1]
  return dx * dx + dy * dy
}
