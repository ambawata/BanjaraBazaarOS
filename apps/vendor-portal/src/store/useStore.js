import { create } from 'zustand'
import { mockVendor, mockProducts, mockSettlements } from '../data/mockData'
import { clearSession } from '../lib/api'

export const useStore = create((set, get) => ({
  // Auth
  vendor: null,
  // Real login now happens in pages/Login.jsx (calls vendorApi.login
  // directly, same as apps/admin-panel's Login.jsx) — this action only
  // sets the resulting session, it doesn't call the API itself. Per
  // docs/LEGACY_VANILLA_HTML_REFERENCE.md, only login/registration are
  // real; the rest of the app (dashboard stats, products, settlements)
  // stays on mock data — so `vendor` is the existing mockVendor object
  // with just the identity fields (name, email) overwritten with the real
  // logged-in user's actual values, rather than replaced outright. This is
  // a deliberate, disclosed compromise: real name/email display, mock
  // business data everywhere else, since no "get my vendor profile"
  // endpoint is part of this task's documented scope.
  setVendorSession: (user) => set({
    vendor: { ...mockVendor, ownerName: user.name, email: user.email },
  }),
  logout: () => { clearSession(); set({ vendor: null }) },

  // Toast
  toasts: [],
  addToast: (msg, type = 'info') => {
    const id = Date.now()
    set(s => ({ toasts: [...s.toasts, { id, msg, type }] }))
    setTimeout(() => get().removeToast(id), 4500)
  },
  removeToast: (id) => set(s => ({ toasts: s.toasts.filter(t => t.id !== id) })),

  // Products
  products: mockProducts,
  addProduct: (product) => {
    const sku = `RCD-${product.category.slice(0,2).toUpperCase()}-${String(Date.now()).slice(-3)}`
    const newProduct = {
      id: `P${Date.now()}`,
      sku,
      ...product,
      status: 'pending',
      submittedAt: new Date().toISOString().split('T')[0],
      lastSoldAt: null,
      daysSinceLastSale: null,
    }
    set(s => ({ products: [newProduct, ...s.products] }))
  },

  // Dead stock actions
  requestPickup: (id) => {
    set(s => ({
      products: s.products.map(p => p.id === id ? { ...p, deadStockAction: 'pickup_requested' } : p)
    }))
  },
  acceptMarkdown: (id) => {
    set(s => ({
      products: s.products.map(p =>
        p.id === id ? { ...p, deadStockAction: 'markdown_accepted', basePrice: Math.round(p.basePrice * 0.7) } : p
      )
    }))
  },

  // Settlements
  settlements: mockSettlements,
}))
