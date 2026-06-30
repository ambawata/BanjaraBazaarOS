import React, { useRef, useState, useEffect } from 'react'
import { evaluateRoom } from './AnalysisPanel'

export default function Canvas({ 
  rooms, 
  plot, 
  onRoomsChange, 
  imageSettings, 
  selectedRoomId, 
  onSelectRoom,
  showVastuGrid = true,
  showNormalGrid = true
}) {
  const containerRef = useRef(null)
  const plotRef = useRef(null)
  const [dragState, setDragState] = useState(null) // { type: 'move'|'resize', roomId, startX, startY, startW, startH, startPx, startPy }
  
  // Calculate relative aspect ratio sizing to fit inside canvas container
  const [plotDims, setPlotDims] = useState({ w: 400, h: 400 })

  useEffect(() => {
    function updateDimensions() {
      if (!containerRef.current) return
      const cWidth = containerRef.current.clientWidth - 48 // padding
      const cHeight = containerRef.current.clientHeight - 48
      
      const pWidth = plot.width
      const pLength = plot.length
      
      const aspect = pWidth / pLength
      
      let w, h
      if (aspect > cWidth / cHeight) {
        // Width constrained
        w = cWidth
        h = cWidth / aspect
      } else {
        // Height constrained
        h = cHeight
        w = cHeight * aspect
      }
      
      // Safety boundaries
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
    
    onSelectRoom(roomId)
    
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
    const touch = e.touches[0]
    const room = rooms.find(r => r.id === roomId)
    if (!room) return
    
    onSelectRoom(roomId)
    
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
    
    // Convert pixels deltas to percentages relative to plot bounding size
    const deltaXPercent = (deltaX / plotDims.w) * 100
    const deltaYPercent = (deltaY / plotDims.h) * 100
    
    const roomIndex = rooms.findIndex(r => r.id === dragState.roomId)
    if (roomIndex === -1) return
    
    const newRooms = [...rooms]
    const targetRoom = { ...newRooms[roomIndex] }
    
    if (dragState.type === 'move') {
      // Boundaries 0 to 100 - width/height
      let newX = dragState.startXCoord + deltaXPercent
      let newY = dragState.startYCoord + deltaYPercent
      
      newX = Math.max(0, Math.min(100 - targetRoom.width, newX))
      let newYClamped = Math.max(0, Math.min(100 - targetRoom.height, newY))
      
      targetRoom.x = Math.round(newX * 10) / 10
      targetRoom.y = Math.round(newYClamped * 10) / 10
    } 
    else if (dragState.type === 'resize') {
      let newW = dragState.startW + deltaXPercent
      let newH = dragState.startH + deltaYPercent
      
      // Min size 10%
      newW = Math.max(10, Math.min(100 - targetRoom.x, newW))
      newH = Math.max(10, Math.min(100 - targetRoom.y, newH))
      
      targetRoom.width = Math.round(newW * 10) / 10
      targetRoom.height = Math.round(newH * 10) / 10
    }
    
    newRooms[roomIndex] = targetRoom
    onRoomsChange(newRooms)
  }

  const handleTouchMove = (e) => {
    if (!dragState || !plotRef.current) return
    e.preventDefault()
    
    const touch = e.touches[0]
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
      
      newX = Math.max(0, Math.min(100 - targetRoom.width, newX))
      let newYClamped = Math.max(0, Math.min(100 - targetRoom.height, newY))
      
      targetRoom.x = Math.round(newX * 10) / 10
      targetRoom.y = Math.round(newYClamped * 10) / 10
    } 
    else if (dragState.type === 'resize') {
      let newW = dragState.startW + deltaXPercent
      let newH = dragState.startH + deltaYPercent
      
      newW = Math.max(10, Math.min(100 - targetRoom.x, newW))
      newH = Math.max(10, Math.min(100 - targetRoom.y, newH))
      
      targetRoom.width = Math.round(newW * 10) / 10
      targetRoom.height = Math.round(newH * 10) / 10
    }
    
    newRooms[roomIndex] = targetRoom
    onRoomsChange(newRooms)
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
    onRoomsChange(rooms.filter(r => r.id !== roomId))
    if (selectedRoomId === roomId) onSelectRoom(null)
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

  return (
    <div 
      className="canvas-container" 
      ref={containerRef}
      onClick={() => onSelectRoom(null)}
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
              <div className="placed-room-header">
                <span className="placed-room-title">{room.label}</span>
                <i 
                  className="ti ti-x placed-room-close"
                  onClick={(e) => handleRemoveRoom(room.id, e)}
                  title="Remove room"
                ></i>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', width: '100%', marginTop: 'auto' }}>
                <span className="placed-room-size">
                  {Math.round((room.width / 100) * plot.width)}x{Math.round((room.height / 100) * plot.length)} ft
                </span>
                <span className="placed-room-status">
                  {evalRes.status}
                </span>
              </div>
              
              {/* Resize Handle */}
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
