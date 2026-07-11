'use strict';
// Vastu symbolic/diagram icons — sub-style 2 (64x64). Zone icons are
// cross-referenced against the live Knowledge Base's own best/avoid
// direction data (knowledge-base/vastu_kb_enriched.json) rather than
// guessed — see the ZONE_DATA comment block for the source entries.
const { PURPLE, AMBER, RED, grid, compassZone, badgeShell } = require('./generate');

// ---------------------------------------------------------------------------
// Zone direction data, pulled directly from knowledge-base/vastu_kb_enriched.json
// (compass-token-only; qualifiers like "CENTER" or "SW_exact_corner" dropped
// since compassZone only plots the 8 standard points):
//   Kitchen Zone   <- KI-01 kitchen_zone           best SE,NW   avoid NE,SW,N
//   Bedroom Zone   <- RZ-01 matrix.master_bedroom  best SW      avoid NE,SE,NW
//   Pooja Zone     <- PJ-01 pooja_zone             best NE,N,E  avoid S,SW
//   Toilet Zone    <- MI-01 toilet_bathroom        best NW,W    avoid NE,SW,N
//   Stair Zone     <- MI-02 staircase              best S,W,SW  avoid NE
//   Septic Zone    <- WE-05 septic_tank            best NW      avoid NE
//   Borewell Zone  <- WE-03 borewell_tubewell      best NE,N,E  avoid SW,S,SE,W
//   Water Tank Zone (generic, uses underground tank guidance — the more
//     commonly asked-about placement) <- WE-01     best N,NE,E  avoid S,SE,SW,NW
//   Underground Tank (vastu-zone) <- WE-01 underground_water_tank  best N,NE,E  avoid S,SE,SW,NW
//   Overhead Tank (vastu-zone)    <- WE-02 overhead_water_tank     best SW,W,S  avoid NE,N,NW
// ---------------------------------------------------------------------------
const ZONE = {
  kitchen: { best: ['SE', 'NW'], avoid: ['NE', 'SW', 'N'] },
  bedroom: { best: ['SW'], avoid: ['NE', 'SE', 'NW'] },
  pooja: { best: ['NE', 'N', 'E'], avoid: ['S', 'SW'] },
  toilet: { best: ['NW', 'W'], avoid: ['NE', 'SW', 'N'] },
  stair: { best: ['S', 'W', 'SW'], avoid: ['NE'] },
  septic: { best: ['NW'], avoid: ['NE'] },
  borewell: { best: ['NE', 'N', 'E'], avoid: ['SW', 'S', 'SE', 'W'] },
  waterTank: { best: ['N', 'NE', 'E'], avoid: ['S', 'SE', 'SW', 'NW'] },
  underground: { best: ['N', 'NE', 'E'], avoid: ['S', 'SE', 'SW', 'NW'] },
  overhead: { best: ['SW', 'W', 'S'], avoid: ['NE', 'N', 'NW'] },
};

const northTick = `<line x1="32" y1="4" x2="32" y2="12"/><text x="32" y="12" font-size="7" fill="${PURPLE}" stroke="none" text-anchor="middle" font-family="sans-serif" font-weight="700">N</text>`;

