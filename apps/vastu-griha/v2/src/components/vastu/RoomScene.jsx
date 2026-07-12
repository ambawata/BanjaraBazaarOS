import React from 'react'
import { isExteriorScene } from '../../lib/vastuEntryHelpers'

// Illustrated scene for a single KB entry. Two compositions:
//  - "interior": wall + floor + an object-specific silhouette + a dashed
//    highlight box over the object (door, mirror, wardrobe, bed, stove...).
//  - "exterior/conceptual": sky + ground + house silhouette, or a plain
//    diagram (compass, grid, plot outline) for whole-house or non-physical
//    entries (house-facing direction, vastu purusha mandala, foundation
//    rules with no single object) — these never reuse the room frame,
//    since a "correct direction for the WHOLE HOUSE" is a different kind
//    of claim than "correct wall for THIS mirror."
//
// state: 'best' (orange) | 'avoid' (red) | 'neutral' (muted grey, solid) |
//        'lowConfidence' (muted grey, dashed, lower opacity)

const HIGHLIGHT_COLORS = {
  best: '#E08A3C',
  avoid: '#C24545',
  neutral: '#B5AA98',
  lowConfidence: '#B5AA98',
}

// The dashed highlight box needs to sit where the object actually is —
// a fixed box was fine when every scene was the same sofa, but a stove
// sits low on a counter while a fridge is tall, so each object gets its
// own box rect rather than the illustration floating disconnected from it.
const HIGHLIGHT_BOX = {
  door: { x: 118, y: 18, w: 76, h: 58 },
  mirror: { x: 128, y: 18, w: 44, h: 56 },
  wardrobe: { x: 104, y: 10, w: 84, h: 60 },
  locker: { x: 126, y: 40, w: 58, h: 64 },
  studyTable: { x: 94, y: 60, w: 130, h: 56 },
  tv: { x: 106, y: 24, w: 108, h: 70 },
  sofa: { x: 60, y: 76, w: 170, h: 66 },
  bed: { x: 58, y: 58, w: 204, h: 88 },
  painting: { x: 112, y: 24, w: 76, h: 58 },
  stove: { x: 94, y: 76, w: 132, h: 64 },
  sink: { x: 44, y: 88, w: 232, h: 54 },
  fridge: { x: 114, y: 12, w: 72, h: 130 },
  kitchenGeneral: { x: 44, y: 54, w: 232, h: 88 },
  toilet: { x: 118, y: 92, w: 64, h: 44 },
  staircase: { x: 64, y: 16, w: 190, h: 124 },
  tankUnderground: { x: 94, y: 64, w: 132, h: 74 },
  septicTank: { x: 104, y: 70, w: 112, h: 64 },
  well: { x: 100, y: 36, w: 100, h: 90 },
  fishTank: { x: 84, y: 40, w: 152, h: 96 },
  tulsi: { x: 114, y: 44, w: 72, h: 100 },
  moneyPlant: { x: 122, y: 18, w: 56, h: 116 },
  plantGeneric: { x: 120, y: 82, w: 60, h: 60 },
  diningTable: { x: 84, y: 76, w: 152, h: 52 },
  parking: { x: 99, y: 86, w: 122, h: 50 },
}
const DEFAULT_BOX = { x: 108, y: 22, w: 84, h: 52 }

