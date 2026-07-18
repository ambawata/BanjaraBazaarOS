/**
 * Coordinate System Utility
 * Handles scaling translations between Canvas %, Pixels, Feet, and Meters.
 */

export const coordinateSystem = {
  // Percentage to feet conversions
  pctToFeet(pct, plotDim) {
    return (pct / 100) * plotDim
  },

  feetToPct(feet, plotDim) {
    if (plotDim === 0) return 0
    return (feet / plotDim) * 100
  },

  // Feet and Meters conversions
  feetToMeters(feet) {
    return feet * 0.3048
  },

  metersToFeet(meters) {
    return meters / 0.3048
  },

  // Percentage to pixels conversions for rendering
  pctToPixels(pct, pixelDim) {
    return (pct / 100) * pixelDim
  },

  pixelsToPct(px, pixelDim) {
    if (pixelDim === 0) return 0
    return (px / pixelDim) * 100
  },

  // Conversions for coordinate points
  pointPctToFeet(point, plotWidth, plotLength) {
    return {
      x: this.pctToFeet(point.x, plotWidth),
      y: this.pctToFeet(point.y, plotLength)
    }
  },

  pointFeetToPct(point, plotWidth, plotLength) {
    return {
      x: this.feetToPct(point.x, plotWidth),
      y: this.feetToPct(point.y, plotLength)
    }
  }
}
