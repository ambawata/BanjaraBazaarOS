/**
 * Rotation Engine
 * Manages angular rotation math and skew offsets translations.
 */

export const rotationEngine = {
  // Rotate a coordinate point around a custom origin point
  rotatePoint(point, angleDegrees, origin = { x: 50, y: 50 }) {
    const angleRadians = (angleDegrees * Math.PI) / 180
    const cosVal = Math.cos(angleRadians)
    const sinVal = Math.sin(angleRadians)
    
    // Shift relative point back to origin coordinate
    const dx = point.x - origin.x
    const dy = point.y - origin.y
    
    return {
      x: cosVal * dx - sinVal * dy + origin.x,
      y: sinVal * dx + cosVal * dy + origin.y
    }
  },

  // Get angular vector alignment of a line segment
  getSegmentAngle(start, end) {
    const dy = end.y - start.y
    const dx = end.x - start.x
    
    let angleRad = Math.atan2(dy, dx)
    let angleDeg = angleRad * (180 / Math.PI)
    
    // Normalize to 0-360 degrees
    if (angleDeg < 0) angleDeg += 360
    return angleDeg
  }
}
