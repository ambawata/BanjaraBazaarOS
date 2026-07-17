<?php
declare(strict_types=1);

namespace Backend\Services;

use RuntimeException;

/**
 * Thin wrapper service for the consumer-friendly "My Home" onboarding
 * wizard (/vastu-griha/my-home). Does NOT duplicate geometry math or
 * plot-persistence logic — every actual computation is delegated to the
 * existing, untouched VastuGeometryMath / VastuGeometryService (this file
 * only reshapes request payloads and composes calls to their already-public
 * methods), and zone classification for the simplified 9-cell grid reuses
 * VastuVerdictMatcher::bearingToZone8() (merged with the Verdict Layer,
 * PR #2) rather than re-deriving an 8-direction reduction a second time.
 *
 * CORE UX PRINCIPLE this class exists to serve: a map-traced boundary is
 * inherently north-up (the user is tracing real satellite imagery, not a
 * hand-drawn floor plan), so no manual True North calibration is ever
 * needed for this flow. confidence_tier is hardcoded to 'tier2_satellite'
 * and true_north_rotation_r is always 0 — both are internal facts the
 * geometry engine still needs to store, never surfaced to the consumer
 * frontend.
 */
final class VastuMapOnboardingService
{
    private const CONFIDENCE_TIER = 'tier2_satellite';

    private VastuGeometryService $geometry;
    private SettingsService $settings;

    public function __construct()
    {
        $this->geometry = new VastuGeometryService();
        $this->settings = new SettingsService();
    }

    /**
     * POST /api/v1/vastu-geometry/plots/from-map
     *
     * @param array<string,mixed> $payload {name, address?, boundary_latlng: [{lat, lng}, ...]}
     * @return array<string,mixed> the created plot (same shape VastuGeometryService::createPlot returns)
     */
    public function createPlotFromMap(?int $userId, array $payload): array
    {
        $name = trim((string) ($payload['name'] ?? ''));
        if ($name === '') {
            throw new RuntimeException(json_encode(['errors' => ['name' => 'Ghar ka naam zaroori hai (house name is required).']]), 422);
        }

        // Address has no dedicated column on vastu_plots (no schema change
        // in this task) — folded into the existing `name` field rather than
        // silently discarded, since the user typed it for a reason.
        $address = trim((string) ($payload['address'] ?? ''));
        $displayName = $address !== '' ? "$name — $address" : $name;

        $rawLatLng = $payload['boundary_latlng'] ?? null;
        $minCorners = $this->settings->int('vastu_onboarding.min_corners', 3);
        if (!is_array($rawLatLng) || count($rawLatLng) < $minCorners) {
            throw new RuntimeException(json_encode([
                'errors' => ['boundary_latlng' => "Kam se kam $minCorners corners tap karo plot ke boundary pe (at least $minCorners corners required)."],
            ]), 422);
        }

        // VastuGeometryService::createPlot() already has a coordinate_type
        // 'latlon' branch (normalizeVertices()) that converts every vertex
        // via VastuGeometryMath::latLongToLocalFeet() using the FIRST vertex
        // as the lat0/lon0 local-planar origin, per spec Section 0.1 — this
        // wrapper just reshapes {lat,lng} (Leaflet's convention) into the
        // {lat,lon} shape that method already expects, and delegates
        // straight to it. No geometry math is re-implemented here.
        $boundaryVertices = [];
        foreach ($rawLatLng as $index => $point) {
            if (!is_array($point) || !isset($point['lat'], $point['lng']) || !is_numeric($point['lat']) || !is_numeric($point['lng'])) {
                throw new RuntimeException(json_encode([
                    'errors' => ["boundary_latlng.$index" => 'Har corner ke paas lat aur lng dono hone chahiye.'],
                ]), 422);
            }
            $boundaryVertices[] = ['lat' => (float) $point['lat'], 'lon' => (float) $point['lng']];
        }

        // true_north_rotation_r intentionally omitted — createPlot()
        // defaults it to 0.0 when absent, which is exactly correct here
        // (map-traced coordinates are inherently north-up; see class
        // docblock). confidence_tier is hardcoded, never taken from the
        // request, so this flow cannot accidentally claim a tier it didn't
        // actually achieve.
        return $this->geometry->createPlot($userId, [
            'name' => $displayName,
            'confidence_tier' => self::CONFIDENCE_TIER,
            'coordinate_type' => 'latlon',
            'boundary_vertices' => $boundaryVertices,
        ]);
    }

