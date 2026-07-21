// SVG compass overlay, styled as a Vastu Purusha Mandala — the classical
// radial+square grid a real Vastu diagram uses, rather than a generic
// circular progress-ring look. This is the single signature visual
// element in the geometry tool (per the approved design direction), so
// it carries the most visual investment in this app: concentric axis-
// aligned squares nested inside the compass ring (echoing the mandala's
// square subdivision, with subdivision ticks on the outer square), tick
// marks every 15 deg (three-tier: bold at cardinals, medium at
// ordinals, thin in between), and bold N/E/S/W labels.
//
// Functionally unchanged from the previous version: same props, same
// rotation-by-R behavior for true-north alignment, same wall/room radial
// lines and boundary_case emphasis, same centroid dot + R readout — only
// the rendering changed.

const CARDINALS = { 0: 'N', 90: 'E', 180: 'S', 270: 'W' }
const ORDINALS = { 45: 'NE', 135: 'SE', 225: 'SW', 315: 'NW' }

function pointOnCircle(cx, cy, r, angleDeg) {
  const rad = (angleDeg * Math.PI) / 180
  return [cx + r * Math.sin(rad), cy - r * Math.cos(rad)]
}

// Axis-aligned square (sides face N/E/S/W, matching the classical Vastu
// Purusha Mandala orientation — not a diamond) centered on (cx, cy) with
// half-width `s`, plus optional subdivision ticks along each side.
function MandalaSquare({ cx, cy, s, stroke, strokeWidth, opacity, subdivisions = 0 }) {
  const ticks = []
  if (subdivisions > 0) {
    const step = (2 * s) / subdivisions
    for (let i = 1; i < subdivisions; i++) {
      const t = -s + i * step
      const tickLen = 5
      // Top and bottom edges
      ticks.push(<line key={`t-${i}`} x1={cx + t} y1={cy - s} x2={cx + t} y2={cy - s + tickLen} stroke={stroke} strokeWidth={1} opacity={opacity * 0.8} />)
      ticks.push(<line key={`b-${i}`} x1={cx + t} y1={cy + s} x2={cx + t} y2={cy + s - tickLen} stroke={stroke} strokeWidth={1} opacity={opacity * 0.8} />)
      // Left and right edges
      ticks.push(<line key={`l-${i}`} x1={cx - s} y1={cy + t} x2={cx - s + tickLen} y2={cy + t} stroke={stroke} strokeWidth={1} opacity={opacity * 0.8} />)
      ticks.push(<line key={`r-${i}`} x1={cx + s} y1={cy + t} x2={cx + s - tickLen} y2={cy + t} stroke={stroke} strokeWidth={1} opacity={opacity * 0.8} />)
    }
  }
  return (
    <>
      <rect x={cx - s} y={cy - s} width={2 * s} height={2 * s} fill="none" stroke={stroke} strokeWidth={strokeWidth} opacity={opacity} />
      {ticks}
    </>
  )
}

export default function CompassOverlay({ rotationR = 0, walls = [], rooms = [], size = 320 }) {
  const cx = size / 2
  const cy = size / 2
  const ringRadius = size / 2 - 24

  const ticks = []
  for (let deg = 0; deg < 360; deg += 15) {
    const isCardinal = deg % 90 === 0
    const isOrdinal = deg % 45 === 0 && !isCardinal
    const tickLen = isCardinal ? 14 : isOrdinal ? 10 : 6
    const [x1, y1] = pointOnCircle(cx, cy, ringRadius, deg)
    const [x2, y2] = pointOnCircle(cx, cy, ringRadius - tickLen, deg)
    ticks.push(
      <line
        key={deg}
        x1={x1} y1={y1} x2={x2} y2={y2}
        stroke="#5A1FB3"
        strokeWidth={isCardinal ? 2 : isOrdinal ? 1.25 : 0.75}
        opacity={isCardinal ? 1 : isOrdinal ? 0.7 : 0.4}
      />
    )
    if (CARDINALS[deg]) {
      const [lx, ly] = pointOnCircle(cx, cy, ringRadius - 30, deg)
      ticks.push(
        <text key={`label-${deg}`} x={lx} y={ly} textAnchor="middle" dominantBaseline="middle" className="fill-brand font-display" fontSize="18" fontWeight="700">
          {CARDINALS[deg]}
        </text>
      )
    } else if (ORDINALS[deg]) {
      const [lx, ly] = pointOnCircle(cx, cy, ringRadius - 24, deg)
      ticks.push(
        <text key={`label-${deg}`} x={lx} y={ly} textAnchor="middle" dominantBaseline="middle" className="fill-ink2 font-ui" fontSize="9" fontWeight="600">
          {ORDINALS[deg]}
        </text>
      )
    }
  }

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="select-none">
      <defs>
        <linearGradient id="vg-compass-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#5A1FB3" />
          <stop offset="100%" stopColor="#5D35AE" />
        </linearGradient>
      </defs>

      <circle cx={cx} cy={cy} r={ringRadius} fill="none" stroke="url(#vg-compass-gradient)" strokeWidth={2.5} />

      <g transform={`rotate(${-rotationR} ${cx} ${cy})`}>
        {/* Vastu Purusha Mandala: nested squares, sides facing N/E/S/W.
            Outer square carries subdivision ticks (evoking the classical
            9x9 grid) without drawing a full grid, keeping this legible
            at small sizes. Innermost square = Brahmasthan, tinted. */}
        <rect
          x={cx - ringRadius * 0.34} y={cy - ringRadius * 0.34}
          width={ringRadius * 0.68} height={ringRadius * 0.68}
          fill="#5A1FB3" opacity={0.06}
        />
        <MandalaSquare cx={cx} cy={cy} s={ringRadius * 0.62} stroke="#5A1FB3" strokeWidth={1.25} opacity={0.55} subdivisions={9} />
        <MandalaSquare cx={cx} cy={cy} s={ringRadius * 0.48} stroke="#5A1FB3" strokeWidth={1} opacity={0.4} />
        <MandalaSquare cx={cx} cy={cy} s={ringRadius * 0.34} stroke="#5D35AE" strokeWidth={1.25} opacity={0.65} />

        {ticks}

        {rooms.map((room, i) => {
          const [x, y] = pointOnCircle(cx, cy, ringRadius - 30, room.bearing_true)
          return <circle key={`room-${room.id ?? i}`} cx={x} cy={y} r={3} fill="#5D35AE" opacity={0.75} />
        })}
        {walls.map((wall, i) => {
          const [x, y] = pointOnCircle(cx, cy, ringRadius - 30, wall.bearing_true)
          return (
            <line
              key={`wall-${wall.id ?? i}`}
              x1={cx} y1={cy} x2={x} y2={y}
              stroke="#5A1FB3"
              strokeWidth={wall.boundary_case ? 2.5 : 1.5}
              opacity={0.85}
            />
          )
        })}
      </g>

      <circle cx={cx} cy={cy} r={4} fill="#241344" />
      <text x={cx} y={cy + 18} textAnchor="middle" className="fill-ink2 font-mono" fontSize="9">
        R = {rotationR.toFixed(1)}°
      </text>
    </svg>
  )
}
