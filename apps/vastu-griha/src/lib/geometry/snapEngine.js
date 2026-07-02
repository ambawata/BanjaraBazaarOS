import { measurementEngine } from './measurementEngine'

/**
 * Snap Engine
 * Locks coordinates inputs to snap intervals, nearby corners, or line segment boundaries.
 */

export const snapEngine = {
  // Snap value to nearest grid interval
  snapToGrid(value, gridSize = 2.5) {
    return Math.round(value / gridSize) * gridSize
  },

  // Snap point to standard grid coordinates
  snapPointToGrid(point, gridSize = 2.5) {
    return {
      x: this.snapToGrid(point.x, gridSize),
      y: this.snapToGrid(point.y, gridSize)
    }
  },

  // Snap moving point to nearest corner vertex if inside tolerance
  snapPointToCorner(point, vertices, tolerance = 2.0) {
    let closestVertex = null
    let minDistance = Infinity
    
    for (const vertex of vertices) {
      const distance = measurementEngine.getDistance(point, vertex)
      if (distance < tolerance && distance < minDistance) {
        minDistance = distance
        closestVertex = { ...vertex }
      }
    }
    
    return closestVertex ? closestVertex : point
  },

  // Snap coordinate point to nearest line segment
  snapPointToSegment(point, start, end, tolerance = 3.0) {
    const A = point.x - start.x
    const B = point.y - start.y
    const C = end.x - start.x
    const D = end.y - start.y
    
    const dotProduct = A * C + B * D
    const lenSq = C * C + D * D
    let param = -1
    
    if (lenSq !== 0) param = dotProduct / lenSq
    
    let xx, yy
    
    if (param < 0) {
      xx = start.x
      yy = start.y
    } else if (param > 1) {
      xx = end.x
      yy = end.y
    } else {
      xx = start.x + param * C
      yy = start.y + param * D
    }
    
    const projection = { x: xx, y: yy }
    const distance = measurementEngine.getDistance(point, projection)
    
    return distance < tolerance ? projection : point
  }
}
