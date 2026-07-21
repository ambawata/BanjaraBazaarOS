import { useEffect, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { vastuVerdictApi } from '../lib/api'
import LowConfidenceBanner from '../components/LowConfidenceBanner'
import VerdictEntityCard from '../components/VerdictEntityCard'

// Verdict Report — the ONLY page in this app that shows shubh/ashubh,
// severity, or remedy content. Per spec Section 10 the Plot Geometry &
// True North Calibration page must stay verdict-free; this page is the
// separate consumer layer that reads geometry + KB output via GET
// /api/v1/vastu-geometry/plots/{id}/verdicts and renders it. It does not
// call the geometry-mutation endpoints (createPlot/addWalls/addRoom/
// addDoor/calibrate) at all — read-only.
//
// State is kept local to this page rather than added to the shared
// useStore (store/useStore.js) — that store is geometry-tool state
// (plotId/geometry/loading tied to the calibration workflow); verdicts are
// a distinct, independently-fetched concern for a distinct plot_id passed
// via query string, so mixing it into the same store would blur that
// boundary rather than reflect it.
export default function VerdictReportPage() {
  const [searchParams] = useSearchParams()
  const plotId = searchParams.get('plot_id')

  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!plotId) return
    setLoading(true)
    setError(null)
    vastuVerdictApi.getVerdicts(plotId)
      .then(setData)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [plotId])

  if (!plotId) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="bg-surface border border-surface3 shadow-card rounded-2xl p-6 text-center">
          <h1 className="text-ink1 font-display text-xl font-semibold mb-2">No plot selected</h1>
          <p className="text-ink3 text-sm mb-4">
            Open a plot from the Plot Geometry &amp; Calibration tool first, then
            come back here via its "View Verdict Report" link.
          </p>
          <Link
            to="/vastu-griha/geometry-tool"
            className="inline-block px-4 py-2 rounded-lg bg-brand-gradient text-white text-sm font-medium"
          >
            Go to Plot Geometry tool
          </Link>
        </div>
      </div>
    )
  }

  // Group flat verdicts[] by entity (entity_type + entity_id), then by
  // zone within each entity, so a boundary_case entity's dual-zone
  // verdicts and a multi-source entity's independent KB matches (e.g. a
  // door matched by both RZ-01 and DE-01) render together, clearly
  // attributed, never merged into one synthesized verdict.
  const entityGroups = groupVerdicts(data?.verdicts || [])

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-ink1 font-display text-3xl font-semibold">Vastu Verdict Report</h1>
        <p className="text-ink3 text-sm mt-1">
          Every verdict below traces to a specific, verified Knowledge Base
          entry — nothing here is generated. A zone with no matching entry
          is logged as a gap, not filled in.
        </p>
      </div>

      {loading && <p className="text-ink3 text-sm">Loading verdicts…</p>}
      {error && <p className="text-red text-sm">{error}</p>}

      {data && (
        <>
          {data.low_confidence_caution && (
            <LowConfidenceBanner message={data.low_confidence_caution} />
          )}

          <div className="flex items-center gap-4 text-xs text-ink3">
            <span>{data.verdict_count} verdict{data.verdict_count === 1 ? '' : 's'}</span>
            <span>·</span>
            <span>{data.zero_hit_count} zone{data.zero_hit_count === 1 ? '' : 's'} with no KB match (logged for review)</span>
          </div>

          {entityGroups.length === 0 && (
            <div className="bg-surface border border-surface3 shadow-card rounded-2xl p-6 text-center text-ink3 text-sm">
              No verdicts yet — add rooms/doors to this plot in the geometry
              tool, or none of this plot's zones have a matching KB entry.
            </div>
          )}

          <div className="grid gap-4">
            {entityGroups.map(group => (
              <VerdictEntityCard key={`${group.entityType}-${group.entityId}`} group={group} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

function groupVerdicts(verdicts) {
  const byEntity = new Map()

  for (const v of verdicts) {
    const entityKey = `${v.entity_type}-${v.entity_id}`
    if (!byEntity.has(entityKey)) {
      byEntity.set(entityKey, { entityType: v.entity_type, entityId: v.entity_id, zones: new Map() })
    }
    const entity = byEntity.get(entityKey)
    if (!entity.zones.has(v.zone)) {
      entity.zones.set(v.zone, [])
    }
    entity.zones.get(v.zone).push(v)
  }

  return Array.from(byEntity.values()).map(entity => ({
    ...entity,
    zones: Array.from(entity.zones.entries()).map(([zone, verdicts]) => ({ zone, verdicts })),
    boundaryCase: Array.from(entity.zones.values()).flat().some(v => v.boundary_case),
  }))
}
