import { useMemo, useRef, useState } from 'react'
import { useStore } from '../store/useStore'
import CompassOverlay from './CompassOverlay_v1_20260717'

const CANVAS_SIZE = 560
const PADDING = 40

// ASSUMPTION: this canvas treats 1 SVG/click unit as 1 local-ft unit in the
// plot's coordinate frame (spec Section 5.3's full affine registration
// transform between a raster floor-plan image and the plot's real-world
// coordinates is a further refinement — see the equivalent assumption
// documented in VastuGeometryService::addRoom). The uploaded floor-plan
// image is a visual backdrop only; it is not auto-registered to scale.
function useFit(boundaryVertices) {
  return useMemo(() => {
    if (!boundaryVertices?.length) {
      return { toScreen: (x, y) => [CANVAS_SIZE / 2, CANVAS_SIZE / 2], toLocal: () => ({ x: 0, y: 0 }) }
    }
    const xs = boundaryVertices.map(v => v.x)
    const ys = boundaryVertices.map(v => v.y)
    const minX = Math.min(...xs), maxX = Math.max(...xs)
    const minY = Math.min(...ys), maxY = Math.max(...ys)
    const spanX = Math.max(maxX - minX, 1)
    const spanY = Math.max(maxY - minY, 1)
    const scale = Math.min((CANVAS_SIZE - 2 * PADDING) / spanX, (CANVAS_SIZE - 2 * PADDING) / spanY)

    const toScreen = (x, y) => [
      PADDING + (x - minX) * scale,
      CANVAS_SIZE - PADDING - (y - minY) * scale,
    ]
    const toLocal = (screenX, screenY) => ({
      x: minX + (screenX - PADDING) / scale,
      y: minY + (CANVAS_SIZE - PADDING - screenY) / scale,
    })
    return { toScreen, toLocal }
  }, [boundaryVertices])
}

