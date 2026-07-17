<?php
declare(strict_types=1);

namespace Backend\Services;

use Backend\Core\Database;
use PDO;
use RuntimeException;

/**
 * Orchestration/persistence layer for the Vastu Griha "Plot Geometry & True
 * North Calibration" module. All trigonometry is delegated to the pure,
 * side-effect-free VastuGeometryMath — this class is where DB reads/writes,
 * validation, and the request/response shape live.
 *
 * Geometry only, per docs/VastuGriha_Geometry_Specification_v0.1.md
 * Section 10 — nothing here ever produces a Vastu verdict, severity, or
 * remedy.
 */
final class VastuGeometryService
{
    private const CONFIDENCE_TIERS = ['tier1_survey', 'tier2_satellite', 'tier3_compass'];

    private PDO $pdo;
    private SettingsService $settings;

    public function __construct()
    {
        $this->pdo = Database::connection();
        $this->settings = new SettingsService();
    }

    // ------------------------------------------------------------------
    // Plots
    // ------------------------------------------------------------------

    /**
     * @param array<string,mixed> $payload
     * @return array<string,mixed>
     */
    public function createPlot(?int $userId, array $payload): array
    {
        $name = $this->cleanString($payload['name'] ?? '', 191);
        if ($name === '') {
            throw new RuntimeException(json_encode(['errors' => ['name' => 'Plot name is required.']]), 422);
        }

        $tier = (string) ($payload['confidence_tier'] ?? '');
        if (!in_array($tier, self::CONFIDENCE_TIERS, true)) {
            throw new RuntimeException(json_encode([
                'errors' => ['confidence_tier' => 'Must be one of: ' . implode(', ', self::CONFIDENCE_TIERS)],
            ]), 422);
        }

        $rawVertices = $payload['boundary_vertices'] ?? null;
        if (!is_array($rawVertices) || count($rawVertices) < 3) {
            throw new RuntimeException(json_encode([
                'errors' => ['boundary_vertices' => 'At least 3 boundary vertices are required.'],
            ]), 422);
        }

        // ASSUMPTION: coordinate_type defaults to 'local_ft' (vertices already
        // in local planar feet, e.g. digitized pixel coordinates the
        // frontend has already scaled). When 'latlon' is passed, vertices
        // are {lat, lon} pairs converted via spec Section 0.1. The spec
        // allows an "arbitrary local reference point" for lat0/lon0; this
        // implementation uses the FIRST supplied vertex as that origin,
        // since it's the only reference point available before a centroid
        // can be computed (the centroid itself depends on already-converted
        // local coordinates).
        $coordinateType = (string) ($payload['coordinate_type'] ?? 'local_ft');
        $vertices = $this->normalizeVertices($rawVertices, $coordinateType);

        $centroid = VastuGeometryMath::polygonCentroid($vertices);
        $rotationR = isset($payload['true_north_rotation_r']) && is_numeric($payload['true_north_rotation_r'])
            ? (float) $payload['true_north_rotation_r']
            : 0.0;

        $stmt = $this->pdo->prepare(
            'INSERT INTO `vastu_plots`
             (`name`, `boundary_vertices`, `centroid_x`, `centroid_y`, `true_north_rotation_r`, `confidence_tier`, `created_by`, `created_at`, `updated_at`)
             VALUES (:name, :boundary_vertices, :centroid_x, :centroid_y, :rotation_r, :tier, :created_by, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)'
        );
        $stmt->execute([
            'name' => $name,
            'boundary_vertices' => json_encode(array_values($vertices), JSON_UNESCAPED_UNICODE),
            'centroid_x' => $centroid['x'],
            'centroid_y' => $centroid['y'],
            'rotation_r' => $rotationR,
            'tier' => $tier,
            'created_by' => $userId,
        ]);

        return $this->getPlotRow((int) $this->pdo->lastInsertId());
    }

    // ------------------------------------------------------------------
    // Walls
    // ------------------------------------------------------------------

