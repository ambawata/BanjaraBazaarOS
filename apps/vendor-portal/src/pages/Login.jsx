import { useState } from 'react'
import { useStore } from '../store/useStore'

export default function Login() {
  const { login, addToast } = useStore()
  const [email, setEmail] = useState('riya@riyacrafts.com')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setTimeout(() => {
      const ok = login(email, password)
      if (!ok) setError('Invalid credentials')
      setLoading(false)
    }, 400)
  }

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-brand flex items-center justify-center">
            <span className="text-white font-bold text-lg">BB</span>
          </div>
          <div>
            <p className="text-ink1 font-semibold text-lg leading-none">BanjaraBazaar</p>
            <p className="text-ink3 text-xs mt-0.5">Vendor Portal</p>
          </div>
        </div>

        <div className="bg-surface rounded-2xl border border-surface3 p-8">
          <h2 className="text-ink1 font-semibold text-xl mb-1">Vendor Login</h2>
          <p className="text-ink3 text-sm mb-6">Sign in to manage your store</p>

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
            {error && <p className="text-red text-sm">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand hover:bg-brand/90 text-white font-medium py-2.5 rounded-lg text-sm transition-colors disabled:opacity-60"
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
          <p className="text-ink3 text-xs text-center mt-5">Demo: riya@riyacrafts.com / vendor123</p>
        </div>
      </div>
    </div>
  )
}
