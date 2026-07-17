import { NOMINATIM_SEARCH_URL, GEOCODE_CACHE_MAX_ENTRIES } from '../config/onboarding'

// Small in-memory cache — keyed by the exact search string. Cleared on
// page reload (no localStorage persistence needed for this use case; the
// point is avoiding repeat calls within one search session, not long-term
// caching). See config/onboarding.js for the Nominatim rate-limit context
// this exists to respect.
const cache = new Map()

/**
 * Searches Nominatim for an address. Caller is responsible for debouncing
 * (see useDebouncedValue in MyHomeWizardPage.jsx) — this function itself
 * does not rate-limit, it just avoids a duplicate network call for a
 * query string already seen this session.
 *
 * @returns {Promise<Array<{lat: number, lng: number, displayName: string}>>}
 */
export async function searchAddress(query) {
  const trimmed = query.trim()
  if (trimmed.length < 3) return []

  if (cache.has(trimmed)) {
    return cache.get(trimmed)
  }

  const url = new URL(NOMINATIM_SEARCH_URL)
  url.searchParams.set('q', trimmed)
  url.searchParams.set('format', 'jsonv2')
  url.searchParams.set('limit', '5')
  // Nominatim's usage policy asks for a way to identify/contact the
  // requester when a custom User-Agent isn't possible (browsers block
  // fetch() from overriding User-Agent) — see config/onboarding.js note.
  url.searchParams.set('email', 'dev@banjarabazaar.online')

  const res = await fetch(url.toString())
  if (!res.ok) {
    throw new Error(`Address search failed (${res.status})`)
  }

  const raw = await res.json()
  const results = raw.map(r => ({
    lat: parseFloat(r.lat),
    lng: parseFloat(r.lon),
    displayName: r.display_name,
  }))

  if (cache.size >= GEOCODE_CACHE_MAX_ENTRIES) {
    const oldestKey = cache.keys().next().value
    cache.delete(oldestKey)
  }
  cache.set(trimmed, results)

  return results
}

/**
 * Browser geolocation — the "Mera location use karo" fast-path alternative
 * to typing an address.
 *
 * @returns {Promise<{lat: number, lng: number}>}
 */
export function getBrowserLocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Is device/browser mein location feature nahi hai.'))
      return
    }
    navigator.geolocation.getCurrentPosition(
      pos => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      err => reject(new Error(err.message || 'Location nahi mil paayi.')),
      { enableHighAccuracy: true, timeout: 10000 }
    )
  })
}