    /**
     * @param array<string,mixed> $payload {walls: [{corner_start:{x,y}, corner_end:{x,y}}, ...]}
     *                                     or a single {corner_start, corner_end} shorthand.
     * @return array<int,array<string,mixed>>
     */
    public function addWalls(int $plotId, array $payload): array
    {
        $plot = $this->requirePlot($plotId);
        $wallsInput = $payload['walls'] ?? (isset($payload['corner_start']) ? [$payload] : null);
        if (!is_array($wallsInput) || count($wallsInput) === 0) {
            throw new RuntimeException(json_encode([
                'errors' => ['walls' => 'At least one wall (corner_start + corner_end) is required.'],
            ]), 422);
        }

        $padaCount = $this->settings->int('vastu_geometry.pada_count', 9);
        $boundaryTolerance = (float) $this->settings->string('vastu_geometry.boundary_tolerance_degrees', '0.5');

        $created = [];
        $this->pdo->beginTransaction();
        try {
            foreach ($wallsInput as $index => $wallInput) {
                $start = $this->requirePoint($wallInput['corner_start'] ?? null, "walls.$index.corner_start");
                $end = $this->requirePoint($wallInput['corner_end'] ?? null, "walls.$index.corner_end");

                $lengthFt = sqrt(($end['x'] - $start['x']) ** 2 + ($end['y'] - $start['y']) ** 2);
                if ($lengthFt <= 0) {
                    throw new RuntimeException(json_encode([
                        'errors' => ["walls.$index" => 'Wall corner_start and corner_end cannot coincide.'],
                    ]), 422);
                }

                $midpointX = ($start['x'] + $end['x']) / 2.0;
                $midpointY = ($start['y'] + $end['y']) / 2.0;
                $planBearing = VastuGeometryMath::bearingFromCentroid(
                    (float) $plot['centroid_x'],
                    (float) $plot['centroid_y'],
                    $midpointX,
                    $midpointY
                );
                $trueBearing = VastuGeometryMath::planToTrueBearing($planBearing, (float) $plot['true_north_rotation_r']);

                $stmt = $this->pdo->prepare(
                    'INSERT INTO `vastu_walls`
                     (`plot_id`, `corner_start_x`, `corner_start_y`, `corner_end_x`, `corner_end_y`, `length_ft`, `facing_bearing_true`, `created_at`)
                     VALUES (:plot_id, :sx, :sy, :ex, :ey, :length_ft, :bearing_true, CURRENT_TIMESTAMP)'
                );
                $stmt->execute([
                    'plot_id' => $plotId,
                    'sx' => $start['x'], 'sy' => $start['y'],
                    'ex' => $end['x'], 'ey' => $end['y'],
                    'length_ft' => $lengthFt,
                    'bearing_true' => $trueBearing,
                ]);
                $wallId = (int) $this->pdo->lastInsertId();

                $this->generatePadasForWall($wallId, $start, $end, $lengthFt, $plot, $padaCount, $boundaryTolerance);

                $created[] = $this->getWallRow($wallId);
            }
            $this->pdo->commit();
        } catch (\Throwable $e) {
            $this->pdo->rollBack();
            throw $e;
        }

        return $created;
    }

    /**
     * Spec Section 4 — generate $padaCount equal-length padas for a wall.
     * Numbering starts at pada_index 1 from $start (see assumption comment
     * on VastuGeometryMath::divideWallIntoPadas re: spec Section 7 Open
     * Question 1, pada numbering direction not yet resolved against source
     * texts).
     *
     * @param array{x: float, y: float} $start
     * @param array{x: float, y: float} $end
     * @param array<string,mixed> $plot
     */
    private function generatePadasForWall(int $wallId, array $start, array $end, float $lengthFt, array $plot, int $padaCount, float $boundaryTolerance): void
    {
        $padas = VastuGeometryMath::divideWallIntoPadas($lengthFt, $padaCount);
        $stmt = $this->pdo->prepare(
            'INSERT INTO `vastu_padas`
             (`wall_id`, `pada_index`, `start_ft`, `end_ft`, `midpoint_x`, `midpoint_y`, `bearing_from_centroid`, `zone_16`, `zone_32`, `created_at`)
             VALUES (:wall_id, :pada_index, :start_ft, :end_ft, :mx, :my, :bearing_plan, :zone_16, :zone_32, CURRENT_TIMESTAMP)'
        );

        foreach ($padas as $pada) {
            $t = $lengthFt > 0 ? ($pada['midpoint_ft'] / $lengthFt) : 0.0;
            $midpointX = $start['x'] + $t * ($end['x'] - $start['x']);
            $midpointY = $start['y'] + $t * ($end['y'] - $start['y']);

            $planBearing = VastuGeometryMath::bearingFromCentroid(
                (float) $plot['centroid_x'],
                (float) $plot['centroid_y'],
                $midpointX,
                $midpointY
            );
            $trueBearing = VastuGeometryMath::planToTrueBearing($planBearing, (float) $plot['true_north_rotation_r']);
            $zone16 = VastuGeometryMath::bearingToZone16($trueBearing, $boundaryTolerance);
            $zone32 = VastuGeometryMath::bearingToZone32($trueBearing, $boundaryTolerance);

            $stmt->execute([
                'wall_id' => $wallId,
                'pada_index' => $pada['pada_index'],
                'start_ft' => $pada['start_ft'],
                'end_ft' => $pada['end_ft'],
                'mx' => $midpointX,
                'my' => $midpointY,
                'bearing_plan' => $planBearing,
                'zone_16' => $zone16['zone'],
                'zone_32' => $zone32['zone'],
            ]);
        }
    }

    // ------------------------------------------------------------------
    // Rooms
    // ------------------------------------------------------------------

