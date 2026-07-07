import { create } from 'zustand'
import { useHistoryStore } from './historyStore'
import { useProjectStore } from './projectStore'
import { hasRoomCollision, findOpenSpot, resolveOverlaps } from '../lib/geometry/collisionEngine'

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
  selectedRoomId: null,
  uploadedFile: null,

  setUploadedFile: (file) => set({ uploadedFile: file }),
  setSelectedRoomId: (id) => set({ selectedRoomId: id }),

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

    const w = template.w || 15
    const h = template.h || 15
    // Doors/windows landed wherever findOpenSpot found free space — often
    // the middle of nowhere, tiny and easy to lose track of. They read as
    // "openings" only when they actually sit on a wall, so default them to
    // the plot's top boundary instead; wall-snapping while dragging takes
    // over from there.
    const { x, y } = template.category === 'opening'
      ? { x: Math.max(2, 50 - w / 2), y: 0 }
      : findOpenSpot(w, h, rooms)

    const newRoom = {
      id: Date.now().toString(),
      type: template.type,
      label: template.label,
      x,
      y,
      width: w,
      height: h,
      category: template.category || 'room',
      rotation: template.rotation || 0,
      icon: template.icon
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

    const r = { ...rooms[index] }
    // A fixed percentage step moved a different number of real feet
    // depending on the plot's size — 1 tap could nudge a room 2ft on one
    // wall and 3ft on another. Converting 1 real foot into the matching
    // percentage for each axis keeps every tap the same, predictable step.
    const stepX = (1 / plot.width) * 100
    const stepY = (1 / plot.length) * 100

    if (direction === 'left') r.x = Math.max(0, r.x - stepX)
    else if (direction === 'right') r.x = Math.min(100 - r.width, r.x + stepX)
    else if (direction === 'up') r.y = Math.max(0, r.y - stepY)
    else if (direction === 'down') r.y = Math.min(100 - r.height, r.y + stepY)

    // Stop the nudge right at a neighboring room's edge instead of
    // stepping through it.
    if (hasRoomCollision(r, rooms, id)) return

    useHistoryStore.getState().pushState(rooms, plot)
    const updated = [...rooms]
    updated[index] = r
    set({ rooms: updated })
    triggerAutosave(updated, plot)
  },

  resizeRoom: (id, dimension, factor) => {
    const { rooms } = get()
    const { plot } = useProjectStore.getState()
    const index = rooms.findIndex(r => r.id === id)
    if (index === -1) return

    const r = { ...rooms[index] }

    // Same fix as nudge — step by exactly 1 real foot on whichever axis,
    // instead of a flat 5% that translated to a different foot count
    // depending on the plot's width vs length.
    if (dimension === 'w') {
      const step = (1 / plot.width) * 100
      const minWidth = (3 / plot.width) * 100
      if (factor > 0) r.width = Math.min(100 - r.x, r.width + step)
      else r.width = Math.max(minWidth, r.width - step)
    } else if (dimension === 'h') {
      const step = (1 / plot.length) * 100
      const minHeight = (3 / plot.length) * 100
      if (factor > 0) r.height = Math.min(100 - r.y, r.height + step)
      else r.height = Math.max(minHeight, r.height - step)
    }

    // Stop the resize right at a neighboring room's edge instead of
    // growing through it.
    if (hasRoomCollision(r, rooms, id)) return

    useHistoryStore.getState().pushState(rooms, plot)
    const updated = [...rooms]
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
        if (Array.isArray(rooms)) {
          // Layouts saved before overlap-prevention existed (or from any
          // other bad state) may already have rooms stacked on top of each
          // other. Repair that once on load instead of leaving it broken
          // forever, since the drag/resize/nudge guards only stop new
          // overlaps from forming going forward.
          const { rooms: fixedRooms, changed } = resolveOverlaps(rooms)
          set({ rooms: fixedRooms })
          if (changed) triggerAutosave(fixedRooms, plot || useProjectStore.getState().plot)
        }
        if (plot) useProjectStore.getState().setPlot(plot)
        return true
      } catch (e) {
        console.error('Failed to parse autosaved layout:', e)
      }
    }
    return false
  }
}))
