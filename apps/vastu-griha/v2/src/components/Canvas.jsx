import React, { useRef, useState, useEffect } from 'react'
import { evaluateRoom } from './AnalysisPanel'
import { useCanvasStore } from '../stores/canvasStore'
import { useProjectStore } from '../stores/projectStore'
import { useSettingsStore } from '../stores/settingsStore'
import { useUiStore } from '../stores/uiStore'
import { snapEngine } from '../lib/geometry/snapEngine'
import { coordinateSystem } from '../lib/geometry/coordinateSystem'
import { hasRoomCollision, isRoomInsideBoundary } from '../lib/geometry/collisionEngine'
import { getPadasInZone } from '../lib/vastu/padaKnowledge'
import RoomSymbol from './RoomSymbol'

// Light pastel fill + matching thin border per room type — a plain white
// box with a thick black outline read as generic/CAD-like; a soft color
// per room type (kept subtle enough not to fight with the furniture
// drawing or labels inside it) reads as an actual furnished floor plan.
// Blueprint mode ignores this entirely and stays black & white.
const ROOM_COLOR_PALETTE = {
  bedroom: { fill: '#EEECFC', border: '#8B7FE0' },
  living: { fill: '#FCEBEF', border: '#E28BA6' },
  kitchen: { fill: '#FDEEDB', border: '#E0A25C' },
  toilet: { fill: '#E3F7F3', border: '#4FBFA8' },
  pooja: { fill: '#FFF6DE', border: '#D0B04A' },
  staircase: { fill: '#ECECEC', border: '#9A9A9A' },
  lift: { fill: '#E7ECFB', border: '#7C93D9' },
  custom: { fill: '#F1EEFB', border: '#9C8FE0' }
}
function roomColors(type) {
  return ROOM_COLOR_PALETTE[type] || ROOM_COLOR_PALETTE.custom
}

// evaluateRoom's status text has spaces ("Needs Attention"), which breaks a
// className if used directly -- the browser reads it as two separate classes.
// Map to a single CSS-safe word instead.
function complianceClassFor(status) {
  if (status === 'Excellent') return 'excellent'
  if (status === 'Good' || status === 'Neutral') return 'good'
  if (status === 'Can Be Improved') return 'warning'
  return 'poor'
}

// Same 3x3 zone grid & thresholds evaluateRoom() in AnalysisPanel.jsx uses
// for a room's own Vastu zone — reused here so a wall's compass label
// always agrees with the zone math already driving the Vastu score,
// instead of a second parallel definition of the grid.
function getZoneCode(cx, cy) {
  const col = cx < 33.3 ? 0 : cx >= 66.6 ? 2 : 1
  const row = cy < 33.3 ? 0 : cy >= 66.6 ? 2 : 1
  const zoneMap = [['NW', 'N', 'NE'], ['W', 'Center', 'E'], ['SW', 'S', 'SE']]
  return zoneMap[row][col]
}

// A room's edge counts as a genuine shared wall with a neighbor when the
// neighbor's matching edge sits at (almost) the same coordinate AND their
// spans overlap by a meaningful amount — not just corners grazing each
// other. This is what makes "extend/shorten while staying connected"
// possible without a full wall-graph rewrite: moving a shared wall just
// resizes both rooms in lockstep along their shared edge.
const SHARED_WALL_TOLERANCE = 1
const SHARED_WALL_MIN_OVERLAP = 3

function findSharedWall(room, side, allRooms) {
  const isBlockingCategory = (r) => !r.category || r.category === 'room'
  if (!isBlockingCategory(room)) return null

  for (const other of allRooms) {
    if (other.id === room.id || !isBlockingCategory(other)) continue

    if (side === 'right') {
      if (Math.abs((room.x + room.width) - other.x) > SHARED_WALL_TOLERANCE) continue
      const overlap = Math.min(room.y + room.height, other.y + other.height) - Math.max(room.y, other.y)
      if (overlap >= SHARED_WALL_MIN_OVERLAP) return { neighborId: other.id, neighborSide: 'left', axis: 'x' }
    } else if (side === 'left') {
      if (Math.abs(room.x - (other.x + other.width)) > SHARED_WALL_TOLERANCE) continue
      const overlap = Math.min(room.y + room.height, other.y + other.height) - Math.max(room.y, other.y)
      if (overlap >= SHARED_WALL_MIN_OVERLAP) return { neighborId: other.id, neighborSide: 'right', axis: 'x' }
    } else if (side === 'bottom') {
      if (Math.abs((room.y + room.height) - other.y) > SHARED_WALL_TOLERANCE) continue
      const overlap = Math.min(room.x + room.width, other.x + other.width) - Math.max(room.x, other.x)
      if (overlap >= SHARED_WALL_MIN_OVERLAP) return { neighborId: other.id, neighborSide: 'top', axis: 'y' }
    } else if (side === 'top') {
      if (Math.abs(room.y - (other.y + other.height)) > SHARED_WALL_TOLERANCE) continue
      const overlap = Math.min(room.x + room.width, other.x + other.width) - Math.max(room.x, other.x)
      if (overlap >= SHARED_WALL_MIN_OVERLAP) return { neighborId: other.id, neighborSide: 'bottom', axis: 'y' }
    }
  }
  return null
}

const SNAP_TOLERANCE_PCT = 1.2

// Magnetically snaps a moving room's left/center/right and top/center/
// bottom to whichever other room (or the plot's own center) it's closest
// to lining up with, and reports which guide line(s) to draw. Only one
// horizontal and one vertical guide show at a time — the closest match
// on each axis — so the canvas doesn't fill with lines while dragging.
function computeSnapGuides(room, x, y, allRooms) {
  const isBlockingCategory = (r) => !r.category || r.category === 'room'
  const targetsX = [{ pos: 0 }, { pos: 50 }, { pos: 100 }]
  const targetsY = [{ pos: 0 }, { pos: 50 }, { pos: 100 }]
  allRooms.forEach(r => {
    if (r.id === room.id || !isBlockingCategory(r)) return
    targetsX.push({ pos: r.x }, { pos: r.x + r.width / 2 }, { pos: r.x + r.width })
    targetsY.push({ pos: r.y }, { pos: r.y + r.height / 2 }, { pos: r.y + r.height })
  })

  const roomEdgesX = [
    { edge: 'left', pos: x },
    { edge: 'center', pos: x + room.width / 2 },
    { edge: 'right', pos: x + room.width }
  ]
  const roomEdgesY = [
    { edge: 'top', pos: y },
    { edge: 'center', pos: y + room.height / 2 },
    { edge: 'bottom', pos: y + room.height }
  ]

  let bestX = null
  roomEdgesX.forEach(({ edge, pos }) => {
    targetsX.forEach(t => {
      const dist = Math.abs(pos - t.pos)
      if (dist <= SNAP_TOLERANCE_PCT && (!bestX || dist < bestX.dist)) {
        bestX = { dist, guidePos: t.pos, edge, targetPos: t.pos }
      }
    })
  })

  let bestY = null
  roomEdgesY.forEach(({ edge, pos }) => {
    targetsY.forEach(t => {
      const dist = Math.abs(pos - t.pos)
      if (dist <= SNAP_TOLERANCE_PCT && (!bestY || dist < bestY.dist)) {
        bestY = { dist, guidePos: t.pos, edge, targetPos: t.pos }
      }
    })
  })

  let snappedX = x
  let snappedY = y
  if (bestX) {
    const offset = bestX.edge === 'left' ? 0 : bestX.edge === 'center' ? room.width / 2 : room.width
    snappedX = bestX.targetPos - offset
  }
  if (bestY) {
    const offset = bestY.edge === 'top' ? 0 : bestY.edge === 'center' ? room.height / 2 : room.height
    snappedY = bestY.targetPos - offset
  }

  return {
    x: snappedX,
    y: snappedY,
    guides: {
      vertical: bestX ? bestX.guidePos : null,
      horizontal: bestY ? bestY.guidePos : null
    }
  }
}

// How close (in % of plot) a door/window has to get to a wall line before
// it snaps onto it. Candidate walls are the plot boundary plus every other
// room's 4 edges — there's no separate "wall" object in this data model,
// a room's own rectangle edge IS the wall.
const WALL_SNAP_PCT = 3

function findWallSnap(door, x, y, allRooms) {
  const centerX = x + door.width / 2
  const centerY = y + door.height / 2

  const candidates = [
    { orientation: 'horizontal', pos: 0, spanMin: 0, spanMax: 100 },
    { orientation: 'horizontal', pos: 100, spanMin: 0, spanMax: 100 },
    { orientation: 'vertical', pos: 0, spanMin: 0, spanMax: 100 },
    { orientation: 'vertical', pos: 100, spanMin: 0, spanMax: 100 }
  ]

  allRooms.forEach(r => {
    if (r.id === door.id || r.category === 'opening' || r.category === 'remedy') return
    candidates.push({ orientation: 'horizontal', pos: r.y, spanMin: r.x, spanMax: r.x + r.width })
    candidates.push({ orientation: 'horizontal', pos: r.y + r.height, spanMin: r.x, spanMax: r.x + r.width })
    candidates.push({ orientation: 'vertical', pos: r.x, spanMin: r.y, spanMax: r.y + r.height })
    candidates.push({ orientation: 'vertical', pos: r.x + r.width, spanMin: r.y, spanMax: r.y + r.height })
  })

  let best = null
  candidates.forEach(c => {
    const dist = c.orientation === 'horizontal' ? Math.abs(centerY - c.pos) : Math.abs(centerX - c.pos)
    const lateral = c.orientation === 'horizontal' ? centerX : centerY
    const withinSpan = lateral >= c.spanMin - 8 && lateral <= c.spanMax + 8
    if (withinSpan && dist <= WALL_SNAP_PCT && (!best || dist < best.dist)) {
      best = { ...c, dist }
    }
  })

  return best
}

