'use strict';
// Structure — site/abstract scale only (6 items). Sub-style 2 (64x64).
// Physical/architectural elements (door, window, wall, column...) belong to
// Track B's painterly set, not here — these are plot/site-level diagrams.
const { PURPLE } = require('./generate');

module.exports = {
  size: 64,
  folder: 'structure-site',
  items: [
    ['Driveway', () => `<path d="M20 54 L26 10 M44 54 L38 10" />${[14,22,30,38].map(y=>`<line x1="27" y1="${y}" x2="32" y2="${y}" stroke-dasharray="3 3"/>`).join('')}<path d="M20 10 h18" />`],
    ['Pathway', () => `<path d="M12 52 Q32 32 52 12" stroke-dasharray="0"/>${[[14,50],[24,38],[34,26],[44,15]].map(([x,y])=>`<ellipse cx="${x}" cy="${y}" rx="4" ry="2.6" transform="rotate(-40 ${x} ${y})"/>`).join('')}`],
    ['Boundary Line', () => `<rect x="10" y="10" width="44" height="44" stroke-dasharray="4 3"/><circle cx="10" cy="10" r="2" fill="${PURPLE}" stroke="none"/><circle cx="54" cy="10" r="2" fill="${PURPLE}" stroke="none"/><circle cx="10" cy="54" r="2" fill="${PURPLE}" stroke="none"/><circle cx="54" cy="54" r="2" fill="${PURPLE}" stroke="none"/>`],
    ['Plot', () => `<rect x="12" y="14" width="40" height="36"/><line x1="12" y1="14" x2="6" y2="8"/><line x1="52" y1="14" x2="58" y2="8"/><line x1="12" y1="50" x2="6" y2="56"/><line x1="52" y1="50" x2="58" y2="56"/>`],
    ['Road', () => `<line x1="6" y1="24" x2="58" y2="24"/><line x1="6" y1="40" x2="58" y2="40"/>${[10,20,30,40,50].map(x=>`<line x1="${x}" y1="32" x2="${x+6}" y2="32" stroke-dasharray="0"/>`).join('')}`],
    ['Parking Slot', () => `<rect x="10" y="10" width="44" height="44" rx="2" stroke-dasharray="3 3"/><path d="M24 42 V22 h8 a7 7 0 0 1 0 14 h-8"/>`],
  ],
};
