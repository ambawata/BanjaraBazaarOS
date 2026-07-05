import { measurementEngine } from './measurementEngine'

/**
 * Room Engine
 * Models room boxes, polygon areas, centroid points, labels, and overlap validations.
 */

export const roomEngine = {
  // Structure room properties
  createRoomPolygon(id, label, type, corners) {
    const centroid = measurementEngine.getPolygonCentroid(corners)
    const bbox = measurementEngine.getBoundingBox(corners)
    
    return {
      id,
      label,
      type, // 'bedroom', 'kitchen', 'pooja', etc.
      corners, // relative percentage points array [{x, y}, ...]
      centroid,
      bbox
    }
  },

  // Update room bounds dynamically
  updateRoomGeometry(room, corners) {
    const centroid = measurementEngine.getPolygonCentroid(corners)
    const bbox = measurementEngine.getBoundingBox(corners)
    
    return {
      ...room,
      corners,
      centroid,
      bbox
    }
  },

  // Collision detection check between rooms bounding boxes
  detectRoomOverlaps(roomA, roomB) {
    const boxA = roomA.bbox || measurementEngine.getBoundingBox(roomA.corners)
    const boxB = roomB.bbox || measurementEngine.getBoundingBox(roomB.corners)
    
    // Check overlapping bounds
    return !(
      boxA.maxX <= boxB.minX ||
      boxA.minX >= boxB.maxX ||
      boxA.maxY <= boxB.minY ||
      boxA.minY >= boxB.maxY
    )
  }
}
