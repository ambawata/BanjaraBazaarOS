import { create } from 'zustand'

const MAX_HISTORY = 50

export const useHistoryStore = create((set, get) => ({
  past: [],
  future: [],

  pushState: (rooms, plot) => {
    const { past } = get()
    // Deep clone arrays/objects to prevent reference sharing mutations
    const snap = JSON.parse(JSON.stringify({ rooms, plot }))
    
    let newPast = [...past, snap]
    if (newPast.length > MAX_HISTORY) {
      newPast = newPast.slice(newPast.length - MAX_HISTORY)
    }
    
    set({
      past: newPast,
      future: [] // Clear future redos on new user operations
    })
  },

  undo: (currentRooms, currentPlot) => {
    const { past, future } = get()
    if (past.length === 0) return null

    const previous = past[past.length - 1]
    const newPast = past.slice(0, past.length - 1)
    
    // Save current state into future stack
    const currentSnap = JSON.parse(JSON.stringify({ rooms: currentRooms, plot: currentPlot }))
    const newFuture = [currentSnap, ...future]

    set({ past: newPast, future: newFuture })
    return previous
  },

  redo: (currentRooms, currentPlot) => {
    const { past, future } = get()
    if (future.length === 0) return null

    const next = future[0]
    const newFuture = future.slice(1)
    
    // Save current state into past stack
    const currentSnap = JSON.parse(JSON.stringify({ rooms: currentRooms, plot: currentPlot }))
    const newPast = [...past, currentSnap]

    set({ past: newPast, future: newFuture })
    return next
  },

  clearHistory: () => set({ past: [], future: [] })
}))
