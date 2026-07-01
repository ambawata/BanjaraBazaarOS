/**
 * Wall Engine
 * Models wall segments, thickness levels, orientation lines, and outer/inner walls boundaries.
 */

export const wallEngine = {
  // Create standard wall segment
  createWallSegment(id, startPoint, endPoint, thickness = 9, isOuter = true) {
    return {
      id,
      start: { x: startPoint.x, y: startPoint.y },
      end: { x: endPoint.x, y: endPoint.y },
      thickness, // in inches, e.g. 9" outer wall or 4.5" inner partition wall
      isOuter,
      openings: [] // references doors, windows, exhaust ventilators
    }
  },

  // Get wall orientation alignment
  getWallDirection(start, end) {
    const dx = Math.abs(end.x - start.x)
    const dy = Math.abs(end.y - start.y)
    
    if (dx > dy && dy < 2) return 'Horizontal'
    if (dy > dx && dx < 2) return 'Vertical'
    return 'Angled'
  },

  // Calculate perpendicular normal vector to place doors and windows
  getWallNormal(start, end) {
    const dx = end.x - start.x
    const dy = end.y - start.y
    const len = Math.sqrt(dx * dx + dy * dy)
    
    if (len === 0) return { x: 0, y: 1 }
    
    // Orthogonal normal vector (rotated 90 deg)
    return {
      x: -dy / len,
      y: dx / len
    }
  },

  // Add opening to a wall segment
  addOpening(wall, opening) {
    return {
      ...wall,
      openings: [...wall.openings, {
        id: opening.id,
        type: opening.type, // 'door' | 'window' | 'ventilator'
        offset: opening.offset, // % distance from wall start
        width: opening.width, // physical width in feet
        direction: opening.direction || 'Inward' // opening swing
      }]
    }
  }
}
