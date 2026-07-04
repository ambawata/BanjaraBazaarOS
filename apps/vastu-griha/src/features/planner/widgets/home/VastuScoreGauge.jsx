import React from 'react';

export function VastuScoreGauge() {
  return (
    <div style={{ flex: '1 1 min(100%, 160px)', background: '#ffffff', borderRadius: '24px', border: '1px solid var(--border)', padding: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative', boxSizing: 'border-box' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', alignSelf: 'flex-start', marginBottom: '8px' }}>
        <span style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--text2)' }}>Your Vastu Score</span>
        <i className="ti ti-info-circle" style={{ fontSize: '12px', color: 'var(--text3)' }}></i>
      </div>

      <div style={{ position: 'relative', width: '110px', height: '70px', display: 'flex', justifyContent: 'center', overflow: 'hidden' }}>
        <svg viewBox="0 0 100 60" style={{ width: '100px', height: '60px' }}>
          <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="#eee" strokeWidth="8" strokeLinecap="round" />
          <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="var(--emerald)" strokeWidth="8" strokeLinecap="round" strokeDasharray="125.6" strokeDashoffset="22.6" />
        </svg>
        <div style={{ position: 'absolute', bottom: '6px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <span style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text)' }}>82<span style={{ fontSize: '11px', color: 'var(--text3)' }}>/100</span></span>
          <span style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--emerald)' }}>Good</span>
          <span style={{ fontSize: '9px', color: 'var(--text3)' }}>Keep going!</span>
        </div>
      </div>
    </div>
  );
}
