import React from 'react'

export default function PlotBoundaryDrawer({ points, onChange, width = 320, height = 220 }) {
  
  const handleCanvasClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = Math.round(((e.clientX - rect.left) / rect.width) * 100)
    const y = Math.round(((e.clientY - rect.top) / rect.height) * 100)
    
    // Add point (up to 12 points for custom shapes)
    if (points.length >= 12) return
    const updated = [...points, { x, y }]
    onChange(updated)
  }

  const handleUndo = (e) => {
    e.stopPropagation()
    if (points.length === 0) return
    const updated = points.slice(0, -1)
    onChange(updated)
  }

  const handleReset = (e) => {
    e.stopPropagation()
    onChange([])
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '12px 0', width: '100%' }}>
      <div 
        style={{ 
          width: `${width}px`, 
          height: `${height}px`, 
          background: 'var(--bg3)', 
          border: '2.5px dashed var(--border)', 
          borderRadius: '12px', 
          position: 'relative', 
          cursor: 'crosshair',
          overflow: 'hidden'
        }}
        onClick={handleCanvasClick}
      >
        {/* SVG Drawing Layer */}
        <svg style={{ width: '100%', height: '100%', pointerEvents: 'none' }}>
          {/* Grid lines */}
          <line x1="33.3%" y1="0" x2="33.3%" y2="100%" stroke="var(--border2)" strokeWidth="0.5" opacity="0.3" />
          <line x1="66.6%" y1="0" x2="66.6%" y2="100%" stroke="var(--border2)" strokeWidth="0.5" opacity="0.3" />
          <line x1="0" y1="33.3%" x2="100%" y2="33.3%" stroke="var(--border2)" strokeWidth="0.5" opacity="0.3" />
          <line x1="0" y1="66.6%" x2="100%" y2="66.6%" stroke="var(--border2)" strokeWidth="0.5" opacity="0.3" />

          {/* Polyline shape */}
          {points.length > 1 && (
            <polyline
              points={points.map(p => `${(p.x / 100) * width}, ${(p.y / 100) * height}`).join(' ')}
              fill="rgba(124, 111, 247, 0.12)"
              stroke="var(--accent)"
              strokeWidth="2.5"
            />
          )}

          {/* Closing helper line */}
          {points.length > 2 && (
            <line 
              x1={`${(points[points.length - 1].x / 100) * width}`}
              y1={`${(points[points.length - 1].y / 100) * height}`}
              x2={`${(points[0].x / 100) * width}`}
              y2={`${(points[0].y / 100) * height}`}
              stroke="var(--accent)"
              strokeWidth="1.5"
              strokeDasharray="4 4"
            />
          )}
        </svg>

        {/* Tapped coordinates nodes */}
        {points.map((p, idx) => (
          <div
            key={idx}
            style={{
              position: 'absolute',
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              background: 'var(--gold)',
              border: '2px solid #fff',
              transform: 'translate(-50%, -50%)',
              pointerEvents: 'none',
              boxShadow: '0 0 5px rgba(0,0,0,0.5)'
            }}
          />
        ))}

        {/* Hint text if empty */}
        {points.length === 0 && (
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text3)', fontSize: '12px', pointerEvents: 'none', padding: '16px', textAlign: 'center' }}>
            Tap inside this box to place corner boundary points of your plot
          </div>
        )}
      </div>

      {/* Toolbar actions */}
      <div style={{ display: 'flex', gap: '8px', marginTop: '10px', width: '100%', maxWidth: `${width}px` }}>
        <button 
          className="btn btn-sm" 
          style={{ flex: 1, padding: '8px', justifyContent: 'center' }} 
          onClick={handleUndo}
          disabled={points.length === 0}
        >
          <i className="ti ti-arrow-back-up" style={{ marginRight: '4px' }}></i> Undo
        </button>
        <button 
          className="btn btn-sm" 
          style={{ flex: 1, padding: '8px', justifyContent: 'center' }} 
          onClick={handleReset}
          disabled={points.length === 0}
        >
          <i className="ti ti-trash" style={{ marginRight: '4px' }}></i> Reset
        </button>
      </div>

    </div>
  )
}
