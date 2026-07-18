import { useState } from 'react'
import { adminApi, setSession } from '../lib/api'

// Real login gate — admin-panel had none at all before this (this file
// existed but was dead code, part of an unused pages/+store/useStore.js
// tree never imported by the live App.jsx — see
// docs/LEGACY_VANILLA_HTML_REFERENCE.md). Without a way to obtain a token,
// Vendor Directory/Approval Queue's real API wiring could never succeed
// (every request would 401), so this had to be added even though the task
// scope only named the two data screens — flagged in the PR description as
// a necessary addition, not scope creep for its own sake.
export default function Login({ onLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const result = await adminApi.login(email, password)
      setSession(result.access_token, result.refresh_token, result.user?.name)
      onLogin()
    } catch (err) {
      setError(err.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-brand flex items-center justify-center">
            <span className="text-white font-bold text-lg">BB</span>
          </div>
          <div>
            <p className="text-ink1 font-semibold text-lg leading-none">BanjaraBazaar</p>
            <p className="text-ink3 text-xs mt-0.5">Admin Panel</p>
          </div>
        </div>

        {/* Card */}
        <div className="bg-surface rounded-2xl border border-surface3 p-8">
          <h2 className="text-ink1 font-semibold text-xl mb-1">Sign in</h2>
          <p className="text-ink3 text-sm mb-6">Admin access only</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-ink2 text-sm mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full bg-surface2 border border-surface3 rounded-lg px-3 py-2.5 text-ink1 text-sm placeholder-ink3 focus:outline-none focus:border-brand transition-colors"
                required
              />
            </div>
            <div>
              <label className="block text-ink2 text-sm mb-1.5">Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full bg-surface2 border border-surface3 rounded-lg px-3 py-2.5 text-ink1 text-sm placeholder-ink3 focus:outline-none focus:border-brand transition-colors"
                placeholder="••••••••"
                required
              />
            </div>

            {error && (
              <p className="text-red text-sm">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand hover:bg-brand/90 text-white font-medium py-2.5 rounded-lg text-sm transition-colors disabled:opacity-60"
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
