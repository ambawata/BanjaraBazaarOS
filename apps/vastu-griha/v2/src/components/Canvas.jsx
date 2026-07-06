import React, { useRef, useState, useEffect } from 'react'
import { evaluateRoom } from './AnalysisPanel'
import { useCanvasStore } from '../stores/canvasStore'
import { useProjectStore } from '../stores/projectStore'
import { useSettingsStore } from '../stores/settingsStore'
import { useUiStore } from '../stores/uiStore'
import { snapEngine } from '../lib/geometry/snapEngine'
import { coordinateSystem } from '../lib/geometry/coordinateSystem'
import RoomSymbol from './RoomSymbol'

// evaluateRoom's status text has spaces ("Needs Attention"), which breaks a
// className if used directly -- the browser reads it as two separate classes.
// Map to a single CSS-safe word instead.
function complianceClassFor(status) {
  if (status === 'Excellent') return 'excellent'
  if (status === 'Good' || status === 'Neutral') return 'good'
  if (status === 'Can Be Improved') return 'warning'
  return 'poor'
}

export default function Canvas() {
  const {
    rooms,
    setRooms,
    imageSettings,
    selectedRoomId,
    setSelectedRoomId,
    deleteRoom
  } = useCanvasStore()

  const { plot } = useProjectStore()
  const { snapToGrid, gridSize } = useSettingsStore()
  const showVastuGrid = useUiStore((state) => state.showVastuGrid)
  const showNormalGrid = useUiStore((state) => state.showNormalGrid)
  const editMode = useUiStore((state) => state.editMode)

  const containerRef = useRef(null)
  const plotRef = useRef(null)
  const [dragState, setDragState] = useState(null)
  const [plotDims, setPlotDims] = useState({ w: 400, h: 400 })
  const [zoom, setZoom] = useState(1)
  const pinchRef = useRef(null)

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

  const handleMouseMove = (e) => {
    if (editMode === 'view' || !dragState || !plotRef.current) return
    e.preventDefault()

    const deltaX = e.clientX - dragState.startX
    const deltaY = e.clientY - dragState.startY

    const deltaXPercent = (deltaX / zoomedDims.w) * 100
    const deltaYPercent = (deltaY / zoomedDims.h) * 100

    const roomIndex = rooms.findIndex(r => r.id === dragState.roomId)
    if (roomIndex === -1) return

    const newRooms = [...rooms]
    const targetRoom = { ...newRooms[roomIndex] }
    
    if (dragState.type === 'move') {
      let newX = dragState.startXCoord + deltaXPercent
      let newY = dragState.startYCoord + deltaYPercent
      
      if (snapToGrid) {
        newX = snapEngine.snapToGrid(newX, gridSize)
        newY = snapEngine.snapToGrid(newY, gridSize)
      }
      
      newX = Math.max(0, Math.min(100 - targetRoom.width, newX))
      let newYClamped = Math.max(0, Math.min(100 - targetRoom.height, newY))
      
      targetRoom.x = Math.round(newX * 10) / 10
      targetRoom.y = Math.round(newYClamped * 10) / 10
    } 
    else if (dragState.type === 'resize') {
      let newW = dragState.startW + deltaXPercent
      let newH = dragState.startH + deltaYPercent
      
      if (snapToGrid) {
        newW = snapEngine.snapToGrid(newW, gridSize)
        newH = snapEngine.snapToGrid(newH, gridSize)
      }
      
      newW = Math.max(10, Math.min(100 - targetRoom.x, newW))
      newH = Math.max(10, Math.min(100 - targetRoom.y, newH))
      
      targetRoom.width = Math.round(newW * 10) / 10
      targetRoom.height = Math.round(newH * 10) / 10
    }
    
    newRooms[roomIndex] = targetRoom
    setRooms(newRooms)
  }

  const handleTouchMove = (e) => {
    if (editMode === 'view' || !dragState || !plotRef.current) return
    e.preventDefault()
    
    const touch = e.touches?.[0]
    if (!touch) return
    const deltaX = touch.clientX - dragState.startX
    const deltaY = touch.clientY - dragState.startY

    const deltaXPercent = (deltaX / zoomedDims.w) * 100
    const deltaYPercent = (deltaY / zoomedDims.h) * 100
    
    const roomIndex = rooms.findIndex(r => r.id === dragState.roomId)
    if (roomIndex === -1) return
    
    const newRooms = [...rooms]
    const targetRoom = { ...newRooms[roomIndex] }
    
    if (dragState.type === 'move') {
      let newX = dragState.startXCoord + deltaXPercent
      let newY = dragState.startYCoord + deltaYPercent
      
      if (snapToGrid) {
        newX = snapEngine.snapToGrid(newX, gridSize)
        newY = snapEngine.snapToGrid(newY, gridSize)
      }
      
      newX = Math.max(0, Math.min(100 - targetRoom.width, newX))
      let newYClamped = Math.max(0, Math.min(100 - targetRoom.height, newY))
      
      targetRoom.x = Math.round(newX * 10) / 10
      targetRoom.y = Math.round(newYClamped * 10) / 10
    } 
    else if (dragState.type === 'resize') {
      let newW = dragState.startW + deltaXPercent
      let newH = dragState.startH + deltaYPercent
      
      if (snapToGrid) {
        newW = snapEngine.snapToGrid(newW, gridSize)
        newH = snapEngine.snapToGrid(newH, gridSize)
      }
      
      newW = Math.max(10, Math.min(100 - targetRoom.x, newW))
      newH = Math.max(10, Math.min(100 - targetRoom.y, newH))
      
      targetRoom.width = Math.round(newW * 10) / 10
      targetRoom.height = Math.round(newH * 10) / 10
    }
    
    newRooms[roomIndex] = targetRoom
    setRooms(newRooms)
  }

  const handleMouseUp = () => {
    setDragState(null)
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
    
    const cells = []
    for(let r=0; r<3; r++) {
      for(let c=0; c<3; c++) {
        const isBrahmasthan = r === 1 && c === 1
        cells.push(
          <div 
            key={`${r}-${c}`} 
            className={`vastu-cell ${isBrahmasthan ? 'brahmasthan' : ''}`}
            style={{
              border: '1.5px dashed rgba(245, 166, 35, 0.22)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
              padding: '6px',
              boxSizing: 'border-box',
              position: 'relative',
              background: isBrahmasthan ? 'radial-gradient(circle, rgba(245, 166, 35, 0.05) 0%, transparent 80%)' : undefined
            }}
          >
            {isBrahmasthan && (
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
            <span className="vastu-cell-label" style={{ fontSize: '9px', fontFamily: 'var(--fd)', fontWeight: 800, color: 'var(--gold)', letterSpacing: '0.04em' }}>
              {zones[r][c]}
            </span>
            <span className="vastu-cell-element" style={{ fontSize: '8px', fontFamily: 'var(--fb)', fontWeight: 600, opacity: 0.7, color: 'var(--text2)', textTransform: 'uppercase' }}>
              {elements[r][c]}
            </span>
          </div>
        )
      }
    }
    return cells
  }

  const {
    shape,
    northWall = 30,
    southWall = 30,
    eastWall = 40,
    westWall = 40
  } = plot

  const maxX = Math.max(northWall, southWall) || 30
  const maxY = Math.max(eastWall, westWall) || 40

  const pctTR_X = (northWall / maxX) * 100
  const pctBR_X = (southWall / maxX) * 100
  const pctBR_Y = (eastWall / maxY) * 100
  const pctBL_Y = (westWall / maxY) * 100

  const clipPathVal = shape === 'Irregular'
    ? `polygon(0% 0%, ${pctTR_X}% 0%, ${pctBR_X}% ${pctBR_Y}%, 0% ${pctBL_Y}%)`
    : 'none'

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
          on a small phone screen. */}
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
      <div
        className={`plot-wrapper ${showNormalGrid ? 'show-normal-grid' : ''}`}
        ref={plotRef}
        style={{
          width: `${zoomedDims.w}px`,
          height: `${zoomedDims.h}px`,
          position: 'relative',
          clipPath: clipPathVal,
          border: shape === 'Irregular' ? 'none' : '1.5px solid var(--text)',
          borderRadius: '0px',
          flexShrink: 0
        }}
      >
        {/* Custom Wall Outline & Length Labels overlay — only while the plot is
            still empty; once rooms are placed these labels just clutter the canvas */}
        {shape === 'Irregular' && rooms.length === 0 && (
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

          return (
            <div
              key={room.id}
              className={`placed-room compliance-${complianceClassFor(evalRes.status)} ${isSelected ? 'selected' : ''}`}
              style={{
                left: `${room.x}%`,
                top: `${room.y}%`,
                width: `${room.width}%`,
                height: `${room.height}%`,
                background: room.category === 'opening' || room.category === 'remedy' ? 'transparent' : undefined,
                border: room.category === 'opening'
                  ? (isSelected ? '1.5px dashed var(--accent)' : 'none')
                  : (room.category === 'remedy' ? 'none' : '4px solid var(--text)'),
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
              {/* Context Sensitive Floating Canva-style Toolbar */}
              {isSelected && editMode !== 'view' && (
                <div className="floating-context-toolbar" onMouseDown={(e) => e.stopPropagation()}>
                  <button 
                    className="floating-context-btn" 
                    onClick={(e) => {
                      e.stopPropagation()
                      const clone = { ...room, id: Date.now().toString(), x: Math.min(80, room.x + 10), y: Math.min(80, room.y + 10) }
                      setRooms([...rooms, clone])
                    }}
                  >
                    <i className="ti ti-copy"></i> Duplicate
                  </button>
                  <div className="floating-context-divider"></div>
                  <button 
                    className="floating-context-btn" 
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
                    <i className="ti ti-rotate-clockwise"></i> Rotate
                  </button>
                  <div className="floating-context-divider"></div>
                  <button 
                    className="floating-context-btn" 
                    style={{ color: 'var(--red)' }}
                    onClick={(e) => {
                      e.stopPropagation()
                      deleteRoom(room.id)
                      setSelectedRoomId(null)
                    }}
                  >
                    <i className="ti ti-trash"></i> Delete
                  </button>
                </div>
              )}

              {/* Construction Dimension lines (Ticks + Center Text) — only for the
                  room you're currently editing, to keep the canvas uncluttered */}
              {isSelected && (!room.category || room.category === 'room' || room.category === 'furniture') && (
                <>
                  {/* Horizontal dimension line */}
                  <div style={{ position: 'absolute', bottom: '4px', left: '12px', right: '12px', height: '1px', background: 'var(--accent)', opacity: 0.9, pointerEvents: 'none' }}>
                    <div style={{ position: 'absolute', left: 0, top: '-3px', width: '1px', height: '7px', background: 'var(--accent)', transform: 'rotate(45deg)' }}></div>
                    <div style={{ position: 'absolute', right: 0, top: '-3px', width: '1px', height: '7px', background: 'var(--accent)', transform: 'rotate(45deg)' }}></div>
                    <span style={{ position: 'absolute', bottom: '2px', left: '50%', transform: 'translateX(-50%)', fontSize: '8.5px', fontFamily: 'var(--fm)', color: 'var(--accent)', fontWeight: 'bold', whiteSpace: 'nowrap', background: 'var(--bg2)', padding: '0 3px' }}>
                      {Math.round(wFeet)}'-0"
                    </span>
                  </div>
                  {/* Vertical dimension line */}
                  <div style={{ position: 'absolute', right: '4px', top: '12px', bottom: '12px', width: '1px', background: 'var(--accent)', opacity: 0.9, pointerEvents: 'none' }}>
                    <div style={{ position: 'absolute', top: 0, left: '-3px', height: '1px', width: '7px', background: 'var(--accent)', transform: 'rotate(45deg)' }}></div>
                    <div style={{ position: 'absolute', bottom: 0, left: '-3px', height: '1px', width: '7px', background: 'var(--accent)', transform: 'rotate(45deg)' }}></div>
                    <span style={{ position: 'absolute', left: '4px', top: '50%', transform: 'translateY(-50%) rotate(90deg)', transformOrigin: 'center', fontSize: '8.5px', fontFamily: 'var(--fm)', color: 'var(--accent)', fontWeight: 'bold', whiteSpace: 'nowrap', background: 'var(--bg2)', padding: '0 3px' }}>
                      {Math.round(hFeet)}'-0"
                    </span>
                  </div>
                </>
              )}

              {/* Specialized Blueprint Renderings depending on Category */}
              {room.category === 'opening' && (
                <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
                  {room.type === 'door' && (
                    <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
                      {/* Wall line cut indicator */}
                      <line x1="0" y1="95" x2="100" y2="95" stroke="var(--text3)" strokeWidth="3" />
                      {/* Door panel swing */}
                      <line x1="0" y1="95" x2="0" y2="5" stroke="var(--accent)" strokeWidth="5.5" strokeLinecap="round" />
                      {/* Swing arc */}
                      <path d="M 0 5 A 90 90 0 0 1 90 95" fill="none" stroke="var(--accent)" strokeWidth="2" strokeDasharray="4 4" />
                    </svg>
                  )}
                  {room.type === 'window' && (
                    <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ width: '100%', height: '100%' }}>
                      <rect x="0" y="30" width="100" height="40" fill="rgba(0, 180, 216, 0.15)" stroke="var(--text2)" strokeWidth="2" />
                      <line x1="0" y1="50" x2="100" y2="50" stroke="var(--text)" strokeWidth="1.5" />
                    </svg>
                  )}
                  {room.type === 'ventilator' && (
                    <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ width: '100%', height: '100%' }}>
                      <rect x="0" y="15" width="100" height="70" fill="none" stroke="var(--text2)" strokeWidth="2" />
                      <line x1="20" y1="15" x2="20" y2="85" stroke="var(--text2)" strokeWidth="1.5" />
                      <line x1="40" y1="15" x2="40" y2="85" stroke="var(--text2)" strokeWidth="1.5" />
                      <line x1="60" y1="15" x2="60" y2="85" stroke="var(--text2)" strokeWidth="1.5" />
                      <line x1="80" y1="15" x2="80" y2="85" stroke="var(--text2)" strokeWidth="1.5" />
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
                  <span
                    className={`placed-room-vastu-dot compliance-dot-${complianceClassFor(evalRes.status)}`}
                    title={evalRes.status}
                    style={{ position: 'absolute', top: '4px', left: '4px' }}
                  />

                  {/* Detailed 2D architectural symbols inside rooms — drawn clearly
                      (not faded watermarks) so the plan reads like a real drawing.
                      Shared with the printable professional floor plan export. */}
                  {roomPxW > 78 && roomPxH > 78 && (
                    <div style={{ flex: '1 1 auto', minHeight: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none', overflow: 'hidden' }}>
                      <RoomSymbol type={room.type} label={room.label} size={Math.max(28, Math.min(50, Math.min(roomPxW, roomPxH) * 0.55))} />
                    </div>
                  )}

                  {/* Room name as a floating pill badge (matches the reference
                      floor plan style) instead of plain text, so it reads
                      clearly against the furniture drawing behind it. */}
                  <div style={{ display: 'flex', justifyContent: 'center', width: '100%', marginTop: 'auto', pointerEvents: 'none' }}>
                    <div style={{
                      background: 'var(--text)',
                      color: 'var(--bg2)',
                      borderRadius: '999px',
                      padding: roomPxW < 70 || roomPxH < 70 ? '2px 8px' : '4px 12px',
                      maxWidth: '92%',
                      textAlign: 'center',
                      lineHeight: 1.25
                    }}>
                      <div style={{
                        fontSize: roomPxW < 70 || roomPxH < 70 ? '8px' : '10.5px',
                        fontWeight: 700,
                        letterSpacing: '0.01em',
                        whiteSpace: 'normal',
                        wordBreak: 'break-word'
                      }}>
                        {room.label}
                      </div>
                      {roomPxW > 55 && roomPxH > 55 && (
                        <div style={{ fontSize: '7.5px', opacity: 0.75, fontFamily: 'var(--fm)' }}>
                          {Math.round(wFeet)}' x {Math.round(hFeet)}'
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}

              {/* Touch Handles */}
              {isSelected && editMode !== 'view' && (
                <div className="touch-handle-rotate" title="Rotate room segment orientation" />
              )}
              
              {editMode !== 'view' && (
                <div 
                  className="placed-room-resize-handle"
                  onMouseDown={(e) => handleMouseDown(e, room.id, 'resize')}
                  onTouchStart={(e) => handleTouchStart(e, room.id, 'resize')}
                />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