    /**
     * @param array<string,mixed> $payload {name, polygon_vertices: [{x,y}, ...]}
     * ASSUMPTION: polygon_vertices are already registered to the plot's
     * local coordinate frame (spec Section 5.3's full affine
     * scale+rotation+translation registration transform is a further
     * refinement not implemented by this endpoint; the frontend digitizer
     * is expected to place room vertices directly in plot-local feet).
     * @return array<string,mixed>
     */
    public function addRoom(int $plotId, array $payload): array
    {
        $plot = $this->requirePlot($plotId);

        $name = $this->cleanString($payload['name'] ?? '', 191);
        if ($name === '') {
            throw new RuntimeException(json_encode(['errors' => ['name' => 'Room name is required.']]), 422);
        }

        $rawVertices = $payload['polygon_vertices'] ?? null;
        if (!is_array($rawVertices) || count($rawVertices) < 3) {
            throw new RuntimeException(json_encode([
                'errors' => ['polygon_vertices' => 'At least 3 polygon vertices are required.'],
            ]), 422);
        }
        $vertices = $this->normalizeVertices($rawVertices, 'local_ft');
        $centroid = VastuGeometryMath::polygonCentroid($vertices);

        $boundaryTolerance = (float) $this->settings->string('vastu_geometry.boundary_tolerance_degrees', '0.5');
        $planBearing = VastuGeometryMath::bearingFromCentroid(
            (float) $plot['centroid_x'],
            (float) $plot['centroid_y'],
            $centroid['x'],
            $centroid['y']
        );
        $trueBearing = VastuGeometryMath::planToTrueBearing($planBearing, (float) $plot['true_north_rotation_r']);
        $zone16 = VastuGeometryMath::bearingToZone16($trueBearing, $boundaryTolerance);
        $zone32 = VastuGeometryMath::bearingToZone32($trueBearing, $boundaryTolerance);

        $stmt = $this->pdo->prepare(
            'INSERT INTO `vastu_rooms`
             (`plot_id`, `name`, `polygon_vertices`, `centroid_x`, `centroid_y`, `bearing_from_centroid`, `zone_16`, `zone_32`, `created_at`)
             VALUES (:plot_id, :name, :polygon_vertices, :cx, :cy, :bearing_plan, :zone_16, :zone_32, CURRENT_TIMESTAMP)'
        );
        $stmt->execute([
            'plot_id' => $plotId,
            'name' => $name,
            'polygon_vertices' => json_encode(array_values($vertices), JSON_UNESCAPED_UNICODE),
            'cx' => $centroid['x'],
            'cy' => $centroid['y'],
            'bearing_plan' => $planBearing,
            'zone_16' => $zone16['zone'],
            'zone_32' => $zone32['zone'],
        ]);

        return $this->getRoomRow((int) $this->pdo->lastInsertId());
    }

    // ------------------------------------------------------------------
    // Doors
    // ------------------------------------------------------------------

    /**
     * @param array<string,mixed> $payload {wall_id, position: {x,y}}
     * @return array<string,mixed>
     */
    public function addDoor(int $plotId, array $payload): array
    {
        $plot = $this->requirePlot($plotId);

        $wallId = (int) ($payload['wall_id'] ?? 0);
        $wall = $wallId > 0 ? $this->getWallRow($wallId) : null;
        if ($wall === null || (int) $wall['plot_id'] !== $plotId) {
            throw new RuntimeException(json_encode(['errors' => ['wall_id' => 'Wall not found on this plot.']]), 422);
        }

        $position = $this->requirePoint($payload['position'] ?? null, 'position');

        // Project the door position onto the wall's line to get its
        // distance-along-wall in feet (spec 6.3: door position as its own
        // registered coordinate, resolved into a wall-relative distance
        // rather than requiring the caller to compute that distance itself).
        $start = ['x' => (float) $wall['corner_start_x'], 'y' => (float) $wall['corner_start_y']];
        $end = ['x' => (float) $wall['corner_end_x'], 'y' => (float) $wall['corner_end_y']];
        $dx = $end['x'] - $start['x'];
        $dy = $end['y'] - $start['y'];
        $lengthSq = $dx * $dx + $dy * $dy;
        $t = $lengthSq > 0
            ? (($position['x'] - $start['x']) * $dx + ($position['y'] - $start['y']) * $dy) / $lengthSq
            : 0.0;
        $t = max(0.0, min(1.0, $t));
        $positionFt = $t * (float) $wall['length_ft'];

        $padaRows = $this->getPadaRowsForWall($wallId);
        $assignment = VastuGeometryMath::assignDoorToPada($positionFt, $padaRows);

        $boundaryTolerance = (float) $this->settings->string('vastu_geometry.boundary_tolerance_degrees', '0.5');
        $planBearing = VastuGeometryMath::bearingFromCentroid(
            (float) $plot['centroid_x'],
            (float) $plot['centroid_y'],
            $position['x'],
            $position['y']
        );
        $trueBearing = VastuGeometryMath::planToTrueBearing($planBearing, (float) $plot['true_north_rotation_r']);
        $zone16 = VastuGeometryMath::bearingToZone16($trueBearing, $boundaryTolerance);
        $zone32 = VastuGeometryMath::bearingToZone32($trueBearing, $boundaryTolerance);

        $stmt = $this->pdo->prepare(
            'INSERT INTO `vastu_doors`
             (`wall_id`, `position_x`, `position_y`, `pada_id`, `spans_pada_ids`, `bearing_from_centroid`, `zone_16`, `zone_32`, `created_at`)
             VALUES (:wall_id, :px, :py, :pada_id, :spans, :bearing_plan, :zone_16, :zone_32, CURRENT_TIMESTAMP)'
        );
        $stmt->execute([
            'wall_id' => $wallId,
            'px' => $position['x'],
            'py' => $position['y'],
            'pada_id' => $assignment['pada_id'],
            'spans' => $assignment['spans_pada_ids'] !== null ? json_encode($assignment['spans_pada_ids']) : null,
            'bearing_plan' => $planBearing,
            'zone_16' => $zone16['zone'],
            'zone_32' => $zone32['zone'],
        ]);

        return $this->getDoorRow((int) $this->pdo->lastInsertId());
    }

