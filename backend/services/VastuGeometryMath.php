<?php
declare(strict_types=1);

namespace Backend\Services;

/**
 * Pure geometry/trigonometry functions for the Vastu Griha "Plot Geometry &
 * True North Calibration" layer.
 *
 * Implements docs/VastuGriha_Geometry_Specification_v0.1.md sections
 * 0.1, 0.2, 2, 3, 4 and 6 verbatim, plus the Tier 2.5 on-site compass
 * calibration method (calibrateOffset / applyOffsetToAllReadings) added in
 * the engineering session that produced this module — not literal text in
 * the frozen spec, but a direct implementation of the compass-correction
 * workflow described in spec Section 1's "Compass fallback caveat".
 *
 * No side effects: no DB access, no I/O, no static mutable state. Every
 * function is deterministic given its inputs, which is what makes this
 * class directly unit-testable (see scripts/test-vastu-geometry.php).
 *
 * Geometry only — per spec Section 10, nothing in this class ever produces
 * a Vastu verdict, severity, or remedy.
 */
final class VastuGeometryMath
{
    /** Feet per degree of latitude, per spec Section 0.1. */
    private const FEET_PER_DEGREE_LATITUDE = 364000.0;

    /** 16-direction compass names, index 0 = N, clockwise, 22.5 deg apart. */
    private const ZONE_16_NAMES = [
        'N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE',
        'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW',
    ];

    /** 32-direction compass names (standard nautical points), index 0 = N, 11.25 deg apart. */
    private const ZONE_32_NAMES = [
        'N', 'NbE', 'NNE', 'NEbN', 'NE', 'NEbE', 'ENE', 'EbN',
        'E', 'EbS', 'ESE', 'SEbE', 'SE', 'SEbS', 'SSE', 'SbE',
        'S', 'SbW', 'SSW', 'SWbS', 'SW', 'SWbW', 'WSW', 'WbS',
        'W', 'WbN', 'WNW', 'NWbW', 'NW', 'NWbN', 'NNW', 'NbW',
    ];

    /**
     * Spec Section 0.1 — lat/long to local planar feet, flat-earth
     * approximation valid for plots under ~1000 ft.
     *
     * @return array{x: float, y: float}
     */
    public static function latLongToLocalFeet(float $lat, float $lon, float $lat0, float $lon0): array
    {
        return [
            'x' => ($lon - $lon0) * cos(deg2rad($lat0)) * self::FEET_PER_DEGREE_LATITUDE,
            'y' => ($lat - $lat0) * self::FEET_PER_DEGREE_LATITUDE,
        ];
    }

    /**
     * Spec Section 0.2 — pixel space to bearing. Image y increases downward
     * so it must be inverted before it represents "north". Satellite pixel
     * bearings computed this way are already true bearings (no rotation
     * correction needed), provided the source screenshot is confirmed
     * north-up.
     */
    public static function pixelBearing(float $x1, float $y1, float $x2, float $y2): float
    {
        $dx = $x2 - $x1;
        $dyNorth = -($y2 - $y1);
        return self::normalizeBearing(rad2deg(atan2($dx, $dyNorth)));
    }

    /**
     * Spec Section 2 — shoelace-formula polygon centroid (true area
     * centroid, not bounding-box midpoint). Vertices must be ordered
     * consistently (CW or CCW) in local planar feet.
     *
     * @param list<array{x: float, y: float}> $vertices
     * @return array{x: float, y: float, area: float}
     */
    public static function polygonCentroid(array $vertices): array
    {
        $n = count($vertices);
        if ($n < 3) {
            throw new \InvalidArgumentException('polygonCentroid requires at least 3 vertices.');
        }

        $areaSum = 0.0;
        $cxSum = 0.0;
        $cySum = 0.0;

        for ($i = 0; $i < $n; $i++) {
            $j = ($i + 1) % $n;
            $xi = (float) $vertices[$i]['x'];
            $yi = (float) $vertices[$i]['y'];
            $xj = (float) $vertices[$j]['x'];
            $yj = (float) $vertices[$j]['y'];

            $cross = $xi * $yj - $xj * $yi;
            $areaSum += $cross;
            $cxSum += ($xi + $xj) * $cross;
            $cySum += ($yi + $yj) * $cross;
        }

        $area = $areaSum / 2.0;
        if (abs($area) < 1.0e-9) {
            throw new \InvalidArgumentException('polygonCentroid: degenerate polygon (zero area).');
        }

        return [
            'x' => $cxSum / (6.0 * $area),
            'y' => $cySum / (6.0 * $area),
            'area' => abs($area),
        ];
    }

