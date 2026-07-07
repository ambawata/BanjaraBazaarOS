import { create } from 'zustand'
import { useHistoryStore } from './historyStore'
import { useProjectStore } from './projectStore'
import { hasRoomCollision, findOpenSpot, resolveOverlaps } from '../lib/geometry/collisionEngine'

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

  // Confirms every plain room has a door and every exterior-facing wall has
  // a window, adding whichever are missing. A room's own rectangle edge is
  // the only thing that represents a wall in this data model, so "does
  // this room have a door" means "is there a door-category opening
  // touching this room's rectangle at all", and "exterior wall" means
  // "this specific edge sits on the plot boundary".
  autoAssignOpenings: () => {
    const { rooms } = get()
    const { plot } = useProjectStore.getState()
    const EPS = 1.5

    const plainRooms = rooms.filter(r => !r.category || r.category === 'room')
    const openings = rooms.filter(r => r.category === 'opening')

    const touchesEdge = (opening, room, side) => {
      if (!(opening.x < room.x + room.width && opening.x + opening.width > room.x &&
            opening.y < room.y + room.height && opening.y + opening.height > room.y)) return false
      const oCenterX = opening.x + opening.width / 2
      const oCenterY = opening.y + opening.height / 2
      if (side === 'top') return Math.abs(oCenterY - room.y) <= EPS * 2
      if (side === 'bottom') return Math.abs(oCenterY - (room.y + room.height)) <= EPS * 2
      if (side === 'left') return Math.abs(oCenterX - room.x) <= EPS * 2
      return Math.abs(oCenterX - (room.x + room.width)) <= EPS * 2
    }

    const placeOpening = (room, side, type) => {
      const isNarrowDoor = type === 'door' && room.type === 'toilet'
      const widthPct = type === 'window' ? 6 : (isNarrowDoor ? 3 : 4)
      const thickPct = 2
      const isHorizontalEdge = side === 'top' || side === 'bottom'
      const wPct = isHorizontalEdge ? Math.min(widthPct, room.width) : thickPct
      const hPct = isHorizontalEdge ? thickPct : Math.min(widthPct, room.height)

      let x, y
      if (side === 'top') { x = room.x + room.width / 2 - wPct / 2; y = room.y - hPct / 2 }
      else if (side === 'bottom') { x = room.x + room.width / 2 - wPct / 2; y = room.y + room.height - hPct / 2 }
      else if (side === 'left') { x = room.x - wPct / 2; y = room.y + room.height / 2 - hPct / 2 }
      else { x = room.x + room.width - wPct / 2; y = room.y + room.height / 2 - hPct / 2 }

      x = Math.max(0, Math.min(100 - wPct, x))
      y = Math.max(0, Math.min(100 - hPct, y))

      return {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        type,
        label: type === 'door' ? 'Door' : 'Window',
        x: Math.round(x * 10) / 10,
        y: Math.round(y * 10) / 10,
        width: Math.round(wPct * 10) / 10,
        height: Math.round(hPct * 10) / 10,
        category: 'opening',
        rotation: 0
      }
    }

    const additions = []

    plainRooms.forEach(room => {
      const hasDoor = openings.some(o => (o.type === 'door' || o.type === 'main-door') &&
        ['top', 'bottom', 'left', 'right'].some(side => touchesEdge(o, room, side)))

      if (!hasDoor) {
        const edges = ['bottom', 'right', 'top', 'left']
        const isBoundary = {
          top: room.y <= EPS,
          bottom: room.y + room.height >= 100 - EPS,
          left: room.x <= EPS,
          right: room.x + room.width >= 100 - EPS
        }
        const preferred = edges.find(side => !isBoundary[side]) || edges[0]
        additions.push(placeOpening(room, preferred, 'door'))
      }

      ;['top', 'bottom', 'left', 'right'].forEach(side => {
        const onBoundary = side === 'top' ? room.y <= EPS
          : side === 'bottom' ? room.y + room.height >= 100 - EPS
          : side === 'left' ? room.x <= EPS
          : room.x + room.width >= 100 - EPS
        if (!onBoundary) return
        const hasWindow = openings.some(o => o.type === 'window' && touchesEdge(o, room, side))
        if (!hasWindow) additions.push(placeOpening(room, side, 'window'))
      })
    })

    if (additions.length === 0) return 0

    useHistoryStore.getState().pushState(rooms, plot)
    const nextRooms = [...rooms, ...additions]
    set({ rooms: nextRooms })
    triggerAutosave(nextRooms, plot)
    return additions.length
  },

  // Manual safety net for the same repair loadFromLocalStorage runs
  // automatically on app load — a browser tab left open from before
  // overlap-prevention shipped won't get that automatic pass until it's
  // reloaded, so this gives a one-tap fix without needing a refresh.
  fixOverlaps: () => {
    const { rooms } = get()
    const { plot } = useProjectStore.getState()
    const { rooms: fixedRooms, changed } = resolveOverlaps(rooms)
    if (!changed) return false

    useHistoryStore.getState().pushState(rooms, plot)
    set({ rooms: fixedRooms })
    triggerAutosave(fixedRooms, plot)
    return true
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