function InteriorObject({ objectType }) {
  switch (objectType) {
    case 'door':
      return (
        <>
          <rect x="118" y="18" width="76" height="118" rx="3" fill="#e6d3b8" stroke="#c9a876" strokeWidth="2" />
          <rect x="126" y="26" width="60" height="102" rx="2" fill="#f3e7d2" stroke="#c9a876" strokeWidth="1.5" />
          <circle cx="180" cy="78" r="2.5" fill="#c9a876" />
          <path d="M126,26 A60,102 0 0 1 186,86" fill="none" stroke="#c9a876" strokeWidth="1.2" strokeDasharray="3 4" opacity="0.6" />
          <rect x="90" y="136" width="140" height="8" rx="3" fill="#d8cba6" opacity="0.6" />
        </>
      )
    case 'mirror':
      return (
        <>
          <line x1="150" y1="24" x2="135" y2="38" stroke="#8d6e63" strokeWidth="1.5" />
          <line x1="150" y1="24" x2="165" y2="38" stroke="#8d6e63" strokeWidth="1.5" />
          <ellipse cx="150" cy="52" rx="16" ry="22" fill="#e0f2f1" stroke="#8d6e63" strokeWidth="2" />
          <ellipse cx="150" cy="52" rx="13" ry="19" fill="#e0f7fa" />
          <circle cx="150" cy="24" r="2" fill="#8d6e63" />
        </>
      )
    case 'wardrobe':
      return (
        <>
          <rect x="110" y="14" width="72" height="122" rx="2" fill="#dcc7a3" stroke="#a9835c" strokeWidth="2" />
          <line x1="146" y1="14" x2="146" y2="136" stroke="#a9835c" strokeWidth="1.5" />
          <circle cx="140" cy="76" r="2" fill="#8a6a44" />
          <circle cx="152" cy="76" r="2" fill="#8a6a44" />
          <rect x="106" y="132" width="80" height="6" rx="2" fill="#a9835c" opacity="0.5" />
        </>
      )
    case 'locker':
      return (
        <>
          <rect x="132" y="46" width="46" height="52" rx="3" fill="#c7ccd1" stroke="#8b929b" strokeWidth="2" />
          <circle cx="155" cy="64" r="7" fill="#eef0f2" stroke="#8b929b" strokeWidth="1.5" />
          <circle cx="155" cy="64" r="1.6" fill="#8b929b" />
          <rect x="140" y="80" width="14" height="4" rx="2" fill="#8b929b" />
        </>
      )
    case 'studyTable':
      return (
        <>
          <rect x="100" y="66" width="90" height="8" rx="2" fill="#c9a876" stroke="#a9835c" strokeWidth="1.5" />
          <rect x="104" y="74" width="6" height="40" fill="#a9835c" />
          <rect x="180" y="74" width="6" height="40" fill="#a9835c" />
          <rect x="198" y="86" width="20" height="24" rx="3" fill="#d7ccc8" stroke="#bcaaa4" strokeWidth="1.5" />
          <rect x="200" y="72" width="16" height="16" rx="2" fill="#bcaaa4" />
        </>
      )
    case 'tv':
      return (
        <>
          <rect x="112" y="30" width="96" height="58" rx="4" fill="#3a342a" stroke="#241408" strokeWidth="2" />
          <rect x="118" y="36" width="84" height="46" rx="2" fill="#5b7c8f" opacity="0.7" />
          <rect x="150" y="88" width="20" height="8" fill="#3a342a" />
          <rect x="130" y="96" width="60" height="6" rx="3" fill="#d7ccc8" />
        </>
      )
    case 'sofa':
      return (
        <>
          <path d="M258,136 Q252,100 256,95 Q260,100 258,136" fill="#a5d6a7" />
          <circle cx="258" cy="136" r="10" fill="#e0d7c6" stroke="#d5cbb6" strokeWidth="1.5" />
          <path d="M258,126 Q248,90 238,90 Q233,95 253,122" fill="#2e7d32" />
          <path d="M258,126 Q268,90 278,90 Q283,95 263,122" fill="#2e7d32" />
          <rect x="65" y="102" width="150" height="34" rx="6" fill="#d7ccc8" stroke="#bcaaa4" strokeWidth="1.5" />
          <rect x="75" y="82" width="130" height="20" rx="6" fill="#d7ccc8" stroke="#bcaaa4" strokeWidth="1.5" />
          <rect x="58" y="94" width="12" height="36" rx="4" fill="#bcaaa4" stroke="#8d6e63" strokeWidth="1.5" />
          <rect x="210" y="94" width="12" height="36" rx="4" fill="#bcaaa4" stroke="#8d6e63" strokeWidth="1.5" />
        </>
      )
    case 'bed':
      // Centered on the 320-wide canvas (was left-anchored at x=24-188,
      // leaving ~40% of the frame empty on the right — the "tiny cut-off
      // bed in a mostly-empty scene" bug) and made taller so it reads at
      // the same visual weight as the other centered illustrations.
      return (
        <>
          <rect x="70" y="94" width="180" height="46" rx="6" fill="#e6d9c8" stroke="#c9b596" strokeWidth="1.5" />
          <rect x="70" y="66" width="180" height="32" rx="6" fill="#f3e9db" stroke="#c9b596" strokeWidth="1.5" />
          <rect x="64" y="62" width="10" height="80" rx="3" fill="#c9b596" />
          <ellipse cx="102" cy="82" rx="17" ry="10" fill="#ffffff" stroke="#e2d8c4" strokeWidth="1" />
          <ellipse cx="136" cy="82" rx="17" ry="10" fill="#ffffff" stroke="#e2d8c4" strokeWidth="1" />
        </>
      )
    case 'painting':
      return (
        <>
          <rect x="118" y="30" width="64" height="46" rx="2" fill="#f3ecdd" stroke="#a9835c" strokeWidth="2.5" />
          <path d="M126,68 L146,44 L160,58 L174,38" fill="none" stroke="#E08A3C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="150" cy="26" r="1.6" fill="#8d6e63" />
        </>
      )
    case 'stove':
      // Counter recentered (was x=20-240, mid=130 — a 25% empty gap on the
      // right, the same left-anchoring pattern that caused the bed bug).
      return (
        <>
          <rect x="50" y="94" width="220" height="42" rx="4" fill="#e9dfcd" stroke="#cbbb99" strokeWidth="1.5" />
          <rect x="100" y="82" width="120" height="22" rx="4" fill="#5c5347" />
          <circle cx="130" cy="93" r="8" fill="#3a342a" />
          <circle cx="190" cy="93" r="8" fill="#3a342a" />
          <circle cx="130" cy="93" r="3" fill="#E08A3C" />
          <circle cx="190" cy="93" r="3" fill="#E08A3C" />
        </>
      )
    case 'sink':
      // Same recentering as stove/kitchenGeneral — see note above.
      return (
        <>
          <rect x="50" y="94" width="220" height="42" rx="4" fill="#e9dfcd" stroke="#cbbb99" strokeWidth="1.5" />
          <ellipse cx="160" cy="98" rx="34" ry="12" fill="#dfe9e6" stroke="#a9c3b5" strokeWidth="1.5" />
          <path d="M160,78 v10 M152,72 h16" stroke="#8b929b" strokeWidth="2.5" strokeLinecap="round" />
        </>
      )
    case 'fridge':
      return (
        <>
          <rect x="120" y="18" width="60" height="118" rx="5" fill="#eef1f0" stroke="#b9c2be" strokeWidth="2" />
          <line x1="120" y1="60" x2="180" y2="60" stroke="#b9c2be" strokeWidth="1.5" />
          <rect x="172" y="30" width="4" height="18" rx="2" fill="#8b929b" />
          <rect x="172" y="70" width="4" height="18" rx="2" fill="#8b929b" />
        </>
      )
    case 'kitchenGeneral':
      // Same recentering as stove/sink — counter now spans x=50-270
      // (mid=160) instead of x=20-240 (mid=130).
      return (
        <>
          <rect x="50" y="94" width="220" height="42" rx="4" fill="#e9dfcd" stroke="#cbbb99" strokeWidth="1.5" />
          <rect x="60" y="98" width="34" height="20" rx="3" fill="#d8cbb0" />
          <circle cx="150" cy="106" r="9" fill="#8d6e63" opacity="0.7" />
          <circle cx="180" cy="106" r="9" fill="#8d6e63" opacity="0.7" />
          <rect x="230" y="60" width="40" height="34" rx="4" fill="#cfe0d6" stroke="#a9c3b5" strokeWidth="1.5" />
        </>
      )
    case 'toilet':
      return (
        <>
          {Array.from({ length: 6 }).map((_, i) => (
            <line key={i} x1={i * 55} y1="136" x2={i * 55} y2="180" stroke="#dbe6e3" strokeWidth="1" />
          ))}
          <rect x="0" y="136" width="320" height="44" fill="#eef4f2" />
          <ellipse cx="150" cy="112" rx="26" ry="15" fill="#eef4f2" stroke="#b9cdc7" strokeWidth="1.5" />
          <rect x="136" y="100" width="28" height="14" rx="6" fill="#eef4f2" stroke="#b9cdc7" strokeWidth="1.5" />
        </>
      )
    case 'staircase':
      return (
        <>
          {[0, 1, 2, 3, 4].map((i) => (
            <rect key={i} x={70 + i * 34} y={122 - i * 18} width="34" height={18 + i * 18} fill={i % 2 === 0 ? '#e6d9c8' : '#dcc7a3'} stroke="#c9b596" strokeWidth="1" />
          ))}
        </>
      )
    case 'pooja':
      return (
        <>
          <path d="M120,30 Q150,4 180,30 L180,60 L120,60 Z" fill="#f3e2c8" stroke="#c9a05a" strokeWidth="2" />
          <rect x="128" y="60" width="44" height="70" fill="#f3e2c8" stroke="#c9a05a" strokeWidth="2" />
          <path d="M148,96 q2,-12 4,0 q2,-14 4,0 q1,7 -4,10 q-5,-3 -4,-10 z" fill="#E08A3C" opacity="0.85" />
        </>
      )
    case 'tankUnderground':
      return (
        <>
          <line x1="0" y1="96" x2="320" y2="96" stroke="#c9b596" strokeWidth="2" strokeDasharray="4 3" />
          <rect x="100" y="100" width="120" height="34" rx="4" fill="#AEC8E0" stroke="#7fa6c9" strokeWidth="2" opacity="0.8" />
          <rect x="150" y="70" width="10" height="30" fill="#8b929b" />
          <text x="30" y="90" fontSize="9" fill="#a99a80" fontWeight="700">GROUND</text>
        </>
      )
    case 'tankOverhead':
      return (
        <>
          <path d="M110,140 L110,90 L160,64 L210,90 L210,140 Z" fill="#efe4cd" stroke="#c9b596" strokeWidth="2" />
          <rect x="135" y="24" width="50" height="36" rx="4" fill="#AEC8E0" stroke="#7fa6c9" strokeWidth="2" />
          <rect x="140" y="60" width="4" height="10" fill="#8b929b" />
          <rect x="176" y="60" width="4" height="10" fill="#8b929b" />
        </>
      )
    case 'septicTank':
      return (
        <>
          <line x1="0" y1="96" x2="320" y2="96" stroke="#c9b596" strokeWidth="2" strokeDasharray="4 3" />
          <rect x="110" y="100" width="100" height="30" rx="4" fill="#c9b596" stroke="#a9835c" strokeWidth="2" opacity="0.75" />
          <rect x="150" y="76" width="8" height="24" fill="#8b929b" />
          <text x="30" y="90" fontSize="9" fill="#a99a80" fontWeight="700">GROUND</text>
        </>
      )
    case 'well':
      return (
        <>
          <path d="M120,90 L110,44 M180,90 L190,44 M108,44 L192,44" fill="none" stroke="#a9835c" strokeWidth="3" strokeLinecap="round" />
          <circle cx="150" cy="44" r="6" fill="#c9b596" />
          <ellipse cx="150" cy="98" rx="42" ry="14" fill="#AEC8E0" stroke="#7fa6c9" strokeWidth="2" />
          <rect x="112" y="98" width="76" height="24" fill="#d8cba6" opacity="0.6" />
        </>
      )
    case 'fishTank':
      return (
        <>
          <rect x="90" y="46" width="140" height="76" rx="4" fill="#cfe6ea" stroke="#7fa6c9" strokeWidth="2" opacity="0.55" />
          <path d="M90,70 Q125,62 160,70 T230,70" fill="none" stroke="#7fa6c9" strokeWidth="1.5" opacity="0.6" />
          <path d="M140,96 q10,-6 18,0 q-4,6 -18,0 M158,96 l8,-5 v10 z" fill="#E08A3C" />
          <rect x="86" y="122" width="148" height="8" rx="2" fill="#a9835c" />
        </>
      )
    case 'tulsi':
      return (
        <>
          <rect x="130" y="96" width="40" height="14" fill="#a9835c" />
          <path d="M130,110 L120,136 L180,136 L170,110 Z" fill="#d8cba6" stroke="#c2ac89" strokeWidth="1.5" />
          <path d="M150,96 Q146,70 150,50 Q154,70 150,96" fill="#2e7d32" />
          <path d="M150,80 Q136,66 130,60 Q136,74 150,86" fill="#388e3c" />
          <path d="M150,80 Q164,66 170,60 Q164,74 150,86" fill="#388e3c" />
        </>
      )
    case 'moneyPlant':
      return (
        <>
          <ellipse cx="150" cy="128" rx="18" ry="8" fill="#d8cba6" stroke="#c2ac89" strokeWidth="1.5" />
          <path d="M150,120 Q140,90 150,30" fill="none" stroke="#2e7d32" strokeWidth="2" strokeLinecap="round" />
          <ellipse cx="146" cy="94" rx="9" ry="6" fill="#66bb6a" transform="rotate(-20 146 94)" />
          <ellipse cx="154" cy="66" rx="9" ry="6" fill="#66bb6a" transform="rotate(20 154 66)" />
          <ellipse cx="146" cy="42" rx="8" ry="5" fill="#66bb6a" transform="rotate(-15 146 42)" />
        </>
      )
    case 'plantGeneric':
      return (
        <>
          <path d="M150,136 Q144,100 148,95 Q152,100 150,136" fill="#a5d6a7" />
          <circle cx="150" cy="136" r="12" fill="#e0d7c6" stroke="#d5cbb6" strokeWidth="1.5" />
          <path d="M150,124 Q138,88 128,88 Q123,93 145,120" fill="#2e7d32" />
          <path d="M150,124 Q162,88 172,88 Q177,93 155,120" fill="#2e7d32" />
        </>
      )
    case 'diningTable':
      return (
        <>
          <rect x="90" y="82" width="140" height="12" rx="3" fill="#c9a876" stroke="#a9835c" strokeWidth="1.5" />
          <rect x="98" y="94" width="6" height="30" fill="#a9835c" />
          <rect x="216" y="94" width="6" height="30" fill="#a9835c" />
          {[70, 110, 150, 190].map((x) => (
            <rect key={x} x={x} y="100" width="16" height="18" rx="3" fill="#d7ccc8" stroke="#bcaaa4" strokeWidth="1.2" />
          ))}
        </>
      )
    case 'parking':
      return (
        <>
          <rect x="0" y="70" width="320" height="70" fill="#dcd5c4" />
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <rect key={i} x={20 + i * 52} y="70" width="26" height="70" fill="#e7e0d0" opacity="0.5" />
          ))}
          <rect x="105" y="92" width="110" height="38" rx="10" fill="#c96f24" opacity="0.85" />
          <circle cx="128" cy="130" r="8" fill="#3a342a" />
          <circle cx="192" cy="130" r="8" fill="#3a342a" />
        </>
      )
    default:
      return null
  }
}

