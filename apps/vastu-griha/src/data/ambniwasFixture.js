// Built-in self-verification fixture (task requirement: "BUILT-IN TEST
// FIXTURE ... do not skip"). Tier 2 confidence — satellite pixel-bearing
// measurement, cross-validated across two independent screenshots per
// docs/VastuGriha_Geometry_Specification_v0.1.md Section 1 — NOT Tier 1
// land-survey ground truth. Mirrors the same square-plot fixture seeded in
// database/seed.sql Section 7 and exercised by scripts/test-vastu-geometry.php.
//
// Loading this fixture and adding the front wall must reproduce the front
// wall's true bearing as 203.8 deg / SSW. If it doesn't, something in the
// backend pipeline has drifted from the pure-function self-check.
export const AMBNIWAS_FIXTURE = {
  plot: {
    name: 'AmbNiwas (fixture — Tier 2 satellite, cross-validated)',
    coordinate_type: 'local_ft',
    boundary_vertices: [
      { x: -100, y: -100 },
      { x: 100, y: -100 },
      { x: 100, y: 100 },
      { x: -100, y: 100 },
    ],
    true_north_rotation_r: 23.8,
    confidence_tier: 'tier2_satellite',
  },
  frontWall: {
    corner_start: { x: -20, y: -100 },
    corner_end: { x: 20, y: -100 },
  },
  expected: {
    facing_bearing_true: 203.8,
    zone_16: 'SSW',
  },
}
