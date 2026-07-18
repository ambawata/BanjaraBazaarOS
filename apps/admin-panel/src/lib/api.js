// Real API client for admin-panel — restores the production wiring that
// existed in the discarded vanilla-HTML pivot (see
// docs/LEGACY_VANILLA_HTML_REFERENCE.md) for Vendor Directory + Approval
// Queue, lost when the old React app was restored in PR #6. Same
// apiFetch/getToken/setSession shape as that doc documents, and the same
// native-fetch convention apps/vastu-griha/src/lib/api.js already
// established (no axios/wrapper package added).
const API_BASE = 'https://api.banjaramarketgurgaon.com'

const TOKEN_KEY = 'bbos_admin_token'
const REFRESH_KEY = 'bbos_admin_refresh'
const NAME_KEY = 'bbos_admin_name'

export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function getAdminName() {
  return localStorage.getItem(NAME_KEY)
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
    throw error
  }

  return body.data
}

export const adminApi = {
  login: (email, password) =>
    apiFetch('/api/v1/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),

  // Vendor Directory
  listVendors: () => apiFetch('/api/v1/vendors/applications'),
  approveVendor: (id) => apiFetch(`/api/v1/vendors/${id}/approve`, { method: 'POST', body: JSON.stringify({}) }),
  rejectVendor: (id, reason) => apiFetch(`/api/v1/vendors/${id}/reject`, { method: 'POST', body: JSON.stringify({ reason }) }),
  suspendVendor: (id, reason) => apiFetch(`/api/v1/vendors/${id}/suspend`, { method: 'POST', body: JSON.stringify({ reason }) }),

  // Approval Queue
  listPendingProducts: () => apiFetch('/api/v1/products/admin/pending?limit=100'),
  approveProduct: (id) => apiFetch(`/api/v1/products/${id}/approve`, { method: 'POST', body: JSON.stringify({}) }),
  rejectProduct: (id, reason) => apiFetch(`/api/v1/products/${id}/reject`, { method: 'POST', body: JSON.stringify({ reason }) }),
}
