import { rotationEngine } from './rotationEngine'

/**
 * Compass Engine
 * Mappings coordinate transformations to 3x3 Vastu Mandala Grid Sectors (NE, N, NW, E, C, W, SE, S, SW).
 */

export const compassEngine = {
  // Determine which sector of the 3x3 Vastu grid a point falls into, accounting for project rotation tilt
  getVastuSector(point, tiltAngle = 0, origin = { x: 50, y: 50 }) {
    // 1. Rotate the point in reverse to align with standard north coordinates grid
    const alignedPoint = tiltAngle !== 0 
      ? rotationEngine.rotatePoint(point, -tiltAngle, origin) 
      : point

    // 2. Identify the grid division based on percentage coordinates (0-100)
    let sectorX = 'C' // Left, Center, Right
    let sectorY = 'C' // Top, Center, Bottom

    if (alignedPoint.x < 33.33) sectorX = 'W' // West boundary column
    else if (alignedPoint.x > 66.66) sectorX = 'E' // East boundary column
    else sectorX = 'C'

    if (alignedPoint.y < 33.33) sectorY = 'N' // North boundary row
    else if (alignedPoint.y > 66.66) sectorY = 'S' // South boundary row
    else sectorY = 'C'

    // 3. Map divisions intersections to corresponding Vastu directions:
    // N = North, NE = Northeast, E = East, SE = Southeast, S = South, SW = Southwest, W = West, NW = Northwest, C = Brahmasthan
    if (sectorX === 'E' && sectorY === 'N') return 'NE' // Ishanya
    if (sectorX === 'E' && sectorY === 'S') return 'SE' // Agneya
    if (sectorX === 'W' && sectorY === 'S') return 'SW' // Nairutya
    if (sectorX === 'W' && sectorY === 'N') return 'NW' // Vayavya

    if (sectorX === 'C' && sectorY === 'N') return 'N' // Kubera
    if (sectorX === 'C' && sectorY === 'S') return 'S' // Yama
    if (sectorX === 'E' && sectorY === 'C') return 'E' // Aditya
    if (sectorX === 'W' && sectorY === 'C') return 'W' // Varuna

    return 'C' // Brahmasthan Center
  },

  // Map sector display names
  getSectorName(sector) {
    const names = {
      N: 'North (Kubera - Wealth)',
      NE: 'Northeast (Ishanya - Water/Spiritual)',
      E: 'East (Aditya - Social/Light)',
      SE: 'Southeast (Agneya - Fire/Kitchen)',
      S: 'South (Yama - Security/Relax)',
      SW: 'Southwest (Nairutya - Earth/Stability)',
      W: 'West (Varuna - Gains/Career)',
      NW: 'Northwest (Vayavya - Air/Support)',
      C: 'Center (Brahmasthan - Ether/Universe)'
    }
    return names[sector] || 'Brahmasthan'
  }
}
