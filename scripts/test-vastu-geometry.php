<?php
declare(strict_types=1);

// =============================================================================
// BanjaraBazaarOS — Vastu Griha geometry self-check
//
// Usage:
//   php scripts/test-vastu-geometry.php
//
// Exercises VastuGeometryMath (backend/services/VastuGeometryMath.php)
// directly against docs/VastuGriha_Geometry_Specification_v0.1.md — no DB
// connection required, since the class is pure/side-effect-free. This
// repo has no PHPUnit installed (see docs/*, no phpunit.xml anywhere), so
// this is a small hand-rolled assertion runner matching the style already
// used for scripts/migrate.php and scripts/api-tests/*.
//
// The final block is the mandatory AmbNiwas built-in fixture check: the
// task specifies that if the front/gate wall does not compute to
// SSW / 203.8 deg given True North Rotation R = +23.8 deg, the
// implementation has a bug and must be fixed before this module ships.
// =============================================================================

if (PHP_SAPI !== 'cli') {
    fwrite(STDERR, "This script must be run from the CLI.\n");
    exit(1);
}

require dirname(__DIR__) . '/backend/services/VastuGeometryMath.php';

use Backend\Services\VastuGeometryMath as Geo;

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

function approx(float $a, float $b, float $tolerance = 0.0001): bool
{
    return abs($a - $b) <= $tolerance;
}

fwrite(STDOUT, "Vastu Griha geometry self-check\n");
fwrite(STDOUT, "================================\n\n");

// -- Section 0.1: latLongToLocalFeet ----------------------------------------
fwrite(STDOUT, "Section 0.1 - latLongToLocalFeet\n");
$p = Geo::latLongToLocalFeet(0.0, 0.0, 0.0, 0.0);
check('origin maps to (0,0)', approx($p['x'], 0.0) && approx($p['y'], 0.0));
$p = Geo::latLongToLocalFeet(1.0 / 364000.0, 0.0, 0.0, 0.0);
check('1/364000 deg latitude north = ~1 ft north', approx($p['y'], 1.0, 0.001) && approx($p['x'], 0.0));

// -- Section 0.2: pixelBearing ----------------------------------------------
fwrite(STDOUT, "\nSection 0.2 - pixelBearing\n");
check('straight up in image = bearing 0 (N)', approx(Geo::pixelBearing(0, 100, 0, 0), 0.0));
check('straight right in image = bearing 90 (E)', approx(Geo::pixelBearing(0, 0, 100, 0), 90.0));
check('straight down in image = bearing 180 (S)', approx(Geo::pixelBearing(0, 0, 0, 100), 180.0));
check('straight left in image = bearing 270 (W)', approx(Geo::pixelBearing(100, 0, 0, 0), 270.0));

// -- Section 2: polygonCentroid ----------------------------------------------
fwrite(STDOUT, "\nSection 2 - polygonCentroid\n");
$square = [['x' => -10, 'y' => -10], ['x' => 10, 'y' => -10], ['x' => 10, 'y' => 10], ['x' => -10, 'y' => 10]];
$c = Geo::polygonCentroid($square);
check('square centroid at origin', approx($c['x'], 0.0) && approx($c['y'], 0.0));
check('square area = 400', approx($c['area'], 400.0));

$lShape = [
    ['x' => 0, 'y' => 0], ['x' => 20, 'y' => 0], ['x' => 20, 'y' => 10],
    ['x' => 10, 'y' => 10], ['x' => 10, 'y' => 20], ['x' => 0, 'y' => 20],
];
$c2 = Geo::polygonCentroid($lShape);
check('L-shape centroid is not the bounding-box midpoint (10,10)', !approx($c2['x'], 10.0) || !approx($c2['y'], 10.0));

// -- Section 3: bearingFromCentroid / planToTrueBearing / zones -------------
fwrite(STDOUT, "\nSection 3 - bearingFromCentroid, planToTrueBearing, zones\n");
check('point due north of centroid = bearing 0', approx(Geo::bearingFromCentroid(0, 0, 0, 10), 0.0));
check('point due east of centroid = bearing 90', approx(Geo::bearingFromCentroid(0, 0, 10, 0), 90.0));
check('point due south of centroid = bearing 180', approx(Geo::bearingFromCentroid(0, 0, 0, -10), 180.0));
check('point due west of centroid = bearing 270', approx(Geo::bearingFromCentroid(0, 0, -10, 0), 270.0));

check('planToTrueBearing adds rotation', approx(Geo::planToTrueBearing(180.0, 23.8), 203.8));
check('planToTrueBearing wraps past 360', approx(Geo::planToTrueBearing(350.0, 20.0), 10.0));

$zone = Geo::bearingToZone16(203.8);
check('203.8 deg resolves to SSW on the 16-point rose', $zone['zone'] === 'SSW');
check('203.8 deg is NOT flagged boundary_case (spec: 1.3 deg from SSW center, not an edge)', $zone['boundary_case'] === false);

