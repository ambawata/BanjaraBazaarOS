// Design System – Colors
// All values reference CSS custom properties from index.css.
// Dark / light mode switching is handled by the CSS cascade.

export const colors = {
  // Backgrounds
  bg:        'var(--bg)',
  bg2:       'var(--bg2)',
  bg3:       'var(--bg3)',
  bg4:       'var(--bg4)',

  // Borders
  border:    'var(--border)',
  border2:   'var(--border2)',

  // Text
  text:      'var(--text)',
  text2:     'var(--text2)',
  text3:     'var(--text3)',

  // Accent (primary brand orange)
  accent:    'var(--accent)',
  accent2:   'var(--accent2)',
  accentDim: 'var(--accent-dim)',

  // Vastu semantic palette
  emerald:      'var(--emerald)',
  emeraldDim:   'var(--emerald-dim)',
  terracotta:   'var(--terracotta)',
  terracottaDim:'var(--terracotta-dim)',
  waterBlue:    'var(--water-blue)',
  waterBlueDim: 'var(--water-blue-dim)',
  gold:         'var(--gold)',
  goldDim:      'var(--gold-dim)',

  // Status aliases
  red:       'var(--red)',
  redDim:    'var(--red-dim)',
  amber:     'var(--amber)',
  amberDim:  'var(--amber-dim)',
  green:     'var(--green)',
  greenDim:  'var(--green-dim)',

  // Static (theme-invariant — see tokens.css)
  white:    '#ffffff',
  card:     'var(--card)',
  shellBg:  'var(--shell-bg)',
}