    // ------------------------------------------------------------------
    // Calibration
    // ------------------------------------------------------------------

    /**
     * Tier 2.5 calibration workflow. Input: a reference wall whose stored
     * `facing_bearing_true` is trusted (established via Tier 1/2 geometry
     * at wall-creation time), plus a fresh raw on-site compass reading of
     * that same wall.
     *
     * DESIGN NOTE (assumption, since the endpoint only takes one reference
     * wall + one raw reading, not a raw reading per wall): `offset` is
     * computed and stored as the diagnostic/audit value from
     * calibrateOffset() exactly per spec. The plot's true_north_rotation_r
     * is then re-derived directly from the reference wall's known-true
     * bearing and its (unchanging) geometric plan bearing:
     *   new_R = trueBearingOfReferenceWall - planBearingOfReferenceWall
     * "Updates all wall/pada/room/door bearings in that plot" is
     * implemented by recomputing every entity's true bearing (and, for
     * padas/rooms/doors, their zone_16/zone_32) from its already-stored
     * plan bearing plus new_R. This keeps the recompute fully determined
     * from data actually present in the schema, and is exact/idempotent
     * when the compass agrees with the existing geometric true bearing.
     *
     * @param array<string,mixed> $payload
     * @return array<string,mixed>
     */
    public function calibrate(int $plotId, array $payload): array
    {
        $plot = $this->requirePlot($plotId);

        $referenceWallId = (int) ($payload['reference_wall_id'] ?? 0);
        $referenceWall = $referenceWallId > 0 ? $this->getWallRow($referenceWallId) : null;
        if ($referenceWall === null || (int) $referenceWall['plot_id'] !== $plotId) {
            throw new RuntimeException(json_encode(['errors' => ['reference_wall_id' => 'Reference wall not found on this plot.']]), 422);
        }

        if (!isset($payload['raw_reading_degrees']) || !is_numeric($payload['raw_reading_degrees'])) {
            throw new RuntimeException(json_encode(['errors' => ['raw_reading_degrees' => 'A numeric raw compass reading is required.']]), 422);
        }
        $rawReading = (float) $payload['raw_reading_degrees'];

        $trueBearingOfReferenceWall = (float) $referenceWall['facing_bearing_true'];
        $offset = VastuGeometryMath::calibrateOffset($trueBearingOfReferenceWall, $rawReading);

        $referencePlanBearing = $this->wallPlanBearing($referenceWall);
        $newRotationR = VastuGeometryMath::normalizeBearing($trueBearingOfReferenceWall - $referencePlanBearing);
        // Keep the signed convention (rotation can be negative/West) rather
        // than the [0,360) wrap normalizeBearing produces, matching how R
        // is described in spec Section 1 ("positive = clockwise/East").
        if ($newRotationR > 180.0) {
            $newRotationR -= 360.0;
        }

        $boundaryTolerance = (float) $this->settings->string('vastu_geometry.boundary_tolerance_degrees', '0.5');

        $this->pdo->beginTransaction();
        try {
            $this->pdo->prepare('UPDATE `vastu_plots` SET `true_north_rotation_r` = :r, `updated_at` = CURRENT_TIMESTAMP WHERE `id` = :id')
                ->execute(['r' => $newRotationR, 'id' => $plotId]);

            $this->recomputeWallBearings($plotId, $newRotationR);
            $this->recomputePadaZones($plotId, $newRotationR, $boundaryTolerance);
            $this->recomputeRoomZones($plotId, $newRotationR, $boundaryTolerance);
            $this->recomputeDoorZones($plotId, $newRotationR, $boundaryTolerance);

            $calibrationStmt = $this->pdo->prepare(
                'INSERT INTO `vastu_calibrations`
                 (`plot_id`, `reference_wall_id`, `raw_reading_degrees`, `true_reading_degrees`, `offset_degrees`, `calibrated_at`)
                 VALUES (:plot_id, :wall_id, :raw, :true_reading, :offset, CURRENT_TIMESTAMP)'
            );
            $calibrationStmt->execute([
                'plot_id' => $plotId,
                'wall_id' => $referenceWallId,
                'raw' => $rawReading,
                'true_reading' => $trueBearingOfReferenceWall,
                'offset' => $offset,
            ]);
            $calibrationId = (int) $this->pdo->lastInsertId();

            $this->pdo->commit();
        } catch (\Throwable $e) {
            $this->pdo->rollBack();
            throw $e;
        }

        $result = [
            'calibration_id' => $calibrationId,
            'offset_degrees' => $offset,
            'true_north_rotation_r' => $newRotationR,
            'reference_wall' => $this->getWallRow($referenceWallId),
        ];

        // Step 5 (optional) — second-wall cross-check, ±tolerance pass/fail.
        // Not persisted (no column in vastu_calibrations for it per the
        // frozen table list); returned inline so the frontend can render
        // the pass/fail indicator immediately after "Apply to all".
        $secondWallId = (int) ($payload['second_reference_wall_id'] ?? 0);
        if ($secondWallId > 0 && isset($payload['second_raw_reading_degrees']) && is_numeric($payload['second_raw_reading_degrees'])) {
            $secondWall = $this->getWallRow($secondWallId);
            if ($secondWall !== null && (int) $secondWall['plot_id'] === $plotId) {
                $secondRaw = (float) $payload['second_raw_reading_degrees'];
                $correctedRaw = VastuGeometryMath::applyOffsetToAllReadings([$secondRaw], $offset)[0];
                $predictedTrue = (float) $secondWall['facing_bearing_true'];
                $crossCheckTolerance = (float) $this->settings->string('vastu_geometry.calibration_cross_check_tolerance_degrees', '2.0');
                $difference = VastuGeometryMath::angularDistance($correctedRaw, $predictedTrue);

                $result['cross_check'] = [
                    'wall_id' => $secondWallId,
                    'raw_reading_degrees' => $secondRaw,
                    'corrected_bearing' => $correctedRaw,
                    'predicted_true_bearing' => $predictedTrue,
                    'difference_degrees' => $difference,
                    'tolerance_degrees' => $crossCheckTolerance,
                    'pass' => $difference <= $crossCheckTolerance,
                ];
            }
        }

        return $result;
    }

