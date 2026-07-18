'use strict';
// Navigation icons — sub-style 1 (48x48, monoline, single purple accent).
const { PURPLE } = require('./generate');

module.exports = {
  size: 48,
  folder: 'navigation',
  items: [
    ['Home', () => `<path d="M8 22 L24 9 L40 22"/><path d="M12 19 V38 a2 2 0 0 0 2 2 H34 a2 2 0 0 0 2-2 V19"/><path d="M20 40 V28 H28 V40"/>`],
    ['Dashboard', () => `<rect x="8" y="8" width="14" height="14" rx="2"/><rect x="26" y="8" width="14" height="9" rx="2"/><rect x="26" y="21" width="14" height="19" rx="2"/><rect x="8" y="26" width="14" height="14" rx="2"/>`],
    ['Search', () => `<circle cx="21" cy="21" r="12"/><line x1="30" y1="30" x2="41" y2="41"/>`],
    ['Notifications', () => `<path d="M14 34 V22 a10 10 0 0 1 20 0 V34 L38 38 H10 Z"/><path d="M20 38 a4 4 0 0 0 8 0"/>`],
    ['Messages', () => `<path d="M8 12 h32 a2 2 0 0 1 2 2 V32 a2 2 0 0 1-2 2 H18 L10 40 V34 H8 a2 2 0 0 1-2-2 V14 a2 2 0 0 1 2-2 Z" transform="translate(1,0)"/><line x1="14" y1="20" x2="34" y2="20"/><line x1="14" y1="27" x2="27" y2="27"/>`],
    ['AI Assistant', () => `<path d="M24 6 L27 15 L36 18 L27 21 L24 30 L21 21 L12 18 L21 15 Z"/><path d="M36 30 L37.5 34 L41 35.5 L37.5 37 L36 41 L34.5 37 L31 35.5 L34.5 34 Z"/>`],
    ['Projects', () => `<path d="M8 14 a2 2 0 0 1 2-2 H18 L21 15 H38 a2 2 0 0 1 2 2 V34 a2 2 0 0 1-2 2 H10 a2 2 0 0 1-2-2 Z"/>`],
    ['Shop', () => `<path d="M10 18 L13 8 H35 L38 18"/><path d="M8 18 H40 V38 a2 2 0 0 1-2 2 H10 a2 2 0 0 1-2-2 Z"/><path d="M18 18 v4 a6 6 0 0 0 12 0 v-4"/>`],
    ['Cart', () => `<circle cx="19" cy="39" r="2.4" fill="${PURPLE}" stroke="none"/><circle cx="34" cy="39" r="2.4" fill="${PURPLE}" stroke="none"/><path d="M6 8 h5 l4 24 h20 l5-16 H15"/>`],
    ['Wishlist', () => `<path d="M24 39 C10 30 6 22 6 16 a8 8 0 0 1 15-4 a8 8 0 0 1 3 3 a8 8 0 0 1 3-3 a8 8 0 0 1 15 4 c0 6-4 14-18 23 Z"/>`],
    ['Orders', () => `<rect x="10" y="7" width="28" height="34" rx="2"/><line x1="16" y1="16" x2="32" y2="16"/><line x1="16" y1="24" x2="32" y2="24"/><path d="M16 31 l3 3 l6-6"/>`],
    ['Reports', () => `<rect x="8" y="8" width="32" height="32" rx="2"/><line x1="16" y1="32" x2="16" y2="22"/><line x1="24" y1="32" x2="24" y2="16"/><line x1="32" y1="32" x2="32" y2="26"/>`],
    ['Calendar', () => `<rect x="7" y="10" width="34" height="30" rx="2"/><line x1="7" y1="18" x2="41" y2="18"/><line x1="15" y1="6" x2="15" y2="14"/><line x1="33" y1="6" x2="33" y2="14"/><circle cx="17" cy="26" r="1.6" fill="${PURPLE}" stroke="none"/><circle cx="24" cy="26" r="1.6" fill="${PURPLE}" stroke="none"/><circle cx="31" cy="26" r="1.6" fill="${PURPLE}" stroke="none"/>`],
    ['Settings', () => `<circle cx="24" cy="24" r="6"/><path d="M24 6 v5 M24 37 v5 M42 24 h-5 M11 24 H6 M36.6 11.4 l-3.5 3.5 M14.9 33.1 l-3.5 3.5 M36.6 36.6 l-3.5-3.5 M14.9 14.9 l-3.5-3.5"/>`],
    ['Profile', () => `<circle cx="24" cy="17" r="8"/><path d="M8 40 c0-9 7-15 16-15 s16 6 16 15"/>`],
    ['Help', () => `<circle cx="24" cy="24" r="16"/><path d="M19 19 a5 5 0 0 1 10 0 c0 4-5 4-5 9"/><circle cx="24" cy="34" r="0.5" fill="${PURPLE}" stroke="${PURPLE}" stroke-width="2.5"/>`],
    ['Share', () => `<circle cx="37" cy="10" r="5"/><circle cx="11" cy="24" r="5"/><circle cx="37" cy="38" r="5"/><line x1="15.5" y1="21.5" x2="32.5" y2="13"/><line x1="15.5" y1="26.5" x2="32.5" y2="35"/>`],
    ['Print', () => `<rect x="12" y="17" width="24" height="14" rx="2"/><path d="M14 17 V9 a2 2 0 0 1 2-2 H32 a2 2 0 0 1 2 2 V17"/><path d="M14 31 v8 a2 2 0 0 0 2 2 H32 a2 2 0 0 0 2-2 V31"/><line x1="18" y1="22" x2="26" y2="22"/>`],
    ['Scan', () => `<path d="M8 16 V10 a2 2 0 0 1 2-2 H16"/><path d="M40 16 V10 a2 2 0 0 0-2-2 H32"/><path d="M8 32 V38 a2 2 0 0 0 2 2 H16"/><path d="M40 32 V38 a2 2 0 0 1-2 2 H32"/><line x1="8" y1="24" x2="40" y2="24"/>`],
    ['Logout', () => `<path d="M20 8 H12 a2 2 0 0 0-2 2 V38 a2 2 0 0 0 2 2 H20"/><path d="M28 16 l8 8 l-8 8"/><line x1="36" y1="24" x2="18" y2="24"/>`],
  ],
};
