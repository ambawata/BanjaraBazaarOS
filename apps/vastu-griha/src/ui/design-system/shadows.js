// Design System – Shadows
// Box-shadow tokens. Base value references the CSS custom property --shadow.

export const shadows = {
  none:   'none',
  base:   'var(--shadow)',                              // CSS variable (theme-aware)
  sm:     '0 2px 8px rgba(0, 0, 0, 0.15)',
  md:     '0 4px 16px rgba(0, 0, 0, 0.2)',
  lg:     '0 8px 32px rgba(0, 0, 0, 0.25)',
  accent: '0 4px 16px rgba(124, 111, 247, 0.35)',       // accent glow
  accentSm: '0 2px 8px rgba(124, 111, 247, 0.25)',
}
