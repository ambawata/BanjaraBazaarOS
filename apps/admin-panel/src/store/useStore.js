import { create } from 'zustand'
import { mockVendors, mockProducts, mockApprovals, mockDeadStock, mockSettlements, mockAuditLogs } from '../data/mockData'

export const useStore = create((set, get) => ({
  // Auth
  user: null,
  login: (email, password) => {
    if (email === 'admin@bb.com' && password === 'admin123') {
      set({ user: { name: 'Admin', email, role: 'superadmin' } })
      return true
    }
    return false
  },
  logout: () => set({ user: null }),

  // Toast
  toasts: [],
  addToast: (msg, type = 'info') => {
    const id = Date.now()
    set(s => ({ toasts: [...s.toasts, { id, msg, type }] }))
    setTimeout(() => get().removeToast(id), 4000)
  },
  removeToast: (id) => set(s => ({ toasts: s.toasts.filter(t => t.id !== id) })),

  // Vendors
  vendors: mockVendors,
  approveVendor: (id) => set(s => ({
    vendors: s.vendors.map(v => v.id === id ? { ...v, status: 'active' } : v)
  })),
  rejectVendor: (id) => set(s => ({
    vendors: s.vendors.map(v => v.id === id ? { ...v, status: 'rejected' } : v)
  })),

  // Products / Approvals
  approvals: mockApprovals,
  approveProduct: (id) => set(s => ({
    approvals: s.approvals.map(p => p.id === id ? { ...p, status: 'approved' } : p)
  })),
  rejectProduct: (id, reason) => set(s => ({
    approvals: s.approvals.map(p => p.id === id ? { ...p, status: 'rejected', rejectReason: reason } : p)
  })),

  // Products
  products: mockProducts,

  // Dead stock
  deadStock: mockDeadStock,
  flagDeadStock: (id) => set(s => ({
    deadStock: s.deadStock.map(p => p.id === id ? { ...p, flagged: true } : p)
  })),

  // Settlements
  settlements: mockSettlements,
  markSettled: (id) => set(s => ({
    settlements: s.settlements.map(v => v.id === id ? { ...v, status: 'settled' } : v)
  })),

  // Audit Logs
  auditLogs: mockAuditLogs,
}))