export default function FloorPlanCanvas() {
  const geometry = useStore(s => s.geometry)
  const addRoom = useStore(s => s.addRoom)
  const addDoor = useStore(s => s.addDoor)

  const svgRef = useRef(null)
  const [bgImage, setBgImage] = useState(null)
  const [mode, setMode] = useState(null) // null | 'room' | 'door'
  const [drawPoints, setDrawPoints] = useState([])
  const [pendingRoomName, setPendingRoomName] = useState('')
  const [doorWallId, setDoorWallId] = useState('')

  const plot = geometry?.plot
  const walls = geometry?.walls ?? []
  const rooms = geometry?.rooms ?? []
  const { toScreen, toLocal } = useFit(plot?.boundary_vertices)

  function handleUpload(e) {
    const file = e.target.files?.[0]
    if (file) setBgImage(URL.createObjectURL(file))
  }

  function screenPointFromEvent(e) {
    const rect = svgRef.current.getBoundingClientRect()
    const screenX = ((e.clientX - rect.left) / rect.width) * CANVAS_SIZE
    const screenY = ((e.clientY - rect.top) / rect.height) * CANVAS_SIZE
    return [screenX, screenY]
  }

  function handleCanvasClick(e) {
    if (!plot) return
    const [sx, sy] = screenPointFromEvent(e)
    const local = toLocal(sx, sy)

    if (mode === 'room') {
      setDrawPoints(pts => [...pts, local])
    } else if (mode === 'door') {
      if (!doorWallId) {
        useStore.getState().addToast('Pick a wall for the door first.', 'warning')
        return
      }
      addDoor({ wall_id: Number(doorWallId), position: local }).catch(() => {})
    }
  }

  function handleCanvasDoubleClick() {
    if (mode !== 'room' || drawPoints.length < 3) return
    setPendingRoomName('')
  }

  async function submitRoom() {
    if (!pendingRoomName.trim() || drawPoints.length < 3) return
    await addRoom({ name: pendingRoomName.trim(), polygon_vertices: drawPoints }).catch(() => {})
    setDrawPoints([])
    setPendingRoomName('')
    setMode(null)
  }

  function cancelDrawing() {
    setDrawPoints([])
    setPendingRoomName('')
  }

  if (!plot) {
    return (
      <div className="bg-surface border border-surface3 shadow-card rounded-2xl p-10 text-center text-ink3 text-sm">
        Save a plot first to unlock the floor plan canvas.
      </div>
    )
  }

  const boundaryScreen = plot.boundary_vertices.map(v => toScreen(v.x, v.y))
  const [centroidScreenX, centroidScreenY] = toScreen(plot.centroid_x, plot.centroid_y)
  const drawPointsScreen = drawPoints.map(p => toScreen(p.x, p.y))

  return (
    <div className="bg-surface border border-surface3 shadow-card rounded-2xl p-5">
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <h2 className="text-ink1 font-display font-semibold text-xl mr-auto">Floor plan canvas</h2>

        <label className="px-3 py-1.5 rounded-lg border border-surface3 text-ink2 text-xs font-medium hover:bg-surface2 cursor-pointer">
          Upload floor plan
          <input type="file" accept="image/*" onChange={handleUpload} className="hidden" />
        </label>

        <button
          onClick={() => { setMode(mode === 'room' ? null : 'room'); setDrawPoints([]) }}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium border ${mode === 'room' ? 'bg-brand-gradient text-white border-transparent' : 'border-surface3 text-ink2 hover:bg-surface2'}`}
        >
          {mode === 'room' ? 'Drawing room… (double-click to close)' : 'Draw room'}
        </button>

        <select
          value={doorWallId}
          onChange={e => setDoorWallId(e.target.value)}
          className="px-2 py-1.5 rounded-lg border border-surface3 bg-bg text-ink2 text-xs"
        >
          <option value="">Wall for door…</option>
          {walls.map(w => (
            <option key={w.id} value={w.id}>Wall #{w.id} ({w.bearing_true?.toFixed(1)}°)</option>
          ))}
        </select>
        <button
          onClick={() => setMode(mode === 'door' ? null : 'door')}
          disabled={!doorWallId}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium border disabled:opacity-40 ${mode === 'door' ? 'bg-brand-gradient text-white border-transparent' : 'border-surface3 text-ink2 hover:bg-surface2'}`}
        >
          {mode === 'door' ? 'Click canvas to place door' : 'Place door'}
        </button>
      </div>

      <div className="relative mx-auto" style={{ width: CANVAS_SIZE, height: CANVAS_SIZE }}>
        {bgImage && (
          <img src={bgImage} alt="Floor plan" className="absolute inset-0 w-full h-full object-contain opacity-40 pointer-events-none" />
        )}

        <svg
          ref={svgRef}
          width={CANVAS_SIZE}
          height={CANVAS_SIZE}
          viewBox={`0 0 ${CANVAS_SIZE} ${CANVAS_SIZE}`}
          onClick={handleCanvasClick}
          onDoubleClick={handleCanvasDoubleClick}
          className="relative bg-bg border border-surface3 rounded-lg cursor-crosshair"
        >
          <polygon
            points={boundaryScreen.map(p => p.join(',')).join(' ')}
            fill="none"
            stroke="#241344"
            strokeWidth={1.5}
            strokeDasharray="4 3"
          />

          {walls.map(w => {
            const [x1, y1] = toScreen(w.corner_start_x, w.corner_start_y)
            const [x2, y2] = toScreen(w.corner_end_x, w.corner_end_y)
            return <line key={w.id} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#5A1FB3" strokeWidth={3} strokeLinecap="round" />
          })}

          {rooms.map(r => {
            const pts = r.polygon_vertices.map(v => toScreen(v.x, v.y))
            return (
              <polygon
                key={r.id}
                points={pts.map(p => p.join(',')).join(' ')}
                fill="#5A1FB3"
                fillOpacity={0.12}
                stroke="#5D35AE"
                strokeWidth={1.5}
              />
            )
          })}

          {walls.flatMap(w => (w.doors ?? []).map(d => {
            const [x, y] = toScreen(d.position_x, d.position_y)
            return <circle key={d.id} cx={x} cy={y} r={4} fill="#D97706" stroke="#fff" strokeWidth={1} />
          }))}

          {drawPoints.length > 0 && (
            <polyline
              points={drawPointsScreen.map(p => p.join(',')).join(' ')}
              fill="none"
              stroke="#5A1FB3"
              strokeWidth={2}
              strokeDasharray="3 3"
            />
          )}
          {drawPointsScreen.map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r={3.5} fill="#5A1FB3" />
          ))}
        </svg>

        <div
          className="absolute pointer-events-none"
          style={{ left: centroidScreenX, top: centroidScreenY, transform: 'translate(-50%, -50%)' }}
        >
          <CompassOverlay rotationR={plot.true_north_rotation_r} walls={walls} rooms={rooms} size={CANVAS_SIZE - 2 * PADDING} />
        </div>
      </div>

      {mode === 'room' && drawPoints.length >= 3 && (
        <div className="flex items-center gap-2 mt-3">
          <input
            value={pendingRoomName}
            onChange={e => setPendingRoomName(e.target.value)}
            placeholder="Room name (e.g. Kitchen)"
            className="px-3 py-1.5 rounded-lg border border-surface3 bg-bg text-ink1 text-sm flex-1"
          />
          <button onClick={submitRoom} className="px-3 py-1.5 rounded-lg bg-brand-gradient text-white text-xs font-medium">
            Save room ({drawPoints.length} pts)
          </button>
          <button onClick={cancelDrawing} className="px-3 py-1.5 rounded-lg border border-surface3 text-ink2 text-xs">
            Cancel
          </button>
        </div>
      )}
    </div>
  )
}