    /**
     * GET /api/v1/vastu-geometry/plots/{id}/zone-grid
     *
     * Simplified 9-cell (3x3) breakdown of the plot's bounding box for the
     * consumer room-tagging step — a deliberate simplification vs. the
     * advanced tool's precise per-room polygon-centroid method (spec
     * Section 5), appropriate for "which rough zone is my kitchen in", not
     * professional Vastu consulting accuracy.
     *
     * Reading order is row-major, north row first, west column first
     * (row0col0 = NW corner cell ... row2col2 = SE corner cell), matching
     * how the frontend independently subdivides its own remembered
     * lat/lng bounding box for on-map rendering — see
     * apps/vastu-griha/src/pages/MyHomeWizardPage.jsx for why the frontend
     * does NOT need this response to include lat/lng: as long as both
     * sides use the same row-major convention, the zone labels line up
     * with the visually-rendered grid cells without the backend needing to
     * invert the local-ft coordinates back to lat/lng (which it couldn't
     * do reliably anyway — lat0/lon0 is used once at plot-creation time by
     * VastuGeometryService::normalizeVertices() and is not persisted
     * anywhere on the plot row).
     *
     * @return array<string,mixed>
     */
    public function getZoneGrid(int $plotId): array
    {
        $full = $this->geometry->getFullGeometry($plotId);
        $plot = $full['plot'];

        $vertices = $plot['boundary_vertices'];
        if (!is_array($vertices) || count($vertices) < 3) {
            throw new RuntimeException('Plot has no valid boundary yet.', 422);
        }

        $xs = array_column($vertices, 'x');
        $ys = array_column($vertices, 'y');
        $xMin = min($xs);
        $xMax = max($xs);
        $yMin = min($ys);
        $yMax = max($ys);

        $cellWidth = ($xMax - $xMin) / 3.0;
        $cellHeight = ($yMax - $yMin) / 3.0;

        $centroidX = (float) $plot['centroid_x'];
        $centroidY = (float) $plot['centroid_y'];

        $cells = [];
        for ($row = 0; $row < 3; $row++) {
            for ($col = 0; $col < 3; $col++) {
                // row 0 = northmost (largest y — local-ft convention: +y is
                // north, per VastuGeometryMath::bearingFromCentroid).
                $cellCenterY = $yMax - ($row + 0.5) * $cellHeight;
                $cellCenterX = $xMin + ($col + 0.5) * $cellWidth;

                $isCenter = $row === 1 && $col === 1;
                if ($isCenter) {
                    $zone = 'CENTER';
                } else {
                    $bearing = VastuGeometryMath::bearingFromCentroid($centroidX, $centroidY, $cellCenterX, $cellCenterY);
                    // Reuses the already-existing, merged 8-direction
                    // reducer from the Verdict Layer rather than
                    // re-deriving a second implementation of the same
                    // "which of the 8 classical zones is this bearing
                    // closest to" logic.
                    $zone = VastuVerdictMatcher::bearingToZone8($bearing);
                }

                $cells[] = [
                    'row' => $row,
                    'col' => $col,
                    'zone' => $zone,
                    // Local-ft cell center — exposed so the frontend's
                    // room-tagging step (Step 3) can construct a small
                    // synthetic room polygon around a tapped cell and POST
                    // it through the EXISTING addRoom() endpoint, creating
                    // a real vastu_rooms row. That means Step 4 can call
                    // the EXISTING /verdicts endpoint completely unchanged
                    // to get real KB-backed results, instead of this
                    // service duplicating any KB-matching logic itself.
                    'center_x' => round($cellCenterX, 4),
                    'center_y' => round($cellCenterY, 4),
                ];
            }
        }

        return [
            'plot_id' => $plotId,
            'cells' => $cells,
        ];
    }
}