    private function wallPlanBearing(array $wallRow): float
    {
        $plot = $this->requirePlot((int) $wallRow['plot_id']);
        $midpointX = ((float) $wallRow['corner_start_x'] + (float) $wallRow['corner_end_x']) / 2.0;
        $midpointY = ((float) $wallRow['corner_start_y'] + (float) $wallRow['corner_end_y']) / 2.0;

        return VastuGeometryMath::bearingFromCentroid(
            (float) $plot['centroid_x'],
            (float) $plot['centroid_y'],
            $midpointX,
            $midpointY
        );
    }

    private function recomputeWallBearings(int $plotId, float $newRotationR): void
    {
        $stmt = $this->pdo->prepare('SELECT * FROM `vastu_walls` WHERE `plot_id` = :plot_id');
        $stmt->execute(['plot_id' => $plotId]);
        $update = $this->pdo->prepare('UPDATE `vastu_walls` SET `facing_bearing_true` = :bearing WHERE `id` = :id');

        foreach ($stmt->fetchAll(PDO::FETCH_ASSOC) as $wall) {
            $planBearing = $this->wallPlanBearing($wall);
            $trueBearing = VastuGeometryMath::planToTrueBearing($planBearing, $newRotationR);
            $update->execute(['bearing' => $trueBearing, 'id' => $wall['id']]);
        }
    }

    private function recomputePadaZones(int $plotId, float $newRotationR, float $boundaryTolerance): void
    {
        $stmt = $this->pdo->prepare(
            'SELECT p.* FROM `vastu_padas` p
             JOIN `vastu_walls` w ON w.`id` = p.`wall_id`
             WHERE w.`plot_id` = :plot_id'
        );
        $stmt->execute(['plot_id' => $plotId]);
        $update = $this->pdo->prepare('UPDATE `vastu_padas` SET `zone_16` = :zone16, `zone_32` = :zone32 WHERE `id` = :id');

        foreach ($stmt->fetchAll(PDO::FETCH_ASSOC) as $pada) {
            $trueBearing = VastuGeometryMath::planToTrueBearing((float) $pada['bearing_from_centroid'], $newRotationR);
            $zone16 = VastuGeometryMath::bearingToZone16($trueBearing, $boundaryTolerance);
            $zone32 = VastuGeometryMath::bearingToZone32($trueBearing, $boundaryTolerance);
            $update->execute(['zone16' => $zone16['zone'], 'zone32' => $zone32['zone'], 'id' => $pada['id']]);
        }
    }