export default function Canvas() {
  const {
    rooms,
    setRooms,
    imageSettings,
    selectedRoomId,
    setSelectedRoomId,
    deleteRoom,
    nudgeRoom,
    resizeRoom
  } = useCanvasStore()

  const { plot } = useProjectStore()
  const { snapToGrid, gridSize } = useSettingsStore()
  const showVastuGrid = useUiStore((state) => state.showVastuGrid)
  const showNormalGrid = useUiStore((state) => state.showNormalGrid)
  const editMode = useUiStore((state) => state.editMode)
  const renderMode = useUiStore((state) => state.renderMode)
  const isBlueprint = renderMode === 'blueprint'

  const containerRef = useRef(null)
  const plotRef = useRef(null)
  const [dragState, setDragState] = useState(null)
  const [plotDims, setPlotDims] = useState({ w: 400, h: 400 })
  const [zoom, setZoom] = useState(1)
  const pinchRef = useRef(null)
  // Which contextual control strip is open above the bottom action bar —
  // mirrors Canva's Transparency/Layers/Position/Nudge/More tab row, but
  // scoped to what's actually useful for a floor plan room.
  const [activePanel, setActivePanel] = useState(null)
  // Which single inner-wall edge of the selected room has its own
  // thickness-editing panel open — { roomId, side } or null.
  const [selectedWallEdge, setSelectedWallEdge] = useState(null)
  // Which pada's "Why?" detail is expanded in the Vastu tab, if any.
  const [expandedPadaId, setExpandedPadaId] = useState(null)
  // Canva-style snap guides while dragging a room — a dashed line appears
  // (and the room snaps to it) when its edge/center lines up with another
  // room's edge/center or the plot's own center. { horizontal: pct|null,
  // vertical: pct|null } in plot-percent coordinates.
  const [activeGuides, setActiveGuides] = useState({ horizontal: null, vertical: null })

  useEffect(() => {
    setActivePanel(null)
    setSelectedWallEdge(null)
    setExpandedPadaId(null)
  }, [selectedRoomId])

  // The zoomed pixel size of the plot — dragging/resizing math and the
  // rendered plot-wrapper both use this instead of the base plotDims, so
  // zooming in gives you bigger, easier-to-tap rooms without changing any
  // of the underlying percentage-based room coordinates.
  const zoomedDims = { w: plotDims.w * zoom, h: plotDims.h * zoom }

  const clampZoom = (z) => Math.max(1, Math.min(3, z))

  // Two-finger pinch to zoom — the same gesture Vinod already knows from
  // Canva. Only engages when a room isn't being dragged.
  const handlePinchStart = (e) => {
    if (e.touches.length === 2 && !dragState) {
      const [t1, t2] = e.touches
      const dist = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY)
      pinchRef.current = { startDist: dist, startZoom: zoom }
    }
  }
  const handlePinchMove = (e) => {
    if (e.touches.length === 2 && pinchRef.current) {
      e.preventDefault()
      const [t1, t2] = e.touches
      const dist = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY)
      const ratio = dist / pinchRef.current.startDist
      setZoom(clampZoom(pinchRef.current.startZoom * ratio))
    }
  }
  const handlePinchEnd = (e) => {
    if (e.touches.length < 2) pinchRef.current = null
  }

  useEffect(() => {
    function updateDimensions() {
      if (!containerRef.current) return
      const cWidth = containerRef.current.clientWidth - 48
      const cHeight = containerRef.current.clientHeight - 48
      
      const pWidth = plot.width
      const pLength = plot.length
      
      const aspect = pWidth / pLength
      
      let w, h
      if (aspect > cWidth / cHeight) {
        w = cWidth
        h = cWidth / aspect
      } else {
        h = cHeight
        w = cHeight * aspect
      }
      
      setPlotDims({
        w: Math.max(200, Math.min(w, cWidth)),
        h: Math.max(200, Math.min(h, cHeight))
      })
    }
    
    updateDimensions()
    window.addEventListener('resize', updateDimensions)
    return () => window.removeEventListener('resize', updateDimensions)
  }, [plot.width, plot.length])

  // Dragging and Resizing Logic
  const handleMouseDown = (e, roomId, type) => {
    if (editMode === 'view') return
    e.stopPropagation()
    const room = rooms.find(r => r.id === roomId)
    if (!room) return

    setSelectedRoomId(roomId)

    setDragState({
      type,
      roomId,
      startX: e.clientX,
      startY: e.clientY,
      startW: room.width,
      startH: room.height,
      startXCoord: room.x,
      startYCoord: room.y
    })
  }

  const handleTouchStart = (e, roomId, type) => {
    if (editMode === 'view') return
    e.stopPropagation()
    const touch = e.touches?.[0]
    if (!touch) return
    const room = rooms.find(r => r.id === roomId)
    if (!room) return
    
    setSelectedRoomId(roomId)
    
    setDragState({
      type,
      roomId,
      startX: touch.clientX,
      startY: touch.clientY,
      startW: room.width,
      startH: room.height,
      startXCoord: room.x,
      startYCoord: room.y
    })
  }

  // Free rotation — like Canva's own rotate handle, drag it around the
  // room's center to spin the room to any angle, not just 90° steps. This
  // stays on the existing rectangle room model (x/y/width/height never
  // change, only the CSS rotation), so nothing else about how a room is
  // stored has to change. The honest trade-off: collision detection still
  // checks the room's un-rotated bounding box, so once a room is rotated
  // off a 90°-multiple, overlap-blocking against neighbors is only
  // approximate — true polygon-vs-polygon collision for arbitrary angles
  // is real-shape-model territory, not a small add-on.
  const handleRotateStart = (clientX, clientY, roomId) => {
    if (editMode === 'view' || !plotRef.current) return
    const room = rooms.find(r => r.id === roomId)
    if (!room) return
    setSelectedRoomId(roomId)

    const plotRect = plotRef.current.getBoundingClientRect()
    const centerX = plotRect.left + ((room.x + room.width / 2) / 100) * plotRect.width
    const centerY = plotRect.top + ((room.y + room.height / 2) / 100) * plotRect.height
    const startAngle = Math.atan2(clientY - centerY, clientX - centerX) * (180 / Math.PI)

    setDragState({
      type: 'rotate',
      roomId,
      centerX,
      centerY,
      startAngle,
      startRotation: room.rotation || 0
    })
  }

  const applyRotate = (clientX, clientY) => {
    const currentAngle = Math.atan2(clientY - dragState.centerY, clientX - dragState.centerX) * (180 / Math.PI)
    let newRotation = dragState.startRotation + (currentAngle - dragState.startAngle)
    newRotation = ((newRotation % 360) + 360) % 360
    // Snap to 15° steps when close, so landing back on a clean angle
    // (0/90/180/270 included) is easy instead of fighting for the exact
    // pixel.
    const snapped = Math.round(newRotation / 15) * 15
    if (Math.abs(newRotation - snapped) < 4) newRotation = snapped % 360

    const rounded = Math.round(newRotation)
    setRooms(rooms.map(r => r.id === dragState.roomId ? { ...r, rotation: rounded } : r))
  }

  // Shared by mouse and touch — handles a plain move, and resizing from
  // any of the 4 corners (Canva lets you resize from any corner, not just
  // bottom-right, so the opposite corner needs to stay anchored in place).
  const applyDrag = (deltaXPercent, deltaYPercent) => {
    const roomIndex = rooms.findIndex(r => r.id === dragState.roomId)
    if (roomIndex === -1) return

    const newRooms = [...rooms]
    const targetRoom = { ...newRooms[roomIndex] }
    const snap = (v) => snapToGrid ? snapEngine.snapToGrid(v, gridSize) : v

    if (dragState.type === 'move') {
      let newX = snap(dragState.startXCoord + deltaXPercent)
      let newY = snap(dragState.startYCoord + deltaYPercent)

      newX = Math.max(0, Math.min(100 - targetRoom.width, newX))
      newY = Math.max(0, Math.min(100 - targetRoom.height, newY))

      // Doors/windows snap onto the nearest wall (plot boundary or another
      // room's edge) and orient themselves to lie flush along it, instead
      // of being placed free-floating by eye.
      if (targetRoom.category === 'opening') {
        const wallSnap = findWallSnap(targetRoom, newX, newY, rooms)
        if (wallSnap) {
          if (wallSnap.orientation === 'horizontal') {
            if (targetRoom.width < targetRoom.height) {
              const w = targetRoom.height, h = targetRoom.width
              targetRoom.width = w
              targetRoom.height = h
            }
            newY = wallSnap.pos - targetRoom.height / 2
          } else {
            if (targetRoom.height < targetRoom.width) {
              const w = targetRoom.height, h = targetRoom.width
              targetRoom.width = w
              targetRoom.height = h
            }
            newX = wallSnap.pos - targetRoom.width / 2
          }
          newX = Math.max(0, Math.min(100 - targetRoom.width, newX))
          newY = Math.max(0, Math.min(100 - targetRoom.height, newY))
        }
      } else {
        // Collision-aware move: try both axes together first; if that
        // would overlap a neighboring room, try each axis alone so the
        // room can still slide along a wall it's touching instead of
        // just refusing to move the instant it makes contact.
        const prevX = targetRoom.x
        const prevY = targetRoom.y
        const tryBoth = { ...targetRoom, x: newX, y: newY }

        if (hasRoomCollision(tryBoth, rooms, targetRoom.id)) {
          const tryX = { ...targetRoom, x: newX, y: prevY }
          const tryY = { ...targetRoom, x: prevX, y: newY }
          if (!hasRoomCollision(tryX, rooms, targetRoom.id)) {
            newY = prevY
          } else if (!hasRoomCollision(tryY, rooms, targetRoom.id)) {
            newX = prevX
          } else {
            newX = prevX
            newY = prevY
          }
        }

        // Canva-style snap guides — magnetically align this room's edges/
        // center with another room's edges/center, or the plot's own
        // center, and show the dashed line it snapped to.
        const snapped = computeSnapGuides(targetRoom, newX, newY, rooms)
        newX = snapped.x
        newY = snapped.y
        setActiveGuides(snapped.guides)

        // On a plot with a custom polygon boundary, stop right at its edge
        // instead of moving into the "cut corner" outside it — same
        // fallback-to-previous-position approach as the collision check
        // above. Doors/windows are exempt (they're meant to sit astride a
        // boundary wall, same as they're exempt from room collision).
        if (!isRoomInsideBoundary({ ...targetRoom, x: newX, y: newY }, plot.boundaryPoints)) {
          newX = prevX
          newY = prevY
        }
      }

      targetRoom.x = Math.round(newX * 10) / 10
      targetRoom.y = Math.round(newY * 10) / 10
    } else if (dragState.type?.startsWith('resize-')) {
      const corner = dragState.type
      const growsRight = corner === 'resize-br' || corner === 'resize-tr'
      const growsDown = corner === 'resize-br' || corner === 'resize-bl'
      const farX = dragState.startXCoord + dragState.startW
      const farY = dragState.startYCoord + dragState.startH

      let newX = dragState.startXCoord
      let newY = dragState.startYCoord
      let newW
      let newH

      if (growsRight) {
        newW = Math.max(10, Math.min(100 - newX, snap(dragState.startW + deltaXPercent)))
      } else {
        newX = Math.max(0, Math.min(farX - 10, snap(dragState.startXCoord + deltaXPercent)))
        newW = farX - newX
      }

      if (growsDown) {
        newH = Math.max(10, Math.min(100 - newY, snap(dragState.startH + deltaYPercent)))
      } else {
        newY = Math.max(0, Math.min(farY - 10, snap(dragState.startYCoord + deltaYPercent)))
        newH = farY - newY
      }

      // Reject this frame's resize if it would grow into a neighboring
      // room, or past a custom polygon boundary edge — the room stops
      // right at the shared wall / boundary instead of overlapping it.
      const resizeCandidate = { ...targetRoom, x: newX, y: newY, width: newW, height: newH }
      if (hasRoomCollision(resizeCandidate, rooms, targetRoom.id) || !isRoomInsideBoundary(resizeCandidate, plot.boundaryPoints)) {
        newX = targetRoom.x
        newY = targetRoom.y
        newW = targetRoom.width
        newH = targetRoom.height
      }

      targetRoom.x = Math.round(newX * 10) / 10
      targetRoom.y = Math.round(newY * 10) / 10
      targetRoom.width = Math.round(newW * 10) / 10
      targetRoom.height = Math.round(newH * 10) / 10
    }

    newRooms[roomIndex] = targetRoom
    setRooms(newRooms)
  }

  const handleMouseMove = (e) => {
    if (editMode === 'view' || !dragState || !plotRef.current) return
    e.preventDefault()
    if (dragState.type === 'rotate') {
      applyRotate(e.clientX, e.clientY)
      return
    }
    const deltaXPercent = ((e.clientX - dragState.startX) / zoomedDims.w) * 100
    const deltaYPercent = ((e.clientY - dragState.startY) / zoomedDims.h) * 100
    applyDrag(deltaXPercent, deltaYPercent)
  }

  const handleTouchMove = (e) => {
    if (editMode === 'view' || !dragState || !plotRef.current) return
    e.preventDefault()
    const touch = e.touches?.[0]
    if (!touch) return
    if (dragState.type === 'rotate') {
      applyRotate(touch.clientX, touch.clientY)
      return
    }
    const deltaXPercent = ((touch.clientX - dragState.startX) / zoomedDims.w) * 100
    const deltaYPercent = ((touch.clientY - dragState.startY) / zoomedDims.h) * 100
    applyDrag(deltaXPercent, deltaYPercent)
  }

  const handleMouseUp = () => {
    setDragState(null)
    setActiveGuides({ horizontal: null, vertical: null })
  }

  useEffect(() => {
    if (dragState) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      document.addEventListener('touchmove', handleTouchMove, { passive: false })
      document.addEventListener('touchend', handleMouseUp)
    } else {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      document.removeEventListener('touchmove', handleTouchMove)
      document.removeEventListener('touchend', handleMouseUp)
    }
    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      document.removeEventListener('touchmove', handleTouchMove)
      document.removeEventListener('touchend', handleMouseUp)
    }
  }, [dragState, plotDims])

  // Remove room
  const handleRemoveRoom = (roomId, e) => {
    e.stopPropagation()
    deleteRoom(roomId)
  }

  // A room drawn on top of the grid (z-index puts rooms above it) can slice
  // straight through the middle of a zone label, leaving an illegible
  // fragment like "N R" or "OUND" visible on either side of it. Rather than
  // let that happen, hide a cell's text entirely once a room covers a
  // meaningful chunk of it — better a blank cell than a sliced one.
  const isVastuCellCovered = (r, c) => {
    const cellX = c * (100 / 3)
    const cellY = r * (100 / 3)
    const cellSize = 100 / 3
    return rooms.some(room => {
      if (room.category && room.category !== 'room') return false
      const overlapX = Math.min(cellX + cellSize, room.x + room.width) - Math.max(cellX, room.x)
      const overlapY = Math.min(cellY + cellSize, room.y + room.height) - Math.max(cellY, room.y)
      if (overlapX <= 0 || overlapY <= 0) return false
      const overlapArea = overlapX * overlapY
      return overlapArea / (cellSize * cellSize) > 0.3
    })
  }

  // Draw grid overlays
  const renderVastuGrid = () => {
    const zones = [
      ['NW (Vayavya)', 'N (Kubera)', 'NE (Ishanya)'],
      ['W (Varuna)',  'Brahmasthan', 'E (Aditya)' ],
      ['SW (Nairutya)', 'S (Yama)', 'SE (Agneya)']
    ]
    const elements = [
      ['Wind Element', 'Wealth Sector', 'Spiritual Water'],
      ['Space Element', 'Sacred Center', 'Solar Energy'],
      ['Earth Stability', 'Ancestral Ground', 'Sacral Fire']
    ]
    // Pastel per-zone tint, Vastu Purusha Mandala convention (water/air/
    // fire/earth palette) — kept subtle (~10% opacity) so it stays legible
    // next to room walls/labels instead of competing with them, but the
    // zones are now visually distinct from each other, not just bordered.
    const zoneTints = [
      ['rgba(148, 163, 184, 0.16)', 'rgba(34, 197, 94, 0.14)', 'rgba(56, 189, 248, 0.16)'],
      ['rgba(168, 85, 247, 0.10)', null, 'rgba(250, 204, 21, 0.16)'],
      ['rgba(146, 64, 14, 0.12)', 'rgba(239, 68, 68, 0.12)', 'rgba(249, 115, 22, 0.16)']
    ]

    const cells = []
    for(let r=0; r<3; r++) {
      for(let c=0; c<3; c++) {
        const isBrahmasthan = r === 1 && c === 1
        const covered = isVastuCellCovered(r, c)
        cells.push(
          <div
            key={`${r}-${c}`}
            className={`vastu-cell ${isBrahmasthan ? 'brahmasthan' : ''}`}
            style={{
              border: '2px dashed rgba(200, 145, 40, 0.5)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
              padding: '6px',
              boxSizing: 'border-box',
              position: 'relative',
              background: isBrahmasthan ? 'radial-gradient(circle, rgba(245, 166, 35, 0.10) 0%, transparent 80%)' : zoneTints[r][c]
            }}
          >
            {isBrahmasthan && !covered && (
              <svg viewBox="0 0 100 100" style={{ position: 'absolute', width: '70%', height: '70%', opacity: 0.22, pointerEvents: 'none', fill: 'none', stroke: 'var(--gold)', strokeWidth: 1.2 }}>
                <circle cx="50" cy="50" r="40" />
                <circle cx="50" cy="50" r="28" strokeDasharray="3 3" />
                <path d="M 50 10 Q 42 30 50 50 Q 58 30 50 10 Z" />
                <path d="M 50 90 Q 42 70 50 50 Q 58 70 50 90 Z" />
                <path d="M 10 50 Q 30 42 50 50 Q 30 58 10 50 Z" />
                <path d="M 90 50 Q 70 42 50 50 Q 70 58 90 50 Z" />
                <circle cx="50" cy="50" r="6" fill="var(--gold)" />
              </svg>
            )}
            {!covered && (
              <>
                <span className="vastu-cell-label" style={{ fontSize: '10px', fontFamily: 'var(--fd)', fontWeight: 800, color: 'var(--gold)', letterSpacing: '0.04em', textShadow: '0 0 4px var(--bg2), 0 0 4px var(--bg2)' }}>
                  {zones[r][c]}
                </span>
                <span className="vastu-cell-element" style={{ fontSize: '8px', fontFamily: 'var(--fb)', fontWeight: 700, opacity: 0.85, color: 'var(--text2)', textTransform: 'uppercase', textShadow: '0 0 4px var(--bg2), 0 0 4px var(--bg2)' }}>
                  {elements[r][c]}
                </span>
              </>
            )}
          </div>
        )
      }
    }
    return cells
  }

  const {
    shape,
    boundaryPoints,
    northWall = 30,
    southWall = 30,
    eastWall = 40,
    westWall = 40
  } = plot

  // A user-edited polygon (PlotBoundaryDrawer, min 3 points) always wins
  // over the derived N/S/E/W trapezoid — same "once edited into a
  // non-rectangle, the wall-length numbers no longer describe it" rule
  // the deleted Canvas 2 tool used. Falls back to the existing
  // wall-length-derived shape for every plot that hasn't opted in, so
  // nothing already saved changes appearance.
  const hasCustomBoundary = Array.isArray(boundaryPoints) && boundaryPoints.length >= 3
  const isNonRectPlot = hasCustomBoundary || shape === 'Irregular'

  const maxX = Math.max(northWall, southWall) || 30
  const maxY = Math.max(eastWall, westWall) || 40

  const pctTR_X = (northWall / maxX) * 100
  const pctBR_X = (southWall / maxX) * 100
  const pctBR_Y = (eastWall / maxY) * 100
  const pctBL_Y = (westWall / maxY) * 100

  const clipPathVal = hasCustomBoundary
    ? `polygon(${boundaryPoints.map(p => `${p.x}% ${p.y}%`).join(', ')})`
    : shape === 'Irregular'
      ? `polygon(0% 0%, ${pctTR_X}% 0%, ${pctBR_X}% ${pctBR_Y}%, 0% ${pctBL_Y}%)`
      : 'none'

  // Contractor-grade dimension lines around the outside of the plot
  // boundary — one per side, with a tick mark (✕, not an arrowhead) at
  // each breakpoint. A side shows its own segment lengths (where rooms
  // touching that wall break it up) plus one overall total further out,
  // reusing the same 0-100% room coordinate space everything else here
  // already uses rather than introducing a separate measurement system.
  const DIM_MARGIN = 46
  const DIM_NEAR = 14
  const DIM_FAR = 32

  const getSideBreakpoints = (side) => {
    const EPS = 1.5
    const spans = []
    rooms.forEach(room => {
      if (room.category && room.category !== 'room') return
      if (side === 'top' && room.y <= EPS) spans.push([room.x, room.x + room.width])
      else if (side === 'bottom' && room.y + room.height >= 100 - EPS) spans.push([room.x, room.x + room.width])
      else if (side === 'left' && room.x <= EPS) spans.push([room.y, room.y + room.height])
      else if (side === 'right' && room.x + room.width >= 100 - EPS) spans.push([room.y, room.y + room.height])
    })
    const points = new Set([0, 100])
    spans.forEach(([a, b]) => {
      points.add(Math.round(a * 10) / 10)
      points.add(Math.round(b * 10) / 10)
    })
    return [...points].sort((a, b) => a - b)
  }

  const renderDimensionLines = () => {
    const W = zoomedDims.w
    const H = zoomedDims.h
    const sideLengthFt = {
      top: shape === 'Irregular' ? northWall : plot.width,
      bottom: shape === 'Irregular' ? southWall : plot.width,
      left: shape === 'Irregular' ? westWall : plot.length,
      right: shape === 'Irregular' ? eastWall : plot.length
    }

    let key = 0
    const els = []

    const tick = (x, y) => {
      els.push(
        <g key={`tick-${key++}`} stroke="var(--text2)" strokeWidth="1">
          <line x1={x - 3.5} y1={y - 3.5} x2={x + 3.5} y2={y + 3.5} />
          <line x1={x - 3.5} y1={y + 3.5} x2={x + 3.5} y2={y - 3.5} />
        </g>
      )
    }

    const label = (x, y, text) => {
      els.push(
        <text
          key={`label-${key++}`}
          x={x} y={y}
          fill="var(--text2)"
          fontSize="8"
          fontFamily="var(--fm)"
          fontWeight="700"
          textAnchor="middle"
          dominantBaseline="middle"
        >
          {text}
        </text>
      )
    }

    ;['top', 'bottom', 'left', 'right'].forEach(side => {
      const isHorizontal = side === 'top' || side === 'bottom'
      const totalFt = sideLengthFt[side]
      const breakpoints = getSideBreakpoints(side)
      const segments = []
      for (let i = 0; i < breakpoints.length - 1; i++) segments.push([breakpoints[i], breakpoints[i + 1]])
      const showSegments = segments.length > 1

      const pctToPx = (pct) => DIM_MARGIN + (pct / 100) * (isHorizontal ? W : H)
      const nearPos = side === 'top' ? DIM_MARGIN - DIM_NEAR
        : side === 'bottom' ? DIM_MARGIN + H + DIM_NEAR
        : side === 'left' ? DIM_MARGIN - DIM_NEAR
        : DIM_MARGIN + W + DIM_NEAR
      const farPos = side === 'top' ? DIM_MARGIN - DIM_FAR
        : side === 'bottom' ? DIM_MARGIN + H + DIM_FAR
        : side === 'left' ? DIM_MARGIN - DIM_FAR
        : DIM_MARGIN + W + DIM_FAR

      // Segment line (closer to the wall) — only when the wall is
      // actually broken into more than one piece by rooms touching it.
      if (showSegments) {
        segments.forEach(([a, b]) => {
          const pA = pctToPx(a)
          const pB = pctToPx(b)
          const mid = (pA + pB) / 2
          const segFt = Math.round(((b - a) / 100) * totalFt * 10) / 10
          if (isHorizontal) {
            els.push(<line key={`seg-${key++}`} x1={pA} y1={nearPos} x2={pB} y2={nearPos} stroke="var(--text2)" strokeWidth="1" />)
            tick(pA, nearPos); tick(pB, nearPos)
            label(mid, nearPos + (side === 'top' ? -6 : 10), `${segFt}'`)
          } else {
            els.push(<line key={`seg-${key++}`} x1={nearPos} y1={pA} x2={nearPos} y2={pB} stroke="var(--text2)" strokeWidth="1" />)
            tick(nearPos, pA); tick(nearPos, pB)
            label(side === 'left' ? nearPos - 10 : nearPos + 10, mid, `${segFt}'`)
          }
        })
      }

      // Overall total — always shown; sits further out than the segment
      // line when both are present.
      const overallPos = showSegments ? farPos : nearPos
      const p0 = pctToPx(0)
      const p100 = pctToPx(100)
      const overallMid = (p0 + p100) / 2
      const totalLabel = `${Math.round(totalFt * 10) / 10}'`
      if (isHorizontal) {
        els.push(<line key={`all-${key++}`} x1={p0} y1={overallPos} x2={p100} y2={overallPos} stroke="var(--text2)" strokeWidth="1.2" />)
        tick(p0, overallPos); tick(p100, overallPos)
        label(overallMid, overallPos + (side === 'top' ? -6 : 10), totalLabel)
      } else {
        els.push(<line key={`all-${key++}`} x1={overallPos} y1={p0} x2={overallPos} y2={p100} stroke="var(--text2)" strokeWidth="1.2" />)
        tick(overallPos, p0); tick(overallPos, p100)
        label(side === 'left' ? overallPos - 10 : overallPos + 10, overallMid, totalLabel)
      }
    })

    return els
  }

  return (
    <div
      className="canvas-container"
      ref={containerRef}
      onClick={() => setSelectedRoomId(null)}
      onTouchStart={handlePinchStart}
      onTouchMove={handlePinchMove}
      onTouchEnd={handlePinchEnd}
      style={{ overflow: 'auto' }}
    >
      {/* Zoom controls — pinch with two fingers works too, but these give
          a reliable tap-based way to get room enough to edit precisely,
          which is the main thing that made a crowded layout hard to use
          on a small phone screen. Hidden while a room is selected so it
          doesn't compete with the room action bar for the same corner. */}
      {!selectedRoomId && (
        <div className="canvas-zoom-controls" onClick={(e) => e.stopPropagation()}>
          <button className="btn-icon" onClick={() => setZoom(z => clampZoom(z - 0.25))} title="Zoom out">
            <i className="ti ti-minus"></i>
          </button>
          <span className="canvas-zoom-level">{Math.round(zoom * 100)}%</span>
          <button className="btn-icon" onClick={() => setZoom(z => clampZoom(z + 0.25))} title="Zoom in">
            <i className="ti ti-plus"></i>
          </button>
          {zoom !== 1 && (
            <button className="btn-icon" onClick={() => setZoom(1)} title="Reset zoom">
              <i className="ti ti-focus-2"></i>
            </button>
          )}
        </div>
      )}
      {/* Frame around the plot boundary that reserves space for the
          dimension lines drawn outside it, so they don't get clipped by
          the plot-wrapper's own overflow:hidden. */}
      <div style={{ position: 'relative', padding: `${DIM_MARGIN}px`, flexShrink: 0 }}>
        <svg
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', overflow: 'visible', zIndex: 6 }}
          viewBox={`0 0 ${zoomedDims.w + DIM_MARGIN * 2} ${zoomedDims.h + DIM_MARGIN * 2}`}
        >
          {/* Diagonal-hatch outer wall band — the standard architectural
              way to draw a cut wall in section, instead of a plain solid
              border. Only for rectangle/square plots; Irregular keeps its
              existing clip-path outline since the hatch frame math below
              assumes an axis-aligned rectangle. */}
          {!isNonRectPlot && (
            <>
              <defs>
                <pattern id="outerWallHatch" width="7" height="7" patternTransform="rotate(45)" patternUnits="userSpaceOnUse">
                  <line x1="0" y1="0" x2="0" y2="7" stroke={isBlueprint ? '#000' : 'var(--text)'} strokeWidth="1.5" />
                </pattern>
              </defs>
              <path
                fillRule="evenodd"
                d={`M${DIM_MARGIN - 8},${DIM_MARGIN - 8} H${DIM_MARGIN + zoomedDims.w + 8} V${DIM_MARGIN + zoomedDims.h + 8} H${DIM_MARGIN - 8} Z M${DIM_MARGIN},${DIM_MARGIN} H${DIM_MARGIN + zoomedDims.w} V${DIM_MARGIN + zoomedDims.h} H${DIM_MARGIN} Z`}
                fill="url(#outerWallHatch)"
                stroke={isBlueprint ? '#000' : 'var(--text)'}
                strokeWidth="1"
              />
            </>
          )}
          {/* A custom polygon boundary (PlotBoundaryDrawer) is a set of
              tapped 0-100% points with no assigned real-world footage per
              edge — unlike the derived N/S/E/W trapezoid, there's no valid
              foot measurement to show here, so skip the (now-misleading,
              always-rectangular) dimension overlay rather than draw wrong
              numbers around a shape that no longer matches them. */}
          {!hasCustomBoundary && renderDimensionLines()}
        </svg>
        <div
          className={`plot-wrapper ${showNormalGrid ? 'show-normal-grid' : ''}`}
          ref={plotRef}
          style={{
            width: `${zoomedDims.w}px`,
            height: `${zoomedDims.h}px`,
            position: 'relative',
            clipPath: clipPathVal,
            // The hatch band drawn in the SVG above is the visible outer
            // wall for rectangle/square plots now; this border stays as
            // the fallback for Irregular plots, which don't get a hatch.
            border: isNonRectPlot ? `6px solid ${isBlueprint ? '#000' : 'var(--text)'}` : 'none',
            borderRadius: '0px',
            flexShrink: 0,
            background: isBlueprint ? '#fff' : undefined
          }}
        >
        {/* Custom Wall Outline & Length Labels overlay — only while the plot is
            still empty; once rooms are placed these labels just clutter the canvas.
            N/S/E/W labels only make sense for the derived 4-wall trapezoid, not
            an arbitrary polygon boundary, so this is skipped once one is set. */}
        {shape === 'Irregular' && !hasCustomBoundary && rooms.length === 0 && (
          <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 8 }}>
            {/* Filled background with low opacity for visual reference */}
            <polygon
              points={`0,0 ${(pctTR_X / 100) * zoomedDims.w},0 ${(pctBR_X / 100) * zoomedDims.w},${(pctBR_Y / 100) * zoomedDims.h} 0,${(pctBL_Y / 100) * zoomedDims.h}`}
              fill="rgba(245, 158, 11, 0.02)"
              stroke="var(--gold)"
              strokeWidth="4"
              strokeLinejoin="round"
            />
            {/* Wall Text Labels */}
            {/* North Wall */}
            <text x={`${pctTR_X / 2}%`} y="20" fill="var(--gold)" fontSize="11" fontWeight="700" textAnchor="middle" style={{ fontStyle: 'normal' }}>
              North: {northWall} ft
            </text>
            {/* South Wall */}
            <text x={`${pctBR_X / 2}%`} y={`${pctBR_Y}%`} dy="-12" fill="var(--gold)" fontSize="11" fontWeight="700" textAnchor="middle">
              South: {southWall} ft
            </text>
            {/* East Wall */}
            <text x={`${pctBR_X}%`} y={`${pctBR_Y / 2}%`} dx="-12" fill="var(--gold)" fontSize="11" fontWeight="700" textAnchor="end">
              East: {eastWall} ft
            </text>
            {/* West Wall */}
            <text x="12" y={`${pctBL_Y / 2}%`} fill="var(--gold)" fontSize="11" fontWeight="700" textAnchor="start">
              West: {westWall} ft
            </text>
          </svg>
        )}
        {/* Floorplan Image overlay */}
        {imageSettings.url && (
          <img 
            src={imageSettings.url} 
            className="floorplan-image-overlay"
            alt="Calibration overlay"
            style={{
              width: '100%',
              height: '100%',
              opacity: imageSettings.opacity,
              transform: `scale(${imageSettings.scale}) rotate(${imageSettings.rotation}deg) translate(${imageSettings.xOffset}px, ${imageSettings.yOffset}px)`,
              transition: dragState ? 'none' : 'transform 0.2s'
            }}
          />
        )}

        {/* 3x3 Vastu Mandala Grid */}
        {showVastuGrid && (
          <div className="vastu-grid-overlay">
            {renderVastuGrid()}
          </div>
        )}

        {/* Canva-style snap guides — dashed lines that appear while
            dragging a room, exactly where it just snapped into alignment
            with another room's edge/center or the plot's own center. */}
        {activeGuides.horizontal !== null && (
          <div className="smart-guide-x" style={{ top: `${activeGuides.horizontal}%` }} />
        )}
        {activeGuides.vertical !== null && (
          <div className="smart-guide-y" style={{ left: `${activeGuides.vertical}%` }} />
        )}

        {/* Empty state overlay inside plot-wrapper — anchored to the bottom edge
            so it never collides with the Vastu grid's centered Brahmasthan label */}
        {rooms.length === 0 && (
          <div className="empty-canvas-state" style={{ position: 'absolute', left: 0, right: 0, bottom: '5%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', pointerEvents: 'none', zIndex: 1, padding: '0 16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '16px', padding: '10px 16px', boxShadow: 'var(--shadow)', maxWidth: '220px' }}>
              <span style={{ fontFamily: 'var(--fd)', fontWeight: 700, color: 'var(--text2)', fontSize: '12px' }}>Add your first room</span>
              <span style={{ fontSize: '10px', color: 'var(--text3)', marginTop: '2px', lineHeight: 1.3, textAlign: 'center' }}>
                Tap "+" to pick a room from the catalog
              </span>
            </div>
          </div>
        )}

        {/* Placed Rooms */}
        {rooms.map((room) => {
          const evalRes = evaluateRoom(room, plot)
          const isSelected = room.id === selectedRoomId
          
          const wFeet = coordinateSystem.pctToFeet(room.width, plot.width)
          const hFeet = coordinateSystem.pctToFeet(room.height, plot.length)
          const areaFeet = wFeet * hFeet
          const roomPxW = (room.width / 100) * zoomedDims.w
          const roomPxH = (room.height / 100) * zoomedDims.h
          const isPlainRoom = !room.category || room.category === 'room'
          // Inner-wall thickness override — per edge, in px, defaulting to
          // the standard 3px inner-wall weight unless the wall panel below
          // has been used to thicken/thin that specific side. The outer
          // plot boundary a few lines up is untouched by any of this.
          const wallThickness = room.wallThickness || {}
          const colors = roomColors(room.type)
          const wallColor = isBlueprint ? '#000' : colors.border

          return (
            <div
              key={room.id}
              className={`placed-room compliance-${complianceClassFor(evalRes.status)} ${isSelected ? 'selected' : ''}`}
              style={{
                left: `${room.x}%`,
                top: `${room.y}%`,
                width: `${room.width}%`,
                height: `${room.height}%`,
                background: room.category === 'opening' || room.category === 'remedy'
                  ? 'transparent'
                  : (isBlueprint ? '#fff' : (isPlainRoom ? colors.fill : undefined)),
                // Inner (room-to-room) walls render thinner than the outer
                // plot boundary below, so the two read as different wall
                // thicknesses at a glance, the way a real plan does. Each
                // edge can be independently thickened via the wall panel.
                ...(isPlainRoom ? {
                  borderStyle: 'solid',
                  borderColor: wallColor,
                  borderTopWidth: `${wallThickness.top || 3}px`,
                  borderRightWidth: `${wallThickness.right || 3}px`,
                  borderBottomWidth: `${wallThickness.bottom || 3}px`,
                  borderLeftWidth: `${wallThickness.left || 3}px`
                } : {
                  border: room.category === 'opening'
                    ? (isSelected ? '1.5px dashed var(--accent)' : 'none')
                    : 'none'
                }),
                boxShadow: 'none',
                transform: room.rotation ? `rotate(${room.rotation}deg)` : undefined,
                borderRadius: room.category === 'remedy' ? '50%' : '2px',
                padding: '6px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'border-color 0.2s, box-shadow 0.2s'
              }}
              onMouseDown={(e) => handleMouseDown(e, room.id, 'move')}
              onTouchStart={(e) => handleTouchStart(e, room.id, 'move')}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Canva-style floating toolbar — icon-only (no text labels) so
                  it's compact enough to sit above a small room without
                  spilling into neighboring rooms on a phone screen. */}
              {isSelected && editMode !== 'view' && (
                <div className="floating-context-toolbar" onMouseDown={(e) => e.stopPropagation()}>
                  <button
                    className="floating-context-btn"
                    title="Duplicate"
                    onClick={(e) => {
                      e.stopPropagation()
                      const clone = { ...room, id: Date.now().toString(), x: Math.min(80, room.x + 10), y: Math.min(80, room.y + 10) }
                      setRooms([...rooms, clone])
                    }}
                  >
                    <i className="ti ti-copy"></i>
                  </button>
                  <button
                    className="floating-context-btn"
                    title="Rotate 90°"
                    onClick={(e) => {
                      e.stopPropagation()
                      const nextRotation = ((room.rotation || 0) + 90) % 360
                      const rotated = {
                         ...room,
                         width: room.height,
                         height: room.width,
                         rotation: nextRotation
                      }
                      const next = rooms.map(r => r.id === room.id ? rotated : r)
                      setRooms(next)
                    }}
                  >
                    <i className="ti ti-rotate-clockwise"></i>
                  </button>
                  <button
                    className="floating-context-btn"
                    title="Delete"
                    style={{ color: 'var(--red)' }}
                    onClick={(e) => {
                      e.stopPropagation()
                      deleteRoom(room.id)
                      setSelectedRoomId(null)
                    }}
                  >
                    <i className="ti ti-trash"></i>
                  </button>
                </div>
              )}

              {/* Construction Dimension lines (Ticks + Center Text) — only for the
                  room you're currently editing, to keep the canvas uncluttered.
                  Each wall's label now also carries the compass zone it sits
                  in/borders (same 3x3 grid the Vastu score already uses), so
                  every inner wall reads its direction the same way the outer
                  9-zone overlay does — recomputed live as the room moves. */}
              {isSelected && (!room.category || room.category === 'room' || room.category === 'furniture') && (
                <>
                  {/* Bottom wall */}
                  <div style={{ position: 'absolute', bottom: '4px', left: '12px', right: '12px', height: '1px', background: 'var(--accent)', opacity: 0.9, pointerEvents: 'none' }}>
                    <div style={{ position: 'absolute', left: 0, top: '-3px', width: '1px', height: '7px', background: 'var(--accent)', transform: 'rotate(45deg)' }}></div>
                    <div style={{ position: 'absolute', right: 0, top: '-3px', width: '1px', height: '7px', background: 'var(--accent)', transform: 'rotate(45deg)' }}></div>
                    <span style={{ position: 'absolute', bottom: '2px', left: '50%', transform: 'translateX(-50%)', fontSize: '8.5px', fontFamily: 'var(--fm)', color: 'var(--accent)', fontWeight: 'bold', whiteSpace: 'nowrap', background: 'var(--bg2)', padding: '0 3px' }}>
                      {getZoneCode(room.x + room.width / 2, room.y + room.height)} · {Math.round(wFeet)} ft
                    </span>
                  </div>
                  {/* Right wall */}
                  <div style={{ position: 'absolute', right: '4px', top: '12px', bottom: '12px', width: '1px', background: 'var(--accent)', opacity: 0.9, pointerEvents: 'none' }}>
                    <div style={{ position: 'absolute', top: 0, left: '-3px', height: '1px', width: '7px', background: 'var(--accent)', transform: 'rotate(45deg)' }}></div>
                    <div style={{ position: 'absolute', bottom: 0, left: '-3px', height: '1px', width: '7px', background: 'var(--accent)', transform: 'rotate(45deg)' }}></div>
                    <span style={{ position: 'absolute', left: '4px', top: '50%', transform: 'translateY(-50%) rotate(90deg)', transformOrigin: 'center', fontSize: '8.5px', fontFamily: 'var(--fm)', color: 'var(--accent)', fontWeight: 'bold', whiteSpace: 'nowrap', background: 'var(--bg2)', padding: '0 3px' }}>
                      {getZoneCode(room.x + room.width, room.y + room.height / 2)} · {Math.round(hFeet)} ft
                    </span>
                  </div>
                  {/* Top wall — compass code only; width is already on the bottom wall */}
                  <span style={{ position: 'absolute', top: '2px', left: '50%', transform: 'translateX(-50%)', fontSize: '8px', fontFamily: 'var(--fm)', color: 'var(--accent)', fontWeight: 'bold', background: 'var(--bg2)', padding: '0 3px', pointerEvents: 'none' }}>
                    {getZoneCode(room.x + room.width / 2, room.y)}
                  </span>
                  {/* Left wall — compass code only; height is already on the right wall */}
                  <span style={{ position: 'absolute', left: '2px', top: '50%', transform: 'translateY(-50%) rotate(-90deg)', transformOrigin: 'center', fontSize: '8px', fontFamily: 'var(--fm)', color: 'var(--accent)', fontWeight: 'bold', background: 'var(--bg2)', padding: '0 3px', pointerEvents: 'none' }}>
                    {getZoneCode(room.x, room.y + room.height / 2)}
                  </span>
                </>
              )}

              {/* Tappable inner-wall edges — select one to open its own
                  thickness panel below, independent of the other 3 sides.
                  Only plain rooms have real walls to tune; doors/furniture/
                  remedies don't. */}
              {isSelected && isPlainRoom && editMode !== 'view' && ['top', 'right', 'bottom', 'left'].map(side => (
                <div
                  key={`wall-edge-${side}`}
                  className={`wall-edge-hit wall-edge-${side} ${selectedWallEdge?.roomId === room.id && selectedWallEdge?.side === side ? 'active' : ''}`}
                  onMouseDown={(e) => e.stopPropagation()}
                  onTouchStart={(e) => e.stopPropagation()}
                  onClick={(e) => {
                    e.stopPropagation()
                    const shared = findSharedWall(room, side, rooms)
                    setSelectedWallEdge({ roomId: room.id, side, shared })
                  }}
                  title={`Edit this wall (${side})`}
                />
              ))}

              {/* Specialized Blueprint Renderings depending on Category */}
              {room.category === 'opening' && (
                <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
                  {/* Standard architectural door symbol: a thin door-leaf
                      line at the hinge, plus a quarter-circle swing arc to
                      the fully-open position — the same convention used on
                      real blueprints (matches the reference style Vinod
                      pointed to). Solid ink-black lines, not a colored or
                      dashed decoration. */}
                  {room.type === 'door' && (
                    <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
                      <line x1="0" y1="95" x2="100" y2="95" stroke="var(--text)" strokeWidth="2" />
                      <line x1="0" y1="95" x2="0" y2="5" stroke="var(--text)" strokeWidth="2" />
                      <path d="M 0 5 A 90 90 0 0 1 90 95" fill="none" stroke="var(--text)" strokeWidth="1.2" />
                    </svg>
                  )}
                  {/* Main entrance — same swing-arc convention as a room
                      door, but wider and with a filled threshold arrow
                      pointing into the house, so the plot's one primary
                      entrance is never confused with an internal room
                      door at a glance. */}
                  {room.type === 'main-door' && (
                    <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
                      <line x1="0" y1="95" x2="100" y2="95" stroke="var(--text)" strokeWidth="3" />
                      <line x1="0" y1="95" x2="0" y2="5" stroke="var(--text)" strokeWidth="3" />
                      <path d="M 0 5 A 90 90 0 0 1 90 95" fill="none" stroke="var(--text)" strokeWidth="1.5" />
                      <path d="M 30 78 L 55 78 L 55 68 L 70 85 L 55 102 L 55 92 L 30 92 Z" fill="var(--text)" transform="translate(0,-15)" />
                    </svg>
                  )}
                  {/* Standard window symbol: a break in the wall filled
                      with two thin parallel lines (the glass pane), no
                      color tint — same as the door/room drawings. */}
                  {room.type === 'window' && (
                    <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ width: '100%', height: '100%' }}>
                      <rect x="0" y="30" width="100" height="40" fill="var(--bg2)" stroke="var(--text)" strokeWidth="2" />
                      <line x1="0" y1="40" x2="100" y2="40" stroke="var(--text)" strokeWidth="1.2" />
                      <line x1="0" y1="60" x2="100" y2="60" stroke="var(--text)" strokeWidth="1.2" />
                    </svg>
                  )}
                  {room.type === 'ventilator' && (
                    <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ width: '100%', height: '100%' }}>
                      <rect x="0" y="15" width="100" height="70" fill="none" stroke="var(--text)" strokeWidth="2" />
                      <line x1="20" y1="15" x2="20" y2="85" stroke="var(--text)" strokeWidth="1.2" />
                      <line x1="40" y1="15" x2="40" y2="85" stroke="var(--text)" strokeWidth="1.2" />
                      <line x1="60" y1="15" x2="60" y2="85" stroke="var(--text)" strokeWidth="1.2" />
                      <line x1="80" y1="15" x2="80" y2="85" stroke="var(--text)" strokeWidth="1.2" />
                    </svg>
                  )}
                  {/* Floating minimal category name when selected */}
                  {isSelected && (
                    <span style={{ position: 'absolute', bottom: '-20px', left: '50%', transform: 'translateX(-50%)', background: 'var(--bg2)', border: '1px solid var(--border)', padding: '2px 6px', borderRadius: '4px', fontSize: '9px', fontWeight: 'bold', whiteSpace: 'nowrap', zIndex: 10, color: 'var(--text)' }}>
                      {room.label.toUpperCase()}
                    </span>
                  )}
                </div>
              )}

              {room.category === 'furniture' && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', width: '100%', padding: '2px', background: 'rgba(255,255,255,0.01)', border: '1px dashed var(--border)', borderRadius: '4px' }}>
                  {/* 2D Plan View Vectors instead of simple text/icons */}
                  <div style={{ width: '60%', height: '60%', minHeight: '26px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {room.type.includes('bed') && (
                      <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
                        <rect x="5" y="5" width="90" height="90" fill="none" stroke="var(--text2)" strokeWidth="2" />
                        <rect x="5" y="5" width="90" height="10" fill="rgba(147, 153, 168, 0.15)" stroke="var(--text2)" strokeWidth="1.5" />
                        <rect x="12" y="20" width="30" height="18" rx="2" fill="none" stroke="var(--text2)" strokeWidth="1.5" />
                        <rect x="58" y="20" width="30" height="18" rx="2" fill="none" stroke="var(--text2)" strokeWidth="1.5" />
                        <path d="M 5 48 L 95 48 M 5 55 L 95 55" stroke="var(--text2)" strokeWidth="1.5" strokeDasharray="3 3" />
                      </svg>
                    )}
                    {room.type.includes('sofa') && (
                      <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
                        <rect x="5" y="5" width="90" height="90" rx="4" fill="none" stroke="var(--text2)" strokeWidth="2" />
                        <rect x="5" y="15" width="14" height="70" rx="2" fill="rgba(147, 153, 168, 0.1)" stroke="var(--text2)" strokeWidth="1.5" />
                        <rect x="81" y="15" width="14" height="70" rx="2" fill="rgba(147, 153, 168, 0.1)" stroke="var(--text2)" strokeWidth="1.5" />
                        <rect x="19" y="15" width="62" height="55" rx="3" fill="none" stroke="var(--text2)" strokeWidth="1.5" />
                        <line x1="50" y1="15" x2="50" y2="70" stroke="var(--text2)" strokeWidth="1.5" />
                        <rect x="19" y="70" width="62" height="15" rx="2" fill="rgba(147, 153, 168, 0.15)" stroke="var(--text2)" strokeWidth="1.5" />
                      </svg>
                    )}
                    {room.type.includes('dining') && (
                      <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%' }}>
                        <rect x="22" y="15" width="56" height="70" rx="4" fill="none" stroke="var(--text2)" strokeWidth="2" />
                        <rect x="8" y="28" width="12" height="18" rx="2" fill="none" stroke="var(--text2)" strokeWidth="1.5" />
                        <rect x="8" y="54" width="12" height="18" rx="2" fill="none" stroke="var(--text2)" strokeWidth="1.5" />
                        <rect x="80" y="28" width="12" height="18" rx="2" fill="none" stroke="var(--text2)" strokeWidth="1.5" />
                        <rect x="80" y="54" width="12" height="18" rx="2" fill="none" stroke="var(--text2)" strokeWidth="1.5" />
                        <rect x="42" y="3" width="16" height="10" rx="2" fill="none" stroke="var(--text2)" strokeWidth="1.5" />
                        <rect x="42" y="87" width="16" height="10" rx="2" fill="none" stroke="var(--text2)" strokeWidth="1.5" />
                      </svg>
                    )}
                    {room.type.includes('desk') && (
                      <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%' }}>
                        <rect x="5" y="10" width="90" height="45" fill="none" stroke="var(--text2)" strokeWidth="2" />
                        <line x1="25" y1="10" x2="25" y2="55" stroke="var(--text2)" strokeWidth="1" />
                        <line x1="75" y1="10" x2="75" y2="55" stroke="var(--text2)" strokeWidth="1" />
                        <rect x="35" y="18" width="30" height="20" rx="1" fill="rgba(147, 153, 168, 0.1)" stroke="var(--text2)" strokeWidth="1.2" />
                        <line x1="33" y1="38" x2="67" y2="38" stroke="var(--text2)" strokeWidth="2" />
                        <rect x="38" y="65" width="24" height="22" rx="3" fill="none" stroke="var(--text2)" strokeWidth="1.5" />
                      </svg>
                    )}
                    {room.type.includes('plant') && (
                      <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%' }}>
                        <circle cx="50" cy="50" r="20" fill="none" stroke="var(--text2)" strokeWidth="2" />
                        <path d="M 50 32 C 45 10 50 5 50 5 C 50 5 55 10 50 32" fill="rgba(34, 197, 94, 0.25)" stroke="var(--text2)" strokeWidth="1.2" />
                        <path d="M 50 68 C 45 90 50 95 50 95 C 50 95 55 90 50 68" fill="rgba(34, 197, 94, 0.25)" stroke="var(--text2)" strokeWidth="1.2" />
                        <path d="M 32 50 C 10 45 5 50 5 50 C 5 50 10 55 32 50" fill="rgba(34, 197, 94, 0.25)" stroke="var(--text2)" strokeWidth="1.2" />
                        <path d="M 68 50 C 90 45 95 50 95 50 C 95 50 90 55 68 50" fill="rgba(34, 197, 94, 0.25)" stroke="var(--text2)" strokeWidth="1.2" />
                      </svg>
                    )}
                    {room.type.includes('mirror') && (
                      <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%' }}>
                        <ellipse cx="50" cy="50" rx="40" ry="24" fill="rgba(0, 180, 216, 0.05)" stroke="var(--text2)" strokeWidth="2" />
                        <line x1="30" y1="40" x2="45" y2="40" stroke="rgba(255,255,255,0.4)" strokeWidth="2.5" strokeLinecap="round" />
                      </svg>
                    )}
                    {/* Fallback layout drawing */}
                    {!room.type.includes('bed') && !room.type.includes('sofa') && !room.type.includes('dining') && !room.type.includes('desk') && !room.type.includes('plant') && !room.type.includes('mirror') && (
                      <i className={room.icon || 'ti ti-armchair'} style={{ fontSize: '18px', color: 'var(--accent)' }}></i>
                    )}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', marginTop: '3px' }}>
                    <span style={{ fontSize: '8.5px', fontWeight: 'bold', color: 'var(--text)', textAlign: 'center', width: '100%', textTransform: 'uppercase', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                      {room.label}
                    </span>
                  </div>
                </div>
              )}

              {room.category === 'remedy' && (
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '100%',
                  width: '100%',
                  background: 'radial-gradient(circle, var(--bg2) 0%, rgba(245, 158, 11, 0.08) 100%)',
                  border: '2.5px solid var(--gold)',
                  borderRadius: '50%',
                  padding: '4px',
                  boxShadow: '0 4px 10px rgba(245, 158, 11, 0.15)'
                }}>
                  <i className={room.icon || 'ti ti-triangle'} style={{ fontSize: '18px', color: 'var(--gold)' }}></i>
                  <span style={{ fontSize: '8px', fontWeight: 800, color: 'var(--gold)', textTransform: 'uppercase', textAlign: 'center', width: '100%', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                    {room.label.replace('Vastu ', '').replace(' Remedy', '').toUpperCase()}
                  </span>
                </div>
              )}

              {/* Standard Room rendering — drawn like an actual floor-plan room
                  (label + symbol + dimensions inside the walls), not a UI card
                  with a header/footer bar, so it reads as "a room" not "a box".
                  Small Vastu-status dot in the corner replaces the old status
                  pill; delete happens via the selection toolbar below. */}
              {(!room.category || room.category === 'room') && (
                <>
                  {isSelected && editMode !== 'view' && (
                    <i
                      className="ti ti-x placed-room-close"
                      onClick={(e) => handleRemoveRoom(room.id, e)}
                      title="Remove room"
                      style={{ position: 'absolute', top: '2px', right: '2px', zIndex: 3 }}
                    ></i>
                  )}
                  {/* Vastu compliance dot is a daily-editing aid — a
                      contractor print doesn't need it, so it's hidden in
                      Blueprint mode. */}
                  {!isBlueprint && (
                    <span
                      className={`placed-room-vastu-dot compliance-dot-${complianceClassFor(evalRes.status)}`}
                      title={evalRes.status}
                      style={{ position: 'absolute', top: '4px', left: '4px' }}
                    />
                  )}

                  {/* Detailed 2D architectural symbols inside rooms — drawn clearly
                      (not faded watermarks) so the plan reads like a real drawing.
                      Shared with the printable professional floor plan export. */}
                  {roomPxW > 78 && roomPxH > 78 && (
                    <div style={{ flex: '1 1 auto', minHeight: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none', overflow: 'hidden' }}>
                      <RoomSymbol
                        type={room.type}
                        label={room.label}
                        size={Math.max(28, Math.min(50, Math.min(roomPxW, roomPxH) * 0.55))}
                        stairStyle={room.stairStyle}
                        long={roomPxW >= roomPxH}
                      />
                    </div>
                  )}

                  {/* Room name as plain text directly on the floor, like a
                      real architectural drawing — no pill/badge background.
                      That was reading as an oversized dark oval dominating
                      each room instead of a label. */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', marginTop: 'auto', pointerEvents: 'none', textAlign: 'center', lineHeight: 1.25 }}>
                    <div style={{
                      fontSize: roomPxW < 70 || roomPxH < 70 ? '8px' : '10.5px',
                      fontWeight: 700,
                      letterSpacing: '0.01em',
                      textTransform: isBlueprint ? 'uppercase' : 'none',
                      fontFamily: isBlueprint ? 'var(--fm)' : 'inherit',
                      color: isBlueprint ? '#000' : 'var(--text)',
                      // A tiny room (e.g. a small bathroom) doesn't have
                      // room to wrap "Bathroom" onto 3 lines without
                      // fracturing the word itself ("Bat/hro/om"). Below
                      // that width, clip to one line with an ellipsis
                      // instead — a cleanly truncated label reads better
                      // than a broken one. Roomier labels still wrap
                      // normally at word boundaries only.
                      whiteSpace: roomPxW < 60 ? 'nowrap' : 'normal',
                      overflow: roomPxW < 60 ? 'hidden' : 'visible',
                      textOverflow: roomPxW < 60 ? 'ellipsis' : 'clip',
                      wordBreak: 'normal',
                      maxWidth: '92%'
                    }}>
                      {room.label}
                    </div>
                    {roomPxW > 55 && roomPxH > 55 && (
                      <div style={{ fontSize: '7.5px', opacity: 0.7, fontFamily: 'var(--fm)', color: 'var(--text2)' }}>
                        {Math.round(wFeet)}' x {Math.round(hFeet)}'
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* Corner resize handles — Canva lets you grab any of the 4
                  corners, not just bottom-right, so a room can be resized
                  from whichever corner is easiest to reach on screen. */}
              {editMode !== 'view' && ['tl', 'tr', 'bl', 'br'].map(corner => (
                <div
                  key={corner}
                  className={`placed-room-resize-handle handle-${corner}`}
                  onMouseDown={(e) => handleMouseDown(e, room.id, `resize-${corner}`)}
                  onTouchStart={(e) => handleTouchStart(e, room.id, `resize-${corner}`)}
                />
              ))}

              {/* Free-rotate handle — Canva-style circular grip floating
                  above the selected room; drag it around the room's
                  center to spin to any angle. */}
              {isSelected && editMode !== 'view' && isPlainRoom && (
                <div
                  className="room-rotate-handle"
                  onMouseDown={(e) => { e.stopPropagation(); handleRotateStart(e.clientX, e.clientY, room.id) }}
                  onTouchStart={(e) => { e.stopPropagation(); const t = e.touches?.[0]; if (t) handleRotateStart(t.clientX, t.clientY, room.id) }}
                  title="Drag to rotate freely"
                >
                  <i className="ti ti-rotate-2"></i>
                </div>
              )}
            </div>
          )
        })}
        </div>
      </div>

      {/* Canva-style bottom action bar — a row of tabs docked to the
          screen bottom; tapping one opens just that control strip above
          the tab row, instead of scattering separate floating buttons
          all over the canvas. */}
      {selectedRoomId && editMode !== 'view' && (() => {
        const selectedRoom = rooms.find(r => r.id === selectedRoomId)
        if (!selectedRoom) return null
        const info = evaluateRoom(selectedRoom, plot)

        // A wall edge is selected — show its own thickness panel instead
        // of the room's usual tabs. Rotate/extend-with-connected-joints/
        // split aren't implemented: this app doesn't model a wall as its
        // own connected object the way a real CAD wall network would (a
        // wall here is just one room's border), so those three genuinely
        // need that bigger data model rather than a shortcut bolted onto
        // room rectangles — thickness-per-edge is the piece that works
        // cleanly on top of what exists today.
        if (selectedWallEdge && selectedWallEdge.roomId === selectedRoomId) {
          const side = selectedWallEdge.side
          const shared = selectedWallEdge.shared
          const current = (selectedRoom.wallThickness && selectedRoom.wallThickness[side]) || 3
          const setThickness = (val) => {
            const clamped = Math.max(1, Math.min(12, val))
            const nextWallThickness = { ...(selectedRoom.wallThickness || {}), [side]: clamped }
            setRooms(rooms.map(r => r.id === selectedRoomId ? { ...r, wallThickness: nextWallThickness } : r))
          }

          // Extend/shorten this wall while staying connected — since a
          // room here is a rectangle, "moving the wall" means growing one
          // side's room and shrinking the neighbor's by the same amount
          // along their shared edge, so no gap or overlap ever opens up
          // between them. Only possible when this edge is a genuine shared
          // wall with a neighbor (findSharedWall) — a wall against the
          // plot boundary or an unshared edge has nothing to extend into.
          const moveSharedWall = (deltaFt) => {
            if (!shared) return
            const neighbor = rooms.find(r => r.id === shared.neighborId)
            if (!neighbor) return

            const axis = shared.axis
            const totalFt = axis === 'x' ? plot.width : plot.length
            const deltaPct = (deltaFt / totalFt) * 100
            const dim = axis === 'x' ? 'width' : 'height'
            const pos = axis === 'x' ? 'x' : 'y'

            const growsWithDelta = side === 'right' || side === 'bottom'
            const leftRoom = growsWithDelta ? selectedRoom : neighbor
            const rightRoom = growsWithDelta ? neighbor : selectedRoom

            const minDimPct = (3 / totalFt) * 100
            const newLeftDim = leftRoom[dim] + deltaPct
            const newRightDim = rightRoom[dim] - deltaPct
            if (newLeftDim < minDimPct || newRightDim < minDimPct) return

            const updatedLeft = { ...leftRoom, [dim]: Math.round(newLeftDim * 10) / 10 }
            const updatedRight = {
              ...rightRoom,
              [pos]: Math.round((rightRoom[pos] + deltaPct) * 10) / 10,
              [dim]: Math.round(newRightDim * 10) / 10
            }

            const others = rooms.filter(r => r.id !== leftRoom.id && r.id !== rightRoom.id)
            if (hasRoomCollision(updatedLeft, others, null) || hasRoomCollision(updatedRight, others, null)) return

            setRooms(rooms.map(r => {
              if (r.id === updatedLeft.id) return updatedLeft
              if (r.id === updatedRight.id) return updatedRight
              return r
            }))
          }

          return (
            <div className="room-action-dock" onClick={(e) => e.stopPropagation()}>
              <div className="room-action-panel room-action-panel-stack">
                {shared && (
                  <div className="room-action-panel-row">
                    <span className="room-action-panel-label">Move wall (both rooms)</span>
                    <button className="btn-icon" onClick={() => moveSharedWall(-1)} title="Shift wall back 1 ft"><i className="ti ti-minus"></i></button>
                    <button className="btn-icon" onClick={() => moveSharedWall(1)} title="Shift wall forward 1 ft"><i className="ti ti-plus"></i></button>
                  </div>
                )}
                <div className="room-action-panel-row">
                  <span className="room-action-panel-label">{side[0].toUpperCase() + side.slice(1)} thickness</span>
                  <button className="btn-icon" onClick={() => setThickness(current - 1)} title="Thinner"><i className="ti ti-minus"></i></button>
                  <span className="room-size-input" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>{current}px</span>
                  <button className="btn-icon" onClick={() => setThickness(current + 1)} title="Thicker"><i className="ti ti-plus"></i></button>
                  <button className="btn-icon" onClick={() => setSelectedWallEdge(null)} title="Done"><i className="ti ti-check"></i></button>
                </div>
              </div>
            </div>
          )
        }

        return (
          <div className="room-action-dock" onClick={(e) => e.stopPropagation()}>
            {activePanel === 'move' && (
              <div className="room-action-panel">
                <button className="btn-icon" onClick={() => nudgeRoom(selectedRoomId, 'left')} title="Nudge left"><i className="ti ti-arrow-left"></i></button>
                <button className="btn-icon" onClick={() => nudgeRoom(selectedRoomId, 'up')} title="Nudge up"><i className="ti ti-arrow-up"></i></button>
                <button className="btn-icon" onClick={() => nudgeRoom(selectedRoomId, 'down')} title="Nudge down"><i className="ti ti-arrow-down"></i></button>
                <button className="btn-icon" onClick={() => nudgeRoom(selectedRoomId, 'right')} title="Nudge right"><i className="ti ti-arrow-right"></i></button>
              </div>
            )}
            {activePanel === 'resize' && (() => {
              const setFeet = (dimension, feetValue) => {
                const feet = parseFloat(feetValue)
                if (!feet || feet <= 0) return
                if (dimension === 'w') {
                  const pct = Math.min(100 - selectedRoom.x, Math.max(3, feet) / plot.width * 100)
                  const candidate = { ...selectedRoom, width: Math.round(pct * 10) / 10 }
                  if (hasRoomCollision(candidate, rooms, selectedRoomId)) return
                  setRooms(rooms.map(r => r.id === selectedRoomId ? candidate : r))
                } else {
                  const pct = Math.min(100 - selectedRoom.y, Math.max(3, feet) / plot.length * 100)
                  const candidate = { ...selectedRoom, height: Math.round(pct * 10) / 10 }
                  if (hasRoomCollision(candidate, rooms, selectedRoomId)) return
                  setRooms(rooms.map(r => r.id === selectedRoomId ? candidate : r))
                }
              }
              const wFt = Math.round((selectedRoom.width / 100) * plot.width)
              const hFt = Math.round((selectedRoom.height / 100) * plot.length)

              return (
                <div className="room-action-panel room-action-panel-stack">
                  <div className="room-action-panel-row">
                    <span className="room-action-panel-label">Width</span>
                    <button className="btn-icon" onClick={() => resizeRoom(selectedRoomId, 'w', -1)} title="1 ft narrower"><i className="ti ti-minus"></i></button>
                    <input
                      type="number"
                      className="room-size-input"
                      value={wFt}
                      onChange={(e) => setFeet('w', e.target.value)}
                      title="Type exact width in feet"
                    />
                    <button className="btn-icon" onClick={() => resizeRoom(selectedRoomId, 'w', 1)} title="1 ft wider"><i className="ti ti-plus"></i></button>
                  </div>
                  <div className="room-action-panel-row">
                    <span className="room-action-panel-label">Length</span>
                    <button className="btn-icon" onClick={() => resizeRoom(selectedRoomId, 'h', -1)} title="1 ft shorter"><i className="ti ti-minus"></i></button>
                    <input
                      type="number"
                      className="room-size-input"
                      value={hFt}
                      onChange={(e) => setFeet('h', e.target.value)}
                      title="Type exact length in feet"
                    />
                    <button className="btn-icon" onClick={() => resizeRoom(selectedRoomId, 'h', 1)} title="1 ft longer"><i className="ti ti-plus"></i></button>
                  </div>
                </div>
              )
            })()}
            {activePanel === 'info' && (() => {
              // evaluateRoom's zone code uses 'C' for center; the pada
              // knowledge table spells it 'Center'.
              const zoneCode = info.zone === 'C' ? 'Center' : info.zone
              const padas = getPadasInZone(zoneCode)
              const dots = (pct) => {
                const filled = Math.round((pct ?? 0) / 20)
                return '●'.repeat(filled) + '○'.repeat(5 - filled)
              }

              return (
                <div className="room-action-panel room-action-panel-stack room-action-panel-text pada-panel">
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                    <span className={`compliance-dot-${complianceClassFor(info.status)} room-info-dot`}></span>
                    <div>
                      <strong>{info.status}</strong> in the {zoneCode} zone
                      <p>{info.desc}</p>
                    </div>
                  </div>

                  {/* This zone spans several padas at the app's current
                      3x3 scoring resolution — each has its own deity and
                      (where researched) its own confidence-scored reading,
                      shown honestly rather than collapsed into one verdict. */}
                  <div className="pada-list">
                    {padas.map(p => (
                      <div key={p.pada_id} className="pada-row">
                        <div className="pada-row-header">
                          <span className="pada-deity">{p.deity_name}</span>
                          <span className="pada-ring">{p.ring} ring</span>
                        </div>
                        <div className="pada-confidence-line">
                          <span>Location {dots(p.location_confidence)} {p.location_confidence}%</span>
                        </div>
                        {p.effectResearched ? (
                          <div className="pada-confidence-line">
                            <span>Effect consensus {dots(p.effect_confidence)} {p.effect_confidence}%</span>
                          </div>
                        ) : (
                          <div className="pada-not-researched">Effect reading not yet researched for this pada.</div>
                        )}
                        <button
                          className="pada-why-btn"
                          onClick={() => setExpandedPadaId(id => id === p.pada_id ? null : p.pada_id)}
                        >
                          {expandedPadaId === p.pada_id ? 'Hide' : 'Why?'}
                        </button>
                        {expandedPadaId === p.pada_id && (
                          <div className="pada-why-detail">
                            {p.effectResearched ? (
                              <>
                                {p.traditional_interpretation.reported_benefits.length > 0 && (
                                  <>
                                    <strong>Reported benefits</strong>
                                    <ul>{p.traditional_interpretation.reported_benefits.map((b, i) => <li key={i}>{b}</li>)}</ul>
                                  </>
                                )}
                                {p.traditional_interpretation.reported_challenges.length > 0 && (
                                  <>
                                    <strong>Reported challenges</strong>
                                    <ul>{p.traditional_interpretation.reported_challenges.map((c, i) => <li key={i}>{c}</li>)}</ul>
                                  </>
                                )}
                                <p className="pada-disagreement-note">{p.traditional_interpretation.source_disagreement_note}</p>
                              </>
                            ) : (
                              <p className="pada-disagreement-note">{p.traditional_interpretation.source_disagreement_note}</p>
                            )}
                            <p className="pada-sources">Sources: {p.classical_references.join(' · ')}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )
            })()}
            {activePanel === 'more' && (
              <div className="room-action-panel room-action-panel-stack">
                <input
                  type="text"
                  className="room-rename-input"
                  value={selectedRoom.label}
                  placeholder="Room name"
                  onChange={(e) => setRooms(rooms.map(r => r.id === selectedRoomId ? { ...r, label: e.target.value } : r))}
                />
                <div className="room-action-panel-row">
                <button
                  className="btn-icon"
                  title="Duplicate"
                  onClick={() => {
                    const clone = { ...selectedRoom, id: Date.now().toString(), x: Math.min(80, selectedRoom.x + 10), y: Math.min(80, selectedRoom.y + 10) }
                    setRooms([...rooms, clone])
                  }}
                >
                  <i className="ti ti-copy"></i>
                </button>
                <button
                  className="btn-icon"
                  title="Rotate 90°"
                  onClick={() => {
                    const nextRotation = ((selectedRoom.rotation || 0) + 90) % 360
                    const rotated = { ...selectedRoom, width: selectedRoom.height, height: selectedRoom.width, rotation: nextRotation }
                    setRooms(rooms.map(r => r.id === selectedRoom.id ? rotated : r))
                  }}
                >
                  <i className="ti ti-rotate-clockwise"></i>
                </button>
                <button
                  className="btn-icon btn-danger"
                  title="Delete"
                  onClick={() => { deleteRoom(selectedRoomId); setSelectedRoomId(null) }}
                >
                  <i className="ti ti-trash"></i>
                </button>
                </div>
                {/* Layer order — rooms stack in array order (all share the
                    same CSS z-index), so "front"/"back" just moves this
                    room to the end/start of that array, same idea as
                    Canva's Layer menu. */}
                <div className="room-action-panel-row">
                  <span className="room-action-panel-label">Layer</span>
                  <button
                    className="btn-icon"
                    title="Bring to front"
                    onClick={() => setRooms([...rooms.filter(r => r.id !== selectedRoomId), selectedRoom])}
                  >
                    <i className="ti ti-stack-front"></i>
                  </button>
                  <button
                    className="btn-icon"
                    title="Send to back"
                    onClick={() => setRooms([selectedRoom, ...rooms.filter(r => r.id !== selectedRoomId)])}
                  >
                    <i className="ti ti-stack-back"></i>
                  </button>
                </div>
                {selectedRoom.type === 'staircase' && (
                  <div className="room-action-panel-row">
                    <span className="room-action-panel-label">Stairs style</span>
                    <select
                      className="room-rename-input"
                      style={{ flex: 1 }}
                      value={selectedRoom.stairStyle || 'straight'}
                      onChange={(e) => setRooms(rooms.map(r => r.id === selectedRoomId ? { ...r, stairStyle: e.target.value } : r))}
                    >
                      <option value="straight">Straight</option>
                      <option value="L">L-shaped</option>
                      <option value="U">U-shaped</option>
                    </select>
                  </div>
                )}
              </div>
            )}

            <div className="room-action-tabs">
              <button className={activePanel === 'move' ? 'active' : ''} onClick={() => setActivePanel(p => p === 'move' ? null : 'move')}>
                <i className="ti ti-arrows-move"></i><span>Move</span>
              </button>
              <button className={activePanel === 'resize' ? 'active' : ''} onClick={() => setActivePanel(p => p === 'resize' ? null : 'resize')}>
                <i className="ti ti-resize"></i><span>Resize</span>
              </button>
              <button className={activePanel === 'info' ? 'active' : ''} onClick={() => setActivePanel(p => p === 'info' ? null : 'info')}>
                <i className="ti ti-compass"></i><span>Vastu</span>
              </button>
              <button className={activePanel === 'more' ? 'active' : ''} onClick={() => setActivePanel(p => p === 'more' ? null : 'more')}>
                <i className="ti ti-dots"></i><span>More</span>
              </button>
            </div>
          </div>
        )
      })()}
    </div>
  )
}
