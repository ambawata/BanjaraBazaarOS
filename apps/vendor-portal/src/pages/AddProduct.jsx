import { useState } from 'react'
import { useStore } from '../store/useStore'
import { useNavigate } from 'react-router-dom'

const CATEGORIES = ['Home Decor', 'Furniture', 'Crockery', 'Furnishing', 'Fiber Statue', 'Outdoor', 'Plants']

export default function AddProduct() {
  const { addProduct, addToast } = useStore()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    name: '', category: '', description: '', material: '', dimensions: '', basePrice: '',
  })
  const [photos, setPhotos] = useState([]) // placeholder
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const validate = () => {
    const e = {}
    if (!form.name.trim()) e.name = 'Required'
    if (!form.category) e.category = 'Required'
    if (!form.basePrice || isNaN(Number(form.basePrice)) || Number(form.basePrice) <= 0) e.basePrice = 'Enter a valid price'
    return e
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const e2 = validate()
    if (Object.keys(e2).length) { setErrors(e2); return }
    setSubmitting(true)
    setTimeout(() => {
      addProduct({ ...form, basePrice: Number(form.basePrice), stock: 0 })
      addToast('Product submitted for approval!', 'success')
      navigate('/products')
      setSubmitting(false)
    }, 500)
  }

  const field = (label, key, type = 'text', placeholder = '') => (
    <div>
      <label className="block text-ink2 text-sm mb-1.5">{label}</label>
      <input
        type={type}
        value={form[key]}
        onChange={e => set(key, e.target.value)}
        placeholder={placeholder}
        className={`w-full bg-surface2 border rounded-lg px-3 py-2.5 text-ink1 text-sm placeholder-ink3 focus:outline-none focus:border-brand transition-colors ${errors[key] ? 'border-red' : 'border-surface3'}`}
      />
      {errors[key] && <p className="text-red text-xs mt-1">{errors[key]}</p>}
    </div>
  )

  return (
    <div className="max-w-2xl">
      <div className="bg-surface rounded-xl border border-surface3 p-6 space-y-5">
        <div>
          <h2 className="text-ink1 font-semibold">New Product</h2>
          <p className="text-ink3 text-xs mt-0.5">Submitted products go to admin review before listing.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {field('Product Name *', 'name', 'text', 'e.g. Terracotta Wall Hanging')}

          {/* Category */}
          <div>
            <label className="block text-ink2 text-sm mb-1.5">Category *</label>
            <select
              value={form.category}
              onChange={e => set('category', e.target.value)}
              className={`w-full bg-surface2 border rounded-lg px-3 py-2.5 text-ink1 text-sm focus:outline-none focus:border-brand transition-colors ${errors.category ? 'border-red' : 'border-surface3'}`}
            >
              <option value="">Select category…</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            {errors.category && <p className="text-red text-xs mt-1">{errors.category}</p>}
          </div>

          {/* Description */}
          <div>
            <label className="block text-ink2 text-sm mb-1.5">Description</label>
            <textarea
              value={form.description}
              onChange={e => set('description', e.target.value)}
              rows={3}
              placeholder="Describe the product…"
              className="w-full bg-surface2 border border-surface3 rounded-lg px-3 py-2.5 text-ink1 text-sm placeholder-ink3 focus:outline-none focus:border-brand resize-none transition-colors"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {field('Material', 'material', 'text', 'e.g. Terracotta, Wood')}
            {field('Dimensions', 'dimensions', 'text', 'e.g. 12" x 8" x 4"')}
          </div>

          {/* Base price — vendor sets their base price only */}
          <div>
            <label className="block text-ink2 text-sm mb-1.5">Base Price (₹) *</label>
            <input
              type="number"
              min="1"
              value={form.basePrice}
              onChange={e => set('basePrice', e.target.value)}
              placeholder="Your cost / base price"
              className={`w-full bg-surface2 border rounded-lg px-3 py-2.5 text-ink1 text-sm placeholder-ink3 focus:outline-none focus:border-brand transition-colors font-mono ${errors.basePrice ? 'border-red' : 'border-surface3'}`}
            />
            {errors.basePrice && <p className="text-red text-xs mt-1">{errors.basePrice}</p>}
            <p className="text-ink3 text-xs mt-1">Selling price is set by BanjaraBazaar admin.</p>
          </div>

          {/* Photo upload placeholder */}
          <div>
            <label className="block text-ink2 text-sm mb-1.5">Photos (max 4)</label>
            <div className="grid grid-cols-4 gap-2">
              {[1, 2, 3, 4].map(i => (
                <div
                  key={i}
                  className="aspect-square rounded-lg border-2 border-dashed border-surface3 flex flex-col items-center justify-center text-ink3 text-xs hover:border-brand cursor-pointer transition-colors"
                >
                  <span className="text-2xl mb-1">+</span>
                  Photo {i}
                </div>
              ))}
            </div>
            <p className="text-ink3 text-xs mt-1">JPG/PNG, max 5 MB each</p>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 bg-brand hover:bg-brand/90 text-white font-medium rounded-lg text-sm transition-colors disabled:opacity-60"
            >
              {submitting ? 'Submitting…' : 'Submit for Approval'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/products')}
              className="px-6 py-2.5 bg-surface2 text-ink2 hover:text-ink1 rounded-lg text-sm transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
