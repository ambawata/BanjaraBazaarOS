'use strict';
// Room icons — sub-style 2 (64x64, monoline purple). Every icon shares the
// same room-outline shell (see roomShell in generate.js) with a distinct
// furniture/function glyph inside, so the set reads as one family.
const { PURPLE, roomShell } = require('./generate');

const bed = `<rect x="16" y="34" width="32" height="14" rx="2"/><rect x="16" y="28" width="32" height="8" rx="2"/><ellipse cx="24" cy="31" rx="4" ry="2.4"/><ellipse cx="34" cy="31" rx="4" ry="2.4"/>`;
const sofa = `<rect x="16" y="30" width="32" height="12" rx="3"/><rect x="18" y="22" width="28" height="9" rx="3"/><rect x="13" y="27" width="5" height="13" rx="2"/><rect x="46" y="27" width="5" height="13" rx="2"/>`;
const stove = `<rect x="16" y="30" width="32" height="14" rx="2"/><circle cx="26" cy="30" r="4"/><circle cx="38" cy="30" r="4"/>`;
const diningTbl = `<rect x="18" y="34" width="28" height="4"/><rect x="14" y="24" width="8" height="9" rx="2"/><rect x="42" y="24" width="8" height="9" rx="2"/><rect x="14" y="40" width="8" height="9" rx="2"/><rect x="42" y="40" width="8" height="9" rx="2"/>`;
const shrine = `<path d="M24 34 Q32 20 40 34 V46 H24 Z"/><path d="M30 38 q2-4 4 0 q1 3-2 4 q-3-1-2-4"/>`;
const toiletFixture = `<ellipse cx="32" cy="38" rx="10" ry="6"/><rect x="26" y="26" width="12" height="8" rx="3"/>`;
const powderBasin = `<ellipse cx="32" cy="34" rx="12" ry="6"/><path d="M32 28 v-4"/><rect x="28" y="20" width="8" height="4"/>`;
const washer = `<rect x="18" y="22" width="28" height="24" rx="3"/><circle cx="32" cy="35" r="8"/><circle cx="32" cy="35" r="4"/>`;
const boxes = `<rect x="17" y="30" width="14" height="14"/><rect x="33" y="24" width="14" height="20"/><line x1="17" y1="37" x2="31" y2="37"/><line x1="33" y1="34" x2="47" y2="34"/>`;
const desk = `<rect x="16" y="34" width="32" height="4"/><rect x="18" y="38" width="6" height="8"/><rect x="40" y="38" width="6" height="8"/><rect x="22" y="20" width="20" height="12" rx="1"/>`;
const books = `<line x1="18" y1="44" x2="46" y2="44"/><rect x="20" y="22" width="6" height="22"/><rect x="27" y="26" width="6" height="18"/><rect x="34" y="20" width="6" height="24"/><rect x="41" y="28" width="5" height="16"/>`;
const dumbbell = `<rect x="14" y="30" width="6" height="10" rx="1"/><rect x="44" y="30" width="6" height="10" rx="1"/><line x1="20" y1="35" x2="44" y2="35"/><rect x="24" y="32" width="4" height="6"/><rect x="36" y="32" width="4" height="6"/>`;
const meditation = `<circle cx="32" cy="24" r="5"/><path d="M20 44 q4-12 12-12 q8 0 12 12 Z"/>`;
const railing = `<line x1="14" y1="44" x2="50" y2="44"/><line x1="14" y1="30" x2="50" y2="30"/>${[18,24,30,36,42,48].map(x=>`<line x1="${x}" y1="30" x2="${x}" y2="44"/>`).join('')}`;
const openSky = `<line x1="16" y1="24" x2="48" y2="24" stroke-dasharray="2 3"/><path d="M22 20 a4 4 0 0 1 8 0" /><path d="M34 22 a3 3 0 0 1 6 0"/>`;
const car = `<path d="M14 40 l3-10 a3 3 0 0 1 3-2 H44 a3 3 0 0 1 3 2 l3 10"/><rect x="12" y="40" width="40" height="6" rx="2"/><circle cx="20" cy="46" r="3"/><circle cx="44" cy="46" r="3"/>`;
const parkingP = `<rect x="20" y="18" width="24" height="28" rx="2"/><path d="M27 40 V24 h6 a5 5 0 0 1 0 10 h-6"/>`;
const basementStairs = `<line x1="14" y1="46" x2="50" y2="46" stroke-dasharray="2 3"/>${[0,1,2,3].map(i=>`<path d="M${18+i*8} ${44-i*6} h6 v6"/>`).join('')}`;
const stairsUp = `${[0,1,2,3,4].map(i=>`<path d="M${16+i*7} ${44-i*6} h7 v6"/>`).join('')}`;
const lift = `<rect x="20" y="16" width="24" height="32" rx="2"/><line x1="32" y1="22" x2="32" y2="42"/><path d="M28 26 l4-4 l4 4 M28 38 l4 4 l4-4"/>`;
const lobby = `<circle cx="32" cy="30" r="3"/><path d="M20 44 q12-14 24 0"/>`;
const corridor = `<line x1="18" y1="18" x2="18" y2="46"/><line x1="46" y1="18" x2="46" y2="46"/><line x1="18" y1="32" x2="46" y2="32" stroke-dasharray="2 3"/><path d="M40 26 l6 6 l-6 6"/>`;
const sinkUtility = `<rect x="18" y="30" width="28" height="12" rx="2"/><circle cx="32" cy="24" r="1.5" fill="${PURPLE}" stroke="none"/><path d="M32 20 v4"/>`;
const projector = `<rect x="16" y="18" width="32" height="20" rx="2"/><path d="M22 38 l-4 8 M42 38 l4 8"/><circle cx="32" cy="28" r="5"/>`;
const pantryShelf = `<rect x="18" y="20" width="28" height="24" rx="2"/><line x1="18" y1="28" x2="46" y2="28"/><line x1="18" y1="36" x2="46" y2="36"/>`;
const drySink = `<rect x="16" y="28" width="32" height="6"/><rect x="20" y="34" width="24" height="10" rx="2"/>`;

