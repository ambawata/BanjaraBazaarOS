import React from 'react';

export function RecentActivity({ setActiveTab }) {
  const activities = [
    { text: 'Dining table placement improved', time: 'Today, 10:30 AM', score: '+18 Score' },
    { text: 'Mirror moved to North wall', time: 'Yesterday, 6:45 PM', score: '+12 Score' },
    { text: 'Water fountain added in NE', time: '29 May, 9:15 PM', score: '+15 Score' }
  ];

  return (
    <div style={{ flex: '1 1 min(100%, 240px)', background: 'var(--card)', borderRadius: '24px', border: '1px solid var(--border)', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', boxSizing: 'border-box' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '13.5px', fontWeight: 'bold', color: 'var(--text)' }}>Recent Activity</span>
        <span style={{ fontSize: '11px', color: 'var(--accent)', fontWeight: 600, cursor: 'pointer' }} onClick={() => setActiveTab('collaborate')}>View All</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {activities.map((act, idx) => (
          <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg3)', padding: '8px 12px', borderRadius: '12px', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
              <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: 'var(--emerald-dim)', color: 'var(--emerald)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <i className="ti ti-arrow-up" style={{ fontSize: '12px' }}></i>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', textAlign: 'left' }}>
                <span style={{ fontSize: '11.5px', fontWeight: 600, color: 'var(--text)' }}>{act.text}</span>
                <span style={{ fontSize: '9px', color: 'var(--text3)' }}>{act.time}</span>
              </div>
            </div>
            <span style={{ fontSize: '10px', color: 'var(--emerald)', fontWeight: 'bold', flexShrink: 0 }}>{act.score}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
