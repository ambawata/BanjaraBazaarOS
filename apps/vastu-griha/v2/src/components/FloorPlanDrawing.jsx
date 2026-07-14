import React from 'react'
import RoomSymbol from './RoomSymbol'

// Renders the layout as a to-scale, dimensioned architectural drawing —
// the "hand it to a contractor" version of the plan. Pulls from the exact
// same rooms/plot data as the live Canvas editor, just presented as a
// finished sheet instead of editable boxes.
export default function FloorPlanDrawing({ rooms, plot, projectName }) {
  const W = plot.width || 30
  const L = plot.length || 40

  const boxW = 720
  const boxH = 520
  const marginLeft = 60
  const marginTop = 50
  const marginRight = 30
  const marginBottom = 30

  const scale = Math.min((boxW - marginLeft - marginRight) / W, (boxH - marginTop - marginBottom) / L)
  const plotPxW = W * scale
  const plotPxH = L * scale
  const ox = marginLeft
  const oy = marginTop

  const totalArea = Math.round(W * L)
  const roomsWithArea = rooms
    .filter(r => !r.category || r.category === 'room')
    .map(r => {
      const wFeet = (r.width / 100) * W
      const hFeet = (r.height / 100) * L
      return { ...r, wFeet, hFeet, areaFeet: Math.round(wFeet * hFeet) }
    })

  return (
    <div className="floor-plan-drawing">
      <svg viewBox={`0 0 ${boxW} ${boxH}`} style={{ width: '100%', height: 'auto', background: '#fff' }}>
        {/* Outer plot boundary — double line to read as a wall */}
        <rect x={ox} y={oy} width={plotPxW} height={plotPxH} fill="none" stroke="#000" strokeWidth="3" />
        <rect x={ox + 4} y={oy + 4} width={plotPxW - 8} height={plotPxH - 8} fill="none" stroke="#000" strokeWidth="1" />

        {/* Rooms */}
        {roomsWithArea.map(room => {
          const px = ox + (room.x / 100) * plotPxW
          const py = oy + (room.y / 100) * plotPxH
          const pw = (room.width / 100) * plotPxW
          const ph = (room.height / 100) * plotPxH
          const symbolSize = Math.min(pw, ph) * 0.5

          return (
            <g key={room.id}>
              <rect x={px} y={py} width={pw} height={ph} fill="#fff" stroke="#000" strokeWidth="1.6" />
              {pw > 40 && ph > 40 && (
                <foreignObject x={px + pw / 2 - symbolSize / 2} y={py + ph * 0.32 - symbolSize / 2} width={symbolSize} height={symbolSize}>
                  <div style={{ width: '100%', height: '100%', opacity: 0.85 }}>
                    <RoomSymbol type={room.type} label={room.label} stroke="#000" size={symbolSize} stairStyle={room.stairStyle} long={pw >= ph} />
                  </div>
                </foreignObject>
              )}
              <text x={px + pw / 2} y={py + ph - 16} textAnchor="middle" fontSize="10.5" fontWeight="700" fill="#000" fontFamily="Arial, sans-serif">
                {room.label.toUpperCase()}
              </text>
              <text x={px + pw / 2} y={py + ph - 5} textAnchor="middle" fontSize="8.5" fill="#333" fontFamily="Arial, sans-serif">
                {Math.round(room.wFeet)}'-0" x {Math.round(room.hFeet)}'-0" ({room.areaFeet} sq ft)
              </text>
            </g>
          )
        })}

        {/* Overall width dimension (top) */}
        <line x1={ox} y1={oy - 14} x2={ox + plotPxW} y2={oy - 14} stroke="#000" strokeWidth="1" />
        <line x1={ox} y1={oy - 18} x2={ox} y2={oy - 10} stroke="#000" strokeWidth="1" />
        <line x1={ox + plotPxW} y1={oy - 18} x2={ox + plotPxW} y2={oy - 10} stroke="#000" strokeWidth="1" />
        <text x={ox + plotPxW / 2} y={oy - 20} textAnchor="middle" fontSize="11" fontWeight="700" fill="#000" fontFamily="Arial, sans-serif">
          {W}'-0"
        </text>

        {/* Overall length dimension (left) */}
        <line x1={ox - 14} y1={oy} x2={ox - 14} y2={oy + plotPxH} stroke="#000" strokeWidth="1" />
        <line x1={ox - 18} y1={oy} x2={ox - 10} y2={oy} stroke="#000" strokeWidth="1" />
        <line x1={ox - 18} y1={oy + plotPxH} x2={ox - 10} y2={oy + plotPxH} stroke="#000" strokeWidth="1" />
        <text x={ox - 22} y={oy + plotPxH / 2} textAnchor="middle" fontSize="11" fontWeight="700" fill="#000" fontFamily="Arial, sans-serif" transform={`rotate(-90 ${ox - 22} ${oy + plotPxH / 2})`}>
          {L}'-0"
        </text>

        {/* North compass, bottom-right corner of the drawing */}
        <g transform={`translate(${ox + plotPxW - 26}, ${oy + plotPxH + 8})`}>
          <circle cx="0" cy="0" r="18" fill="#fff" stroke="#000" strokeWidth="1.2" />
          <line x1="0" y1="12" x2="0" y2="-12" stroke="#000" strokeWidth="1.2" />
          <line x1="-12" y1="0" x2="12" y2="0" stroke="#000" strokeWidth="1.2" />
          <polygon points="0,-12 3,-4 -3,-4" fill="#000" />
          <text x="0" y="-16" textAnchor="middle" fontSize="9" fontWeight="700" fill="#000" fontFamily="Arial, sans-serif">N</text>
        </g>
      </svg>

      {/* Title block — matches a standard architectural drawing sheet footer */}
      <table className="title-block">
        <tbody>
          <tr>
            <td className="title-block-label">PROJECT</td>
            <td>{projectName || 'Residential Building Plan'}</td>
            <td className="title-block-label">DRAWING TITLE</td>
            <td>FLOOR PLAN</td>
            <td className="title-block-label">PLOT SIZE</td>
            <td>{W} ft × {L} ft</td>
          </tr>
          <tr>
            <td className="title-block-label">DATE</td>
            <td>{new Date().toLocaleDateString()}</td>
            <td className="title-block-label">TOTAL AREA</td>
            <td>{totalArea} sq ft</td>
            <td className="title-block-label">FACING</td>
            <td>{plot.facing || 'East'}</td>
          </tr>
          <tr>
            <td className="title-block-label">DRAFTED BY</td>
            <td colSpan="5">Vastu Griha — Banjara Bazaar Home Design Engine</td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}