    /**
     * Spec Section 3 — bearing of point P as seen from centroid C, both
     * already in local planar feet (y = North, positive already means
     * north — unlike pixelBearing, no inversion here).
     */
    public static function bearingFromCentroid(float $centroidX, float $centroidY, float $pointX, float $pointY): float
    {
        $east = $pointX - $centroidX;
        $north = $pointY - $centroidY;
        return self::normalizeBearing(rad2deg(atan2($east, $north)));
    }

    /**
     * Spec Section 3 — converts a floor-plan ("plan-north") bearing into a
     * true bearing using the plot's True North Rotation Angle R. Only
     * needed for floor-plan-derived angles; satellite-derived bearings are
     * already true per Section 0.2.
     */
    public static function planToTrueBearing(float $planBearing, float $rotationR): float
    {
        return self::normalizeBearing($planBearing + $rotationR);
    }

    /**
     * Spec Section 3 — 16-direction (22.5 deg sector) zone resolution, with
     * boundary-case flag if the bearing falls within $boundaryToleranceDeg
     * of a sector edge (default 0.5 deg per spec).
     *
     * @return array{zone: string, boundary_case: bool, adjacent_zone: ?string}
     */
    public static function bearingToZone16(float $bearing, float $boundaryToleranceDeg = 0.5): array
    {
        return self::bearingToZone($bearing, self::ZONE_16_NAMES, 22.5, $boundaryToleranceDeg);
    }

    /**
     * Spec Section 3 — 32-direction (11.25 deg sector) zone resolution,
     * used for pada-level precision (spec Section 4).
     *
     * @return array{zone: string, boundary_case: bool, adjacent_zone: ?string}
     */
    public static function bearingToZone32(float $bearing, float $boundaryToleranceDeg = 0.5): array
    {
        return self::bearingToZone($bearing, self::ZONE_32_NAMES, 11.25, $boundaryToleranceDeg);
    }

    /**
     * @param list<string> $names
     * @return array{zone: string, boundary_case: bool, adjacent_zone: ?string}
     */
    private static function bearingToZone(float $bearing, array $names, float $sectorWidth, float $toleranceDeg): array
    {
        $bearing = self::normalizeBearing($bearing);
        $count = count($names);
        $index = ((int) round($bearing / $sectorWidth)) % $count;
        $zone = $names[$index];

        // Sector for index i is centered at i * sectorWidth, so its edges
        // sit at (i - 0.5) * sectorWidth and (i + 0.5) * sectorWidth.
        $lowerEdge = self::normalizeBearing(($index - 0.5) * $sectorWidth);
        $upperEdge = self::normalizeBearing(($index + 0.5) * $sectorWidth);
        $distToLower = self::angularDistance($bearing, $lowerEdge);
        $distToUpper = self::angularDistance($bearing, $upperEdge);
        $boundaryCase = min($distToLower, $distToUpper) <= $toleranceDeg;

        $adjacentZone = null;
        if ($boundaryCase) {
            $adjacentIndex = $distToLower <= $distToUpper
                ? ($index - 1 + $count) % $count
                : ($index + 1) % $count;
            $adjacentZone = $names[$adjacentIndex];
        }

        return [
            'zone' => $zone,
            'boundary_case' => $boundaryCase,
            'adjacent_zone' => $adjacentZone,
        ];
    }