function ExteriorScene({ objectType, color, dashed }) {
  switch (objectType) {
    case 'houseFacing':
      return (
        <>
          <rect width="320" height="180" fill="#f2ecdd" />
          <rect y="130" width="320" height="50" fill="#e7ddc4" />
          <circle cx="160" cy="90" r="62" fill="none" stroke={color} strokeWidth="2" strokeDasharray={dashed ? '3 5' : '5 4'} opacity="0.7" />
          {['N', 'E', 'S', 'W'].map((label, i) => {
            const angle = (i * 90 - 90) * (Math.PI / 180)
            const x = 160 + Math.cos(angle) * 62
            const y = 90 + Math.sin(angle) * 62
            return (
              <text key={label} x={x} y={y + 3} fontSize="10" fontWeight="700" fill={color} textAnchor="middle">{label}</text>
            )
          })}
          <path d="M120,130 L120,96 L160,68 L200,96 L200,130 Z" fill="#efe4cd" stroke="#c9b596" strokeWidth="2" />
          <rect x="150" y="108" width="20" height="22" fill="#a9835c" />
        </>
      )
    case 'houseGeneric':
      return (
        <>
          <rect width="320" height="180" fill="#f2ecdd" />
          <rect y="130" width="320" height="50" fill="#e7ddc4" />
          <path d="M110,130 L110,90 L160,60 L210,90 L210,130 Z" fill="#efe4cd" stroke="#c9b596" strokeWidth="2" />
          <rect x="140" y="106" width="20" height="24" fill="#a9835c" />
          <rect x="172" y="100" width="16" height="16" fill="#AEC8E0" stroke="#7fa6c9" strokeWidth="1" />
        </>
      )
    case 'houseCorner':
      return (
        <>
          <rect width="320" height="180" fill="#f2ecdd" />
          <rect y="130" width="320" height="50" fill="#e7ddc4" />
          <path d="M110,130 L110,80 L160,80 L160,60 L210,60 L210,130 Z" fill="#efe4cd" stroke="#c9b596" strokeWidth="2" />
          <rect x="160" y="60" width="50" height="20" fill="none" stroke={color} strokeWidth="2" strokeDasharray="3 4" />
          <text x="185" y="75" fontSize="8" fontWeight="700" fill={color} textAnchor="middle">MISSING</text>
        </>
      )
    case 'basement':
      return (
        <>
          <rect width="320" height="180" fill="#f2ecdd" />
          <path d="M120,96 L120,60 L160,38 L200,60 L200,96 Z" fill="#efe4cd" stroke="#c9b596" strokeWidth="2" />
          <line x1="60" y1="96" x2="260" y2="96" stroke="#a9835c" strokeWidth="2" />
          <rect x="120" y="96" width="80" height="50" fill={color} opacity="0.18" stroke={color} strokeWidth="2" strokeDasharray={dashed ? '3 5' : '0'} />
          <text x="160" y="126" fontSize="9" fontWeight="700" fill="#8a7a5c" textAnchor="middle">BASEMENT</text>
        </>
      )
    case 'plotShape':
      return (
        <>
          <rect width="320" height="180" fill="#f2ecdd" />
          <rect x="100" y="40" width="120" height="100" fill="none" stroke="#c9b596" strokeWidth="2" strokeDasharray="4 3" />
          <path d="M100,40 L220,40 L220,140 L160,140 L160,110 L100,110 Z" fill={`${color}22`} stroke={color} strokeWidth="2" />
        </>
      )
    case 'mandala':
      return (
        <>
          <rect width="320" height="180" fill="#f2ecdd" />
          {(() => {
            const cells = []
            const size = 90
            const ox = 160 - size / 2
            const oy = 90 - size / 2
            const step = size / 3
            for (let r = 0; r < 3; r++) {
              for (let c = 0; c < 3; c++) {
                const isCenter = r === 1 && c === 1
                cells.push(
                  <rect
                    key={`${r}-${c}`}
                    x={ox + c * step} y={oy + r * step} width={step} height={step}
                    fill={isCenter ? color : '#efe4cd'}
                    stroke="#c9b596" strokeWidth="1.5"
                  />
                )
              }
            }
            return cells
          })()}
        </>
      )
    case 'concept':
    default:
      return (
        <>
          <rect width="320" height="180" fill="#f2ecdd" />
          <circle cx="160" cy="90" r="46" fill="none" stroke={color} strokeWidth="2" strokeDasharray={dashed ? '3 5' : '5 4'} opacity="0.75" />
          <line x1="160" y1="44" x2="160" y2="136" stroke={color} strokeWidth="1.2" opacity="0.5" />
          <line x1="114" y1="90" x2="206" y2="90" stroke={color} strokeWidth="1.2" opacity="0.5" />
        </>
      )
  }
}

