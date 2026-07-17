// Minimal fetch-based API client for /api/v1/vastu-geometry/*.
//
// No axios/fetch-wrapper convention exists elsewhere in this repo yet
// (admin-panel and vendor-portal are both pure mock-data/zustand — see
// research notes in this module's PR). This introduces the first one,
// using native fetch (already a hard dependency of every target browser
// Vite builds for) rather than adding a new package. Token storage key
// ('bb-token') mirrors the existing 'bb-theme' localStorage convention
// used by admin-panel/src/App.jsx.

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'
const TOKEN_KEY = 'bb-token'

export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token)
  else localStorage.removeItem(TOKEN_KEY)
}

async function request(method, path, body) {
  const headers = { 'Content-Type': 'application/json' }
  const token = getToken()
  if (token) headers.Authorization = `Bearer ${token}`

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  const payload = await res.json().catch(() => null)

  if (!res.ok) {
    const message = payload?.message || `Request failed (${res.status})`
    const error = new Error(message)
    error.status = res.status
    error.errors = payload?.meta?.errors || null
    throw error
  }

  return payload?.data
}

export const vastuGeometryApi = {
  createPlot: (payload) => request('POST', '/api/v1/vastu-geometry/plots', payload),
  addWalls: (plotId, payload) => request('POST', `/api/v1/vastu-geometry/plots/${plotId}/walls`, payload),
  addRoom: (plotId, payload) => request('POST', `/api/v1/vastu-geometry/plots/${plotId}/rooms`, payload),
  addDoor: (plotId, payload) => request('POST', `/api/v1/vastu-geometry/plots/${plotId}/doors`, payload),
  calibrate: (plotId, payload) => request('POST', `/api/v1/vastu-geometry/plots/${plotId}/calibrate`, payload),
  getFull: (plotId) => request('GET', `/api/v1/vastu-geometry/plots/${plotId}/full`),
}
