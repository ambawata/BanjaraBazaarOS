import { create } from 'zustand'

export const useAuthStore = create((set) => ({
  user: { id: 'AM-001', name: 'Amit Mishra', email: 'amit@example.com', role: 'Owner' },
  token: 'mock-jwt-token-12345',
  isAuthenticated: true,
  setSession: (session) => set({ user: session.user, token: session.token, isAuthenticated: !!session }),
  clearSession: () => set({ user: null, token: null, isAuthenticated: false })
}))
