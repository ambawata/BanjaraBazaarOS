import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { forwardAzimuth, gpsConfidenceFromAccuracy, haversineDistanceMeters } from '../lib/geoBearing'
import { DELHI_NCR_DECLINATION } from '../config/geo'

// Auto True North Detect — a modal offering 3 real ways to arrive at the
// "raw on-site compass reading" CalibrationWorkflow's Step 2 already asks
// for, instead of only a manual number. Whichever method the user picks,
// this modal's only job is to hand a real, freshly-measured bearing (in
// degrees, 0-360) back to the caller via onApply() — the caller (
// CalibrationWorkflow) drops it straight into its existing rawReading
// state, so the existing Step 1-6 flow (pick reference wall -> Step 4
// "Apply to all" -> real POST /calibrate) is completely unchanged and
// un-duplicated. No method here ever fabricates a number: every path either
// shows a real reading or an honest error state.

function describeGeolocationError(e) {
  if (e.code === 1) return 'Location permission denied. Enable location access for this site and try again.'
  if (e.code === 2) return 'Position unavailable — GPS could not get a fix. Move to an open area (away from walls/roof) and retry.'
  if (e.code === 3) return 'GPS request timed out. Try again, ideally outdoors with a clear sky view.'
  return e.message || 'Could not read GPS position.'
}

function getCurrentPositionAsync(options) {
  return new Promise((resolve, reject) => {
    if (!('geolocation' in navigator)) {
      reject(new Error('Geolocation is not available in this browser.'))
      return
    }
    navigator.geolocation.getCurrentPosition(resolve, reject, options)
  })
}

const METHODS = [
  { key: 'gps', label: 'GPS Corner-to-Corner', icon: '📍' },
  { key: 'map', label: 'Map Front Wall Trace', icon: '🛰️' },
  { key: 'compass', label: 'Live Phone Compass', icon: '🧭' },
]

function ModalShell({ onClose, children }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className="bg-surface shadow-card rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6"
        onClick={e => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  )
}

function GpsMethod({ onApply }) {
  const [pointA, setPointA] = useState(null)
  const [pointB, setPointB] = useState(null)
  const [busy, setBusy] = useState(null) // 'A' | 'B' | null
  const [error, setError] = useState(null)

  async function capture(which) {
    setError(null)
    setBusy(which)
    try {
      const position = await getCurrentPositionAsync({ enableHighAccuracy: true, timeout: 15000, maximumAge: 0 })
      const point = {
        lat: position.coords.latitude,
        lon: position.coords.longitude,
        accuracy: position.coords.accuracy, // meters, real value from the browser
      }
      if (which === 'A') setPointA(point)
      else setPointB(point)
    } catch (e) {
      setError(describeGeolocationError(e))
    } finally {
      setBusy(null)
    }
  }

  const result = useMemo(() => {
    if (!pointA || !pointB) return null
    const distanceM = haversineDistanceMeters(pointA.lat, pointA.lon, pointB.lat, pointB.lon)
    const bearing = forwardAzimuth(pointA.lat, pointA.lon, pointB.lat, pointB.lon)
    const confidence = gpsConfidenceFromAccuracy(pointA.accuracy, pointB.accuracy)
    return { distanceM, bearing, confidence }
  }, [pointA, pointB])

  function reset() {
    setPointA(null)
    setPointB(null)
    setError(null)
  }

  return (
    <div className="space-y-4">
      <p className="text-ink3 text-sm">
        Stand at one corner of the front/gate wall and capture Point A, then walk to the
        other corner of that same wall and capture Point B. The bearing between the two
        is computed from your real GPS coordinates — no compass needed for this method.
      </p>

      <div className="grid sm:grid-cols-2 gap-3">
        <div className="px-4 py-3 rounded-lg bg-surface2 border border-surface3">
          <p className="text-ink2 text-xs font-medium mb-2">Point A (first corner)</p>
          {pointA ? (
            <p className="text-ink1 text-xs font-mono">
              {pointA.lat.toFixed(6)}, {pointA.lon.toFixed(6)}
              <br />±{pointA.accuracy.toFixed(1)} m accuracy
            </p>
          ) : (
            <button
              onClick={() => capture('A')}
              disabled={busy === 'A'}
              className="px-3 py-1.5 rounded-lg bg-brand-gradient text-white text-xs font-medium disabled:opacity-50"
            >
              {busy === 'A' ? 'Getting fix…' : 'Capture Point A'}
            </button>
          )}
        </div>
        <div className="px-4 py-3 rounded-lg bg-surface2 border border-surface3">
          <p className="text-ink2 text-xs font-medium mb-2">Point B (other corner)</p>
          {pointB ? (
            <p className="text-ink1 text-xs font-mono">
              {pointB.lat.toFixed(6)}, {pointB.lon.toFixed(6)}
              <br />±{pointB.accuracy.toFixed(1)} m accuracy
            </p>
          ) : (
            <button
              onClick={() => capture('B')}
              disabled={!pointA || busy === 'B'}
              className="px-3 py-1.5 rounded-lg bg-brand-gradient text-white text-xs font-medium disabled:opacity-50"
            >
              {busy === 'B' ? 'Getting fix…' : 'Capture Point B'}
            </button>
          )}
        </div>
      </div>

      {error && <p className="text-red text-sm">{error}</p>}

      {result && (
        <div className="px-4 py-3 rounded-lg bg-surface2 border border-surface3 space-y-1">
          <p className="text-ink1 text-lg font-mono font-semibold">{result.bearing.toFixed(2)}°</p>
          <p className="text-ink2 text-xs">
            Distance between points: <span className="font-mono">{result.distanceM.toFixed(2)} m</span>
            {' · '}
            Combined GPS accuracy: <span className="font-mono">±{result.confidence.combinedAccuracyM.toFixed(1)} m</span>
            {' → '}
            <span className="font-semibold">{result.confidence.label} confidence</span>
          </p>
          {result.distanceM < 1 && (
            <p className="text-amberMuted text-xs">
              ⚠ The two points are very close together (under 1 m) — GPS noise likely
              dominates this bearing. Walk further apart and recapture for a reliable reading.
            </p>
          )}
        </div>
      )}

      <div className="flex items-center gap-2">
        <button
          onClick={() => onApply(result.bearing)}
          disabled={!result}
          className="px-4 py-2 rounded-lg bg-brand-gradient text-white text-sm font-medium disabled:opacity-50"
        >
          Use this bearing
        </button>
        {(pointA || pointB) && (
          <button onClick={reset} className="px-3 py-1.5 rounded-lg border border-surface3 text-ink2 text-xs font-medium hover:bg-surface2">
            Reset points
          </button>
        )}
      </div>
    </div>
  )
}

