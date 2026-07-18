import React from 'react';

export function Hero() {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', background: 'transparent', marginBottom: '-16px' }}>
      <div style={{ flex: 1.1, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', textAlign: 'left' }}>
        <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text2)', opacity: 0.9 }}>👋 Namaste, Amit</span>
        <h2 style={{ fontFamily: 'var(--fd)', fontSize: '24px', fontWeight: 800, color: 'var(--text)', marginTop: '6px', lineHeight: 1.2, letterSpacing: '-0.3px' }}>
          Let's make your home<br />more <span style={{ color: 'var(--accent)' }}>Vastu</span> friendly
        </h2>
        <p style={{ fontSize: '12px', color: 'var(--text2)', marginTop: '8px', lineHeight: 1.4 }}>
          Get personalized guidance and shop the right products for your home.
        </p>
      </div>
      <div style={{ flex: 0.9, display: 'flex', justifyContent: 'center' }}>
        {/* Cozy Armchair Illustration (Enlarged) */}
        <svg viewBox="0 0 200 200" style={{ width: '100%', height: 'auto', maxWidth: '220px' }}>
          <defs>
            <radialGradient id="hero-grad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#fffcf5" />
              <stop offset="70%" stopColor="#fdf6e2" />
              <stop offset="100%" stopColor="#f7eecf" stopOpacity="0" />
            </radialGradient>
          </defs>
          <circle cx="110" cy="100" r="80" fill="url(#hero-grad)" />
          
          {/* Minimalist Floor Lamp */}
          <path d="M150,160 L150,70" stroke="#d7ccc8" strokeWidth="2" strokeLinecap="round" />
          <path d="M140,160 L160,160" stroke="#d7ccc8" strokeWidth="3" strokeLinecap="round" />
          <path d="M138,70 L162,70 L154,54 L146,54 Z" fill="#efebe9" stroke="#d7ccc8" strokeWidth="1" />
          <path d="M150,70 L150,85" stroke="#ffe082" strokeWidth="1.5" />
          
          {/* Table with Plant */}
          <ellipse cx="60" cy="140" rx="20" ry="4" fill="#d7ccc8" />
          <line x1="50" y1="140" x2="45" y2="165" stroke="#8d6e63" strokeWidth="2" />
          <line x1="70" y1="140" x2="75" y2="165" stroke="#8d6e63" strokeWidth="2" />
          <line x1="60" y1="140" x2="60" y2="165" stroke="#8d6e63" strokeWidth="2" />
          {/* Plant Pot */}
          <rect x="54" y="124" width="12" height="12" fill="#ffab91" rx="2" />
          {/* Green Plant Leaves (Monstera style) */}
          <path d="M60,124 Q45,100 38,105 Q35,115 54,124" fill="#4caf50" />
          <path d="M60,124 Q75,100 82,105 Q85,115 66,124" fill="#4caf50" />
          <path d="M60,124 Q60,95 55,95 Q50,105 60,124" fill="#388e3c" />
          <path d="M60,124 Q68,105 72,112" stroke="#2e7d32" strokeWidth="2" />
          
          {/* Armchair */}
          {/* Backrest */}
          <rect x="90" y="90" width="50" height="45" rx="10" fill="#f5f5f0" stroke="#e0e0d1" strokeWidth="1.5" />
          {/* Seat cushion */}
          <rect x="84" y="125" width="62" height="20" rx="6" fill="#f5f5f0" stroke="#e0e0d1" strokeWidth="1.5" />
          {/* Left Armrest */}
          <rect x="78" y="110" width="12" height="32" rx="4" fill="#e0e0d1" stroke="#d5d5c3" strokeWidth="1.5" />
          {/* Right Armrest */}
          <rect x="140" y="110" width="12" height="32" rx="4" fill="#e0e0d1" stroke="#d5d5c3" strokeWidth="1.5" />
          {/* Chair legs */}
          <line x1="94" y1="145" x2="90" y2="165" stroke="#8d6e63" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="136" y1="145" x2="140" y2="165" stroke="#8d6e63" strokeWidth="2.5" strokeLinecap="round" />
          
          {/* Pillow */}
          <path d="M102,125 Q115,115 128,125 Q128,132 115,130 Q102,132 102,125 Z" fill="#ffe082" stroke="#ffd54f" strokeWidth="1" />
        </svg>
      </div>
    </div>
  );
}
