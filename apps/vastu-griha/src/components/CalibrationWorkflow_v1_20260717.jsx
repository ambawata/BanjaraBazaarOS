import { useMemo, useState } from 'react'
import { useStore } from '../store/useStore'

// Mirrors VastuGeometryMath::calibrateOffset (backend/services/VastuGeometryMath.php)
// exactly, for a client-side "Step 3" preview before the user commits by
// clicking "Apply to all" (which is the only step that actually calls the
// backend POST /calibrate endpoint — there is no separate preview API,
// per the task's fixed 6-endpoint list).
function normalizeBearing(b) {
  let x = b % 360
  if (x < 0) x += 360
  return x
}
function calibrateOffsetPreview(trueBearing, rawReading) {
  let diff = normalizeBearing(trueBearing) - normalizeBearing(rawReading)
  diff = ((diff + 180) % 360 + 360) % 360
  return diff - 180
}

export default function CalibrationWorkflow() {
  const geometry = useStore(s => s.geometry)
  const calibrate = useStore(s => s.calibrate)
  const loading = useStore(s => s.loading)
  const lastCalibrationResult = useStore(s => s.lastCalibrationResult)

  const walls = geometry?.walls ?? []
  const calibrations = geometry?.calibrations ?? []

  const [referenceWallId, setReferenceWallId] = useState('')
  const [rawReading, setRawReading] = useState('')
  const [useCrossCheck, setUseCrossCheck] = useState(false)
  const [secondWallId, setSecondWallId] = useState('')
  const [secondRawReading, setSecondRawReading] = useState('')

  const referenceWall = walls.find(w => String(w.id) === String(referenceWallId))

  const previewOffset = useMemo(() => {
    if (!referenceWall || rawReading === '') return null
    return calibrateOffsetPreview(referenceWall.facing_bearing_true, parseFloat(rawReading))
  }, [referenceWall, rawReading])

  async function handleApply() {
    if (!referenceWallId || rawReading === '') return
    const payload = {
      reference_wall_id: Number(referenceWallId),
      raw_reading_degrees: parseFloat(rawReading),
    }
    if (useCrossCheck && secondWallId && secondRawReading !== '') {
      payload.second_reference_wall_id = Number(secondWallId)
      payload.second_raw_reading_degrees = parseFloat(secondRawReading)
    }
    await calibrate(payload).catch(() => {})
  }

  if (walls.length === 0) {
    return (
      <div className="bg-surface border border-surface3 rounded-xl p-6 text-ink3 text-sm">
        Add at least one wall before running true north calibration.
      </div>
    )
  }

  return (
    <div className="bg-surface border border-surface3 rounded-xl p-6">
      <h2 className="text-ink1 font-semibold text-lg mb-1">True north calibration</h2>
      <p className="text-ink3 text-sm mb-5">
        Tier 2.5 method — corroborate one wall's already-known true bearing
        against a fresh on-site compass reading, then apply the resulting
        offset to every bearing on this plot.
      </p>

      <div className="grid sm:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-ink2 text-xs font-medium mb-1">Step 1 — Reference wall</label>
          <select
            value={referenceWallId}
            onChange={e => setReferenceWallId(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-surface3 bg-bg text-ink1 text-sm"
          >
            <option value="">Select a wall…</option>
            {walls.map(w => (
              <option key={w.id} value={w.id}>Wall #{w.id} — stored true bearing {w.facing_bearing_true?.toFixed(1)}°</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-ink2 text-xs font-medium mb-1">Step 2 — Raw on-site compass reading (deg)</label>
          <input
            type="number"
            step="0.1"
            value={rawReading}
            onChange={e => setRawReading(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-surface3 bg-bg text-ink1 text-sm font-mono"
            placeholder="e.g. 178.8"
          />
        </div>
      </div>

      {previewOffset !== null && (
        <div className="mb-4 px-4 py-3 rounded-lg bg-surface2 border border-surface3">
          <p className="text-ink2 text-xs font-medium mb-0.5">Step 3 — Computed offset (preview)</p>
          <p className="text-ink1 text-lg font-mono font-semibold">{previewOffset >= 0 ? '+' : ''}{previewOffset.toFixed(2)}°</p>
        </div>
      )}

      <div className="mb-4">
        <label className="flex items-center gap-2 text-ink2 text-xs font-medium mb-2">
          <input type="checkbox" checked={useCrossCheck} onChange={e => setUseCrossCheck(e.target.checked)} />
          Step 5 — Second-wall cross-check (optional, ±2° default tolerance)
        </label>
        {useCrossCheck && (
          <div className="grid sm:grid-cols-2 gap-3 pl-6">
            <select
              value={secondWallId}
              onChange={e => setSecondWallId(e.target.value)}
              className="px-3 py-2 rounded-lg border border-surface3 bg-bg text-ink1 text-sm"
            >
              <option value="">Select a second wall…</option>
              {walls.filter(w => String(w.id) !== String(referenceWallId)).map(w => (
                <option key={w.id} value={w.id}>Wall #{w.id}</option>
              ))}
            </select>
            <input
              type="number"
              step="0.1"
              value={secondRawReading}
              onChange={e => setSecondRawReading(e.target.value)}
              className="px-3 py-2 rounded-lg border border-surface3 bg-bg text-ink1 text-sm font-mono"
              placeholder="Raw reading for that wall"
            />
          </div>
        )}
      </div>

      <button
        onClick={handleApply}
        disabled={loading || !referenceWallId || rawReading === ''}
        className="px-4 py-2 rounded-lg bg-brand-gradient text-white text-sm font-medium disabled:opacity-50"
      >
        {loading ? 'Applying…' : 'Step 4 — Apply to all'}
      </button>

      {lastCalibrationResult?.cross_check && (
        <div className={`mt-4 px-4 py-3 rounded-lg border ${lastCalibrationResult.cross_check.pass ? 'bg-greenDim border-green text-greenMuted' : 'bg-redDim border-red text-redMuted'}`}>
          <p className="text-xs font-semibold">
            Cross-check {lastCalibrationResult.cross_check.pass ? 'PASS' : 'FAIL'} — difference {lastCalibrationResult.cross_check.difference_degrees.toFixed(2)}° (tolerance ±{lastCalibrationResult.cross_check.tolerance_degrees}°)
          </p>
        </div>
      )}

      {calibrations.length > 0 && (
        <div className="mt-5 pt-4 border-t border-surface3">
          <p className="text-ink2 text-xs font-medium mb-2">Step 6 — Calibration history (locked, read-only)</p>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-ink3 text-left">
                  <th className="pr-4 py-1">Calibrated at</th>
                  <th className="pr-4 py-1">Reference wall</th>
                  <th className="pr-4 py-1">Raw</th>
                  <th className="pr-4 py-1">True</th>
                  <th className="pr-4 py-1">Offset</th>
                </tr>
              </thead>
              <tbody className="font-mono text-ink1">
                {calibrations.map(c => (
                  <tr key={c.id} className="border-t border-surface3">
                    <td className="pr-4 py-1.5">{c.calibrated_at}</td>
                    <td className="pr-4 py-1.5">#{c.reference_wall_id}</td>
                    <td className="pr-4 py-1.5">{c.raw_reading_degrees.toFixed(2)}°</td>
                    <td className="pr-4 py-1.5">{c.true_reading_degrees.toFixed(2)}°</td>
                    <td className="pr-4 py-1.5">{c.offset_degrees >= 0 ? '+' : ''}{c.offset_degrees.toFixed(2)}°</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
