import React from 'react';

export function ItemPlacementWidget({ placementDirection, setPlacementDirection, onAddToCart }) {
  const isCorrectDirection = ['North', 'East'].includes(placementDirection);
  
  return (
    <div id="item-placement-widget" style={{ display: 'flex', flexDirection: 'column', gap: '12px', background: '#ffffff', border: '1px solid var(--border)', borderRadius: '24px', padding: '18px', textAlign: 'left', width: '100%' }}>
      <div>
        <h3 style={{ fontSize: '15px', fontWeight: 'bold', color: 'var(--text)' }}>Where do you want to place?</h3>
        <div style={{ fontSize: '12px', marginTop: '4px' }}>
          Item: <span style={{ fontWeight: 600 }}>Wall Mirror</span>
        </div>
        <div style={{ fontSize: '12px', marginTop: '2px' }}>
          Best Directions: <span style={{ color: 'var(--emerald)', fontWeight: 'bold' }}>North, East</span>
        </div>
      </div>

      {/* Direction Chips */}
      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
        {['North', 'East', 'West', 'South'].map(dir => {
          const isActive = placementDirection === dir;
          return (
            <button 
              key={dir}
              onClick={() => setPlacementDirection(dir)}
              style={{
                padding: '6px 14px',
                borderRadius: '16px',
                border: isActive ? '1px solid var(--accent)' : '1px solid var(--border2)',
                background: isActive ? 'var(--accent)' : 'transparent',
                color: isActive ? '#ffffff' : 'var(--text2)',
                fontSize: '11px',
                fontWeight: 'bold',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              {dir}
            </button>
          )
        })}
      </div>

      {/* Split Box */}
      <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', marginTop: '4px' }}>
        
        {/* Left side: Wall vector preview */}
        <div style={{ flex: 1.2, minWidth: '180px', position: 'relative' }}>
          <svg viewBox="0 0 320 180" style={{ width: '100%', height: 'auto', display: 'block', borderRadius: '16px', background: '#faf9f5', border: '1px solid var(--border)' }}>
            <rect width="320" height="180" fill="#faf9f5" />
            {/* Baseboard/Skirting */}
            <rect y="136" width="320" height="44" fill="#f3efe6" />
            <line x1="0" y1="136" x2="320" y2="136" stroke="#eae4d6" strokeWidth="2" />
            
            {/* Door/Window on the left */}
            <rect x="15" y="20" width="40" height="116" fill="none" stroke="#ddd7c9" strokeWidth="1.5" />
            <line x1="35" y1="20" x2="35" y2="136" stroke="#ddd7c9" strokeWidth="1.5" />
            <rect x="22" y="30" width="26" height="25" fill="none" stroke="#ddd7c9" strokeWidth="1" />
            <rect x="22" y="65" width="26" height="25" fill="none" stroke="#ddd7c9" strokeWidth="1" />
            <rect x="22" y="100" width="26" height="25" fill="none" stroke="#ddd7c9" strokeWidth="1" />

            {/* Plant on the right */}
            <path d="M260,136 Q254,100 258,95 Q262,100 260,136" fill="#a5d6a7" />
            <circle cx="260" cy="136" r="10" fill="#e0d7c6" stroke="#d5cbb6" strokeWidth="1.5" />
            {/* Plant leaves */}
            <path d="M260,126 Q250,90 240,90 Q235,95 255,122" fill="#2e7d32" />
            <path d="M260,126 Q270,90 280,90 Q285,95 265,122" fill="#2e7d32" />
            <path d="M260,116 Q250,75 252,70 Q258,75 260,116" fill="#388e3c" />
            <path d="M260,120 Q242,105 248,110" stroke="#1b5e20" strokeWidth="1" />
            
            {/* Sofa Couch */}
            <rect x="75" y="102" width="150" height="34" rx="6" fill="#d7ccc8" stroke="#bcaaa4" strokeWidth="1.5" />
            <rect x="85" y="82" width="130" height="20" rx="6" fill="#d7ccc8" stroke="#bcaaa4" strokeWidth="1.5" />
            <rect x="68" y="94" width="12" height="36" rx="4" fill="#bcaaa4" stroke="#8d6e63" strokeWidth="1.5" />
            <rect x="220" y="94" width="12" height="36" rx="4" fill="#bcaaa4" stroke="#8d6e63" strokeWidth="1.5" />
            <line x1="84" y1="136" x2="80" y2="152" stroke="#8d6e63" strokeWidth="3" strokeLinecap="round" />
            <line x1="216" y1="136" x2="220" y2="152" stroke="#8d6e63" strokeWidth="3" strokeLinecap="round" />

            {/* Mirror placement preview on North / East */}
            {isCorrectDirection ? (
              <>
                <rect x="110" y="24" width="80" height="50" fill="rgba(95, 85, 229, 0.05)" stroke="var(--accent)" strokeWidth="2" strokeDasharray="4 4" rx="6" />
                {/* Hanging string */}
                <line x1="150" y1="24" x2="135" y2="38" stroke="var(--accent)" strokeWidth="1.5" />
                <line x1="150" y1="24" x2="165" y2="38" stroke="var(--accent)" strokeWidth="1.5" />
                {/* Oval mirror */}
                <ellipse cx="150" cy="48" rx="14" ry="18" fill="#e0f2f1" stroke="#8d6e63" strokeWidth="2" />
                <ellipse cx="150" cy="48" rx="12" ry="16" fill="#e0f7fa" />
                <circle cx="150" cy="24" r="2" fill="var(--accent)" />
                
                {/* Target points */}
                <circle cx="110" cy="24" r="3" fill="#fff" stroke="var(--accent)" strokeWidth="1.5" />
                <circle cx="190" cy="24" r="3" fill="#fff" stroke="var(--accent)" strokeWidth="1.5" />
                <circle cx="110" cy="74" r="3" fill="#fff" stroke="var(--accent)" strokeWidth="1.5" />
                <circle cx="190" cy="74" r="3" fill="#fff" stroke="var(--accent)" strokeWidth="1.5" />
              </>
            ) : (
              <>
                <rect x="110" y="24" width="80" height="50" fill="rgba(239, 68, 68, 0.05)" stroke="var(--red)" strokeWidth="2" strokeDasharray="4 4" rx="6" />
                <text x="150" y="52" fill="var(--red)" fontSize="9" fontWeight="bold" textAnchor="middle">Conflict Zone</text>
              </>
            )}
          </svg>
        </div>

        {/* Right side: Product recommend card */}
        <div style={{ flex: '1 1 130px', display: 'flex', flexDirection: 'column', gap: '8px', background: '#faf9f6', padding: '12px', borderRadius: '16px', border: '1px solid var(--border)', justifyContent: 'space-between', boxSizing: 'border-box' }}>
          <span style={{ fontSize: '9px', fontWeight: 'bold', color: 'var(--accent)', textTransform: 'uppercase' }}>Perfect on this wall!</span>
          
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <svg viewBox="0 0 100 100" width="40" height="40">
              <ellipse cx="50" cy="50" rx="20" ry="28" fill="#eae5db" stroke="#8d6e63" strokeWidth="2" />
              <ellipse cx="50" cy="50" rx="16" ry="24" fill="#ffffff" />
            </svg>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <span style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--text)' }}>Wall Mirror (Round)</span>
            <span style={{ fontSize: '9px', color: 'var(--text3)' }}>Size: 24 inch</span>
            <span style={{ fontSize: '12.5px', fontWeight: 'bold', color: 'var(--accent)', marginTop: '2px' }}>â‚¹2,499</span>
          </div>

          <div style={{ fontSize: '10px', color: 'var(--text2)' }}>
            4.6 â­ <span style={{ color: 'var(--text3)' }}>(128)</span>
          </div>

          <button 
            className="btn btn-primary btn-sm"
            style={{ width: '100%', padding: '8px', borderRadius: '10px', fontSize: '10px', justifyContent: 'center' }}
            onClick={onAddToCart}
          >
            Add to Cart
          </button>
        </div>

      </div>
    </div>
  );
}