    private function recomputeRoomZones(int $plotId, float $newRotationR, float $boundaryTolerance): void
    {
        $stmt = $this->pdo->prepare('SELECT * FROM `vastu_rooms` WHERE `plot_id` = :plot_id');
        $stmt->execute(['plot_id' => $plotId]);
        $update = $this->pdo->prepare('UPDATE `vastu_rooms` SET `zone_16` = :zone16, `zone_32` = :zone32 WHERE `id` = :id');

        foreach ($stmt->fetchAll(PDO::FETCH_ASSOC) as $room) {
            $trueBearing = VastuGeometryMath::planToTrueBearing((float) $room['bearing_from_centroid'], $newRotationR);
            $zone16 = VastuGeometryMath::bearingToZone16($trueBearing, $boundaryTolerance);
            $zone32 = VastuGeometryMath::bearingToZone32($trueBearing, $boundaryTolerance);
            $update->execute(['zone16' => $zone16['zone'], 'zone32' => $zone32['zone'], 'id' => $room['id']]);
        }
    }

    private function recomputeDoorZones(int $plotId, float $newRotationR, float $boundaryTolerance): void
    {
        $stmt = $this->pdo->prepare(
            'SELECT d.* FROM `vastu_doors` d
             JOIN `vastu_walls` w ON w.`id` = d.`wall_id`
             WHERE w.`plot_id` = :plot_id'
        );
        $stmt->execute(['plot_id' => $plotId]);
        $update = $this->pdo->prepare('UPDATE `vastu_doors` SET `zone_16` = :zone16, `zone_32` = :zone32 WHERE `id` = :id');

        foreach ($stmt->fetchAll(PDO::FETCH_ASSOC) as $door) {
            $trueBearing = VastuGeometryMath::planToTrueBearing((float) $door['bearing_from_centroid'], $newRotationR);
            $zone16 = VastuGeometryMath::bearingToZone16($trueBearing, $boundaryTolerance);
            $zone32 = VastuGeometryMath::bearingToZone32($trueBearing, $boundaryTolerance);
            $update->execute(['zone16' => $zone16['zone'], 'zone32' => $zone32['zone'], 'id' => $door['id']]);
        }
    }

    // ------------------------------------------------------------------
    // Full geometry read
    // ------------------------------------------------------------------

    /** @return array<string,mixed> */
    public function getFullGeometry(int $plotId): array
    {
        $plot = $this->requirePlot($plotId);
        $boundaryTolerance = (float) $this->settings->string('vastu_geometry.boundary_tolerance_degrees', '0.5');
        $rotationR = (float) $plot['true_north_rotation_r'];

        $wallsStmt = $this->pdo->prepare('SELECT * FROM `vastu_walls` WHERE `plot_id` = :plot_id ORDER BY `id` ASC');
        $wallsStmt->execute(['plot_id' => $plotId]);
        $walls = [];
        foreach ($wallsStmt->fetchAll(PDO::FETCH_ASSOC) as $wallRow) {
            $trueBearing = (float) $wallRow['facing_bearing_true'];
            $planBearing = VastuGeometryMath::normalizeBearing($trueBearing - $rotationR);
            $zone16 = VastuGeometryMath::bearingToZone16($trueBearing, $boundaryTolerance);
            $zone32 = VastuGeometryMath::bearingToZone32($trueBearing, $boundaryTolerance);

            $wall = $this->hydrateWall($wallRow);
            $wall['bearing_plan'] = $planBearing;
            $wall['bearing_true'] = $trueBearing;
            $wall['zone_16'] = $zone16['zone'];
            $wall['zone_32'] = $zone32['zone'];
            $wall['boundary_case'] = $zone16['boundary_case'] || $zone32['boundary_case'];
            $wall['boundary_adjacent_zone_16'] = $zone16['adjacent_zone'];
            $wall['boundary_adjacent_zone_32'] = $zone32['adjacent_zone'];
            $wall['padas'] = array_map(
                fn (array $p) => $this->enrichEntity($p, $rotationR, $boundaryTolerance),
                $this->getPadaRowsForWall((int) $wallRow['id'])
            );

            $doorsStmt = $this->pdo->prepare('SELECT * FROM `vastu_doors` WHERE `wall_id` = :wall_id ORDER BY `id` ASC');
            $doorsStmt->execute(['wall_id' => $wallRow['id']]);
            $wall['doors'] = array_map(
                fn (array $d) => $this->enrichEntity($this->hydrateDoor($d), $rotationR, $boundaryTolerance),
                $doorsStmt->fetchAll(PDO::FETCH_ASSOC)
            );

            $walls[] = $wall;
        }

        $roomsStmt = $this->pdo->prepare('SELECT * FROM `vastu_rooms` WHERE `plot_id` = :plot_id ORDER BY `id` ASC');
        $roomsStmt->execute(['plot_id' => $plotId]);
        $rooms = array_map(
            fn (array $r) => $this->enrichEntity($this->hydrateRoom($r), $rotationR, $boundaryTolerance),
            $roomsStmt->fetchAll(PDO::FETCH_ASSOC)
        );

        $calibrationsStmt = $this->pdo->prepare('SELECT * FROM `vastu_calibrations` WHERE `plot_id` = :plot_id ORDER BY `calibrated_at` DESC');
        $calibrationsStmt->execute(['plot_id' => $plotId]);

        return [
            'plot' => $this->hydratePlot($plot),
            'walls' => $walls,
            'rooms' => $rooms,
            'calibrations' => array_map($this->hydrateCalibration(...), $calibrationsStmt->fetchAll(PDO::FETCH_ASSOC)),
        ];
    }

