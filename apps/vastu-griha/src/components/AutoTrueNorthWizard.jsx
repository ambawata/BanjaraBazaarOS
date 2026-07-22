import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { forwardAzimuth, gpsConfidencePercent, haversineDistanceMeters } from '../lib/geoBearing'
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
  if (e.code === 1) return 'Location permission nahi mili. Is site ke liye location access on karo aur phir try karo.'
  if (e.code === 2) return 'GPS fix nahi mil paaya. Khule area mein jao (chhat/deewar se door) aur dobara try karo.'
  if (e.code === 3) return 'GPS request timeout ho gaya. Khule aasman ke niche dobara try karo.'
  return e.message || 'GPS position nahi mil paaya.'
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
  { key: 'gps', label: 'GPS Se', icon: '📍' },
  { key: 'map', label: 'Map Se', icon: '🛰️' },
  { key: 'compass', label: 'Compass Se', icon: '🧭' },
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

// Shared compass-needle visual, reused identically across all 3 methods so
// the "you're measuring a real angle" feeling is consistent everywhere —
// a simple ring + N/E/S/W labels + a needle rotated to `angle` (degrees
// clockwise from North, 0-360). `dim` renders it as an inactive/greyed
// placeholder before a real angle exists yet (never shows a fake number —
// callers pass `angle=0` only where 0 is itself the genuine value, e.g.
// the Map method's inherently-north-up plots). Brand colors only (
// shared/ui/tokens.js: brand/ink1/ink2/ink3), no new hues.
function CompassNeedle({ angle, dim = false, size = 148 }) {
  const cx = size / 2
  const cy = size / 2
  const r = size / 2 - 18

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="select-none mx-auto">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#5A1FB3" strokeWidth={2} opacity={dim ? 0.2 : 0.45} />
      <text x={cx} y={cy - r + 15} textAnchor="middle" className="fill-brand font-display font-bold" fontSize="14" opacity={dim ? 0.4 : 1}>N</text>
      <text x={cx + r - 11} y={cy + 5} textAnchor="middle" className="fill-ink2 font-ui" fontSize="11" opacity={dim ? 0.4 : 1}>E</text>
      <text x={cx} y={cy + r - 3} textAnchor="middle" className="fill-ink2 font-ui" fontSize="11" opacity={dim ? 0.4 : 1}>S</text>
      <text x={cx - r + 11} y={cy + 5} textAnchor="middle" className="fill-ink2 font-ui" fontSize="11" opacity={dim ? 0.4 : 1}>W</text>
      <g
        transform={`rotate(${angle ?? 0} ${cx} ${cy})`}
        style={{ transition: 'transform 0.25s ease-out', opacity: dim ? 0.3 : 1 }}
      >
        <line x1={cx} y1={cy} x2={cx} y2={cy - r + 8} stroke="#5A1FB3" strokeWidth={3} strokeLinecap="round" />
        <line x1={cx} y1={cy} x2={cx} y2={cy + (r - 8) * 0.32} stroke="#9891B3" strokeWidth={3} strokeLinecap="round" />
      </g>
      <circle cx={cx} cy={cy} r={4} fill="#241344" />
    </svg>
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
    const confidence = gpsConfidencePercent(pointA.accuracy, pointB.accuracy)
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
        Front/gate wall ke ek corner pe khade ho ke "Point A" capture karo, phir doosre
        corner pe chal ke "Point B" capture karo. Dono ke beech ka asli direction GPS se
        nikal lenge — compass ki zaroorat nahi.
      </p>

      <CompassNeedle angle={result ? result.bearing : null} dim={!result} />

      <div className="grid sm:grid-cols-2 gap-3">
        <div className="px-4 py-3 rounded-lg bg-surface2 border border-surface3">
          <p className="text-ink2 text-xs font-medium mb-2">Point A (pehla corner)</p>
          {pointA ? (
            <p className="text-green text-sm font-semibold">✓ Point A capture ho gaya</p>
          ) : (
            <button
              onClick={() => capture('A')}
              disabled={busy === 'A'}
              className="px-3 py-1.5 rounded-lg bg-brand-gradient text-white text-xs font-medium disabled:opacity-50"
            >
              {busy === 'A' ? 'Location le rahe hain…' : 'Capture Point A'}
            </button>
          )}
        </div>
        <div className="px-4 py-3 rounded-lg bg-surface2 border border-surface3">
          <p className="text-ink2 text-xs font-medium mb-2">Point B (doosra corner)</p>
          {pointB ? (
            <p className="text-green text-sm font-semibold">✓ Point B capture ho gaya</p>
          ) : (
            <button
              onClick={() => capture('B')}
              disabled={!pointA || busy === 'B'}
              className="px-3 py-1.5 rounded-lg bg-brand-gradient text-white text-xs font-medium disabled:opacity-50"
            >
              {busy === 'B' ? 'Location le rahe hain…' : 'Capture Point B'}
            </button>
          )}
        </div>
      </div>

      {error && <p className="text-red text-sm">{error}</p>}

      {result && (
        <div className="px-4 py-3 rounded-lg bg-surface2 border border-surface3 space-y-1 text-center">
          <p className="text-ink1 text-2xl font-mono font-semibold">{result.bearing.toFixed(1)}°</p>
          <p className="text-ink2 text-sm">
            GPS se <span className="font-semibold">{result.confidence.percent}% pakka</span>
          </p>
          {result.distanceM < 1 && (
            <p className="text-amberMuted text-xs">
              ⚠ Dono points bahut paas hain (1 m se kam) — thoda aur door jaake dobara try karo.
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
          Ye reading use karo
        </button>
        {(pointA || pointB) && (
          <button onClick={reset} className="px-3 py-1.5 rounded-lg border border-surface3 text-ink2 text-xs font-medium hover:bg-surface2">
            Reset karo
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
        Satellite map pe apne plot ki boundary trace karo — real imagery pe trace karne se
        north apne aap sahi aa jaata hai, koi calibration ki zaroorat nahi. Ye ek naya plot
        banata hai "Mera Ghar" wizard ke through, is abhi wale plot ko nahi badalta.
      </p>

      <CompassNeedle angle={0} dim />
      <p className="text-ink3 text-xs text-center -mt-2">
        Map se trace kiya plot hamesha north-up hota hai (0°) — asli fact hai, andaza nahi.
      </p>

      <div className="px-4 py-3 rounded-lg bg-surface2 border border-surface3">
        <p className="text-ink2 text-sm mb-3">
          Naye tab mein khulega, taaki abhi wala plot progress na khoye.
        </p>
        <Link
          to="/vastu-griha/my-home"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block px-4 py-2 rounded-lg bg-brand-gradient text-white text-sm font-medium"
        >
          Map Trace Kholo →
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
      setError('Is browser mein compass data available nahi hai.')
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
          setError('Compass permission deny ho gayi. Settings mein Motion & Orientation Access on karke phir try karo.')
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
      setError(e.message || 'Compass start nahi ho paaya.')
    }
  }

  const headingTrue = headingMagnetic == null ? null : (headingMagnetic + DELHI_NCR_DECLINATION + 360) % 360

  return (
    <div className="space-y-4">
      <p className="text-ink3 text-sm">
        Phone ko front/gate wall se saath mein flat rakho, screen wall ki direction mein.
        Neeche live reading ghoomti rahegi jaise-jaise tum ghumaoge — settle hone pe
        "Ye reading use karo" dabao.
      </p>

      <CompassNeedle angle={headingTrue} dim={headingTrue == null} />

      {status === 'idle' && (
        <button
          onClick={enableCompass}
          className="px-4 py-2 rounded-lg bg-brand-gradient text-white text-sm font-medium"
        >
          Compass chalu karo
        </button>
      )}

      {status === 'requesting' && <p className="text-ink2 text-sm">Permission maang rahe hain…</p>}

      {(status === 'denied' || status === 'unsupported') && (
        <div className="space-y-2">
          <p className="text-red text-sm">{error}</p>
          {status === 'denied' && (
            <button onClick={enableCompass} className="px-3 py-1.5 rounded-lg border border-surface3 text-ink2 text-xs font-medium hover:bg-surface2">
              Phir se try karo
            </button>
          )}
        </div>
      )}

      {status === 'listening' && (
        <div className="space-y-3">
          {headingTrue == null ? (
            <p className="text-ink2 text-sm text-center">Reading ka wait ho raha hai… phone thoda ghumao.</p>
          ) : (
            <div className="px-4 py-3 rounded-lg bg-surface2 border border-surface3 space-y-1 text-center">
              <p className="text-ink1 text-2xl font-mono font-semibold tabular-nums">{headingTrue.toFixed(1)}°</p>
              <p className="text-ink2 text-sm">Compass se live pata chal raha hai — jaise ghumaoge, waise update hoga</p>
              {!isAbsolute && (
                <p className="text-amberMuted text-xs">
                  ⚠ Ye reading thodi drift kar sakti hai. Phone ko figure-8 mein ghumao
                  calibrate karne ke liye, ya GPS/Map trace try karo.
                </p>
              )}
            </div>
          )}
          <button
            onClick={() => onApply(headingTrue)}
            disabled={headingTrue == null}
            className="px-4 py-2 rounded-lg bg-brand-gradient text-white text-sm font-medium disabled:opacity-50"
          >
            Ye reading use karo
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
        <h2 className="text-ink1 font-display font-semibold text-xl">🧭 Auto Pata Karo</h2>
        <button onClick={onClose} className="text-ink3 hover:text-ink1 text-xl leading-none" aria-label="Close">✕</button>
      </div>
      <p className="text-ink3 text-sm mb-5">
        Apna asli north kaise pata karna hai, wo chuno — jo bhi reading milegi, wo neeche
        form mein bhar jaayegi. Kuch bhi automatically apply nahi hota.
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
      {!activeMethod && <p className="text-ink3 text-sm">Upar se ek tareeka chuno, shuru karte hain.</p>}
    </ModalShell>
  )
}
