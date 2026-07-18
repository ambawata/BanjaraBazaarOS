/**
 * Measurement Engine
 * Handles distances, polygon areas (Shoelace formula), centroids, and boundary dimensions.
 */

export const measurementEngine = {
  // Distance between two points in percentage
  getDistance(p1, p2) {
    return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2))
  },

  // Calculate physical length of a wall line segment
  getWallPhysicalLength(start, end, plotWidth, plotLength, useMeters = false) {
    const dxFeet = ((end.x - start.x) / 100) * plotWidth
    const dyFeet = ((end.y - start.y) / 100) * plotLength
    const lengthFeet = Math.sqrt(dxFeet * dxFeet + dyFeet * dyFeet)
    
    return useMeters ? lengthFeet * 0.3048 : lengthFeet
  },

  // Polygon Area calculation using the Shoelace formula (coordinates in feet)
  getPolygonArea(vertices) {
    let area = 0
    const j = vertices.length - 1
    
    for (let i = 0; i < vertices.length; i++) {
      const prev = vertices[i === 0 ? j : i - 1]
      const curr = vertices[i]
      area += (prev.x + curr.x) * (prev.y - curr.y)
    }
    
    return Math.abs(area / 2)
  },

  // Centroid of a polygon (coordinates in relative percentage)
  getPolygonCentroid(vertices) {
    let cx = 0, cy = 0
    let area = 0
    const factor = 6
    
    for (let i = 0; i < vertices.length; i++) {
      const p1 = vertices[i]
      const p2 = vertices[(i + 1) % vertices.length]
      
      const commonFactor = (p1.x * p2.y - p2.x * p1.y)
      area += commonFactor
      cx += (p1.x + p2.x) * commonFactor
      cy += (p1.y + p2.y) * commonFactor
    }
    
    area = area / 2
    if (area === 0) return { x: 0, y: 0 }
    
    return {
      x: cx / (factor * area),
      y: cy / (factor * area)
    }
  },

  // Get Bounding Box coordinates
  getBoundingBox(vertices) {
    if (!vertices || vertices.length === 0) {
      return { minX: 0, minY: 0, maxX: 0, maxY: 0 }
    }
    
    let minX = vertices[0].x
    let maxX = vertices[0].x
    let minY = vertices[0].y
    let maxY = vertices[0].y
    
    for (let i = 1; i < vertices.length; i++) {
      const p = vertices[i]
      if (p.x < minX) minX = p.x
      if (p.x > maxX) maxX = p.x
      if (p.y < minY) minY = p.y
      if (p.y > maxY) maxY = p.y
    }
    
    return { minX, minY, maxX, maxY }
  }
}