    /**
     * Adds bearing_plan/bearing_true/zone_16/zone_32/boundary_case to a
     * pada/room/door row whose `bearing_from_centroid` column already holds
     * the plan bearing. Zones are always re-derived live from the current
     * true_north_rotation_r rather than trusted from the stored zone_16/
     * zone_32 columns, so a plot that was calibrated through some path
     * other than POST /calibrate can never show stale zones.
     *
     * @param array<string,mixed> $row
     * @return array<string,mixed>
     */
    private function enrichEntity(array $row, float $rotationR, float $boundaryTolerance): array
    {
        $planBearing = (float) $row['bearing_from_centroid'];
        $trueBearing = VastuGeometryMath::planToTrueBearing($planBearing, $rotationR);
        $zone16 = VastuGeometryMath::bearingToZone16($trueBearing, $boundaryTolerance);
        $zone32 = VastuGeometryMath::bearingToZone32($trueBearing, $boundaryTolerance);

        $row['bearing_plan'] = $planBearing;
        $row['bearing_true'] = $trueBearing;
        $row['zone_16'] = $zone16['zone'];
        $row['zone_32'] = $zone32['zone'];
        $row['boundary_case'] = $zone16['boundary_case'] || $zone32['boundary_case'];
        $row['boundary_adjacent_zone_16'] = $zone16['adjacent_zone'];
        $row['boundary_adjacent_zone_32'] = $zone32['adjacent_zone'];

        return $row;
    }

    // ------------------------------------------------------------------
    // Row hydration
    // ------------------------------------------------------------------

    /** @return array<string,mixed> */
    private function hydratePlot(array $row): array
    {
        return [
            'id' => (int) $row['id'],
            'name' => (string) $row['name'],
            'boundary_vertices' => json_decode((string) $row['boundary_vertices'], true) ?? [],
            'centroid_x' => (float) $row['centroid_x'],
            'centroid_y' => (float) $row['centroid_y'],
            'true_north_rotation_r' => (float) $row['true_north_rotation_r'],
            'confidence_tier' => (string) $row['confidence_tier'],
            'created_by' => isset($row['created_by']) ? (int) $row['created_by'] : null,
            'created_at' => (string) $row['created_at'],
            'updated_at' => (string) $row['updated_at'],
        ];
    }

    /** @return array<string,mixed> */
    private function hydrateWall(array $row): array
    {
        return [
            'id' => (int) $row['id'],
            'plot_id' => (int) $row['plot_id'],
            'corner_start_x' => (float) $row['corner_start_x'],
            'corner_start_y' => (float) $row['corner_start_y'],
            'corner_end_x' => (float) $row['corner_end_x'],
            'corner_end_y' => (float) $row['corner_end_y'],
            'length_ft' => (float) $row['length_ft'],
            'facing_bearing_true' => (float) $row['facing_bearing_true'],
            'created_at' => (string) $row['created_at'],
        ];
    }

    /** @return array<string,mixed> */
    private function hydratePada(array $row): array
    {
        return [
            'id' => (int) $row['id'],
            'wall_id' => (int) $row['wall_id'],
            'pada_index' => (int) $row['pada_index'],
            'start_ft' => (float) $row['start_ft'],
            'end_ft' => (float) $row['end_ft'],
            'midpoint_x' => (float) $row['midpoint_x'],
            'midpoint_y' => (float) $row['midpoint_y'],
            'bearing_from_centroid' => (float) $row['bearing_from_centroid'],
        ];
    }

    /** @return array<string,mixed> */
    private function hydrateRoom(array $row): array
    {
        return [
            'id' => (int) $row['id'],
            'plot_id' => (int) $row['plot_id'],
            'name' => (string) $row['name'],
            'polygon_vertices' => json_decode((string) $row['polygon_vertices'], true) ?? [],
            'centroid_x' => (float) $row['centroid_x'],
            'centroid_y' => (float) $row['centroid_y'],
            'bearing_from_centroid' => (float) $row['bearing_from_centroid'],
        ];
    }

    /** @return array<string,mixed> */
    private function hydrateDoor(array $row): array
    {
        return [
            'id' => (int) $row['id'],
            'wall_id' => (int) $row['wall_id'],
            'position_x' => (float) $row['position_x'],
            'position_y' => (float) $row['position_y'],
            'pada_id' => $row['pada_id'] !== null ? (int) $row['pada_id'] : null,
            'spans_pada_ids' => $row['spans_pada_ids'] ? json_decode((string) $row['spans_pada_ids'], true) : null,
            'bearing_from_centroid' => (float) $row['bearing_from_centroid'],
        ];
    }

