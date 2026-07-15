import React from 'react';

export function ActionCards({ setActiveTab, setScreenState }) {
  const handleItemPlacementClick = () => {
    const el = document.getElementById('item-placement-widget');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', textAlign: 'left', width: '100%' }}>
      <span style={{ fontSize: '13.5px', fontWeight: 'bold', color: 'var(--text)' }}>What would you like to do today?</span>
      
      <div className="dashboard-action-grid">
        
        {/* Card 1: Already have floor plan */}
        <div
          onClick={() => { setScreenState('workspace'); setActiveTab('upload'); }}
          style={{ width: '100%', background: 'var(--tile-purple-bg)', border: '1px solid var(--tile-purple-border)', borderRadius: '24px', padding: '16px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '210px', cursor: 'pointer', transition: 'transform 0.15s ease' }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'none'}
        >
          <svg viewBox="0 0 100 100" width="50" height="50" style={{ margin: '0 auto 8px 0' }}>
            <rect x="10" y="10" width="80" height="80" rx="10" fill="var(--card)" stroke="var(--tile-purple-icon-border)" strokeWidth="1.5" />
            <rect x="22" y="22" width="25" height="25" fill="none" stroke="var(--status-tile-utility)" strokeWidth="1.5" strokeDasharray="2 2" />
            <rect x="52" y="22" width="26" height="35" fill="none" stroke="var(--status-tile-utility)" strokeWidth="1.5" />
            <rect x="22" y="52" width="25" height="26" fill="none" stroke="var(--status-tile-utility)" strokeWidth="1.5" />
            <line x1="34" y1="22" x2="34" y2="47" stroke="var(--status-tile-utility)" strokeWidth="1" />
            <line x1="22" y1="34" x2="47" y2="34" stroke="var(--status-tile-utility)" strokeWidth="1" />
          </svg>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
            <span style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--tile-purple-heading)', lineHeight: 1.2 }}>I already have a Floor Plan</span>
            <span style={{ fontSize: '10px', color: 'var(--tile-purple-text)' }}>Upload your plan and get Vastu analysis</span>
          </div>
          <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'var(--status-tile-utility)', color: 'var(--card)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '10px' }}>
            <i className="ti ti-arrow-right" style={{ fontSize: '12px' }}></i>
          </div>
        </div>

        {/* Card 2: Don't have floor plan */}
        <div 
          onClick={() => setScreenState('step_prop')}
          style={{ width: '100%', background: 'var(--tile-green-bg)', border: '1px solid var(--tile-green-border)', borderRadius: '24px', padding: '16px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '210px', cursor: 'pointer', transition: 'transform 0.15s ease' }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'none'}
        >
          <svg viewBox="0 0 100 100" width="50" height="50" style={{ margin: '0 auto 8px 0' }}>
            <rect x="10" y="10" width="80" height="80" rx="10" fill="var(--card)" stroke="var(--tile-green-icon-border)" strokeWidth="1.5" />
            <polygon points="25,25 75,25 65,75 35,75" fill="none" stroke="var(--status-green)" strokeWidth="2" />
            <circle cx="25" cy="25" r="3" fill="var(--status-green)" />
            <circle cx="75" cy="25" r="3" fill="var(--status-green)" />
            <circle cx="65" cy="75" r="3" fill="var(--status-green)" />
            <circle cx="35" cy="75" r="3" fill="var(--status-green)" />
          </svg>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
            <span style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--tile-green-heading)', lineHeight: 1.2 }}>I don't have a Floor Plan</span>
            <span style={{ fontSize: '10px', color: 'var(--tile-green-text)' }}>Draw your plot and create the plan</span>
          </div>
          <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'var(--status-green)', color: 'var(--card)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '10px' }}>
            <i className="ti ti-arrow-right" style={{ fontSize: '12px' }}></i>
          </div>
        </div>

        {/* Card 3: Place Item */}
        <div 
          onClick={handleItemPlacementClick}
          style={{ width: '100%', background: 'var(--tile-amber-bg)', border: '1px solid var(--tile-amber-border)', borderRadius: '24px', padding: '16px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '210px', cursor: 'pointer', transition: 'transform 0.15s ease' }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'none'}
        >
          <svg viewBox="0 0 100 100" width="50" height="50" style={{ margin: '0 auto 8px 0' }}>
            <rect x="10" y="10" width="80" height="80" rx="10" fill="var(--card)" stroke="var(--tile-amber-border)" strokeWidth="1.5" />
            <ellipse cx="50" cy="45" rx="16" ry="24" fill="none" stroke="var(--tile-amber)" strokeWidth="2.5" />
            <ellipse cx="50" cy="45" rx="13" ry="21" fill="var(--card)" stroke="var(--tile-amber-accent)" strokeWidth="1" />
            <line x1="38" y1="80" x2="62" y2="80" stroke="var(--tile-amber)" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="41" y1="80" x2="46" y2="68" stroke="var(--tile-amber)" strokeWidth="2" />
            <line x1="59" y1="80" x2="54" y2="68" stroke="var(--tile-amber)" strokeWidth="2" />
          </svg>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
            <span style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--tile-amber-heading)', lineHeight: 1.2 }}>Place My New Item</span>
            <span style={{ fontSize: '10px', color: 'var(--tile-amber)' }}>Find the perfect Vastu placement for any item</span>
          </div>
          <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'var(--tile-amber)', color: 'var(--card)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '10px' }}>
            <i className="ti ti-arrow-right" style={{ fontSize: '12px' }}></i>
          </div>
        </div>

        {/* Card 4: Quick Vastu check */}
        <div
          onClick={() => { setScreenState('workspace'); setActiveTab('analysis'); }}
          style={{ width: '100%', background: 'var(--tile-blue-bg)', border: '1px solid var(--tile-blue-border)', borderRadius: '24px', padding: '16px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '210px', cursor: 'pointer', transition: 'transform 0.15s ease' }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'none'}
        >
          <svg viewBox="0 0 100 100" width="50" height="50" style={{ margin: '0 auto 8px 0' }}>
            <rect x="10" y="10" width="80" height="80" rx="10" fill="var(--card)" stroke="var(--tile-blue-border)" strokeWidth="1.5" />
            <path d="M50,22 L75,30 L75,55 Q75,72 50,80 Q25,72 25,55 L25,30 Z" fill="none" stroke="var(--tile-blue)" strokeWidth="2" />
            <path d="M42,51 L48,57 L58,44" fill="none" stroke="var(--tile-blue)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
            <span style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--tile-blue-heading)', lineHeight: 1.2 }}>Quick Vastu Check</span>
            <span style={{ fontSize: '10px', color: 'var(--tile-blue)' }}>Get instant score and top remedies</span>
          </div>
          <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'var(--tile-blue)', color: 'var(--card)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '10px' }}>
            <i className="ti ti-arrow-right" style={{ fontSize: '12px' }}></i>
          </div>
        </div>

      </div>
    </div>
  );
}
