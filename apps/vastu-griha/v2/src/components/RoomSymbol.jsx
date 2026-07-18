import React from 'react'

// Shared 2D architectural symbols for each room type — used by both the live
// Canvas editor and the printable professional floor plan, so the drawing you
// see while editing matches exactly what gets exported. Filled with color
// (not just thin gray outlines) to match the reference Canva-style floor
// plan Vinod asked for — furniture should read as furniture at a glance.
export default function RoomSymbol({ type, label = '', stroke = 'var(--text)', size = 50, stairStyle = 'straight', long = true }) {
  const isDining = label.toLowerCase().includes('dining')
  const ink = '#2c2417'

  if (type === 'kitchen') {
    return (
      <svg viewBox="0 0 100 100" style={{ width: size, height: size }}>
        <path d="M 8 8 L 92 8 L 92 30 L 30 30 L 30 92 L 8 92 Z" fill="#E3C9A0" stroke={ink} strokeWidth="2.2" />
        <rect x="16" y="14" width="16" height="12" rx="2" fill="#BFE3F0" stroke={ink} strokeWidth="1.4" />
        <circle cx="58" cy="18" r="6" fill="#555" stroke={ink} strokeWidth="1.2" />
        <circle cx="78" cy="18" r="6" fill="#555" stroke={ink} strokeWidth="1.2" />
        <rect x="14" y="55" width="16" height="30" fill="#D9C7A8" stroke={ink} strokeWidth="1.4" />
      </svg>
    )
  }
  if (type === 'bedroom') {
    return (
      <svg viewBox="0 0 100 100" style={{ width: size, height: size }}>
        <rect x="10" y="8" width="80" height="60" rx="3" fill="#C9D9F5" stroke={ink} strokeWidth="2.2" />
        <rect x="16" y="14" width="30" height="16" rx="4" fill="#EAF1FD" stroke={ink} strokeWidth="1.4" />
        <rect x="54" y="14" width="30" height="16" rx="4" fill="#EAF1FD" stroke={ink} strokeWidth="1.4" />
        <line x1="10" y1="46" x2="90" y2="46" stroke={ink} strokeWidth="1.4" />
        <rect x="2" y="8" width="8" height="14" fill="#AEC6F0" stroke={ink} strokeWidth="1.2" />
        <rect x="90" y="8" width="8" height="14" fill="#AEC6F0" stroke={ink} strokeWidth="1.2" />
        <rect x="10" y="80" width="80" height="14" fill="#AEC6F0" stroke={ink} strokeWidth="1.4" />
      </svg>
    )
  }
  if (type === 'living' && !isDining) {
    return (
      <svg viewBox="0 0 100 100" style={{ width: size, height: size }}>
        <rect x="8" y="55" width="60" height="20" rx="3" fill="#B9C6D9" stroke={ink} strokeWidth="2" />
        <rect x="8" y="20" width="20" height="55" rx="3" fill="#B9C6D9" stroke={ink} strokeWidth="2" />
        <line x1="8" y1="55" x2="28" y2="55" stroke={ink} strokeWidth="1.2" />
        <rect x="45" y="30" width="35" height="20" rx="2" fill="#D9C7A8" stroke={ink} strokeWidth="1.4" />
        <rect x="45" y="82" width="45" height="8" fill="#8A97A8" stroke={ink} strokeWidth="1.4" />
      </svg>
    )
  }
  if (type === 'living' && isDining) {
    return (
      <svg viewBox="0 0 100 100" style={{ width: size, height: size }}>
        <rect x="24" y="18" width="52" height="64" rx="4" fill="#E3C9A0" stroke={ink} strokeWidth="2" />
        <rect x="6" y="26" width="14" height="18" rx="2" fill="#D9C7A8" stroke={ink} strokeWidth="1.4" />
        <rect x="6" y="56" width="14" height="18" rx="2" fill="#D9C7A8" stroke={ink} strokeWidth="1.4" />
        <rect x="80" y="26" width="14" height="18" rx="2" fill="#D9C7A8" stroke={ink} strokeWidth="1.4" />
        <rect x="80" y="56" width="14" height="18" rx="2" fill="#D9C7A8" stroke={ink} strokeWidth="1.4" />
        <rect x="38" y="4" width="24" height="12" rx="2" fill="#D9C7A8" stroke={ink} strokeWidth="1.4" />
        <rect x="38" y="84" width="24" height="12" rx="2" fill="#D9C7A8" stroke={ink} strokeWidth="1.4" />
      </svg>
    )
  }
  if (type === 'pooja') {
    return (
      <svg viewBox="0 0 100 100" style={{ width: size, height: size }}>
        <rect x="20" y="55" width="60" height="30" fill="#F0E0B0" stroke="var(--gold)" strokeWidth="2" />
        <path d="M 30 55 L 30 30 L 50 12 L 70 30 L 70 55 Z" fill="#F5E9C8" stroke="var(--gold)" strokeWidth="2" />
        <circle cx="50" cy="40" r="7" fill="var(--gold)" stroke={ink} strokeWidth="1" />
        <line x1="20" y1="70" x2="80" y2="70" stroke="var(--gold)" strokeWidth="1.2" />
      </svg>
    )
  }
  if (type === 'toilet') {
    return (
      <svg viewBox="0 0 100 100" style={{ width: size, height: size }}>
        <rect x="12" y="10" width="34" height="16" rx="2" fill="#CFE0E8" stroke={ink} strokeWidth="1.8" />
        <ellipse cx="29" cy="46" rx="17" ry="20" fill="#FFFFFF" stroke={ink} strokeWidth="1.8" />
        <ellipse cx="29" cy="42" rx="11" ry="14" fill="#EAF4F7" stroke={ink} strokeWidth="1.2" />
        <rect x="58" y="8" width="30" height="14" rx="6" fill="#CFE0E8" stroke={ink} strokeWidth="1.6" />
        <circle cx="73" cy="15" r="2" fill={ink} />
        <rect x="58" y="55" width="34" height="34" fill="#EAF4F7" stroke={ink} strokeWidth="1.6" strokeDasharray="3 3" />
      </svg>
    )
  }
  if (type === 'staircase') {
    return (
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ width: '100%', height: size }}>
        <rect x="5" y="5" width="90" height="90" fill="none" stroke={ink} strokeWidth="2" />
        <StaircaseTreads ink={ink} style={stairStyle} long={long} />
      </svg>
    )
  }
  if (type === 'lift') {
    return (
      <svg viewBox="0 0 100 100" style={{ width: size, height: size }}>
        <rect x="10" y="10" width="80" height="80" fill="#E4DFD5" stroke={ink} strokeWidth="2" />
        <line x1="50" y1="10" x2="50" y2="90" stroke={ink} strokeWidth="1.6" />
        <path d="M 40 40 L 50 30 L 60 40 M 40 60 L 50 70 L 60 60" fill="none" stroke={ink} strokeWidth="1.6" />
      </svg>
    )
  }
  return null
}

