import React from 'react'

// Generalized illustrated "room scene" — extends the pattern originally
// hardcoded for the mirror-in-living-room tool (see the old
// ItemPlacementWidget) into a data-driven component reused across every
// category: wall + floor + a room-appropriate furniture silhouette in warm
// tan/cream tones, with a dashed selection box marking where the item goes.
//
// state:
//   'best'          -> orange dashed box (correct placement)
//   'avoid'         -> red dashed box + "Avoid" label
//   'lowConfidence' -> muted grey dashed box, lower opacity — the KB itself
//                      isn't confident here, so the illustration shouldn't
//                      look as certain as a 90%-confidence entry either.

const HIGHLIGHT_COLORS = {
  best: '#E08A3C',
  avoid: '#C24545',
  neutral: '#B5AA98',
  lowConfidence: '#B5AA98',
}

function Furniture({ roomType }) {
  switch (roomType) {
    case 'bedroom':
      return (
        <>
          <rect x="30" y="96" width="150" height="44" rx="6" fill="#e6d9c8" stroke="#c9b596" strokeWidth="1.5" />
          <rect x="30" y="86" width="150" height="16" rx="4" fill="#f3e9db" stroke="#c9b596" strokeWidth="1.5" />
          <rect x="24" y="80" width="10" height="60" rx="3" fill="#c9b596" />
          <rect x="190" y="104" width="26" height="32" rx="3" fill="#d7c6ad" stroke="#c2ac89" strokeWidth="1" />
          <circle cx="203" cy="112" r="2" fill="#8d7a5c" />
        </>
      )
    case 'kitchen':
      return (
        <>
          <rect x="20" y="94" width="220" height="42" rx="4" fill="#e9dfcd" stroke="#cbbb99" strokeWidth="1.5" />
          <rect x="30" y="98" width="34" height="20" rx="3" fill="#d8cbb0" />
          <circle cx="120" cy="106" r="9" fill="#8d6e63" opacity="0.7" />
          <circle cx="150" cy="106" r="9" fill="#8d6e63" opacity="0.7" />
          <rect x="200" y="60" width="40" height="34" rx="4" fill="#cfe0d6" stroke="#a9c3b5" strokeWidth="1.5" />
        </>
      )
    case 'entrance':
      return (
        <>
          <rect x="120" y="20" width="80" height="118" rx="4" fill="#e6d3b8" stroke="#c9a876" strokeWidth="2" />
          <rect x="128" y="28" width="64" height="102" rx="2" fill="#f3e7d2" stroke="#c9a876" strokeWidth="1.5" />
          <circle cx="186" cy="80" r="2.5" fill="#c9a876" />
          <rect x="90" y="140" width="140" height="10" rx="4" fill="#d8cba6" opacity="0.6" />
        </>
      )
    case 'bathroom':
      return (
        <>
          {Array.from({ length: 6 }).map((_, i) => (
            <line key={i} x1={i * 55} y1="136" x2={i * 55} y2="180" stroke="#dbe6e3" strokeWidth="1" />
          ))}
          <rect x="0" y="136" width="320" height="44" fill="#eef4f2" />
          <ellipse cx="70" cy="120" rx="28" ry="16" fill="#eef4f2" stroke="#b9cdc7" strokeWidth="1.5" />
          <rect x="55" y="108" width="30" height="14" rx="6" fill="#eef4f2" stroke="#b9cdc7" strokeWidth="1.5" />
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
    case 'exterior':
      return (
        <>
          <rect x="0" y="60" width="320" height="80" fill="#e7ddc4" />
          <path d="M100,140 L100,90 L160,60 L220,90 L220,140 Z" fill="#efe4cd" stroke="#c9b596" strokeWidth="2" />
          <ellipse cx="270" cy="128" rx="22" ry="12" fill="#cfe0d6" stroke="#a9c3b5" strokeWidth="1.5" />
        </>
      )
    case 'living':
    default:
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
  }
}

export default function RoomScene({ roomType = 'living', state = 'best', highlightText, size = 'lg' }) {
  const color = HIGHLIGHT_COLORS[state] || HIGHLIGHT_COLORS.best
  const dashed = state === 'lowConfidence'
  const height = size === 'sm' ? 84 : 150

  return (
    <svg
      viewBox="0 0 320 180"
      style={{
        width: '100%',
        height: `${height}px`,
        display: 'block',
        borderRadius: size === 'sm' ? '14px' : '16px',
        background: '#faf5ec',
        border: '1px solid #EFE3D0',
        opacity: state === 'lowConfidence' ? 0.75 : 1,
      }}
    >
      <rect width="320" height="180" fill="#faf5ec" />
      <rect y="136" width="320" height="44" fill="#f3ecdd" />
      <line x1="0" y1="136" x2="320" y2="136" stroke="#eadfc9" strokeWidth="2" />

      <Furniture roomType={roomType} />

      <rect
        x="108" y="22" width="84" height="52"
        fill={state === 'avoid' ? 'rgba(194, 69, 69, 0.06)' : `${color}14`}
        stroke={color}
        strokeWidth="2"
        strokeDasharray={dashed ? '3 5' : '4 4'}
        rx="8"
      />
      {highlightText && (
        <text x="150" y="52" fill={color} fontSize="10" fontWeight="700" textAnchor="middle">
          {highlightText}
        </text>
      )}
    </svg>
  )
}
