<?php
declare(strict_types=1);

// =============================================================================
// BanjaraBazaarOS — "My Home" map onboarding self-check
//
// Usage:
//   php scripts/test-vastu-map-onboarding.php
//
// Requires a live DB connection (.env) — VastuMapOnboardingService reads/
// writes through the real VastuGeometryService, unlike
// test-vastu-geometry.php's pure-function-only checks. Same hand-rolled
// assertion-runner style as the other scripts/test-vastu-*.php files (no
// PHPUnit in this repo).
//
// WHY THIS TEST MATTERS (per task instructions): the AmbNiwas fixture and
// every existing geometry test feed local-planar-feet coordinates directly
// — none of them exercise VastuGeometryMath::latLongToLocalFeet() (spec
// Section 0.1) at all. This is the first real test of that formula, via
// the only code path that actually calls it with real lat/lng input: the
// from-map endpoint.
//
// Fixture choice: a 200x200 ft square with its first corner AT THE
// EQUATOR (lat0=0). cos(0deg) = 1 exactly, so the lon->feet conversion
// has zero trigonometric rounding in the hand-computed expected values
// below — any deviation beyond basic float precision is a real bug, not
// an artifact of the test's own expected-value arithmetic.
// =============================================================================

if (PHP_SAPI !== 'cli') {
    fwrite(STDERR, "This script must be run from the CLI.\n");
    exit(1);
}

require dirname(__DIR__) . '/backend/core/bootstrap.php';

use Backend\Services\VastuMapOnboardingService;

$failures = 0;
$passes = 0;

function check(string $label, bool $condition): void
{
    global $failures, $passes;
    if ($condition) {
        $passes++;
        fwrite(STDOUT, "  \xE2\x9C\x93 $label\n");
    } else {
        $failures++;
        fwrite(STDERR, "  \xE2\x9C\x97 $label\n");
    }
}

function approx(float $a, float $b, float $tolerance = 0.05): bool
{
    return abs($a - $b) <= $tolerance;
}

fwrite(STDOUT, "My Home map-onboarding self-check\n");
fwrite(STDOUT, "==================================\n\n");

// -----------------------------------------------------------------------
// Part 1 - from-map: real lat/long -> local-feet conversion (spec 0.1)
// -----------------------------------------------------------------------
fwrite(STDOUT, "Part 1 - POST /plots/from-map (lat/long -> local feet, spec Section 0.1)\n");

$sideFt = 200.0;
$degPerSide = $sideFt / 364000.0; // FEET_PER_DEGREE_LATITUDE from VastuGeometryMath

// Square, first vertex at the equator (lat0=0, lon0=0) so cos(lat0)=1
// exactly. Ordered so corner A -> B -> C -> D traces a simple
// (non-self-intersecting) square.
$boundaryLatLng = [
    ['lat' => 0.0,        'lng' => 0.0],
    ['lat' => 0.0,        'lng' => $degPerSide],
    ['lat' => $degPerSide, 'lng' => $degPerSide],
    ['lat' => $degPerSide, 'lng' => 0.0],
];

$service = new VastuMapOnboardingService();
$plot = $service->createPlotFromMap(null, [
    'name' => 'Self-check equator square',
    'address' => '',
    'boundary_latlng' => $boundaryLatLng,
]);

check('plot was created with an id', isset($plot['id']) && $plot['id'] > 0);
check('confidence_tier is hardcoded to tier2_satellite (never taken from request)', $plot['confidence_tier'] === 'tier2_satellite');
check('true_north_rotation_r is 0 (map-traced == inherently north-up)', approx($plot['true_north_rotation_r'], 0.0, 0.0001));