    /** @return array<string,mixed> */
    private function hydrateCalibration(array $row): array
    {
        return [
            'id' => (int) $row['id'],
            'plot_id' => (int) $row['plot_id'],
            'reference_wall_id' => (int) $row['reference_wall_id'],
            'raw_reading_degrees' => (float) $row['raw_reading_degrees'],
            'true_reading_degrees' => (float) $row['true_reading_degrees'],
            'offset_degrees' => (float) $row['offset_degrees'],
            'calibrated_at' => (string) $row['calibrated_at'],
        ];
    }

    // ------------------------------------------------------------------
    // Lookups / helpers
    // ------------------------------------------------------------------

    /** @return array<string,mixed> */
    private function requirePlot(int $plotId): array
    {
        $plot = $this->getPlotRow($plotId);
        if ($plot === null) {
            throw new RuntimeException('Plot not found.', 404);
        }
        return $plot;
    }

    /** @return array<string,mixed>|null */
    private function getPlotRow(int $plotId): ?array
    {
        $stmt = $this->pdo->prepare('SELECT * FROM `vastu_plots` WHERE `id` = :id LIMIT 1');
        $stmt->execute(['id' => $plotId]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        return $row !== false ? $row : null;
    }

    /** @return array<string,mixed>|null */
    private function getWallRow(int $wallId): ?array
    {
        $stmt = $this->pdo->prepare('SELECT * FROM `vastu_walls` WHERE `id` = :id LIMIT 1');
        $stmt->execute(['id' => $wallId]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        return $row !== false ? $this->hydrateWall($row) : null;
    }

    /** @return array<string,mixed>|null */
    private function getRoomRow(int $roomId): ?array
    {
        $stmt = $this->pdo->prepare('SELECT * FROM `vastu_rooms` WHERE `id` = :id LIMIT 1');
        $stmt->execute(['id' => $roomId]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        return $row !== false ? $this->hydrateRoom($row) : null;
    }

    /** @return array<string,mixed>|null */
    private function getDoorRow(int $doorId): ?array
    {
        $stmt = $this->pdo->prepare('SELECT * FROM `vastu_doors` WHERE `id` = :id LIMIT 1');
        $stmt->execute(['id' => $doorId]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        return $row !== false ? $this->hydrateDoor($row) : null;
    }

    /** @return list<array<string,mixed>> */
    private function getPadaRowsForWall(int $wallId): array
    {
        $stmt = $this->pdo->prepare('SELECT * FROM `vastu_padas` WHERE `wall_id` = :wall_id ORDER BY `pada_index` ASC');
        $stmt->execute(['wall_id' => $wallId]);
        return array_map($this->hydratePada(...), $stmt->fetchAll(PDO::FETCH_ASSOC));
    }

    /**
     * @param list<array{x: mixed, y: mixed}|array{lat: mixed, lon: mixed}> $rawVertices
     * @return list<array{x: float, y: float}>
     */
    private function normalizeVertices(array $rawVertices, string $coordinateType): array
    {
        if ($coordinateType === 'latlon') {
            $first = $rawVertices[0] ?? null;
            if (!is_array($first) || !isset($first['lat'], $first['lon'])) {
                throw new RuntimeException(json_encode([
                    'errors' => ['boundary_vertices' => 'latlon vertices require {lat, lon} pairs.'],
                ]), 422);
            }
            $lat0 = (float) $first['lat'];
            $lon0 = (float) $first['lon'];

            $vertices = [];
            foreach ($rawVertices as $index => $vertex) {
                if (!is_array($vertex) || !isset($vertex['lat'], $vertex['lon']) || !is_numeric($vertex['lat']) || !is_numeric($vertex['lon'])) {
                    throw new RuntimeException(json_encode([
                        'errors' => ["boundary_vertices.$index" => 'Each vertex requires numeric lat and lon.'],
                    ]), 422);
                }
                $vertices[] = VastuGeometryMath::latLongToLocalFeet((float) $vertex['lat'], (float) $vertex['lon'], $lat0, $lon0);
            }
            return $vertices;
        }

        $vertices = [];
        foreach ($rawVertices as $index => $vertex) {
            $vertices[] = $this->requirePoint($vertex, "boundary_vertices.$index");
        }
        return $vertices;
    }

    /** @return array{x: float, y: float} */
    private function requirePoint(mixed $point, string $field): array
    {
        if (!is_array($point) || !isset($point['x'], $point['y']) || !is_numeric($point['x']) || !is_numeric($point['y'])) {
            throw new RuntimeException(json_encode(['errors' => [$field => 'Requires numeric x and y.']]), 422);
        }
        return ['x' => (float) $point['x'], 'y' => (float) $point['y']];
    }

    private function cleanString(mixed $value, int $maxLength): string
    {
        $clean = strip_tags((string) $value);
        $clean = preg_replace('/[\x00-\x1F\x7F]/', ' ', $clean) ?? $clean;
        $clean = preg_replace('/\s+/', ' ', $clean) ?? $clean;
        return mb_substr(trim($clean), 0, $maxLength);
    }
}
