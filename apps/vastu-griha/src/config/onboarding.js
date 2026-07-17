// Business thresholds / third-party config for the consumer "My Home"
// wizard — named constants rather than magic numbers scattered through
// components, per task constraint. Frontend has no DB-backed
// SettingsService equivalent (that's a backend-only concept — see
// backend/services/SettingsService.php), so this file is the frontend's
// analogous single place to change these values.

// Mirrors backend `vastu_onboarding.min_corners` setting default (see
// VastuMapOnboardingService::createPlotFromMap) — kept in sync manually
// since there's no shared-config mechanism between PHP and this Vite app
// yet. The backend is still the authority: it will reject <3 corners
// itself even if this constant ever drifts.
export const MIN_CORNERS = 3

// Nominatim (OSM's free geocoding search) usage policy caps public
// requests to ~1/sec and requires a descriptive User-Agent — see
// https://operations.osmfoundation.org/policies/nominatim/. Debouncing
// keystrokes is the client-side mitigation; this constant is that debounce
// window.
export const GEOCODE_DEBOUNCE_MS = 800

// KNOWN SCALING LIMITATION (flagged per task instruction, not a bug to fix
// now): Nominatim's public instance is a shared, rate-limited free
// service not meant for high-traffic production use. This app has a large
// Instagram-driven audience; if/when address search volume grows, this
// should move to either a self-hosted Nominatim instance or a paid
// geocoder (Google Places, Mapbox, etc.) — swapping is contained to
// geocodeAddress() in mapOnboardingClient.js, nothing else in this wizard
// depends on Nominatim's specific response shape beyond {lat, lon,
// display_name}.
export const NOMINATIM_SEARCH_URL = 'https://nominatim.openstreetmap.org/search'
export const NOMINATIM_USER_AGENT_HEADER_NOTE =
  'Nominatim requires a descriptive User-Agent per their usage policy — browsers ' +
  'do not allow overriding the User-Agent header from client-side fetch(), so this ' +
  'is sent as the "email" query param instead (their documented browser-side fallback) ' +
  'plus a Referer the browser sets automatically.'

export const ESRI_WORLD_IMAGERY_URL =
  'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
export const ESRI_WORLD_IMAGERY_ATTRIBUTION =
  'Tiles &copy; Esri &mdash; Source: Esri, Maxar, Earthstar Geographics, and the GIS User Community'

export const OSM_TILE_URL = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
export const OSM_ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'

export const DEFAULT_MAP_CENTER = { lat: 20.5937, lng: 78.9629 } // India, roughly centered
export const DEFAULT_MAP_ZOOM = 5
export const TRACE_ZOOM = 19 // close enough to actually see individual plot corners

// Geocode result cache — same debounce/rate-limit concern above; avoids
// re-hitting Nominatim for a query the user already searched this session.
export const GEOCODE_CACHE_MAX_ENTRIES = 50
