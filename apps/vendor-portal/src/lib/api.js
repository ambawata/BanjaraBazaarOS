// Real API client for vendor-portal — restores the production wiring that
// existed in the discarded vanilla-HTML pivot (see
// docs/LEGACY_VANILLA_HTML_REFERENCE.md) for Login + vendor registration,
// lost when the old React app was restored in PR #6. Same
// apiFetch/getToken/setSession shape as that doc documents (same as
// admin-panel's apps/admin-panel/src/lib/api.js, different key prefix) and
// the same native-fetch convention apps/vastu-griha/src/lib/api.js
// established.
const API_BASE = 'https://api.banjaramarketgurgaon.com'

const TOKEN_KEY = 'bbv_token'
const REFRESH_KEY = 'bbv_refresh'
const NAME_KEY = 'bbv_name'

export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function setSession(access, refresh, name) {
  localStorage.setItem(TOKEN_KEY, access)
  localStorage.setItem(REFRESH_KEY, refresh)
  localStorage.setItem(NAME_KEY, name || '')
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(REFRESH_KEY)
  localStorage.removeItem(NAME_KEY)
}

async function apiFetch(path, opts = {}) {
  const headers = { 'Content-Type': 'application/json', ...(opts.headers || {}) }
  const token = getToken()
  if (token) headers.Authorization = `Bearer ${token}`

  const res = await fetch(API_BASE + path, { ...opts, headers })
  const body = await res.json().catch(() => ({}))

  if (!res.ok) {
    const error = new Error(body.message || body.error || `Request failed (${res.status})`)
    error.status = res.status
    // Real backend returns field-level validation errors as
    // { errors: { field: message } } inside the error body for 422s (see
    // VendorService::validateApplicationPayload on the backend) — surface
    // them for the registration form to show per-field, not just a single
    // generic message.
    error.fieldErrors = body.errors || null
    throw error
  }

  return body.data
}

export const vendorApi = {
  login: (email, password) =>
    apiFetch('/api/v1/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),

  // Real backend requires admin approval before the `vendor` role is
  // granted (see docs/LEGACY_VANILLA_HTML_REFERENCE.md gotcha #2) — a
  // freshly-registered vendor is NOT logged in automatically here; they're
  // shown a "pending approval" message and sent back to Login, matching
  // that documented backend behavior rather than assuming immediate access.
  register: (payload) =>
    apiFetch('/api/v1/vendors/register', { method: 'POST', body: JSON.stringify(payload) }),
}
