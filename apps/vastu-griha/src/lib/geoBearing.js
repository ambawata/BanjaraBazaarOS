// Pure, dependency-free spherical-geometry helpers for the Auto True North
// wizard's GPS Corner-to-Corner method. The project has no existing lat/lon
// geometry library (Leaflet doesn't expose a bearing helper, and turf.js
// isn't a dependency) — these are the standard forward-azimuth and
// haversine-distance formulas, implemented directly rather than pulling in
// a new package for ~20 lines of trig.

const EARTH_RADIUS_M = 6371000

function toRad(deg) {
  return (deg * Math.PI) / 180
}

function toDeg(rad) {
  return (rad * 180) / Math.PI
}

// Initial bearing (forward azimuth) from point 1 to point 2, in degrees
// clockwise from true north, normalized to [0, 360). Standard great-circle
// bearing formula — this treats lat/lon as true-north-referenced (WGS84),
// so the result is a TRUE bearing, not a magnetic one (no declination
// correction needed for this method, unlike the compass method).
export function forwardAzimuth(lat1, lon1, lat2, lon2) {
  const phi1 = toRad(lat1)
  const phi2 = toRad(lat2)
  const deltaLambda = toRad(lon2 - lon1)

  const y = Math.sin(deltaLambda) * Math.cos(phi2)
  const x = Math.cos(phi1) * Math.sin(phi2) - Math.sin(phi1) * Math.cos(phi2) * Math.cos(deltaLambda)
  const theta = Math.atan2(y, x)

  return (toDeg(theta) + 360) % 360
}

// Great-circle distance in meters (haversine formula) — used only to warn
// the user if their two captured points are too close together for the
// bearing between them to be meaningful (GPS noise dominates the reading
// at short distances).
export function haversineDistanceMeters(lat1, lon1, lat2, lon2) {
  const phi1 = toRad(lat1)
  const phi2 = toRad(lat2)
  const deltaPhi = toRad(lat2 - lat1)
  const deltaLambda = toRad(lon2 - lon1)

  const a =
    Math.sin(deltaPhi / 2) ** 2 +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) ** 2
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  return EARTH_RADIUS_M * c
}

// Confidence PERCENTAGE derived from the REAL browser-reported GPS accuracy
// (meters, from position.coords.accuracy) for both captured points — never
// a fixed/fake number. Combined via root-sum-square as an
// independent-error approximation, since the bearing depends on both
// points' error, then mapped onto an intuitive 0-100 scale with a smooth
// inverse curve (a common way to turn a "lower is better" error metric
// into a "higher is better" confidence figure): ~50% at 5m combined
// accuracy, ~80% at 1.25m, approaching (but never reaching) 100% as
// accuracy improves further, and correspondingly low as it degrades.
// Clamped to [1, 99] since a real GPS fix is never perfectly certain nor
// completely worthless.
export function gpsConfidencePercent(accuracyA, accuracyB) {
  const combinedAccuracyM = Math.sqrt(accuracyA ** 2 + accuracyB ** 2)
  const raw = 100 / (1 + combinedAccuracyM / 5)
  const percent = Math.max(1, Math.min(99, Math.round(raw)))
  return { combinedAccuracyM, percent }
}
