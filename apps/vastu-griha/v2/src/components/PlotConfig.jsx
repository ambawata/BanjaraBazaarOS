import React from 'react'
import { useProjectStore } from '../stores/projectStore'

function InteractiveCompassDial({ value, onChange }) {
  const svgRef = React.useRef(null)
  const [isDragging, setIsDragging] = React.useState(false)

  const handlePointerEvent = (e) => {
    if (!svgRef.current) return
    const rect = svgRef.current.getBoundingClientRect()
    const cx = rect.left + rect.width / 2
    const cy = rect.top + rect.height / 2
    
    let clientX = e.clientX
    let clientY = e.clientY
    if (e.touches && e.touches[0]) {
      clientX = e.touches[0].clientX
      clientY = e.touches[0].clientY
    }
    if (clientX === undefined || clientY === undefined) return
    
    const dx = clientX - cx
    const dy = clientY - cy
    const angleRad = Math.atan2(dx, -dy)
    let angleDeg = Math.round((angleRad * 180) / Math.PI)
    
    // Clamp to ±45 degrees
    if (angleDeg < -45) angleDeg = -45
    if (angleDeg > 45) angleDeg = 45

    onChange(angleDeg)
  }

  const handleMouseDown = (e) => {
    e.preventDefault()
    setIsDragging(true)
    handlePointerEvent(e)
  }

  React.useEffect(() => {
    const handleMouseMove = (e) => {
      if (isDragging) handlePointerEvent(e)
    }
    const handleMouseUp = () => {
      setIsDragging(false)
    }

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleMouseUp)
      window.addEventListener('touchmove', handleMouseMove, { passive: false })
      window.addEventListener('touchend', handleMouseUp)
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
      window.removeEventListener('touchmove', handleMouseMove)
      window.removeEventListener('touchend', handleMouseUp)
    }
  }, [isDragging])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', padding: '6px 0' }}>
      <div 
        style={{ position: 'relative', width: '120px', height: '120px', cursor: 'grab', userSelect: 'none' }}
        onMouseDown={handleMouseDown}
        onTouchStart={handleMouseDown}
      >
        <svg 
          ref={svgRef}
          viewBox="0 0 100 100" 
          style={{ width: '100%', height: '100%', overflow: 'visible' }}
        >
          {/* Outer Ring */}
          <circle cx="50" cy="50" r="44" stroke="var(--border)" strokeWidth="1.5" fill="var(--bg3)" />
          <circle cx="50" cy="50" r="40" stroke="var(--border2)" strokeWidth="0.5" strokeDasharray="2 2" fill="none" />
          
          {/* Compass Ticks */}
          {Array.from({ length: 24 }).map((_, i) => {
            const angle = i * 15
            const rad = (angle * Math.PI) / 180
            const x1 = 50 + 38 * Math.sin(rad)
            const y1 = 50 - 38 * Math.cos(rad)
            const x2 = 50 + 44 * Math.sin(rad)
            const y2 = 50 - 44 * Math.cos(rad)
            return (
              <line 
                key={i} 
                x1={x1} y1={y1} x2={x2} y2={y2} 
                stroke={i % 6 === 0 ? 'var(--gold)' : 'var(--border2)'} 
                strokeWidth={i % 6 === 0 ? 1.2 : 0.6} 
              />
            )
          })}

          {/* Compass labels */}
          <text x="50" y="14" fill="var(--gold)" fontSize="7.5" fontWeight="900" textAnchor="middle">N</text>
          <text x="50" y="89" fill="var(--text3)" fontSize="6" fontWeight="bold" textAnchor="middle">S</text>
          <text x="87" y="52" fill="var(--text3)" fontSize="6" fontWeight="bold" textAnchor="middle">E</text>
          <text x="13" y="52" fill="var(--text3)" fontSize="6" fontWeight="bold" textAnchor="middle">W</text>

          {/* Active Rotated Compass Needle */}
          <g transform={`rotate(${value} 50 50)`}>
            <line x1="50" y1="50" x2="50" y2="18" stroke="var(--gold)" strokeWidth="2" strokeLinecap="round" />
            <polygon points="50,14 53,24 47,24" fill="var(--gold)" />
            <circle cx="50" cy="50" r="4.5" fill="var(--bg2)" stroke="var(--gold)" strokeWidth="1.5" />
          </g>
        </svg>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
        <span style={{ fontSize: '10.5px', fontFamily: 'var(--fm)', fontWeight: 'bold', color: 'var(--gold)', letterSpacing: '0.02em' }}>
          COMPASS ORIENTATION TILT
        </span>
        <span style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text)' }}>
          {value}° {value > 0 ? 'EASTWARD' : value < 0 ? 'WESTWARD' : 'TRUE NORTH'}
        </span>
      </div>
    </div>
  )
}