module.exports = {
  size: 64,
  folder: 'rooms',
  items: [
    ['Living Room', () => roomShell(sofa)],
    ['Drawing Room', () => roomShell(sofa + `<circle cx="32" cy="20" r="1.6" fill="${PURPLE}" stroke="none"/>`)],
    ['Family Lounge', () => roomShell(`<rect x="15" y="30" width="16" height="12" rx="3"/><rect x="33" y="30" width="16" height="12" rx="3"/>`)],
    ['Master Bedroom', () => roomShell(bed + `<circle cx="44" cy="24" r="1.6" fill="${PURPLE}" stroke="none"/>`)],
    ['Parents Bedroom', () => roomShell(bed)],
    ['Kids Bedroom', () => roomShell(`<rect x="16" y="36" width="20" height="10" rx="2"/><ellipse cx="21" cy="34" rx="3" ry="2"/><path d="M40 22 l4 8 h-8 Z"/>`)],
    ['Guest Bedroom', () => roomShell(bed + `<path d="M42 40 h6 v6 h-6 Z"/>`)],
    ['Servant Room', () => roomShell(`<rect x="20" y="34" width="18" height="10" rx="2"/><ellipse cx="25" cy="32" rx="3" ry="2"/>`)],
    ['Kitchen', () => roomShell(stove)],
    ['Dry Kitchen', () => roomShell(drySink)],
    ['Pantry', () => roomShell(pantryShelf)],
    ['Dining Room', () => roomShell(diningTbl)],
    ['Pooja Room', () => roomShell(shrine)],
    ['Bathroom', () => roomShell(toiletFixture + `<line x1="18" y1="46" x2="46" y2="46" stroke-dasharray="1 3"/>`)],
    ['Toilet', () => roomShell(toiletFixture)],
    ['Powder Room', () => roomShell(powderBasin)],
    ['Laundry', () => roomShell(washer)],
    ['Store Room', () => roomShell(boxes)],
    ['Study Room', () => roomShell(desk)],
    ['Library', () => roomShell(books)],
    ['Home Office', () => roomShell(desk + `<rect x="26" y="14" width="12" height="4" rx="1"/>`)],
    ['Gym', () => roomShell(dumbbell)],
    ['Meditation Room', () => roomShell(meditation)],
    ['Balcony', () => roomShell(railing)],
    ['Terrace', () => roomShell(openSky)],
    ['Verandah', () => roomShell(railing + `<line x1="14" y1="20" x2="50" y2="20"/>`)],
    ['Garage', () => roomShell(car)],
    ['Parking', () => roomShell(parkingP)],
    ['Basement', () => roomShell(basementStairs)],
    ['Staircase', () => roomShell(stairsUp)],
    ['Lift', () => roomShell(lift)],
    ['Lobby', () => roomShell(lobby)],
    ['Corridor', () => roomShell(corridor)],
    ['Utility Room', () => roomShell(sinkUtility)],
    ['Home Theater', () => roomShell(projector)],
  ],
};
