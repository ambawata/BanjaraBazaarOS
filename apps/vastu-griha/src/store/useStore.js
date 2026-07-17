import { create } from 'zustand'
import { vastuGeometryApi } from '../lib/api'

export const useStore = create((set, get) => ({
  // Toast
  toasts: [],
  addToast: (msg, type = 'info') => {
    const id = Date.now() + Math.random()
    set(s => ({ toasts: [...s.toasts, { id, msg, type }] }))
    setTimeout(() => get().removeToast(id), 4500)
  },
  removeToast: (id) => set(s => ({ toasts: s.toasts.filter(t => t.id !== id) })),

  // Geometry state
  plotId: null,
  geometry: null, // { plot, walls, rooms, calibrations }
  loading: false,
  lastCalibrationResult: null,

  reset: () => set({ plotId: null, geometry: null, lastCalibrationResult: null }),

  refresh: async () => {
    const { plotId } = get()
    if (!plotId) return
    set({ loading: true })
    try {
      const geometry = await vastuGeometryApi.getFull(plotId)
      set({ geometry, loading: false })
    } catch (e) {
      set({ loading: false })
      get().addToast(e.message, 'error')
    }
  },

  createPlot: async (payload) => {
    set({ loading: true })
    try {
      const plot = await vastuGeometryApi.createPlot(payload)
      set({ plotId: plot.id, loading: false })
      get().addToast(`Plot "${plot.name}" created.`, 'success')
      await get().refresh()
      return plot
    } catch (e) {
      set({ loading: false })
      get().addToast(e.message, 'error')
      throw e
    }
  },

  addWalls: async (payload) => {
    const { plotId } = get()
    set({ loading: true })
    try {
      const walls = await vastuGeometryApi.addWalls(plotId, payload)
      set({ loading: false })
      get().addToast(`${walls.length} wall(s) added — padas auto-generated.`, 'success')
      await get().refresh()
      return walls
    } catch (e) {
      set({ loading: false })
      get().addToast(e.message, 'error')
      throw e
    }
  },

  addRoom: async (payload) => {
    const { plotId } = get()
    set({ loading: true })
    try {
      const room = await vastuGeometryApi.addRoom(plotId, payload)
      set({ loading: false })
      get().addToast(`Room "${room.name}" added.`, 'success')
      await get().refresh()
      return room
    } catch (e) {
      set({ loading: false })
      get().addToast(e.message, 'error')
      throw e
    }
  },

  addDoor: async (payload) => {
    const { plotId } = get()
    set({ loading: true })
    try {
      const door = await vastuGeometryApi.addDoor(plotId, payload)
      set({ loading: false })
      get().addToast('Door placed and assigned to pada.', 'success')
      await get().refresh()
      return door
    } catch (e) {
      set({ loading: false })
      get().addToast(e.message, 'error')
      throw e
    }
  },

  calibrate: async (payload) => {
    const { plotId } = get()
    set({ loading: true })
    try {
      const result = await vastuGeometryApi.calibrate(plotId, payload)
      set({ loading: false, lastCalibrationResult: result })
      get().addToast(`Calibrated — offset ${result.offset_degrees.toFixed(2)} deg applied to all bearings.`, 'success')
      await get().refresh()
      return result
    } catch (e) {
      set({ loading: false })
      get().addToast(e.message, 'error')
      throw e
    }
  },
}))
