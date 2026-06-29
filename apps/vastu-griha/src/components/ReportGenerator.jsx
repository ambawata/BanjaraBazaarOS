import React from 'react'
import { evaluateRoom } from './AnalysisPanel'

export default function ReportGenerator({ rooms, plot }) {
  const evaluatedRooms = rooms.map(room => ({
    ...room,
    analysis: evaluateRoom(room, plot)
  }))

  let totalScore = 0
  evaluatedRooms.forEach(r => { totalScore += r.analysis.rating })
  const score = rooms.length > 0 ? Math.round(totalScore / rooms.length) : 100

  // Set description and rating summary text
  let statusText = 'Very Harmonious Home Layout'
  let color = 'var(--emerald)'
  let summaryText = 'This layout demonstrates very high compliance with Vastu Shastra rules. Electromagnetic forces and solar pathways are unobstructed, promoting career luck, physical energy, and positive relations among family members.'
  
  if (score < 50) {
    statusText = 'Needs Attention (Significant Adjustments Advised)'
    color = 'var(--terracotta)'
    summaryText = 'This plan has multiple aspects that need attention. Elements like fire and water clash in critical zones, which can affect comfort and family harmony. Implementing the recommended remedies or adjusting the canvas coordinates is strongly advised.'
  } else if (score < 80) {
    statusText = 'Fair Layout (Can Be Improved with Remedies)'
    color = 'var(--gold)'
    summaryText = 'The layout is generally good but contains a few anomalies. Minor remedies (like sea salt placements, thresholds, or copper helixes) are recommended to prevent negative energy drains. Placing heavy decorations in the Southwest can help ground stability.'
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="reports-area">
      <div className="report-document">
        
        {/* Header */}
        <div className="report-header">
          <div className="report-title-group">
            <span className="report-title">VASTU GRIHA AUDIT REPORT</span>
            <span className="report-meta">BANJARA BAZAAR HOME DESIGN ENGINE</span>
          </div>
          <button className="btn btn-primary" onClick={handlePrint}>
            <i className="ti ti-printer"></i> Print / Save PDF
          </button>
        </div>

        {/* Audit Details */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
          <div>
            <strong style={{ fontSize: '11px', color: 'var(--text3)', fontFamily: 'var(--fm)', display: 'block', textTransform: 'uppercase' }}>Plot Size</strong>
            <span style={{ fontSize: '14px', fontWeight: 600 }}>{plot.width} ft × {plot.length} ft</span>
          </div>
          <div>
            <strong style={{ fontSize: '11px', color: 'var(--text3)', fontFamily: 'var(--fm)', display: 'block', textTransform: 'uppercase' }}>Facing Side</strong>
            <span style={{ fontSize: '14px', fontWeight: 600 }}>{plot.facing} Direction</span>
          </div>
          <div>
            <strong style={{ fontSize: '11px', color: 'var(--text3)', fontFamily: 'var(--fm)', display: 'block', textTransform: 'uppercase' }}>Audit Date</strong>
            <span style={{ fontSize: '14px', fontWeight: 600 }}>{new Date().toLocaleDateString()}</span>
          </div>
        </div>

        {/* Score Card */}
        <div className="report-score-box">
          <div style={{ 
            width: '90px', 
            height: '90px', 
            borderRadius: '50%', 
            border: `6px solid ${color}`,
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            fontSize: '28px',
            fontFamily: 'var(--fd)',
            fontWeight: 700,
            color: color,
            flexShrink: 0
          }}>
            {score}%
          </div>
          <div>
            <h4 style={{ fontFamily: 'var(--fd)', fontSize: '16px', fontWeight: 700, color: color, marginBottom: '4px' }}>{statusText}</h4>
            <p className="report-summary-text">{summaryText}</p>
          </div>
        </div>

        {/* Room Table Details */}
        <div className="report-section">
          <h3 className="report-section-title">Placement Health Checks</h3>
          <div className="rule-list" style={{ marginTop: '10px' }}>
            {evaluatedRooms.map((room) => {
              const isIssue = room.analysis.status === 'Can Be Improved' || room.analysis.status === 'Needs Attention'
              const statusColor = room.analysis.status === 'Needs Attention' ? 'var(--terracotta)' : room.analysis.status === 'Can Be Improved' ? 'var(--gold)' : 'var(--emerald)'
              
              return (
                <div key={room.id} className={`rule-card rule-${isIssue ? 'warning' : 'excellent'}`} style={{ borderLeftWidth: '5px' }}>
                  <div className="rule-card-content" style={{ width: '100%' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <strong style={{ fontSize: '13px' }}>{room.label} placed in {room.analysis.zone}</strong>
                      <span style={{ fontWeight: 600, color: statusColor }}>
                        {room.analysis.status} ({room.analysis.rating}%)
                      </span>
                    </div>
                    <span style={{ color: 'var(--text2)', fontSize: '12px', lineHeight: '1.4' }}>{room.analysis.desc}</span>
                    {room.analysis.remedy && (
                      <div className="rule-card-remedy" style={{ marginTop: '8px' }}>
                        <strong>Remedy Suggestion:</strong> {room.analysis.remedy}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
            {evaluatedRooms.length === 0 && (
              <p style={{ color: 'var(--text3)', fontStyle: 'italic', fontSize: '12px' }}>No rooms have been placed on the canvas layout yet.</p>
            )}
          </div>
        </div>

        {/* Remedies Recommendations */}
        <div className="report-section" style={{ pageBreakBefore: 'always' }}>
          <h3 className="report-section-title">Banjara Bazaar Home Remedies</h3>
          <p style={{ fontSize: '12px', color: 'var(--text2)', lineHeight: '1.5' }}>
            To improve energy balance without rebuilding brick walls, the Vastu Acharya recommends placing these Vedic elements in your home:
          </p>
          
          <ul style={{ paddingLeft: '20px', fontSize: '12px', color: 'var(--text2)', display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '10px' }}>
            {evaluatedRooms.filter(r => r.analysis.rating < 70).map(r => (
              <li key={r.id}>
                <strong>For {r.label} in {r.analysis.zone}:</strong> Obtain and place the{' '}
                {r.type === 'toilet' || r.type === 'septic-tank' ? 'Raw Pink Sea Salt Bowl + virtual partitions.' : ''}
                {r.type === 'kitchen' || r.type === 'solar' || r.type === 'borewell' ? 'Agni Southeast Copper Helix.' : ''}
                {r.type === 'entrance' ? 'Vastu Lead Metal Boundary strip.' : ''}
                {r.type === 'bedroom' ? 'Rose/Crystal Quartz cluster.' : ''}
                {r.type === 'staircase' || r.type === 'lift' ? 'Brass Tortoise grounding base.' : ''}
                <span style={{ color: 'var(--gold)', fontFamily: 'var(--fm)', marginLeft: '6px' }}>[Remedy Item Available]</span>
              </li>
            ))}
            {evaluatedRooms.filter(r => r.analysis.rating < 70).length === 0 && (
              <li>No major elements need improvement! Your layout meets all high-level Vedic energy standards.</li>
            )}
          </ul>
        </div>

        {/* Footer Disclaimer */}
        <div style={{ marginTop: 'auto', paddingTop: '20px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text3)', fontFamily: 'var(--fm)' }}>
          <span>BanjaraBazaarOS Vastu Griha v1.0</span>
          <span>Verified Vedic Guidance Engine</span>
        </div>

      </div>
    </div>
  )
}
