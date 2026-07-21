import { useState } from 'react'
import { useStore } from '../store/useStore'
import { AMBNIWAS_FIXTURE } from '../data/ambniwasFixture'

const TIERS = [
  { value: 'tier1_survey', label: 'Tier 1 — Land survey / architect plan' },
  { value: 'tier2_satellite', label: 'Tier 2 — Satellite imagery (cross-validated)' },
  { value: 'tier3_compass', label: 'Tier 3 — On-site compass only' },
]

// Parses one vertex per line, "a,b" -> {x,y} or {lat,lon} depending on
// coordinateType. Blank lines are ignored.
function parseVertices(text, coordinateType) {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean)
  return lines.map(line => {
    const [a, b] = line.split(',').map(v => parseFloat(v.trim()))
    return coordinateType === 'latlon' ? { lat: a, lon: b } : { x: a, y: b }
  })
}

function verticesToText(vertices, coordinateType) {
  return vertices
    .map(v => (coordinateType === 'latlon' ? `${v.lat},${v.lon}` : `${v.x},${v.y}`))
    .join('\n')
}

export default function PlotSetupPanel() {
  const createPlot = useStore(s => s.createPlot)
  const loading = useStore(s => s.loading)

  const [name, setName] = useState('')
  const [coordinateType, setCoordinateType] = useState('local_ft')
  const [verticesText, setVerticesText] = useState('')
  const [confidenceTier, setConfidenceTier] = useState('tier2_satellite')
  const [rotationR, setRotationR] = useState('0')
  const [error, setError] = useState('')

  function loadFixture() {
    const f = AMBNIWAS_FIXTURE.plot
    setName(f.name)
    setCoordinateType(f.coordinate_type)
    setVerticesText(verticesToText(f.boundary_vertices, f.coordinate_type))
    setConfidenceTier(f.confidence_tier)
    setRotationR(String(f.true_north_rotation_r))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    const boundary_vertices = parseVertices(verticesText, coordinateType)
    if (boundary_vertices.length < 3) {
      setError('At least 3 boundary vertices are required (one "x,y" or "lat,lon" pair per line).')
      return
    }

    try {
      await createPlot({
        name,
        coordinate_type: coordinateType,
        boundary_vertices,
        confidence_tier: confidenceTier,
        true_north_rotation_r: parseFloat(rotationR) || 0,
      })
    } catch {
      // toast already shown by the store
    }
  }

  return (
    <div className="bg-surface border border-surface3 shadow-card rounded-2xl p-6 max-w-xl">
      <h2 className="text-ink1 font-display font-semibold text-xl mb-1">Plot setup</h2>
      <p className="text-ink3 text-sm mb-5">
        Enter the plot boundary once. Everything downstream (centroid, wall
        bearings, padas, rooms, doors) is computed from this and the true
        north rotation.
      </p>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-ink2 text-xs font-medium mb-1">Plot name</label>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-surface3 bg-bg text-ink1 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
            placeholder="e.g. AmbNiwas"
            required
          />
        </div>

        <div>
          <label className="block text-ink2 text-xs font-medium mb-1">Coordinate type</label>
          <select
            value={coordinateType}
            onChange={e => setCoordinateType(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-surface3 bg-bg text-ink1 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
          >
            <option value="local_ft">Local feet / pixel coords (x, y)</option>
            <option value="latlon">Lat / Long (satellite-derived)</option>
          </select>
        </div>

        <div>
          <label className="block text-ink2 text-xs font-medium mb-1">
            Boundary vertices — one per line, {coordinateType === 'latlon' ? 'lat,lon' : 'x,y'}
          </label>
          <textarea
            value={verticesText}
            onChange={e => setVerticesText(e.target.value)}
            rows={6}
            className="w-full px-3 py-2 rounded-lg border border-surface3 bg-bg text-ink1 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-brand"
            placeholder={coordinateType === 'latlon' ? '18.5204,73.8567\n18.5205,73.8570\n...' : '-100,-100\n100,-100\n100,100\n-100,100'}
            required
          />
        </div>

        <div>
          <label className="block text-ink2 text-xs font-medium mb-1">Confidence tier</label>
          <select
            value={confidenceTier}
            onChange={e => setConfidenceTier(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-surface3 bg-bg text-ink1 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
          >
            {TIERS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-ink2 text-xs font-medium mb-1">
            True north rotation R (deg, optional — refine later via calibration)
          </label>
          <input
            type="number"
            step="0.01"
            value={rotationR}
            onChange={e => setRotationR(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-surface3 bg-bg text-ink1 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-brand"
          />
        </div>

        {error && <p className="text-red text-sm">{error}</p>}

        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 rounded-lg bg-brand-gradient text-white text-sm font-medium disabled:opacity-50"
          >
            {loading ? 'Saving…' : 'Save plot'}
          </button>
          <button
            type="button"
            onClick={loadFixture}
            className="px-4 py-2 rounded-lg border border-surface3 text-ink2 text-sm font-medium hover:bg-surface2"
          >
            Load AmbNiwas fixture (Tier 2 self-check)
          </button>
        </div>
      </form>
    </div>
  )
}