function MapMethod() {
  return (
    <div className="space-y-4">
      <p className="text-ink3 text-sm">
        Tracing your plot's boundary directly on a satellite map is inherently north-up
        (you're tracing real imagery, not a hand-drawn sketch) — so this path never needs
        manual True North calibration at all. It creates a new plot through the "Mera Ghar"
        wizard, rather than calibrating the plot you're currently editing here.
      </p>
      <div className="px-4 py-3 rounded-lg bg-surface2 border border-surface3">
        <p className="text-ink2 text-sm mb-3">
          Opens in a new tab so your current plot's progress here isn't lost.
        </p>
        <Link
          to="/vastu-griha/my-home"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block px-4 py-2 rounded-lg bg-brand-gradient text-white text-sm font-medium"
        >
          Open Map Trace →
        </Link>
      </div>
    </div>
  )
}

function CompassMethod({ onApply }) {
  const [status, setStatus] = useState('idle') // idle | requesting | listening | denied | unsupported
  const [error, setError] = useState(null)
  const [headingMagnetic, setHeadingMagnetic] = useState(null)
  const [isAbsolute, setIsAbsolute] = useState(false)
  const listenerRef = useRef(null)

  useEffect(() => {
    return () => {
      if (listenerRef.current) {
        window.removeEventListener('deviceorientationabsolute', listenerRef.current, true)
        window.removeEventListener('deviceorientation', listenerRef.current, true)
      }
    }
  }, [])

  function handleOrientationEvent(event) {
    // iOS Safari's non-standard webkitCompassHeading is already a real
    // magnetic-north-referenced compass heading (0-360, clockwise) with no
    // inversion needed. Everywhere else, `alpha` is a device-orientation
    // angle, not a compass heading directly — when the event carries an
    // absolute flag (deviceorientationabsolute, or `absolute: true`), the
    // standard conversion is heading = (360 - alpha) % 360. Without an
    // absolute flag, alpha's reference frame is undefined (arbitrary at
    // power-on) — we still compute a best-effort value but flag it so the
    // UI can warn the reading may drift.
    if (typeof event.webkitCompassHeading === 'number') {
      setIsAbsolute(true)
      setHeadingMagnetic(event.webkitCompassHeading)
      return
    }
    if (event.alpha == null) return
    const absolute = event.absolute === true || event.type === 'deviceorientationabsolute'
    setIsAbsolute(absolute)
    setHeadingMagnetic((360 - event.alpha) % 360)
  }

  async function enableCompass() {
    setError(null)
    if (typeof DeviceOrientationEvent === 'undefined') {
      setStatus('unsupported')
      setError('This browser does not expose device orientation/compass data.')
      return
    }
    setStatus('requesting')
    try {
      // iOS 13+ requires this to be called synchronously from a user
      // gesture (the button tap that invoked enableCompass satisfies that)
      // and gates deviceorientation entirely behind it.
      if (typeof DeviceOrientationEvent.requestPermission === 'function') {
        const result = await DeviceOrientationEvent.requestPermission()
        if (result !== 'granted') {
          setStatus('denied')
          setError('Compass permission denied. Enable Motion & Orientation Access for this site in Settings and retry.')
          return
        }
      }
      const handler = (e) => handleOrientationEvent(e)
      listenerRef.current = handler
      window.addEventListener('deviceorientationabsolute', handler, true)
      window.addEventListener('deviceorientation', handler, true)
      setStatus('listening')
    } catch (e) {
      setStatus('denied')
      setError(e.message || 'Could not start the compass.')
    }
  }

  const headingTrue = headingMagnetic == null ? null : (headingMagnetic + DELHI_NCR_DECLINATION + 360) % 360

  return (
    <div className="space-y-4">
      <p className="text-ink3 text-sm">
        Hold your phone flat against the front/gate wall, screen facing the wall's
        direction. The live reading below updates in real time as you rotate — tap
        "Use this reading" once it's settled.
      </p>

      {status === 'idle' && (
        <button
          onClick={enableCompass}
          className="px-4 py-2 rounded-lg bg-brand-gradient text-white text-sm font-medium"
        >
          Enable compass
        </button>
      )}

      {status === 'requesting' && <p className="text-ink2 text-sm">Requesting permission…</p>}

      {(status === 'denied' || status === 'unsupported') && (
        <div className="space-y-2">
          <p className="text-red text-sm">{error}</p>
          {status === 'denied' && (
            <button onClick={enableCompass} className="px-3 py-1.5 rounded-lg border border-surface3 text-ink2 text-xs font-medium hover:bg-surface2">
              Retry
            </button>
          )}
        </div>
      )}

      {status === 'listening' && (
        <div className="space-y-3">
          {headingTrue == null ? (
            <p className="text-ink2 text-sm">Waiting for a reading… rotate your phone slightly.</p>
          ) : (
            <div className="px-4 py-3 rounded-lg bg-surface2 border border-surface3 space-y-1">
              <p className="text-ink1 text-2xl font-mono font-semibold tabular-nums">{headingTrue.toFixed(1)}°</p>
              <p className="text-ink2 text-xs">
                Magnetic heading <span className="font-mono">{headingMagnetic.toFixed(1)}°</span>
                {' '}+ Delhi NCR declination <span className="font-mono">{DELHI_NCR_DECLINATION.toFixed(1)}°</span>
                {' '}= true heading above (live, updating as you rotate)
              </p>
              {!isAbsolute && (
                <p className="text-amberMuted text-xs">
                  ⚠ This device did not report an absolute/calibrated orientation — the
                  reading may drift. Rotate in a figure-8 to calibrate your compass, or
                  prefer GPS/Map trace instead.
                </p>
              )}
            </div>
          )}
          <button
            onClick={() => onApply(headingTrue)}
            disabled={headingTrue == null}
            className="px-4 py-2 rounded-lg bg-brand-gradient text-white text-sm font-medium disabled:opacity-50"
          >
            Use this reading
          </button>
        </div>
      )}
    </div>
  )
}

export default function AutoTrueNorthWizard({ onClose, onApply }) {
  const [activeMethod, setActiveMethod] = useState(null)

  function handleApply(bearing) {
    onApply(bearing)
    onClose()
  }

  return (
    <ModalShell onClose={onClose}>
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-ink1 font-display font-semibold text-xl">Auto True North Detect</h2>
        <button onClick={onClose} className="text-ink3 hover:text-ink1 text-xl leading-none" aria-label="Close">✕</button>
      </div>
      <p className="text-ink3 text-sm mb-5">
        Pick a method to measure the raw on-site reading for Step 2 — the result drops
        straight into the calibration form below, nothing here is applied automatically.
      </p>

      <div className="flex flex-wrap gap-2 mb-5">
        {METHODS.map(m => (
          <button
            key={m.key}
            onClick={() => setActiveMethod(m.key)}
            className={`px-3 py-2 rounded-lg text-sm font-medium border ${
              activeMethod === m.key
                ? 'border-brand bg-brandDim text-brand'
                : 'border-surface3 bg-surface text-ink2 hover:bg-surface2'
            }`}
          >
            {m.icon} {m.label}
          </button>
        ))}
      </div>

      {activeMethod === 'gps' && <GpsMethod onApply={handleApply} />}
      {activeMethod === 'map' && <MapMethod />}
      {activeMethod === 'compass' && <CompassMethod onApply={handleApply} />}
      {!activeMethod && <p className="text-ink3 text-sm">Choose a method above to get started.</p>}
    </ModalShell>
  )
}
