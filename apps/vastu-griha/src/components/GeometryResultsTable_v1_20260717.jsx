import { useStore } from '../store/useStore'

// Read-only computed results — geometry only. No Vastu verdict, severity,
// or remedy text anywhere in this component (spec Section 10 / task
// constraint #6).
function BoundaryBadge({ boundaryCase, adjacent }) {
  if (!boundaryCase) return <span className="text-ink3">—</span>
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-goldDim text-goldMuted text-[11px] font-semibold">
      ⚠ boundary_case{adjacent ? ` (~${adjacent})` : ''}
    </span>
  )
}

function Row({ type, id, label, bearingPlan, bearingTrue, zone16, zone32, boundaryCase, adjacent }) {
  return (
    <tr className="border-t border-surface3">
      <td className="pr-4 py-2 text-ink3 text-xs uppercase tracking-wide">{type}</td>
      <td className="pr-4 py-2 text-ink1 font-medium">{label}</td>
      <td className="pr-4 py-2 font-mono text-ink2">{bearingPlan?.toFixed(2)}°</td>
      <td className="pr-4 py-2 font-mono text-ink1 font-semibold">{bearingTrue?.toFixed(2)}°</td>
      <td className="pr-4 py-2 text-ink1">{zone16}</td>
      <td className="pr-4 py-2 text-ink2">{zone32}</td>
      <td className="pr-4 py-2"><BoundaryBadge boundaryCase={boundaryCase} adjacent={adjacent} /></td>
    </tr>
  )
}

export default function GeometryResultsTable() {
  const geometry = useStore(s => s.geometry)
  if (!geometry?.plot) return null

  const { walls, rooms } = geometry

  return (
    <div className="bg-surface border border-surface3 shadow-card rounded-2xl p-6">
      <h2 className="text-ink1 font-display font-semibold text-xl mb-1">Results</h2>
      <p className="text-ink3 text-sm mb-4">
        Every wall, pada, room, and door — plan bearing, true bearing, and
        16/32-point zone classification. Geometry only.
      </p>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-ink3 text-left text-xs">
              <th className="pr-4 py-2">Type</th>
              <th className="pr-4 py-2">Entity</th>
              <th className="pr-4 py-2">Plan bearing</th>
              <th className="pr-4 py-2">True bearing</th>
              <th className="pr-4 py-2">Zone (16)</th>
              <th className="pr-4 py-2">Zone (32)</th>
              <th className="pr-4 py-2">Boundary case</th>
            </tr>
          </thead>
          <tbody>
            {walls.map(w => (
              <Row
                key={`wall-${w.id}`}
                type="Wall"
                id={w.id}
                label={`#${w.id} (${w.length_ft.toFixed(1)} ft)`}
                bearingPlan={w.bearing_plan}
                bearingTrue={w.bearing_true}
                zone16={w.zone_16}
                zone32={w.zone_32}
                boundaryCase={w.boundary_case}
                adjacent={w.boundary_adjacent_zone_16 || w.boundary_adjacent_zone_32}
              />
            ))}
            {walls.flatMap(w => w.padas.map(p => (
              <Row
                key={`pada-${p.id}`}
                type="Pada"
                id={p.id}
                label={`Wall #${w.id} · Pada ${p.pada_index}`}
                bearingPlan={p.bearing_plan}
                bearingTrue={p.bearing_true}
                zone16={p.zone_16}
                zone32={p.zone_32}
                boundaryCase={p.boundary_case}
                adjacent={p.boundary_adjacent_zone_16 || p.boundary_adjacent_zone_32}
              />
            )))}
            {rooms.map(r => (
              <Row
                key={`room-${r.id}`}
                type="Room"
                id={r.id}
                label={r.name}
                bearingPlan={r.bearing_plan}
                bearingTrue={r.bearing_true}
                zone16={r.zone_16}
                zone32={r.zone_32}
                boundaryCase={r.boundary_case}
                adjacent={r.boundary_adjacent_zone_16 || r.boundary_adjacent_zone_32}
              />
            ))}
            {walls.flatMap(w => w.doors.map(d => (
              <Row
                key={`door-${d.id}`}
                type="Door"
                id={d.id}
                label={`Wall #${w.id} · Door ${d.spans_pada_ids ? `spans padas ${d.spans_pada_ids.join('/')}` : `pada ${d.pada_id ?? '—'}`}`}
                bearingPlan={d.bearing_plan}
                bearingTrue={d.bearing_true}
                zone16={d.zone_16}
                zone32={d.zone_32}
                boundaryCase={d.boundary_case}
                adjacent={d.boundary_adjacent_zone_16 || d.boundary_adjacent_zone_32}
              />
            )))}
            {walls.length === 0 && rooms.length === 0 && (
              <tr><td colSpan={7} className="py-6 text-center text-ink3 text-sm">No walls, rooms, or doors yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
