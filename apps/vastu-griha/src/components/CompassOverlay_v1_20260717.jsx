// SVG compass / degree-wheel overlay: a circular protractor centered on the
// plot centroid, tick marks every 10 deg, N/E/S/W labels. The whole
// tick+label ring is rotated by true_north_rotation_r so it visually
// matches a real on-site compass-app overlay (true north points wherever
// it actually is relative to the floor plan's "up", rather than the plan's
// arbitrary up direction always being labeled N). Radial lines from the
// centroid to each wall/room's true bearing are drawn inside the same
// rotated group so they line up with the rotated ring.
//
// Brand purple ring per the Vastu Griha palette: #5A1FB3 -> #5D35AE.

const CARDINALS = { 0: 'N', 90: 'E', 180: 'S', 270: 'W' }

function pointOnCircle(cx, cy, r, angleDeg) {
  const rad = (angleDeg * Math.PI) / 180
  return [cx + r * Math.sin(rad), cy - r * Math.cos(rad)]
}

export default function CompassOverlay({ rotationR = 0, walls = [], rooms = [], size = 320 }) {
  const cx = size / 2
  const cy = size / 2
  const ringRadius = size / 2 - 24

  const ticks = []
  for (let deg = 0; deg < 360; deg += 10) {
    const isMajor = deg % 30 === 0
    const [x1, y1] = pointOnCircle(cx, cy, ringRadius, deg)
    const [x2, y2] = pointOnCircle(cx, cy, ringRadius - (isMajor ? 12 : 6), deg)
    ticks.push(
      <line key={deg} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#5A1FB3" strokeWidth={isMajor ? 1.5 : 0.75} opacity={isMajor ? 0.9 : 0.4} />
    )
    if (CARDINALS[deg]) {
      const [lx, ly] = pointOnCircle(cx, cy, ringRadius - 26, deg)
      ticks.push(
        <text key={`label-${deg}`} x={lx} y={ly} textAnchor="middle" dominantBaseline="middle" className="fill-brand font-ui" fontSize="14" fontWeight="700">
          {CARDINALS[deg]}
        </text>
      )
    } else if (deg % 30 === 0) {
      const [lx, ly] = pointOnCircle(cx, cy, ringRadius - 22, deg)
      ticks.push(
        <text key={`deg-${deg}`} x={lx} y={ly} textAnchor="middle" dominantBaseline="middle" className="fill-ink3 font-mono" fontSize="8">
          {deg}
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
      <circle cx={cx} cy={cy} r={ringRadius - 30} fill="none" stroke="#E4DEF2" strokeWidth={1} strokeDasharray="2 4" />

      <g transform={`rotate(${-rotationR} ${cx} ${cy})`}>
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