$v = $plot['boundary_vertices'];
check('4 boundary vertices persisted', count($v) === 4);
check('vertex 0 (the lat0/lon0 origin) is exactly (0, 0)', approx($v[0]['x'], 0.0, 0.0001) && approx($v[0]['y'], 0.0, 0.0001));
check('vertex 1 is (200, 0) ft — pure longitude delta at the equator', approx($v[1]['x'], $sideFt) && approx($v[1]['y'], 0.0));
check('vertex 2 is (200, 200) ft', approx($v[2]['x'], $sideFt) && approx($v[2]['y'], $sideFt));
check('vertex 3 is (0, 200) ft — pure latitude delta', approx($v[3]['x'], 0.0) && approx($v[3]['y'], $sideFt));

check('centroid_x is 100 ft (square center)', approx($plot['centroid_x'], 100.0));
check('centroid_y is 100 ft', approx($plot['centroid_y'], 100.0));

fwrite(STDOUT, "  -> plot_id={$plot['id']}, centroid=({$plot['centroid_x']}, {$plot['centroid_y']}), boundary vertex 2 = ({$v[2]['x']}, {$v[2]['y']})\n");

// -----------------------------------------------------------------------
// Part 2 - zone-grid: 9-cell breakdown with correct compass labels
// -----------------------------------------------------------------------
fwrite(STDOUT, "\nPart 2 - GET /plots/{id}/zone-grid (9 zones, known-rotation square)\n");

$grid = $service->getZoneGrid((int) $plot['id']);
check('zone-grid returns exactly 9 cells', count($grid['cells']) === 9);

// Row-major, north row first, west column first (see
// VastuMapOnboardingService::getZoneGrid docblock) — for an axis-aligned
// square with true_north_rotation_r=0, this must resolve to the classical
// 3x3 layout exactly.
$expectedByPosition = [
    '0-0' => 'NW', '0-1' => 'N', '0-2' => 'NE',
    '1-0' => 'W',  '1-1' => 'CENTER', '1-2' => 'E',
    '2-0' => 'SW', '2-1' => 'S', '2-2' => 'SE',
];

$actualByPosition = [];
foreach ($grid['cells'] as $cell) {
    $actualByPosition["{$cell['row']}-{$cell['col']}"] = $cell['zone'];
}

foreach ($expectedByPosition as $position => $expectedZone) {
    check("cell $position resolves to $expectedZone", ($actualByPosition[$position] ?? null) === $expectedZone);
}

check('center cell is real numeric center (not an edge)', isset($grid['cells'][4]) && $grid['cells'][4]['row'] === 1 && $grid['cells'][4]['col'] === 1);

fwrite(STDOUT, "  -> grid: " . implode(' ', array_map(fn ($c) => $c['zone'], $grid['cells'])) . "\n");

// -----------------------------------------------------------------------
// Part 3 - validation: minimum corner count is enforced (not a magic
// number silently ignored — reads from the same DB-driven settings the
// endpoint actually uses).
// -----------------------------------------------------------------------
fwrite(STDOUT, "\nPart 3 - validation\n");

try {
    $service->createPlotFromMap(null, [
        'name' => 'Too few corners',
        'boundary_latlng' => [['lat' => 0, 'lng' => 0], ['lat' => 0, 'lng' => 0.001]],
    ]);
    check('rejects fewer than min_corners points', false);
} catch (\RuntimeException $e) {
    check('rejects fewer than min_corners points', true);
}

try {
    $service->createPlotFromMap(null, ['name' => '', 'boundary_latlng' => $boundaryLatLng]);
    check('rejects an empty plot name', false);
} catch (\RuntimeException $e) {
    check('rejects an empty plot name', true);
}

// -----------------------------------------------------------------------
// Summary
// -----------------------------------------------------------------------
fwrite(STDOUT, "\n==================================\n");
fwrite(STDOUT, "Passed: $passes   Failed: $failures\n");

if ($failures > 0) {
    fwrite(STDERR, "\nSelf-check FAILED.\n");
    exit(1);
}

fwrite(STDOUT, "\nAll checks passed.\n");
exit(0);
