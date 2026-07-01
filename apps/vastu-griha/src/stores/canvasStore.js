import { create } from 'zustand'
import { useHistoryStore } from './historyStore'
import { useProjectStore } from './projectStore'

let autosaveTimeout = null
const DEBOUNCE_INTERVAL = 1500

const triggerAutosave = (rooms, plot) => {
  if (typeof window === 'undefined') return
  if (autosaveTimeout) clearTimeout(autosaveTimeout)
  
  autosaveTimeout = setTimeout(() => {
    localStorage.setItem('vg-layout-project', JSON.stringify({ rooms, plot }))
  }, DEBOUNCE_INTERVAL)
}

export const useCanvasStore = create((set, get) => ({
  rooms: [],
  boundaryPoints: [],
  imageSettings: {
    url: '',
    scale: 1.0,
    opacity: 0.5,
    rotation: 0,
    xOffset: 0,
    yOffset: 0
  },

  setRooms: (rooms) => {
    set({ rooms })
    const { plot } = useProjectStore.getState()
    triggerAutosave(rooms, plot)
  },

  setBoundaryPoints: (boundaryPoints) => set({ boundaryPoints }),
  
  setImageSettings: (imageSettings) => set({ imageSettings }),

  addRoom: (template) => {
    const { rooms } = get()
    const { plot } = useProjectStore.getState()
    
    // Save state to undo history before change
    useHistoryStore.getState().pushState(rooms, plot)

    const newRoom = {
      id: Date.now().toString(),
      type: template.type,
      label: template.label,
      x: 30,
      y: 30,
      width: template.w,
      height: template.h
    }

    const nextRooms = [...rooms, newRoom]
    set({ rooms: nextRooms })
    triggerAutosave(nextRooms, plot)
    return newRoom.id
  },

  deleteRoom: (id) => {
    const { rooms } = get()
    const { plot } = useProjectStore.getState()

    useHistoryStore.getState().pushState(rooms, plot)

    const nextRooms = rooms.filter(r => r.id !== id)
    set({ rooms: nextRooms })
    triggerAutosave(nextRooms, plot)
  },

  clearCanvas: () => {
    const { rooms } = get()
    const { plot } = useProjectStore.getState()

    useHistoryStore.getState().pushState(rooms, plot)

    set({ rooms: [] })
    triggerAutosave([], plot)
  },

  nudgeRoom: (id, direction) => {
    const { rooms } = get()
    const { plot } = useProjectStore.getState()
    const index = rooms.findIndex(r => r.id === id)
    if (index === -1) return

    useHistoryStore.getState().pushState(rooms, plot)

    const updated = [...rooms]
    const r = { ...updated[index] }
    const step = 2.5 // grid nudge increment
    
    if (direction === 'left') r.x = Math.max(0, r.x - step)
    else if (direction === 'right') r.x = Math.min(100 - r.width, r.x + step)
    else if (direction === 'up') r.y = Math.max(0, r.y - step)
    else if (direction === 'down') r.y = Math.min(100 - r.height, r.y + step)

    updated[index] = r
    set({ rooms: updated })
    triggerAutosave(updated, plot)
  },

  resizeRoom: (id, dimension, factor) => {
    const { rooms } = get()
    const { plot } = useProjectStore.getState()
    const index = rooms.findIndex(r => r.id === id)
    if (index === -1) return

    useHistoryStore.getState().pushState(rooms, plot)

    const updated = [...rooms]
    const r = { ...updated[index] }
    const step = 5

    if (dimension === 'w') {
      if (factor > 0) r.width = Math.min(100 - r.x, r.width + step)
      else r.width = Math.max(10, r.width - step)
    } else if (dimension === 'h') {
      if (factor > 0) r.height = Math.min(100 - r.y, r.height + step)
      else r.height = Math.max(10, r.height - step)
    }

    updated[index] = r
    set({ rooms: updated })
    triggerAutosave(updated, plot)
  },

  undoLayout: () => {
    const { rooms } = get()
    const { plot } = useProjectStore.getState()
    
    const prev = useHistoryStore.getState().undo(rooms, plot)
    if (prev) {
      set({ rooms: prev.rooms })
      useProjectStore.getState().setPlot(prev.plot)
      triggerAutosave(prev.rooms, prev.plot)
    }
  },

  redoLayout: () => {
    const { rooms } = get()
    const { plot } = useProjectStore.getState()

    const next = useHistoryStore.getState().redo(rooms, plot)
    if (next) {
      set({ rooms: next.rooms })
      useProjectStore.getState().setPlot(next.plot)
      triggerAutosave(next.rooms, next.plot)
    }
  },

  loadFromLocalStorage: () => {
    if (typeof window === 'undefined') return false
    const saved = localStorage.getItem('vg-layout-project')
    if (saved) {
      try {
        const { rooms, plot } = JSON.parse(saved)
        if (rooms) set({ rooms })
        if (plot) useProjectStore.getState().setPlot(plot)
        return true
      } catch (e) {
        console.error('Failed to parse autosaved layout:', e)
      }
    }
    return false
  }
}))
