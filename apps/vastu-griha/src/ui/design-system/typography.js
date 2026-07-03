// Design System – Typography
// Font families reference CSS variables. Size/weight/line-height are
// raw values shared across components for consistency.

export const typography = {
  // Font family stacks (CSS variable references)
  familyDisplay: 'var(--fd)',   // Syne – headings, brand
  familyBody:    'var(--fb)',   // DM Sans – body copy, UI
  familyMono:    'var(--fm)',   // DM Mono – code, labels, captions

  // Font size scale (px values used in inline styles)
  size: {
    xs:   '10px',
    sm:   '12px',
    base: '13px',
    md:   '14px',
    lg:   '16px',
    xl:   '18px',
    '2xl': '20px',
    '3xl': '24px',
    '4xl': '32px',
  },

  // Font weight
  weight: {
    regular:   400,
    medium:    500,
    semibold:  600,
    bold:      700,
    extrabold: 800,
  },

  // Line height
  lineHeight: {
    tight:   1.1,
    snug:    1.3,
    normal:  1.5,
    relaxed: 1.6,
  },

  // Letter spacing
  tracking: {
    tight:  '-0.01em',
    normal: '0',
    wide:   '0.05em',
    wider:  '0.08em',
    widest: '0.12em',
  },
}
