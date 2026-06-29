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
  let statusText = 'Auspicious Design (Highly Harmonized)'
  let color = 'var(--emerald)'
  let summaryText = 'This layout demonstrates very high compliance with Vastu Shastra rules. Electromagnetic forces and solar pathways are unobstructed, promoting career luck, physical energy, and positive relations among family members.'
  
  if (score < 50) {
    statusText = 'Defective Layout (Requires Remedies)'
    color = 'var(--red)'
    summaryText = 'This plan has multiple severe directional defects. Fire elements clash with water quadrants (e.g. kitchen/toilet in Northeast), which can lead to stress, wealth losses, or chronic fatigue. Implementing the recommended remedies or adjusting the canvas coordinates is strongly advised.'
  } else if (score < 80) {
    statusText = 'Fair Layout (Needs Minor Corrections)'
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
            <strong style={{ fontSize: '11px', color: 'var(--text3)', fontFamily: 'var(--fm)', display: 'block', textTransform: 'uppercase' }}>Street Facing</strong>
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
          <h3 className="report-section-title">Zone-by-Zone Placement Analysis</h3>
          <div className="rule-list" style={{ marginTop: '10px' }}>
            {evaluatedRooms.map((room) => (
              <div key={room.id} className={`rule-card rule-${room.analysis.status.toLowerCase()}`} style={{ borderLeftWidth: '5px' }}>
                <div className="rule-card-content" style={{ width: '100%' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <strong style={{ fontSize: '13px' }}>{room.label} — Placed in {room.analysis.zone}</strong>
                    <span style={{ fontWeight: 600, color: room.analysis.status === 'Poor' ? 'var(--red)' : room.analysis.status === 'Warning' ? 'var(--amber)' : 'var(--emerald)' }}>
                      {room.analysis.status} ({room.analysis.rating}%)
                    </span>
                  </div>
                  <span style={{ color: 'var(--text2)', fontSize: '12px', lineHeight: '1.4' }}>{room.analysis.desc}</span>
                  {room.analysis.remedy && (
                    <div className="rule-card-remedy" style={{ marginTop: '8px' }}>
                      <strong>Remedy Action:</strong> {room.analysis.remedy}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {evaluatedRooms.length === 0 && (
              <p style={{ color: 'var(--text3)', fontStyle: 'italic', fontSize: '12px' }}>No rooms have been placed on the canvas layout yet.</p>
            )}
          </div>
        </div>

        {/* Remedies & Catalog recommendations list */}
        <div className="report-section" style={{ pageBreakBefore: 'always' }}>
          <h3 className="report-section-title">Banjara Bazaar Remedy Procurement</h3>
          <p style={{ fontSize: '12px', color: 'var(--text2)', lineHeight: '1.5' }}>
            To offset the structural violations in this plan without major reconstruction, you can install specialized Vedic energy elements. The following items can be ordered directly from the Banjara Bazaar home portal:
          </p>
          
          <ul style={{ paddingLeft: '20px', fontSize: '12px', color: 'var(--text2)', display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '10px' }}>
            {evaluatedRooms.filter(r => r.analysis.rating < 70).map(r => (
              <li key={r.id}>
                <strong>For {r.label} in {r.analysis.zone}:</strong> Buy and install the{' '}
                {r.type === 'toilet' ? 'Raw Sea Salt Bowl + Brass Partition Pyramid.' : ''}
                {r.type === 'kitchen' ? 'Agni Copper Helix energizer.' : ''}
                {r.type === 'entrance' ? 'Vastu Lead Metal Boundary strip.' : ''}
                {r.type === 'bedroom' ? 'Calming Crystal Quartz Cluster.' : ''}
                {r.type === 'staircase' ? 'Brass Tortoise base energy anchor.' : ''}
                <span style={{ color: 'var(--gold)', fontFamily: 'var(--fm)', marginLeft: '6px' }}>[Remedy Item Available]</span>
              </li>
            ))}
            {evaluatedRooms.filter(r => r.analysis.rating < 70).length === 0 && (
              <li>No major defect remedies required! Your layout meets all high-level Vedic energy standards.</li>
            )}
          </ul>
        </div>

        {/* Footer Disclaimer */}
        <div style={{ marginTop: 'auto', paddingTop: '20px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text3)', fontFamily: 'var(--fm)' }}>
          <span>BanjaraBazaarOS Vastu Griha v1.0</span>
          <span>Verified Vedic Mathematics Engine</span>
        </div>

      </div>
    </div>
  )
}
