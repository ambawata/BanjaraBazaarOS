import { create } from 'zustand'
import { mockVendor, mockProducts, mockSettlements } from '../data/mockData'

export const useStore = create((set, get) => ({
  // Auth
  vendor: null,
  login: (email, password) => {
    if (email === 'riya@riyacrafts.com' && password === 'vendor123') {
      set({ vendor: mockVendor })
      return true
    }
    return false
  },
  logout: () => set({ vendor: null }),

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