export default function RoomScene({ objectType = 'sofa', state = 'best', highlightText, size = 'lg' }) {
  const color = HIGHLIGHT_COLORS[state] || HIGHLIGHT_COLORS.best
  const dashed = state === 'lowConfidence'
  const exterior = isExteriorScene(objectType)

  return (
    <svg
      viewBox="0 0 320 180"
      style={{
        width: '100%',
        // Was a fixed pixel height (84/150) paired with width:100% — once
        // the illustration column could stretch wider than its natural
        // 320:180 shape (e.g. next to ShopPanel), the fixed height forced
        // preserveAspectRatio to letterbox the artwork, leaving empty
        // space on both sides instead of filling the box. Locking to the
        // viewBox's own aspect ratio means the rendered box always matches
        // its content regardless of how wide the flex parent makes it.
        aspectRatio: '320 / 180',
        display: 'block',
        borderRadius: size === 'sm' ? '14px' : '16px',
        background: '#faf5ec',
        border: '1px solid #EFE3D0',
        opacity: state === 'lowConfidence' ? 0.75 : 1,
      }}
    >
      {exterior ? (
        <ExteriorScene objectType={objectType} color={color} dashed={dashed} />
      ) : (
        <>
          <rect width="320" height="180" fill="#faf5ec" />
          <rect y="136" width="320" height="44" fill="#f3ecdd" />
          <line x1="0" y1="136" x2="320" y2="136" stroke="#eadfc9" strokeWidth="2" />

          <InteriorObject objectType={objectType} />

          {(() => {
            const box = HIGHLIGHT_BOX[objectType] || DEFAULT_BOX
            return (
              <>
                <rect
                  x={box.x} y={box.y} width={box.w} height={box.h}
                  fill={state === 'avoid' ? 'rgba(194, 69, 69, 0.06)' : `${color}14`}
                  stroke={color}
                  strokeWidth="2"
                  strokeDasharray={dashed ? '3 5' : '4 4'}
                  rx="8"
                />
                {highlightText && (
                  <text x={box.x + box.w / 2} y={box.y + box.h / 2 + 4} fill={color} fontSize="10" fontWeight="700" textAnchor="middle">
                    {highlightText}
                  </text>
                )}
              </>
            )
          })()}
        </>
      )}
    </svg>
  )
}
