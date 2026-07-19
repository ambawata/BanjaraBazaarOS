import { useMemo, useRef, useState } from 'react'
import { useStore } from '../store/useStore'

const CANVAS_SIZE = 480

// ---------------------------------------------------------------------------
// Photo-space geometry ONLY. Everything below operates in raw tapped-pixel
// coordinates from the uploaded image — there is no bearing, rotation, or
// compass math anywhere in this file. The only thing this tool computes is
// a 0.0-1.0 ratio along the two tapped corner points, which is then applied
// to the SELECTED WALL's own already-verified corner_start/corner_end (both
// already stored in the database from the Advanced tool's normal Tier 1/2
// flow). The resulting point is a real position on that real wall, exactly
// as if the user had clicked it directly on the plot-coordinate canvas — it
// is submitted to the existing POST /doors endpoint unchanged, which is the
// only place bearing/pada assignment logic runs (VastuGeometryService::
// addDoor -> VastuGeometryMath::assignDoorToPada). Nothing here duplicates
// that logic; the client-side preview below is a read-only mirror of it,
// purely for live visual feedback before the real submit.
// ---------------------------------------------------------------------------

function clamp01(t) {
  return Math.max(0, Math.min(1, t))
}

// Ratio of point P's projection onto segment A->B, in whatever space A/B/P
// are expressed in (here: tapped photo pixels). Pure 2D vector projection,
// not a bearing calculation.
function projectRatio(a, b, p) {
  const dx = b.x - a.x
  const dy = b.y - a.y
  const lenSq = dx * dx + dy * dy
  if (lenSq === 0) return 0
  const t = ((p.x - a.x) * dx + (p.y - a.y) * dy) / lenSq
  return clamp01(t)
}

// Read-only mirror of VastuGeometryMath::assignDoorToPada (spec Section 6.4)
// for live preview only — same tie-breaking rule (a position landing exactly
// on a shared pada boundary is reported as spanning both, never forced into
// one). The authoritative assignment always comes from the server response
// after submit, not from this preview.
function previewAssignDoorToPada(positionFt, padas) {
  const matches = padas.filter(p => positionFt >= p.start_ft && positionFt <= p.end_ft)
  if (matches.length === 0) return { pada: null, spans: null }
  if (matches.length === 1) return { pada: matches[0], spans: null }
  return { pada: null, spans: matches }
}

function BoundaryBadge({ boundaryCase, adjacent }) {
  if (!boundaryCase) return null
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amberDim text-amberMuted text-[11px] font-medium">
      ⚠ boundary_case{adjacent ? ` (~${adjacent})` : ''}
    </span>
  )
}

// Horizontal strip showing every real pada on the selected wall, proportional
// to each pada's own start_ft/end_ft span (not assumed equal-width — if the
// wall's pada_count or spacing ever isn't the classical uniform 9, this still
// renders correctly since widths come from the actual data).
function PadaStrip({ wall, highlightPadaIds, highlightSpansIds }) {
  if (!wall?.padas?.length) return null
  const totalFt = wall.length_ft

  return (
    <div>
      <div className="flex w-full h-10 rounded-lg overflow-hidden border border-surface3">
        {wall.padas.map(p => {
          const widthPct = ((p.end_ft - p.start_ft) / totalFt) * 100
          const isHighlighted = highlightPadaIds?.includes(p.id) || highlightSpansIds?.includes(p.id)
          return (
            <div
              key={p.id}
              style={{ width: `${widthPct}%` }}
              className={`flex items-center justify-center text-[11px] font-medium border-r border-surface3 last:border-r-0 transition-colors ${
                isHighlighted ? 'bg-brand-gradient text-white' : 'bg-surface2 text-ink2'
              }`}
              title={`Pada ${p.pada_index} — ${p.start_ft.toFixed(1)}-${p.end_ft.toFixed(1)} ft — ${p.zone_16}`}
            >
              {p.pada_index}
            </div>
          )
        })}
      </div>
      <p className="text-ink3 text-[11px] mt-1">
        {wall.padas.length} pada(s) on this wall — widths shown to scale from the wall's actual stored pada data.
      </p>
    </div>
  )
}