    /**
     * Spec Section 4 — divide a wall of given length into $padaCount
     * equal-length padas (classical default = 9, the 9x9 Vastu Purusha
     * Mandala). Numbering starts at pada_index 1 from corner_start and
     * proceeds toward corner_end.
     *
     * ASSUMPTION (spec Section 7, Open Question 1 — pada numbering
     * start point/direction is explicitly unresolved pending KB entries
     * per classical source text): this function numbers sequentially from
     * whichever vertex the caller designates as corner_start. The caller
     * (VastuGeometryService) always passes the wall's stored corner_start
     * as the numbering origin, so numbering direction is stable and
     * reproducible even though it is not yet validated against a specific
     * classical text.
     *
     * @return list<array{pada_index: int, start_ft: float, end_ft: float, midpoint_ft: float}>
     */
    public static function divideWallIntoPadas(float $wallLength, int $padaCount = 9): array
    {
        if ($padaCount < 1) {
            throw new \InvalidArgumentException('divideWallIntoPadas requires padaCount >= 1.');
        }

        $padaLength = $wallLength / $padaCount;
        $padas = [];
        for ($i = 0; $i < $padaCount; $i++) {
            $start = $i * $padaLength;
            $end = ($i + 1) * $padaLength;
            $padas[] = [
                'pada_index' => $i + 1,
                'start_ft' => $start,
                'end_ft' => $end,
                'midpoint_ft' => ($start + $end) / 2.0,
            ];
        }

        return $padas;
    }

    /**
     * Spec Section 6 — assign a door (given as a distance-along-wall in
     * feet from corner_start) to whichever pada's [start_ft, end_ft) range
     * contains it. A door that lands exactly on a shared boundary between
     * two padas is recorded as spanning both (spec 6.4) rather than forced
     * into a single pada.
     *
     * @param list<array{pada_index?: int, id?: int, start_ft: float, end_ft: float}> $padasOnWall
     * @return array{pada_id: int|null, spans_pada_ids: list<int>|null}
     */
    public static function assignDoorToPada(float $doorPositionFt, array $padasOnWall): array
    {
        $matches = [];
        foreach ($padasOnWall as $pada) {
            if ($doorPositionFt >= $pada['start_ft'] && $doorPositionFt <= $pada['end_ft']) {
                $matches[] = $pada;
            }
        }

        if (count($matches) === 0) {
            return ['pada_id' => null, 'spans_pada_ids' => null];
        }

        if (count($matches) === 1) {
            return ['pada_id' => self::padaIdentifier($matches[0]), 'spans_pada_ids' => null];
        }

        // Falls exactly on a shared edge between two adjacent padas.
        return [
            'pada_id' => null,
            'spans_pada_ids' => array_map(self::padaIdentifier(...), $matches),
        ];
    }

    private static function padaIdentifier(array $pada): int
    {
        return (int) ($pada['id'] ?? $pada['pada_index']);
    }

    /**
     * Tier 2.5 calibration method (this session's addition, see class
     * docblock). Computes the signed offset between a wall's independently
     * known true bearing (Tier 1/2, e.g. satellite pixel bearing) and a
     * raw on-site magnetic compass reading of that same wall. The offset
     * is the site's apparent magnetic deviation (declination + local
     * interference combined into a single empirical constant), expressed
     * in the shortest-path signed range (-180, 180].
     */
    public static function calibrateOffset(float $trueBearingOfReferenceWall, float $rawCompassReadingOfSameWall): float
    {
        $diff = self::normalizeBearing($trueBearingOfReferenceWall) - self::normalizeBearing($rawCompassReadingOfSameWall);
        $diff = fmod($diff + 180.0, 360.0);
        if ($diff < 0) {
            $diff += 360.0;
        }
        return $diff - 180.0;
    }

    /**
     * Tier 2.5 calibration method — applies a previously computed offset to
     * an array of raw compass readings (e.g. of other walls measured with
     * the same compass, at the same site/session) to produce corrected
     * true bearings.
     *
     * @param list<float> $rawReadings
     * @return list<float>
     */
    public static function applyOffsetToAllReadings(array $rawReadings, float $offset): array
    {
        return array_map(
            static fn (float $raw): float => self::normalizeBearing($raw + $offset),
            $rawReadings
        );
    }

    /** Shortest angular distance between two bearings, always in [0, 180]. */
    public static function angularDistance(float $a, float $b): float
    {
        $diff = fmod(abs(self::normalizeBearing($a) - self::normalizeBearing($b)), 360.0);
        return $diff > 180.0 ? 360.0 - $diff : $diff;
    }

    /** Normalizes any bearing into [0, 360). */
    public static function normalizeBearing(float $bearing): float
    {
        $b = fmod($bearing, 360.0);
        if ($b < 0) {
            $b += 360.0;
        }
        return $b;
    }
}
