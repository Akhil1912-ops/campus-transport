/**
 * Buggy route configuration - SCHEMATIC LAYOUT matching hand-drawn diagram.
 *
 * Layout:
 * - Main vertical route (Route A): H12&13 (top) → ... → Maingate (bottom)
 * - Branch (Route B): From Chayoos goes RIGHT → H5 → H4 [TURN DOWN] → H3 → H2 → H1 → H1-turning [TURN LEFT] → T-point
 *
 * Uses schematic coordinates for clean diagram layout (vertical main + rectangular loop).
 * Stop names are from real campus; positions arranged to match the drawing.
 */

export type StopId = string

export type SegmentDef = {
  route: 'common' | 'blue' | 'red'
  color: string
  stops: StopId[]
}

export type StopDef = {
  name: string
  lat: number
  lng: number
}

export const BUGGY_ROUTE = {
  segments: [
    { route: 'common' as const, color: '#6366f1', stops: ['h12_13', 'h17', 'chayoos'] },
    { route: 'blue' as const, color: '#3b82f6', stops: ['chayoos', 'gymkhana', 't_point'] },
    { route: 'red' as const, color: '#ef4444', stops: ['chayoos', 'h5', 'h4', 'h3', 'h2', 'h1', 'h1_turning', 't_point'] },
    { route: 'common' as const, color: '#6366f1', stops: ['t_point', 'convocation', 'lhc', 'h10', 'maingate'] }
  ],
  stops: {
    // Main vertical route — 2× scaled for less saturation
    h12_13: { name: 'H 12 & 13', lat: 19.1445, lng: 72.902 },
    h17: { name: 'h17', lat: 19.1405, lng: 72.902 },
    chayoos: { name: 'Chayoos', lat: 19.1365, lng: 72.902 },
    gymkhana: { name: 'Gymkhana', lat: 19.1325, lng: 72.902 },
    t_point: { name: 'T Point', lat: 19.1285, lng: 72.902 },
    convocation: { name: 'Convocation', lat: 19.1265, lng: 72.902 },
    lhc: { name: 'LHC', lat: 19.1245, lng: 72.902 },
    h10: { name: 'h10 (T-point)', lat: 19.1225, lng: 72.902 },
    maingate: { name: 'Maingate', lat: 19.1185, lng: 72.902 },

    // Branch - top horizontal (Chayoos → H5 → H4)
    h5: { name: 'h5', lat: 19.1365, lng: 72.908 },
    h4: { name: 'h4', lat: 19.1385, lng: 72.914 },

    // Branch - right vertical (H4 → H3 → H2 → H1 → H1-turning)
    h3: { name: 'h3', lat: 19.1355, lng: 72.914 },
    h2: { name: 'h2', lat: 19.1335, lng: 72.914 },
    h1: { name: 'h1', lat: 19.1315, lng: 72.914 },
    h1_turning: { name: 'h1 turning', lat: 19.1285, lng: 72.914 }
  } as Record<StopId, StopDef>
}