export default function DoorViaPhotoTool() {
  const geometry = useStore(s => s.geometry)
  const addDoor = useStore(s => s.addDoor)
  const loading = useStore(s => s.loading)

  const svgRef = useRef(null)
  const walls = geometry?.walls ?? []

  const [open, setOpen] = useState(false)
  const [wallId, setWallId] = useState('')
  const [bgImage, setBgImage] = useState(null)
  const [cornerA, setCornerA] = useState(null)
  const [cornerB, setCornerB] = useState(null)
  const [doorPoint, setDoorPoint] = useState(null)
  const [lastDoorId, setLastDoorId] = useState(null)

  const wall = walls.find(w => String(w.id) === String(wallId))

  const step = !cornerA ? 'corner-a' : !cornerB ? 'corner-b' : !doorPoint ? 'door' : 'review'

  // Preview-only ratio + pada assignment, recomputed live as the user taps.
  // Mirrors the server's own projection/assignment (see comments above) —
  // superseded by the authoritative response once the door is actually
  // submitted.
  const preview = useMemo(() => {
    if (!wall || !cornerA || !cornerB || !doorPoint) return null
    const t = projectRatio(cornerA, cornerB, doorPoint)
    const positionFt = t * wall.length_ft
    const assignment = previewAssignDoorToPada(positionFt, wall.padas)
    return { t, positionFt, ...assignment }
  }, [wall, cornerA, cornerB, doorPoint])

  const lastDoor = wall?.doors?.find(d => d.id === lastDoorId) ?? null

  function resetTaps() {
    setCornerA(null)
    setCornerB(null)
    setDoorPoint(null)
    setLastDoorId(null)
  }

  function handleWallChange(e) {
    setWallId(e.target.value)
    resetTaps()
  }

  function handleUpload(e) {
    const file = e.target.files?.[0]
    if (file) {
      setBgImage(URL.createObjectURL(file))
      resetTaps()
    }
  }

  function pointFromEvent(e) {
    const rect = svgRef.current.getBoundingClientRect()
    return {
      x: ((e.clientX - rect.left) / rect.width) * CANVAS_SIZE,
      y: ((e.clientY - rect.top) / rect.height) * CANVAS_SIZE,
    }
  }

  function handleCanvasClick(e) {
    if (!wall || !bgImage) return
    const p = pointFromEvent(e)
    if (!cornerA) setCornerA(p)
    else if (!cornerB) setCornerB(p)
    else if (!doorPoint) setDoorPoint(p)
  }

  async function handleConfirm() {
    if (!wall || !preview) return
    // The ONLY math this feature performs itself: convert the photo-space
    // ratio into a point on the SELECTED WALL's real, already-stored corner
    // coordinates. No bearing is read, computed, or overridden here — the
    // backend re-derives everything (including re-projecting this exact
    // point back onto the wall to get the same ratio) from the wall's
    // existing facing_bearing_true, exactly as the manual-coordinate door
    // entry above already does.
    const position = {
      x: wall.corner_start_x + preview.t * (wall.corner_end_x - wall.corner_start_x),
      y: wall.corner_start_y + preview.t * (wall.corner_end_y - wall.corner_start_y),
    }
    const door = await addDoor({ wall_id: wall.id, position }).catch(() => null)
    if (door) {
      setLastDoorId(door.id)
      setCornerA(null)
      setCornerB(null)
      setDoorPoint(null)
    }
  }

  if (!geometry?.plot) return null

  return (
    <div className="bg-surface border border-surface3 rounded-xl p-5">
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-ink1 font-semibold text-lg">Add door via floor plan photo</h2>
        <button
          onClick={() => setOpen(o => !o)}
          className="px-3 py-1.5 rounded-lg border border-surface3 text-ink2 text-xs font-medium hover:bg-surface2"
        >
          {open ? 'Hide' : 'Open'}
        </button>
      </div>
      <p className="text-ink3 text-sm mb-4">
        A more visual way to place a door on a wall you've already added above.
        Tap the wall's two corners in a photo, then tap the door — the door's
        position along the wall is computed from your photo, but its bearing,
        pada, and zone always come from this wall's existing, already-verified
        geometry. No new North reading is taken here.
      </p>

      {open && (
        <div className="space-y-4">
          <div>
            <label className="block text-ink2 text-xs font-medium mb-1">
              Step 1 — Which existing wall does this photo show?
            </label>
            <select
              value={wallId}
              onChange={handleWallChange}
              className="w-full sm:w-96 px-3 py-2 rounded-lg border border-surface3 bg-bg text-ink1 text-sm"
            >
              <option value="">Select a wall…</option>
              {walls.map(w => (
                <option key={w.id} value={w.id}>
                  Wall #{w.id} — {w.length_ft.toFixed(1)} ft, true bearing {w.bearing_true.toFixed(1)}°
                </option>
              ))}
            </select>
            {wall && (
              <p className="text-ink3 text-[11px] mt-1">
                Plot confidence tier: <span className="font-mono">{geometry.plot.confidence_tier}</span>.
                This wall's bearing and length are read as-is from the database — this tool cannot change them.
              </p>
            )}
          </div>

          {wall && (
            <div>
              <label className="px-3 py-1.5 rounded-lg border border-surface3 text-ink2 text-xs font-medium hover:bg-surface2 cursor-pointer inline-block">
                Step 2 — Upload floor plan photo
                <input type="file" accept="image/*" onChange={handleUpload} className="hidden" />
              </label>
            </div>
          )}

          {wall && bgImage && (
            <div>
              <p className="text-ink2 text-xs font-medium mb-2">
                {step === 'corner-a' && 'Step 3 — Tap one end of this wall in the photo'}
                {step === 'corner-b' && 'Step 3 — Now tap the other end of this same wall'}
                {step === 'door' && 'Step 4 — Tap where the door is, along that same wall'}
                {step === 'review' && 'Step 5 — Review and confirm'}
              </p>

              <div className="relative mx-auto" style={{ width: CANVAS_SIZE, height: CANVAS_SIZE }}>
                <img src={bgImage} alt="Floor plan" className="absolute inset-0 w-full h-full object-contain pointer-events-none" />
                <svg
                  ref={svgRef}
                  width={CANVAS_SIZE}
                  height={CANVAS_SIZE}
                  viewBox={`0 0 ${CANVAS_SIZE} ${CANVAS_SIZE}`}
                  onClick={handleCanvasClick}
                  className="relative border border-surface3 rounded-lg cursor-crosshair"
                >
                  {cornerA && cornerB && (
                    <line x1={cornerA.x} y1={cornerA.y} x2={cornerB.x} y2={cornerB.y} stroke="#5A1FB3" strokeWidth={2.5} />
                  )}
                  {cornerA && <circle cx={cornerA.x} cy={cornerA.y} r={5} fill="#5A1FB3" stroke="#fff" strokeWidth={1.5} />}
                  {cornerB && <circle cx={cornerB.x} cy={cornerB.y} r={5} fill="#5A1FB3" stroke="#fff" strokeWidth={1.5} />}
                  {doorPoint && <circle cx={doorPoint.x} cy={doorPoint.y} r={5} fill="#D97706" stroke="#fff" strokeWidth={1.5} />}
                </svg>
              </div>

              {(cornerA || cornerB || doorPoint) && (
                <button
                  onClick={resetTaps}
                  className="mt-2 px-3 py-1.5 rounded-lg border border-surface3 text-ink2 text-xs font-medium hover:bg-surface2"
                >
                  Reset taps
                </button>
              )}
            </div>
          )}

          {wall && preview && (
            <div className="px-4 py-3 rounded-lg bg-surface2 border border-surface3 space-y-3">
              <p className="text-ink2 text-xs font-medium">
                Live preview — {(preview.t * 100).toFixed(1)}% along the wall ≈ {preview.positionFt.toFixed(1)} ft
                from wall #{wall.id}'s start corner (using this wall's real {wall.length_ft.toFixed(1)} ft length).
              </p>

              <PadaStrip
                wall={wall}
                highlightPadaIds={preview.pada ? [preview.pada.id] : null}
                highlightSpansIds={preview.spans ? preview.spans.map(p => p.id) : null}
              />

              {preview.spans ? (
                <p className="text-amberMuted text-xs">
                  ⚠ This position sits exactly on the boundary between pada{' '}
                  {preview.spans.map(p => p.pada_index).join(' and ')}. It will be recorded as spanning both —
                  not forced into a single one.
                </p>
              ) : preview.pada ? (
                <p className="text-ink2 text-xs">
                  Preview assignment: <span className="font-mono">pada {preview.pada.pada_index}</span>{' '}
                  ({preview.pada.zone_16}). Final zone/boundary status is confirmed by the server on submit.
                </p>
              ) : null}

              <button
                onClick={handleConfirm}
                disabled={loading}
                className="px-4 py-2 rounded-lg bg-brand-gradient text-white text-sm font-medium disabled:opacity-50"
              >
                {loading ? 'Saving…' : 'Confirm & save door'}
              </button>
            </div>
          )}

          {lastDoor && (
            <div className="px-4 py-3 rounded-lg bg-greenDim border border-green">
              <p className="text-greenMuted text-sm font-semibold mb-1">✓ Door saved to wall #{wall.id}</p>
              <p className="text-ink2 text-xs">
                True bearing <span className="font-mono">{lastDoor.bearing_true.toFixed(2)}°</span> · Zone (16){' '}
                <span className="font-mono">{lastDoor.zone_16}</span> · Zone (32){' '}
                <span className="font-mono">{lastDoor.zone_32}</span>
              </p>
              <p className="text-ink2 text-xs mt-1">
                {lastDoor.spans_pada_ids
                  ? `Spans padas ${lastDoor.spans_pada_ids.join(' and ')} — `
                  : `Assigned to pada ${lastDoor.pada_id} — `}
                <BoundaryBadge
                  boundaryCase={lastDoor.boundary_case}
                  adjacent={lastDoor.boundary_adjacent_zone_16 || lastDoor.boundary_adjacent_zone_32}
                />
              </p>
            </div>
          )}

          {!wall && (
            <p className="text-ink3 text-sm">Add at least one wall above before using this tool.</p>
          )}
        </div>
      )}
    </div>
  )
}