export default function PlotConfig() {
  const { plot, setPlot } = useProjectStore()
  const {
    width,
    length,
    shape,
    facing,
    tilt,
    northWall = 30,
    southWall = 30,
    eastWall = 40,
    westWall = 40
  } = plot

  const handleChange = (key, val) => {
    let nextPlot = { ...plot, [key]: val }
    if (key === 'shape') {
      if (val === 'Square') {
        const side = Math.min(plot.width, plot.length)
        nextPlot.width = side
        nextPlot.length = side
        nextPlot.northWall = side
        nextPlot.southWall = side
        nextPlot.eastWall = side
        nextPlot.westWall = side
      } else if (val === 'Rectangular') {
        nextPlot.northWall = plot.width
        nextPlot.southWall = plot.width
        nextPlot.eastWall = plot.length
        nextPlot.westWall = plot.length
      }
    } else if (key === 'width') {
      nextPlot.northWall = val
      nextPlot.southWall = val
      if (plot.shape === 'Square') {
        nextPlot.length = val
        nextPlot.eastWall = val
        nextPlot.westWall = val
      }
    } else if (key === 'length') {
      nextPlot.eastWall = val
      nextPlot.westWall = val
      if (plot.shape === 'Square') {
        nextPlot.width = val
        nextPlot.northWall = val
        nextPlot.southWall = val
      }
    } else if (key === 'northWall' || key === 'southWall') {
      nextPlot.width = Math.max(nextPlot.northWall || 15, nextPlot.southWall || 15)
    } else if (key === 'eastWall' || key === 'westWall') {
      nextPlot.length = Math.max(nextPlot.eastWall || 15, nextPlot.westWall || 15)
    }
    setPlot(nextPlot)
  }

  const adjustDimension = (key, step) => {
    const val = (plot[key] || 30) + step
    if (val >= 15 && val <= 120) {
      handleChange(key, val)
    }
  }

  return (
    <div className="plot-config-panel" style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '18px 16px' }}>
      
      {/* Title */}
      <div style={{ borderBottom: '1.5px solid var(--border)', paddingBottom: '12px' }}>
        <h3 style={{ fontFamily: 'var(--fd)', fontWeight: 800, fontSize: '14.5px', color: 'var(--text)', margin: 0, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          Plot Geometry
        </h3>
        <span style={{ fontSize: '10.5px', color: 'var(--text3)' }}>Set boundaries & compound orientations</span>
      </div>

      {/* Plot Shape Selection Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <label style={{ fontSize: '11px', color: 'var(--text2)', fontWeight: '700', textTransform: 'uppercase' }}>
          Plot Shape
        </label>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
          {[
            { id: 'Square', label: 'SQUARE', sub: 'Ideal', shapeStyle: { width: '16px', height: '16px', border: '1.5px solid currentColor' } },
            { id: 'Rectangular', label: 'RECT', sub: 'Balanced', shapeStyle: { width: '22px', height: '14px', border: '1.5px solid currentColor' } },
            { id: 'Irregular', label: 'CUSTOM', sub: 'Irregular', shapeStyle: { width: '20px', height: '16px', clipPath: 'polygon(15% 0%, 100% 20%, 85% 100%, 0% 80%)', background: 'currentColor' } }
          ].map((item) => {
            const active = shape === item.id
            return (
              <div
                key={item.id}
                onClick={() => handleChange('shape', item.id)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '10px 4px',
                  borderRadius: '10px',
                  background: active ? 'var(--accent-dim)' : 'var(--bg3)',
                  border: `1.5px solid ${active ? 'var(--accent)' : 'var(--border)'}`,
                  color: active ? 'var(--accent)' : 'var(--text3)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  gap: '6px'
                }}
              >
                <div style={{ ...item.shapeStyle, opacity: active ? 1 : 0.6 }} />
                <span style={{ fontSize: '10px', fontWeight: '800' }}>{item.label}</span>
                <span style={{ fontSize: '8px', opacity: 0.8 }}>{item.sub}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Dynamic Dimension Selectors */}
      {shape !== 'Irregular' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* Width */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text2)', fontWeight: '700', textTransform: 'uppercase' }}>
              <span>Width (East-West)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button className="btn" style={{ padding: '6px 12px', minWidth: '32px', justifyContent: 'center' }} onClick={() => adjustDimension('width', -1)}>-</button>
              <div style={{ flex: 1, height: '36px', border: '1.5px solid var(--border)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg3)', fontWeight: '800', fontFamily: 'var(--fb)', fontSize: '13px' }}>
                {width} FT
              </div>
              <button className="btn" style={{ padding: '6px 12px', minWidth: '32px', justifyContent: 'center' }} onClick={() => adjustDimension('width', 1)}>+</button>
            </div>
          </div>

          {/* Length */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text2)', fontWeight: '700', textTransform: 'uppercase' }}>
              <span>Length (North-South)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button className="btn" style={{ padding: '6px 12px', minWidth: '32px', justifyContent: 'center' }} onClick={() => adjustDimension('length', -1)}>-</button>
              <div style={{ flex: 1, height: '36px', border: '1.5px solid var(--border)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg3)', fontWeight: '800', fontFamily: 'var(--fb)', fontSize: '13px' }}>
                {length} FT
              </div>
              <button className="btn" style={{ padding: '6px 12px', minWidth: '32px', justifyContent: 'center' }} onClick={() => adjustDimension('length', 1)}>+</button>
            </div>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {[
            { key: 'northWall', label: 'North Wall (Top)' },
            { key: 'southWall', label: 'South Wall (Bottom)' },
            { key: 'eastWall', label: 'East Wall (Right)' },
            { key: 'westWall', label: 'West Wall (Left)' }
          ].map((wall) => (
            <div key={wall.key} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span style={{ fontSize: '10px', color: 'var(--text3)', fontWeight: 'bold' }}>{wall.label}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <button className="btn" style={{ padding: '4px 10px' }} onClick={() => adjustDimension(wall.key, -1)}>-</button>
                <div style={{ flex: 1, height: '30px', border: '1.5px solid var(--border)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg3)', fontWeight: '700', fontSize: '12px' }}>
                  {plot[wall.key] || 30} FT
                </div>
                <button className="btn" style={{ padding: '4px 10px' }} onClick={() => adjustDimension(wall.key, 1)}>+</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Facing Direction Badges */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <label style={{ fontSize: '11px', color: 'var(--text2)', fontWeight: '700', textTransform: 'uppercase' }}>
          Facing Direction
        </label>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          {[
            { id: 'East', label: 'EAST', sub: 'Aditya (Air)', color: 'rgba(34, 197, 94, 0.08)', text: 'var(--emerald)' },
            { id: 'North', label: 'NORTH', sub: 'Kubera (Water)', color: 'rgba(34, 197, 94, 0.08)', text: 'var(--emerald)' },
            { id: 'West', label: 'WEST', sub: 'Varuna (Space)', color: 'rgba(245, 158, 11, 0.08)', text: 'var(--gold)' },
            { id: 'South', label: 'SOUTH', sub: 'Yama (Earth)', color: 'rgba(239, 68, 68, 0.08)', text: 'var(--red)' }
          ].map((item) => {
            const active = facing === item.id
            return (
              <div
                key={item.id}
                onClick={() => handleChange('facing', item.id)}
                style={{
                  padding: '10px 8px',
                  borderRadius: '10px',
                  background: active ? item.color : 'var(--bg3)',
                  border: `1.5px solid ${active ? item.text : 'var(--border)'}`,
                  color: active ? item.text : 'var(--text3)',
                  cursor: 'pointer',
                  textAlign: 'center',
                  transition: 'all 0.15s ease'
                }}
              >
                <div style={{ fontSize: '11.5px', fontWeight: '800' }}>{item.label}</div>
                <div style={{ fontSize: '8px', opacity: 0.8, marginTop: '2px' }}>{item.sub}</div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Interactive Compass Dial */}
      <div style={{ borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
        <InteractiveCompassDial value={tilt} onChange={(val) => handleChange('tilt', val)} />
      </div>

      {/* Dynamic Vastu Tip panel */}
      <div style={{ background: 'var(--bg3)', padding: '14px', borderRadius: '12px', border: '1.5px solid var(--border)', textAlign: 'left' }}>
        <h4 style={{ fontSize: '10.5px', fontWeight: '800', color: 'var(--gold)', textTransform: 'uppercase', marginBottom: '6px', letterSpacing: '0.02em', margin: 0 }}>
          Vastu Alignment Guide
        </h4>
        <p style={{ fontSize: '11px', color: 'var(--text2)', lineHeight: '1.45', margin: 0 }}>
          {shape === 'Square' && "Square plots have balanced electromagnetic energy fields in all cardinal corners. Highly auspicious."}
          {shape === 'Rectangular' && "Rectangular plots with width:length ratios up to 1:2 support uniform cosmic energy flow."}
          {shape === 'Irregular' && "Irregular borders lead to cut corners. Place copper Vastu pyramids on custom coordinate corners to balance magnetic currents."}
        </p>
      </div>

    </div>
  )
}
