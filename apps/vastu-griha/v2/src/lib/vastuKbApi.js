// Vastu Knowledge Engine — API client.
// Talks to the PHP backend's /api/v1/vastu/* routes (backend/services/VastuKbService.php).
// Base URL is configurable because the backend is not bundled with this
// Vite app — set VITE_VASTU_API_BASE to wherever backend/public is deployed.

const API_BASE = import.meta.env.VITE_VASTU_API_BASE || 'http://localhost:8000'

async function getJson(url) {
  const res = await fetch(url)
  const body = await res.json().catch(() => null)
  if (!res.ok || !body || body.status !== 'success') {
    const message = body?.message || `Request failed (${res.status})`
    throw new Error(message)
  }
  return body.data
}

export async function searchVastuKb(query) {
  const url = `${API_BASE}/api/v1/vastu/search?q=${encodeURIComponent(query)}`
  return getJson(url)
}

export async function fetchTopVastuTopics() {
  const url = `${API_BASE}/api/v1/vastu/top-topics`
  return getJson(url)
}
