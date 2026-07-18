import { useState } from 'react'
import { vendorApi } from '../lib/api'

const BUSINESS_TYPES = ['Individual', 'Proprietorship', 'Partnership', 'Private Limited', 'LLP']

const emptyForm = {
  full_name: '',
  email: '',
  phone: '',
  password: '',
  business_name: '',
  gst_number: '',
  business_type: '',
  city: '',
  state: '',
}

// Vendor registration/onboarding — did not exist at all in the old React
// app (only 7 pages: AddProduct, Dashboard, DeadStockAlerts, Earnings,
// Login, MyProducts, Profile — no Register/Onboarding). This is new work,
// not a "replace the mock" migration, per
// docs/LEGACY_VANILLA_HTML_REFERENCE.md's note that only login/onboarding
// were ever real in the vanilla pivot. Field set covers the backend's
// required-by-default validations (see
// VendorService::validateApplicationPayload) plus the most commonly
// needed optional ones (business_type, city, state) — not every optional
// field (pan_number, website, second address line, separate business
// contact) to keep the form practical; those can be added later if wanted.
export default function Register({ onBack }) {
  const [form, setForm] = useState(emptyForm)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const update = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setFieldErrors({})
    try {
      await vendorApi.register(form)
      setSubmitted(true)
    } catch (err) {
      setError(err.message || 'Registration failed')
      if (err.fieldErrors) setFieldErrors(err.fieldErrors)
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center p-4">
        <div className="w-full max-w-sm bg-surface rounded-2xl border border-surface3 p-8 text-center">
          <div className="w-12 h-12 rounded-full bg-greenDim flex items-center justify-center mx-auto mb-4">
            <span className="text-green text-xl">✓</span>
          </div>
          <h2 className="text-ink1 font-semibold text-xl mb-2">Application submitted</h2>
          <p className="text-ink3 text-sm mb-6">
            Your vendor application is pending admin approval. You'll be able to sign in
            once it's approved — you'll need to log in again after approval to pick up
            your vendor access.
          </p>
          <button onClick={onBack} className="w-full bg-brand hover:bg-brand/90 text-white font-medium py-2.5 rounded-lg text-sm transition-colors">
            Back to login
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-4 py-10">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-brand flex items-center justify-center">
            <span className="text-white font-bold text-lg">BB</span>
          </div>
          <div>
            <p className="text-ink1 font-semibold text-lg leading-none">BanjaraBazaar</p>
            <p className="text-ink3 text-xs mt-0.5">Become a Vendor</p>
          </div>
        </div>

        <div className="bg-surface rounded-2xl border border-surface3 p-8">
          <h2 className="text-ink1 font-semibold text-xl mb-1">Vendor Application</h2>
          <p className="text-ink3 text-sm mb-6">Tell us about your business to get started</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Field label="Your Name" value={form.full_name} onChange={update('full_name')} fieldError={fieldErrors.full_name} required />
            <Field label="Email" type="email" value={form.email} onChange={update('email')} fieldError={fieldErrors.email} required />
            <Field label="Phone" value={form.phone} onChange={update('phone')} fieldError={fieldErrors.phone} required />
            <Field label="Password" type="password" value={form.password} onChange={update('password')} fieldError={fieldErrors.password} required />
            <Field label="Business Name" value={form.business_name} onChange={update('business_name')} fieldError={fieldErrors.business_name} required />
            <Field label="GSTIN" value={form.gst_number} onChange={update('gst_number')} fieldError={fieldErrors.gst_number} placeholder="27AABCU9603R1ZM" required />

            <div>
              <label className="block text-ink2 text-sm mb-1.5">Business Type</label>
              <select
                value={form.business_type}
                onChange={update('business_type')}
                className="w-full bg-surface2 border border-surface3 rounded-lg px-3 py-2.5 text-ink1 text-sm focus:outline-none focus:border-brand transition-colors"
              >
                <option value="">Select…</option>
                {BUSINESS_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Field label="City" value={form.city} onChange={update('city')} fieldError={fieldErrors.city} />
              <Field label="State" value={form.state} onChange={update('state')} fieldError={fieldErrors.state} />
            </div>

            {error && <p className="text-red text-sm">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand hover:bg-brand/90 text-white font-medium py-2.5 rounded-lg text-sm transition-colors disabled:opacity-60"
            >
              {loading ? 'Submitting…' : 'Submit Application'}
            </button>
          </form>

          <p className="text-ink3 text-xs text-center mt-5">
            Already a vendor?{' '}
            <button type="button" onClick={onBack} className="text-brand hover:underline">Sign in</button>
          </p>
        </div>
      </div>
    </div>
  )
}

function Field({ label, value, onChange, fieldError, type = 'text', required = false, placeholder }) {
  return (
    <div>
      <label className="block text-ink2 text-sm mb-1.5">{label}</label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        required={required}
        placeholder={placeholder}
        className={`w-full bg-surface2 border rounded-lg px-3 py-2.5 text-ink1 text-sm placeholder-ink3 focus:outline-none focus:border-brand transition-colors ${fieldError ? 'border-red' : 'border-surface3'}`}
      />
      {fieldError && <p className="text-red text-xs mt-1">{fieldError}</p>}
    </div>
  )
}
