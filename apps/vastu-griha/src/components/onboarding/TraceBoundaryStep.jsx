import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import { useLeafletMap } from '../../lib/useLeafletMap'
import { vastuMapOnboardingApi } from '../../lib/api'
import { MIN_CORNERS, TRACE_ZOOM } from '../../config/onboarding'

// Hand-rolled tap-to-add-corner interaction rather than Leaflet-Geoman /
// Leaflet.draw (both suggested in the task) — those plugins ship a full
// multi-shape drawing/editing toolbar (handles, edit mode, delete mode,
// several geometry types) which is more than this step needs and doesn't
// naturally support the specific Hinglish micro-copy / first-tap hint
// this step requires. What's actually needed is simple enough (tap ->
// push point -> redraw polygon -> Done once >=3 points) to implement
// directly against the Leaflet map instance with a plain click handler.
export default function TraceBoundaryStep({ center, addressLabel, onComplete }) {
  const containerRef = useRef(null)
  const { map, satelliteOn, toggleSatellite } = useLeafletMap(containerRef, { center, zoom: TRACE_ZOOM })
  const layersRef = useRef({ markers: [], polygon: null, hintMarker: null })

  const [points, setPoints] = useState([])
  const [plotName, setPlotName] = useState('')
  const [hasTappedOnce, setHasTappedOnce] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  // First-use animated hint: a pulsing dot near the plot center, "yahan
  // tap karo", cleared the moment the user places their first real point.
  useEffect(() => {
    if (!map || hasTappedOnce) return

    const hintIcon = L.divIcon({
      className: '',
      html: '<div class="onboarding-pulse-dot"></div>',
      iconSize: [24, 24],
    })
    const hintMarker = L.marker([center.lat, center.lng], { icon: hintIcon, interactive: false }).addTo(map)
    const hintPopup = L.popup({ closeButton: false, autoClose: false, closeOnClick: false })
      .setLatLng([center.lat, center.lng])
      .setContent('👆 yahan tap karo')
      .openOn(map)

    layersRef.current.hintMarker = hintMarker

    return () => {
      map.removeLayer(hintMarker)
      map.closePopup(hintPopup)
    }
  }, [map, hasTappedOnce, center])

  // Click-to-add-corner + live polygon redraw.
  useEffect(() => {
    if (!map) return

    function handleClick(e) {
      setHasTappedOnce(true)
      setPoints(prev => [...prev, { lat: e.latlng.lat, lng: e.latlng.lng }])
    }

    map.on('click', handleClick)
    return () => map.off('click', handleClick)
  }, [map])

  useEffect(() => {
    if (!map) return
    const layers = layersRef.current

    layers.markers.forEach(m => map.removeLayer(m))
    if (layers.polygon) map.removeLayer(layers.polygon)

    layers.markers = points.map((p, i) =>
      L.circleMarker([p.lat, p.lng], {
        radius: 9,
        color: '#5A1FB3',
        fillColor: '#5D35AE',
        fillOpacity: 1,
        weight: 2,
      }).bindTooltip(`${i + 1}`, { permanent: true, direction: 'center', className: 'onboarding-corner-label' }).addTo(map)
    )

    if (points.length >= 2) {
      layers.polygon = L.polygon(points.map(p => [p.lat, p.lng]), {
        color: '#5A1FB3',
        weight: 3,
        fillColor: '#5D35AE',
        fillOpacity: 0.25,
      }).addTo(map)
    }
  }, [map, points])

  function undoLastPoint() {
    setPoints(prev => prev.slice(0, -1))
  }

  async function handleDone() {
    if (points.length < MIN_CORNERS) return
    if (!plotName.trim()) {
      setError('Ghar ka naam likho pehle.')
      return
    }

    setSaving(true)
    setError(null)
    try {
      const plot = await vastuMapOnboardingApi.createPlotFromMap({
        name: plotName.trim(),
        address: addressLabel,
        boundary_latlng: points,
      })
      const zoneGrid = await vastuMapOnboardingApi.getZoneGrid(plot.id)
      onComplete(plot, zoneGrid, points)
    } catch (e) {
      setError(e.message || 'Plot save nahi ho paaya. Dobara try karo.')
    } finally {
      setSaving(false)
    }
  }

  const canFinish = points.length >= MIN_CORNERS

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-3 bg-surface border-b border-surface3">
        <h2 className="text-ink1 font-display font-semibold text-lg">Apne plot ke corners pe tap karo</h2>
        <p className="text-ink3 text-xs">Tap your plot's corners — kam se kam {MIN_CORNERS} points</p>
      </div>

      <div className="relative flex-1 min-h-[360px]">
        <div ref={containerRef} className="absolute inset-0" />

        <button
          onClick={toggleSatellite}
          className="absolute top-3 right-3 z-[1000] px-3 py-2 rounded-lg bg-surface shadow-lg text-xs font-medium text-ink1"
        >
          {satelliteOn ? '🗺️ Street view' : '🛰️ Satellite view'}
        </button>

        {points.length > 0 && (
          <button
            onClick={undoLastPoint}
            className="absolute top-3 left-3 z-[1000] px-3 py-2 rounded-lg bg-surface shadow-lg text-xs font-medium text-ink1"
          >
            ↩ Undo
          </button>
        )}
      </div>

      <div className="px-4 py-4 bg-surface border-t border-surface3 space-y-3">
        {error && <p className="text-red text-sm">{error}</p>}

        {canFinish && (
          <input
            type="text"
            value={plotName}
            onChange={e => setPlotName(e.target.value)}
            placeholder="Ghar ka naam (e.g. Sharma Niwas)"
            className="w-full px-4 py-3 rounded-xl border-2 border-surface3 bg-bg text-ink1 text-sm focus:outline-none focus:border-brand"
          />
        )}

        <button
          onClick={handleDone}
          disabled={!canFinish || saving}
          className="w-full py-4 rounded-xl bg-brand-gradient text-white text-base font-semibold disabled:opacity-40"
        >
          {saving ? 'Save ho raha hai…' : canFinish ? '✓ Ho gaya (Done)' : `${points.length}/${MIN_CORNERS} corners tap karo`}
        </button>
      </div>
    </div>
  )
}
