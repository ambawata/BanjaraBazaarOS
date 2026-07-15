import React from 'react';

export function VastuScoreGauge() {
  const score = 82;
  const circumference = 2 * Math.PI * 40;
  const offset = circumference * (1 - score / 100);

  return (
    <div style={{ flex: '1 1 min(100%, 160px)', background: 'var(--card)', borderRadius: '24px', border: '1px solid var(--border)', padding: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative', boxSizing: 'border-box' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', alignSelf: 'flex-start', marginBottom: '8px' }}>
        <span style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--text2)' }}>Your Vastu Score</span>
        <i className="ti ti-info-circle" style={{ fontSize: '12px', color: 'var(--text3)' }}></i>
      </div>

      <div style={{ position: 'relative', width: '104px', height: '104px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <svg viewBox="0 0 100 100" style={{ width: '100px', height: '100px' }}>
          {/* Compass tick marks at N / E / S / W, echoing the brand mark */}
          <g stroke="var(--border2)" strokeWidth="1.5">
            <line x1="50" y1="4" x2="50" y2="10" />
            <line x1="96" y1="50" x2="90" y2="50" />
            <line x1="50" y1="96" x2="50" y2="90" />
            <line x1="4" y1="50" x2="10" y2="50" />
          </g>
          {/* Score ring */}
          <circle cx="50" cy="50" r="40" fill="none" stroke="var(--bg3)" strokeWidth="7" />
          <circle
            cx="50" cy="50" r="40" fill="none"
            stroke="var(--emerald)" strokeWidth="7" strokeLinecap="round"
            strokeDasharray={circumference} strokeDashoffset={offset}
            transform="rotate(-90 50 50)"
          />
          {/* North marker dot, tying the ring back to the compass motif */}
          <circle cx="50" cy="10" r="2.5" fill="var(--gold)" />
        </svg>
        <div style={{ position: 'absolute', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <span style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text)' }}>{score}<span style={{ fontSize: '11px', color: 'var(--text3)' }}>/100</span></span>
          <span style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--emerald)' }}>Good</span>
        </div>
      </div>
      <span style={{ fontSize: '9px', color: 'var(--text3)', marginTop: '2px' }}>Keep going!</span>
    </div>
  );
}
