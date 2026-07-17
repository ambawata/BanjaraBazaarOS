import { useEffect, useRef, useState } from 'react'
import { searchAddress, getBrowserLocation } from '../../lib/nominatim'
import { GEOCODE_DEBOUNCE_MS } from '../../config/onboarding'

export default function AddressSearchStep({ onLocationChosen }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [searching, setSearching] = useState(false)
  const [locating, setLocating] = useState(false)
  const [error, setError] = useState(null)
  const debounceTimer = useRef(null)

  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current)

    if (query.trim().length < 3) {
      setResults([])
      return
    }

    // Debounced per Nominatim's ~1 req/sec usage policy — see
    // config/onboarding.js GEOCODE_DEBOUNCE_MS for the scaling-limitation
    // note (self-host or swap to a paid geocoder if traffic grows).
    debounceTimer.current = setTimeout(async () => {
      setSearching(true)
      setError(null)
      try {
        const found = await searchAddress(query)
        setResults(found)
      } catch (e) {
        setError('Address search abhi kaam nahi kar raha. Thodi der baad try karo.')
      } finally {
        setSearching(false)
      }
    }, GEOCODE_DEBOUNCE_MS)

    return () => clearTimeout(debounceTimer.current)
  }, [query])

  async function handleUseMyLocation() {
    setLocating(true)
    setError(null)
    try {
      const loc = await getBrowserLocation()
      onLocationChosen(loc, 'Aapki current location')
    } catch (e) {
      setError(e.message)
    } finally {
      setLocating(false)
    }
  }

  return (
    <div className="max-w-lg mx-auto space-y-5 px-4">
      <div className="text-center space-y-1">
        <h1 className="text-ink1 text-2xl font-bold">Apna ghar dhoondo</h1>
        <p className="text-ink3 text-sm">Find your home on the map</p>
      </div>

      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Apna address type karo..."
          className="w-full px-4 py-4 rounded-xl border-2 border-surface3 bg-surface text-ink1 text-base focus:outline-none focus:border-brand"
          autoFocus
        />
        {searching && (
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-ink3 text-xs">…</span>
        )}
      </div>

      {results.length > 0 && (
        <div className="bg-surface border border-surface3 rounded-xl divide-y divide-surface3 overflow-hidden">
          {results.map((r, i) => (
            <button
              key={i}
              onClick={() => onLocationChosen({ lat: r.lat, lng: r.lng }, r.displayName)}
              className="w-full text-left px-4 py-3 hover:bg-surface2 text-sm text-ink2"
            >
              📍 {r.displayName}
            </button>
          ))}
        </div>
      )}

      {error && <p className="text-red text-sm text-center">{error}</p>}

      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-surface3" />
        <span className="text-ink3 text-xs">ya</span>
        <div className="flex-1 h-px bg-surface3" />
      </div>

      <button
        onClick={handleUseMyLocation}
        disabled={locating}
        className="w-full py-4 rounded-xl bg-brand-gradient text-white text-base font-semibold disabled:opacity-50"
      >
        {locating ? 'Location dhoondh rahe hain…' : '📍 Mera location use karo'}
      </button>
    </div>
  )
}