// Tread-line rendering for the 3 staircase styles, ported from the
// deleted standalone Canvas 2 tool's drawStairs() (vastu-studio-v4.html).
// Drawn inside the fixed 5..95 frame RoomSymbol already draws for
// 'staircase'. `long` picks the direction of travel (true = across the
// room's width, matching a wider-than-tall room) — same convention Canvas
// 2 used (`long = w >= h`) so treads always run perpendicular to travel
// instead of parallel to it. Everything below is written for the `long`
// case and mirrored across the diagonal (x<->y) when `long` is false,
// same as Canvas 2's own long/!long branches.
function StaircaseTreads({ ink, style, long }) {
  const MIN = 5, MAX = 95, MID = 50, W = 1.2

  // A tread line perpendicular to travel: at position `a` along the travel
  // axis, spanning from `spanFrom` to `spanTo` on the cross axis.
  const tread = (a, spanFrom, spanTo, key) => long
    ? <line key={key} x1={a} y1={spanFrom} x2={a} y2={spanTo} stroke={ink} strokeWidth={W} />
    : <line key={key} x1={spanFrom} y1={a} x2={spanTo} y2={a} stroke={ink} strokeWidth={W} />

  const rectAt = (travelFrom, travelLen, crossFrom, crossLen) => long
    ? <rect x={travelFrom} y={crossFrom} width={travelLen} height={crossLen} fill="none" stroke={ink} strokeWidth="1" />
    : <rect x={crossFrom} y={travelFrom} width={crossLen} height={travelLen} fill="none" stroke={ink} strokeWidth="1" />

  const upLabel = (x, y) => (
    <text x={x} y={y} textAnchor="middle" style={{ font: '700 8px sans-serif', fill: ink }}>UP</text>
  )

  if (style === 'L') {
    const land = 40
    const nearEnd = MAX - land
    const flight1 = []
    for (let a = MIN + 10; a < nearEnd; a += 10) flight1.push(tread(a, MIN, MID, `f1-${a}`))
    const flight2 = []
    for (let b = MID + 12; b < MAX; b += 10) flight2.push(tread(b, nearEnd, MAX, `f2-${b}`))
    return (
      <>
        {flight1}
        {rectAt(nearEnd, land, MIN, MID - MIN)}
        {flight2}
        {upLabel(MID, MID + 3)}
      </>
    )
  }

  if (style === 'U') {
    const land = 22
    const nearEnd = MAX - land
    const flights = []
    for (let a = MIN + 10; a < nearEnd; a += 10) {
      flights.push(tread(a, MIN, MID - 6, `u1-${a}`))
      flights.push(tread(a, MID + 6, MAX, `u2-${a}`))
    }
    return (
      <>
        {flights}
        {rectAt(nearEnd, land, MIN, MAX - MIN)}
        {tread(MID, MIN, nearEnd, 'connector')}
        {upLabel(MID, MID + 3)}
      </>
    )
  }

  // straight (default)
  const treads = []
  for (let a = MIN + 10; a < MAX; a += 10) treads.push(tread(a, MIN, MAX, `s${a}`))
  const arrowLine = long
    ? <line x1={MIN + 5} y1={MID} x2={MAX - 8} y2={MID} stroke={ink} strokeWidth="1.6" />
    : <line x1={MID} y1={MIN + 5} x2={MID} y2={MAX - 8} stroke={ink} strokeWidth="1.6" />
  const arrowHead = long
    ? <path d={`M ${MAX - 13} ${MID - 4} L ${MAX - 8} ${MID} L ${MAX - 13} ${MID + 4}`} fill="none" stroke={ink} strokeWidth="1.6" />
    : <path d={`M ${MID - 4} ${MAX - 13} L ${MID} ${MAX - 8} L ${MID + 4} ${MAX - 13}`} fill="none" stroke={ink} strokeWidth="1.6" />
  return (
    <>
      {treads}
      {arrowLine}
      {arrowHead}
      {upLabel(long ? (MIN + MAX) / 2 : MID, long ? MID - 6 : (MIN + MAX) / 2 - 4)}
    </>
  )
}
