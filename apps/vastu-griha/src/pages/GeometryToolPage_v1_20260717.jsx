import { Link } from 'react-router-dom'
import { useStore } from '../store/useStore'
import { AMBNIWAS_FIXTURE } from '../data/ambniwasFixture'
import PlotSetupPanel from '../components/PlotSetupPanel_v1_20260717'
import FloorPlanCanvas from '../components/FloorPlanCanvas_v1_20260717'
import DoorViaPhotoTool from '../components/DoorViaPhotoTool'
import CalibrationWorkflow from '../components/CalibrationWorkflow_v1_20260717'
import GeometryResultsTable from '../components/GeometryResultsTable_v1_20260717'

function FixtureVerificationBanner() {
  const geometry = useStore(s => s.geometry)
  const addWalls = useStore(s => s.addWalls)
  const loading = useStore(s => s.loading)

  const plot = geometry?.plot
  const isFixturePlot = plot?.name === AMBNIWAS_FIXTURE.plot.name
  if (!isFixturePlot) return null

  const frontWall = geometry.walls.find(
    w => Math.abs(w.corner_start_y - AMBNIWAS_FIXTURE.frontWall.corner_start.y) < 0.01
      && Math.abs(w.corner_start_x - AMBNIWAS_FIXTURE.frontWall.corner_start.x) < 0.01
  )

  if (!frontWall) {
    return (
      <div className="mb-6 px-4 py-3 rounded-lg bg-surface2 border border-surface3 flex items-center justify-between gap-4">
        <p className="text-ink2 text-sm">
          AmbNiwas fixture plot loaded. Add the front/gate wall to run the built-in self-check
          (expected: <span className="font-mono">203.8° / SSW</span>).
        </p>
        <button
          disabled={loading}
          onClick={() => addWalls(AMBNIWAS_FIXTURE.frontWall).catch(() => {})}
          className="shrink-0 px-3 py-1.5 rounded-lg bg-brand-gradient text-white text-xs font-medium disabled:opacity-50"
        >
          Add front wall
        </button>
      </div>
    )
  }

  const pass = Math.abs(frontWall.bearing_true - AMBNIWAS_FIXTURE.expected.facing_bearing_true) < 0.01
    && frontWall.zone_16 === AMBNIWAS_FIXTURE.expected.zone_16

  return (
    <div className={`mb-6 px-4 py-3 rounded-lg border ${pass ? 'bg-greenDim border-green text-greenMuted' : 'bg-redDim border-red text-redMuted'}`}>
      <p className="text-sm font-semibold">
        {pass ? '✓' : '✗'} Built-in self-check: front wall computed to{' '}
        <span className="font-mono">{frontWall.bearing_true.toFixed(1)}° / {frontWall.zone_16}</span>
        {' '}(expected 203.8° / SSW, Tier 2 — not ground truth)
      </p>
    </div>
  )
}

export default function GeometryToolPage() {
  const geometry = useStore(s => s.geometry)
  const reset = useStore(s => s.reset)
  const hasPlot = Boolean(geometry?.plot)

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-ink1 font-display text-3xl font-semibold">Plot Geometry & True North Calibration</h1>
        <p className="text-ink3 text-sm mt-1">
          Geometry layer only — plot centroid, wall/pada/room/door bearings, and
          16/32-point zone classification. No Vastu rules, verdicts, or remedies
          are computed or shown on this page.
        </p>
      </div>

      {hasPlot && <FixtureVerificationBanner />}

      {!hasPlot ? (
        <PlotSetupPanel />
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-ink1 font-display font-semibold text-lg">{geometry.plot.name}</h2>
              <p className="text-ink3 text-xs font-mono">
                centroid ({geometry.plot.centroid_x.toFixed(2)}, {geometry.plot.centroid_y.toFixed(2)}) ·
                {' '}R = {geometry.plot.true_north_rotation_r.toFixed(2)}° ·
                {' '}{geometry.plot.confidence_tier}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {/* Pure navigation link, no verdict content on this page —
                  spec Section 10 keeps this tool verdict-free; the actual
                  shubh/ashubh/severity/remedy content lives only on
                  /vastu-griha/verdict-report. */}
              <Link
                to={`/vastu-griha/verdict-report?plot_id=${geometry.plot.id}`}
                className="px-3 py-1.5 rounded-lg bg-brand-gradient text-white text-xs font-medium"
              >
                View Verdict Report
              </Link>
              <button onClick={reset} className="px-3 py-1.5 rounded-lg border border-surface3 text-ink2 text-xs font-medium hover:bg-surface2">
                Start a new plot
              </button>
            </div>
          </div>

          <FloorPlanCanvas />
          <DoorViaPhotoTool />
          <CalibrationWorkflow />
          <GeometryResultsTable />
        </div>
      )}
    </div>
  )
}