$zone32 = Geo::bearingToZone32(203.8);
check('203.8 deg resolves to SSW on the 32-point rose too', $zone32['zone'] === 'SSW');

$edgeZone = Geo::bearingToZone16(191.25); // exact S/SSW sector edge
check('bearing exactly on a sector edge is flagged boundary_case', $edgeZone['boundary_case'] === true);
check('boundary_case surfaces the adjacent zone', in_array($edgeZone['adjacent_zone'], ['S', 'SSW'], true));

// -- Section 4: divideWallIntoPadas ------------------------------------------
fwrite(STDOUT, "\nSection 4 - divideWallIntoPadas\n");
$padas = Geo::divideWallIntoPadas(90.0, 9);
check('9 padas generated', count($padas) === 9);
check('each pada is 10 ft long', approx($padas[0]['end_ft'] - $padas[0]['start_ft'], 10.0));
check('padas are numbered 1..9', $padas[0]['pada_index'] === 1 && $padas[8]['pada_index'] === 9);
check('padas tile the wall exactly (last end_ft = wall length)', approx($padas[8]['end_ft'], 90.0));

// -- Section 6: assignDoorToPada ---------------------------------------------
fwrite(STDOUT, "\nSection 6 - assignDoorToPada\n");
$assign = Geo::assignDoorToPada(5.0, $padas); // inside pada 1 (0-10)
check('door in the middle of a pada assigns to that single pada', $assign['pada_id'] === 1 && $assign['spans_pada_ids'] === null);

$assignSpan = Geo::assignDoorToPada(10.0, $padas); // exact boundary between pada 1 and 2
check('door exactly on a pada boundary spans both padas', $assignSpan['pada_id'] === null && $assignSpan['spans_pada_ids'] === [1, 2]);

// -- Tier 2.5 calibration: calibrateOffset / applyOffsetToAllReadings -------
fwrite(STDOUT, "\nTier 2.5 - calibrateOffset, applyOffsetToAllReadings\n");
$offset = Geo::calibrateOffset(203.8, 178.8); // spec-style scenario: raw reads 25 deg short of true
check('calibrateOffset recovers the known deviation', approx($offset, 25.0));
$corrected = Geo::applyOffsetToAllReadings([90.0, 355.0], $offset);
check('applyOffsetToAllReadings shifts every raw reading by the offset', approx($corrected[0], 115.0));
check('applyOffsetToAllReadings wraps past 360', approx($corrected[1], 20.0));

// -- Built-in AmbNiwas fixture (Tier 2 — satellite, cross-validated) --------
// See docs/VastuGriha_Geometry_Specification_v0.1.md "Reference test case".
// True North Rotation R = +23.8 deg (East). This block replicates exactly
// what VastuGeometryService::addWalls() computes for a wall, using the
// same square-plot fixture seeded in database/seed.sql Section 7: a
// 200x200 ft plot centered on the origin, front/gate wall = the south
// edge from (-20,-100) to (20,-100).
fwrite(STDOUT, "\nBuilt-in fixture - AmbNiwas front wall (Tier 2, not ground truth)\n");
$plotBoundary = [['x' => -100, 'y' => -100], ['x' => 100, 'y' => -100], ['x' => 100, 'y' => 100], ['x' => -100, 'y' => 100]];
$plotCentroid = Geo::polygonCentroid($plotBoundary);
$rotationR = 23.8;

$frontWallStart = ['x' => -20, 'y' => -100];
$frontWallEnd = ['x' => 20, 'y' => -100];
$midpointX = ($frontWallStart['x'] + $frontWallEnd['x']) / 2.0;
$midpointY = ($frontWallStart['y'] + $frontWallEnd['y']) / 2.0;

$planBearing = Geo::bearingFromCentroid($plotCentroid['x'], $plotCentroid['y'], $midpointX, $midpointY);
$trueBearing = Geo::planToTrueBearing($planBearing, $rotationR);
$frontZone = Geo::bearingToZone16($trueBearing);

check('plot centroid is (0,0)', approx($plotCentroid['x'], 0.0) && approx($plotCentroid['y'], 0.0));
check('front wall true bearing = 203.8 deg', approx($trueBearing, 203.8));
check('front wall zone = SSW', $frontZone['zone'] === 'SSW');
fwrite(STDOUT, "  -> computed: {$trueBearing} deg / {$frontZone['zone']}\n");

// -- Summary -------------------------------------------------------------
fwrite(STDOUT, "\n================================\n");
fwrite(STDOUT, "Passed: $passes   Failed: $failures\n");

if ($failures > 0) {
    fwrite(STDERR, "\nSelf-check FAILED — fix VastuGeometryMath before shipping this module.\n");
    exit(1);
}

fwrite(STDOUT, "\nAll checks passed.\n");
exit(0);