module.exports = {
  size: 64,
  folder: 'vastu-symbolic',
  items: [
    ['Brahmasthan', () => grid(12, 12, 40, 3, [[1, 1]])],
    ['16 Direction Grid', () => northTick + grid(10, 16, 40, 4)],
    ['Vastu Purusha Mandala', () => grid(10, 10, 44, 4, [[1, 1]]) + `<circle cx="20" cy="20" r="3" fill="#faf5ec"/><path d="M22 22 L40 40 M26 34 L22 38 M34 26 L38 22"/>`],
    ['North Arrow', () => `<circle cx="32" cy="34" r="16" stroke-dasharray="2 3" opacity="0.4"/><path d="M32 10 L38 30 L32 26 L26 30 Z" fill="${PURPLE}" stroke="none"/><text x="32" y="52" font-size="7" fill="${PURPLE}" stroke="none" text-anchor="middle" font-family="sans-serif" font-weight="700">N</text>`],
    ['Compass', () => compassZone(32, 32, 18, [], [])],
    ['Plot Facing', () => `<rect x="16" y="14" width="32" height="32"/>` + northTick + `<path d="M32 46 v10 M32 56 l-4-5 M32 56 l4-5"/>`],
    ['Road Direction', () => `<line x1="8" y1="26" x2="56" y2="26"/><line x1="8" y1="38" x2="56" y2="38"/><path d="M40 32 h10 M50 32 l-4-4 M50 32 l-4 4"/>` + northTick],
    ['Kitchen Zone', () => compassZone(32, 34, 17, ZONE.kitchen.best, ZONE.kitchen.avoid)],
    ['Bedroom Zone', () => compassZone(32, 34, 17, ZONE.bedroom.best, ZONE.bedroom.avoid)],
    ['Pooja Zone', () => compassZone(32, 34, 17, ZONE.pooja.best, ZONE.pooja.avoid)],
    ['Toilet Zone', () => compassZone(32, 34, 17, ZONE.toilet.best, ZONE.toilet.avoid)],
    ['Stair Zone', () => compassZone(32, 34, 17, ZONE.stair.best, ZONE.stair.avoid)],
    ['Septic Zone', () => compassZone(32, 34, 17, ZONE.septic.best, ZONE.septic.avoid)],
    ['Borewell Zone', () => compassZone(32, 34, 17, ZONE.borewell.best, ZONE.borewell.avoid)],
    ['Water Tank Zone', () => compassZone(32, 34, 17, ZONE.waterTank.best, ZONE.waterTank.avoid)],
    ['Underground Tank', () => compassZone(32, 34, 17, ZONE.underground.best, ZONE.underground.avoid) + `<rect x="27" y="30" width="10" height="7" rx="1" fill="#ffffff" stroke="${PURPLE}"/>`],
    ['Overhead Tank', () => compassZone(32, 34, 17, ZONE.overhead.best, ZONE.overhead.avoid) + `<path d="M28 27 L28 33 L36 33 L36 27" fill="#ffffff" stroke="${PURPLE}"/>`],
    ['Energy Flow', () => `<path d="M12 40 q10-20 20-4 t20-4"/><path d="M52 32 l4 1 l-2 4"/><path d="M12 50 q10-16 20-4 t20-4"/>`],
    ['Positive Energy', () => `<path d="M32 54 C20 44 20 30 32 18"/><path d="M32 54 C44 44 44 30 32 18"/><path d="M32 10 v8 M26 12 l3 6 M38 12 l-3 6"/>`],
    ['Negative Energy', () => `<path d="M20 16 L28 26 L20 34 L28 44 L20 54"/><path d="M44 16 L36 26 L44 34 L36 44 L44 54"/>`],
    ['Dosha', () => `<path d="M32 8 L54 32 L32 56 L10 32 Z"/><path d="M32 20 L27 34 L34 34 L29 48"/>`],
    ['Remedy', () => `<path d="M32 12 L48 44 H16 Z"/><path d="M32 4 v4 M26 6 l2 3 M38 6 l-2 3"/>`],
    ['Energy Shield', () => `<path d="M32 8 L52 16 V32 C52 46 42 54 32 58 C22 54 12 46 12 32 V16 Z"/><path d="M24 32 l6 6 l12-14"/>`],
    ['Aura Ring', () => `<circle cx="32" cy="32" r="6"/><circle cx="32" cy="32" r="14" stroke-dasharray="2 3" opacity="0.7"/><circle cx="32" cy="32" r="22" stroke-dasharray="2 4" opacity="0.4"/>`],
    ['Chakra Symbol', () => `<circle cx="32" cy="32" r="8"/>` + [0, 45, 90, 135, 180, 225, 270, 315].map((a) => { const r1 = 10, r2 = 22; const rad = (a * Math.PI) / 180; return `<line x1="${(32 + Math.cos(rad) * r1).toFixed(1)}" y1="${(32 + Math.sin(rad) * r1).toFixed(1)}" x2="${(32 + Math.cos(rad) * r2).toFixed(1)}" y2="${(32 + Math.sin(rad) * r2).toFixed(1)}"/>`; }).join('')],
    ['Earth Element', () => `<rect x="16" y="16" width="32" height="32" rx="2"/><circle cx="32" cy="32" r="4" fill="${PURPLE}" stroke="none"/>`],
    ['Water Element', () => `<path d="M32 12 c9 11 14 18 14 25 a14 14 0 0 1-28 0 c0-7 5-14 14-25 Z"/>`],
    ['Fire Element', () => `<path d="M32 10 C24 22 18 28 18 38 a14 14 0 0 0 28 0 c0-6-3-10-6-13 c0 5-3 8-6 8 c2-6-1-14-2-23 Z"/>`],
    ['Air Element', () => `<path d="M14 26 a18 10 0 0 1 18-10"/><path d="M14 38 a22 12 0 0 0 22 12"/><path d="M50 32 a18 10 0 0 1-18 10"/>`],
    ['Space Element', () => `<circle cx="32" cy="32" r="20" stroke-dasharray="3 4"/>`],
    ['Direction Marker', () => `<path d="M32 8 C20 8 12 17 12 28 c0 16 20 28 20 28 s20-12 20-28 c0-11-8-20-20-20 Z"/><circle cx="32" cy="27" r="6"/>`],
    ['Vastu Score', () => `<path d="M10 40 A22 22 0 0 1 54 40"/>${[0, 45, 90, 135, 180].map((a) => { const rad = ((180 - a) * Math.PI) / 180; const x1 = 32 + Math.cos(rad) * 18, y1 = 40 - Math.sin(rad) * 18; const x2 = 32 + Math.cos(rad) * 22, y2 = 40 - Math.sin(rad) * 22; return `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}"/>`; }).join('')}<line x1="32" y1="40" x2="42" y2="26"/><circle cx="32" cy="40" r="3" fill="${PURPLE}" stroke="none"/>`],
    ['Excellent Badge', () => badgeShell(32, 32, 20) + `<path d="M22 32 l7 7 l14-16"/><path d="M32 6 l1.6 3.4 l3.8 0.5 l-2.7 2.7 l0.7 3.7 L32 14.5 l-3.4 1.8 l0.7-3.7 l-2.7-2.7 l3.8-0.5 Z" fill="${PURPLE}" stroke="none"/>`],
    ['Good Badge', () => badgeShell(32, 32, 20) + `<path d="M22 32 l7 7 l14-16"/>`],
    ['Warning Badge', () => `<path d="M32 10 L56 50 H8 Z" stroke="${AMBER}"/><line x1="32" y1="26" x2="32" y2="38" stroke="${AMBER}"/><circle cx="32" cy="44" r="0.6" fill="${AMBER}" stroke="${AMBER}" stroke-width="2.4"/>`],
    ['Critical Badge', () => badgeShell(32, 32, 20, RED) + `<line x1="24" y1="24" x2="40" y2="40" stroke="${RED}"/><line x1="40" y1="24" x2="24" y2="40" stroke="${RED}"/>`],
    ['AI Suggestion', () => badgeShell(32, 32, 20) + `<path d="M32 18 L35 27 L44 30 L35 33 L32 42 L29 33 L20 30 L29 27 Z" fill="${PURPLE}" stroke="none"/>`],
    ['Compliance Seal', () => `${Array.from({ length: 12 }).map((_, i) => { const a = (i * 30 * Math.PI) / 180; const x = 32 + Math.cos(a) * 20, y = 26 + Math.sin(a) * 20; return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="2.4" fill="${PURPLE}" stroke="none"/>`; }).join('')}<circle cx="32" cy="26" r="14"/><path d="M25 26 l5 5 l9-10"/><path d="M24 38 L18 56 L26 52 L32 58 L38 52 L46 56 L40 38"/>`],
    ['Vastu Divider', () => `<line x1="6" y1="32" x2="26" y2="32"/><line x1="38" y1="32" x2="58" y2="32"/><path d="M32 26 L36 32 L32 38 L28 32 Z"/>`],
  ],
};
