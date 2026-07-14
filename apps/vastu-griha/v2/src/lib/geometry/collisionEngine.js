// Room overlap checking, shared by every place a room's position/size can
// change: manual drag, corner-resize, the nudge buttons, and the +/- and
// typed-feet resize controls. All of them used to only clamp against the
// plot's own edges and never checked neighboring rooms, which is how rooms
// ended up stacked on top of each other.
//
// Only plain rooms (category 'room', or no category at all) block each
// other. Doors/windows sit ON a wall by design (they're meant to overlap a
// room's edge), furniture sits INSIDE a room by design, and Vastu remedy
// icons are small overlays — none of those should be treated as walls.

export function isBlockingRoom(room) {
  return !room.category || room.category === 'room'
}

export function rectsOverlap(a, b) {
  return a.x < b.x + b.width && a.x + a.width > b.x &&
         a.y < b.y + b.height && a.y + a.height > b.y
}

// candidate: {x, y, width, height, category?, id?}
export function hasRoomCollision(candidate, allRooms, excludeId) {
  if (!isBlockingRoom(candidate)) return false
  return allRooms.some(r => {
    if (r.id === excludeId) return false
    if (!isBlockingRoom(r)) return false
    return rectsOverlap(candidate, r)
  })
}

// Scans a grid of candidate spots and returns the first one that doesn't
// overlap any room in `existingRooms`. Shared by addRoom (placing a new
// room) and resolveOverlaps below (relocating a room that's already
// overlapping something). `boundaryPoints`, when the plot has a custom
// polygon boundary, additionally rejects spots that fall outside it —
// otherwise a new room could spawn in the "cut corner" of a non-rectangular
// plot.
export function findOpenSpot(w, h, existingRooms, boundaryPoints) {
  const step = 8
  const fits = (candidate) =>
    !hasRoomCollision(candidate, existingRooms, null) &&
    isRoomInsideBoundary(candidate, boundaryPoints)

  for (let y = 2; y + h <= 100; y += step) {
    for (let x = 2; x + w <= 100; x += step) {
      const candidate = { x, y, width: w, height: h, category: 'room' }
      if (fits(candidate)) return { x, y }
    }
  }
  const offset = (existingRooms.length * 4) % 40
  return {
    x: Math.min(100 - w, 10 + offset),
    y: Math.min(100 - h, 10 + offset)
  }
}

// Ray-casting point-in-polygon test, ported from the deleted standalone
// Canvas 2 tool's inPoly() (vastu-studio-v4.html). `points` is an array of
// {x, y} in the same 0-100% plot space rooms already use.
export function pointInPolygon(x, y, points) {
  let inside = false
  for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
    const xi = points[i].x, yi = points[i].y
    const xj = points[j].x, yj = points[j].y
    if (((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi)) inside = !inside
  }
  return inside
}

// A room counts as "inside" a custom polygon boundary when all 4 corners
// are inside it (same small inset Canvas 2's roomInside() used, so a room
// flush against the boundary edge doesn't get rejected by float rounding).
export function isRoomInsideBoundary(room, boundaryPoints) {
  if (!boundaryPoints || boundaryPoints.length < 3) return true
  const e = 0.1
  return (
    pointInPolygon(room.x + e, room.y + e, boundaryPoints) &&
    pointInPolygon(room.x + room.width - e, room.y + e, boundaryPoints) &&
    pointInPolygon(room.x + e, room.y + room.height - e, boundaryPoints) &&
    pointInPolygon(room.x + room.width - e, room.y + room.height - e, boundaryPoints)
  )
}

// One-time repair pass for layouts saved before overlap-prevention existed
// (or corrupted by any other means) — walks the room list in order, and
// any room that overlaps one already placed gets relocated to the nearest
// open spot instead of silently staying stacked on top of it.
export function resolveOverlaps(rooms) {
  const placed = []
  let changed = false

  rooms.forEach(room => {
    if (!isBlockingRoom(room) || !hasRoomCollision(room, placed, room.id)) {
      placed.push(room)
      return
    }
    changed = true
    const { x, y } = findOpenSpot(room.width, room.height, placed)
    placed.push({ ...room, x, y })
  })

  return { rooms: placed, changed }
}
