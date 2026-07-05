import { measurementEngine } from './measurementEngine'

/**
 * Validation Engine
 * Validates layout sanitization checks (closed loops, intersections, overlaps, duplicate vertices).
 */

export const validationEngine = {
  // Check if a polygon's start and end match
  isPolygonClosed(vertices) {
    if (vertices.length < 3) return false
    const start = vertices[0]
    const end = vertices[vertices.length - 1]
    
    return start.x === end.x && start.y === end.y
  },

  // Check for duplicate vertices in a polygon
  hasDuplicateVertices(vertices, tolerance = 0.5) {
    for (let i = 0; i < vertices.length; i++) {
      for (let j = i + 1; j < vertices.length; j++) {
        if (measurementEngine.getDistance(vertices[i], vertices[j]) < tolerance) {
          return true
        }
      }
    }
    return false
  },

  // Line segment intersection math
  getLineIntersection(p1, p2, p3, p4) {
    const s1_x = p2.x - p1.x
    const s1_y = p2.y - p1.y
    const s2_x = p4.x - p3.x
    const s2_y = p4.y - p3.y

    const s = (-s1_y * (p1.x - p3.x) + s1_x * (p1.y - p3.y)) / (-s2_x * s1_y + s1_x * s2_y)
    const t = (s2_x * (p1.y - p3.y) - s2_y * (p1.x - p3.x)) / (-s2_x * s1_y + s1_x * s2_y)

    // Collision detected
    if (s >= 0 && s <= 1 && t >= 0 && t <= 1) {
      return {
        x: p1.x + (t * s1_x),
        y: p1.y + (t * s1_y)
      }
    }

    return null // No intersection
  },

  // Verify wall segment structural criteria
  isValidWallSegment(wall, minLengthInches = 12, plotWidth = 30, plotLength = 40) {
    const physicalLen = measurementEngine.getWallPhysicalLength(
      wall.start, 
      wall.end, 
      plotWidth, 
      plotLength
    ) // in feet
    
    const lengthInches = physicalLen * 12
    return lengthInches >= minLengthInches
  }
}
