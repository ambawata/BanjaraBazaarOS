import React, { useRef, useState, useEffect } from 'react'
import { evaluateRoom } from './AnalysisPanel'
import { useCanvasStore } from '../stores/canvasStore'
import { useProjectStore } from '../stores/projectStore'
import { useSettingsStore } from '../stores/settingsStore'
import { useUiStore } from '../stores/uiStore'
import { snapEngine } from '../lib/geometry/snapEngine'
import { coordinateSystem } from '../lib/geometry/coordinateSystem'

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

  const containerRef = useRef(null)
  const plotRef = useRef(null)
  const [dragState, setDragState] = useState(null)
  const [plotDims, setPlotDims] = useState({ w: 400, h: 400 })

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
    if (!dragState || !plotRef.current) return
    e.preventDefault()
    
    const deltaX = e.clientX - dragState.startX
    const deltaY = e.clientY - dragState.startY
    
    const deltaXPercent = (deltaX / plotDims.w) * 100
    const deltaYPercent = (deltaY / plotDims.h) * 100
    
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
    if (!dragState || !plotRef.current) return
    e.preventDefault()
    
    const touch = e.touches?.[0]
    if (!touch) return
    const deltaX = touch.clientX - dragState.startX
    const deltaY = touch.clientY - dragState.startY
    
    const deltaXPercent = (deltaX / plotDims.w) * 100
    const deltaYPercent = (deltaY / plotDims.h) * 100
    
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
      ['NW', 'N', 'NE'],
      ['W',  'C', 'E' ],
      ['SW', 'S', 'SE']
    ]
    const elements = [
      ['Vayu (Wind)', 'Water', 'Ishanya (Water)'],
      ['Space', 'Brahmasthan', 'Aditya (Solar)'],
      ['Nairutya (Earth)', 'Yama (Earth)', 'Agni (Fire)']
    ]
    
    const cells = []
    for(let r=0; r<3; r++) {
      for(let c=0; c<3; c++) {
        const isBrahmasthan = r === 1 && c === 1
        cells.push(
          <div 
            key={`${r}-${c}`} 
            className={`vastu-cell ${isBrahmasthan ? 'brahmasthan' : ''}`}
          >
            <span className="vastu-cell-label">{zones[r][c]}</span>
            <span className="vastu-cell-element">{elements[r][c]}</span>
          </div>
        )
      }
    }
    return cells
  }

  // Render empty state
  if (rooms.length === 0) {
    return (
      <div className="canvas-container" ref={containerRef} onClick={() => setSelectedRoomId(null)}>
        <div className="empty-canvas-state">
          <svg viewBox="0 0 100 100" width="80" height="80" style={{ fill: 'none', stroke: 'var(--text3)', strokeWidth: 1.5, marginBottom: '16px' }}>
            <circle cx="50" cy="50" r="40" strokeDasharray="4 4" />
            <polygon points="50,22 78,50 50,78 22,50" />
            <line x1="50" y1="10" x2="50" y2="90" />
            <line x1="10" y1="50" x2="90" y2="50" />
            <circle cx="50" cy="50" r="8" fill="var(--accent-dim)" stroke="var(--accent)" strokeWidth="2" />
          </svg>
          <h3 style={{ fontFamily: 'var(--fd)', fontWeight: 600, color: 'var(--text)' }}>Your Planner Canvas is Ready</h3>
          <p style={{ fontSize: '12px', color: 'var(--text2)', marginTop: '8px', maxWidth: '280px', lineHeight: 1.4 }}>
            Place rooms from the left catalog, or upload a sketch layout backdrop to trace your blueprint.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div 
      className="canvas-container" 
      ref={containerRef}
      onClick={() => setSelectedRoomId(null)}
    >
      <div 
        className={`plot-wrapper ${showNormalGrid ? 'show-normal-grid' : ''}`} 
        ref={plotRef}
        style={{
          width: `${plotDims.w}px`,
          height: `${plotDims.h}px`,
          position: 'relative'
        }}
      >
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

        {/* Placed Rooms */}
        {rooms.map((room) => {
          const evalRes = evaluateRoom(room, plot)
          const isSelected = room.id === selectedRoomId
          
          const wFeet = coordinateSystem.pctToFeet(room.width, plot.width)
          const hFeet = coordinateSystem.pctToFeet(room.height, plot.length)
          const areaFeet = wFeet * hFeet
          
          return (
            <div
              key={room.id}
              className={`placed-room compliance-${evalRes.status.toLowerCase()} ${isSelected ? 'selected' : ''}`}
              style={{
                left: `${room.x}%`,
                top: `${room.y}%`,
                width: `${room.width}%`,
                height: `${room.height}%`
              }}
              onMouseDown={(e) => handleMouseDown(e, room.id, 'move')}
              onTouchStart={(e) => handleTouchStart(e, room.id, 'move')}
            >
              {/* Context Sensitive Floating Canva-style Toolbar */}
              {isSelected && (
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
                      const rotated = { ...room, width: room.height, height: room.width }
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

              {/* Floating Measurements Badge overlays (Visible only while editing/dragging) */}
              {dragState && dragState.roomId === room.id && (
                <>
                  <div className="floating-measurement-badge" style={{ left: '50%', top: '-20px', transform: 'translateX(-50%)' }}>
                    W: {Math.round(wFeet)} ft
                  </div>
                  <div className="floating-measurement-badge" style={{ right: '-65px', top: '50%', transform: 'translateY(-50%)' }}>
                    L: {Math.round(hFeet)} ft
                  </div>
                </>
              )}

              <div className="placed-room-header">
                <span className="placed-room-title">{room.label}</span>
                <i 
                  className="ti ti-x placed-room-close"
                  onClick={(e) => handleRemoveRoom(room.id, e)}
                  title="Remove room"
                ></i>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', width: '100%', marginTop: 'auto' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '2px' }}>
                  <span className="placed-room-size" style={{ fontSize: '9px' }}>
                    {Math.round(wFeet)}x{Math.round(hFeet)} ft
                  </span>
                  <span className="placed-room-size" style={{ fontSize: '9px', opacity: 0.8 }}>
                    ({Math.round(areaFeet)} sq ft)
                  </span>
                </div>
                <span className="placed-room-status">
                  {evalRes.status}
                </span>
              </div>
              
              {/* Touch Handles */}
              {isSelected && (
                <div className="touch-handle-rotate" title="Rotate room segment orientation" />
              )}
              
              <div 
                className="placed-room-resize-handle"
                onMouseDown={(e) => handleMouseDown(e, room.id, 'resize')}
                onTouchStart={(e) => handleTouchStart(e, room.id, 'resize')}
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}
