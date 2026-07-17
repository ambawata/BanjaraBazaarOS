<?php
declare(strict_types=1);

namespace Backend\Services;

/**
 * Pure, side-effect-free helpers for the Vastu Griha "Verdict Layer".
 *
 * Mirrors the Math/Service split already used by the geometry module
 * (VastuGeometryMath / VastuGeometryService) — this class does no DB access
 * and produces no verdicts by itself; it only turns geometry outputs and raw
 * KB rows into the intermediate values VastuVerdictService needs to look up
 * and interpret real KB entries. Per spec Section 10, geometry and rules are
 * separate layers; this class belongs to the rules/consumer side, not to
 * VastuGeometryMath, precisely because "8-direction zone" and "room type"
 * are rule-layer concepts with no meaning in pure geometry.
 *
 * SCHEMA NOTE (inspected directly against the live banjara_db before writing
 * any of this, per task instructions — nothing here is assumed):
 * vastu_kb_entries.raw_json carries the actual matchable content. Flat
 * columns (location_confidence, effect_confidence, severity_default,
 * disagreement, remedy) are denormalized copies of raw_json fields, kept for
 * indexed queries. The interesting structure lives in raw_json as either:
 *   - top-level `best`/`avoid` arrays of 8-direction zone codes (e.g. KI-01
 *     kitchen_zone), or
 *   - a `matrix` object keyed by room-type slug, each with its own
 *     `best`/`alt`/`avoid` arrays (RZ-01 room_zone_matrix — the single
 *     entry covering all room types at once).
 * There is no literal `shubh_ashubh`, `zone`, or `tier` column/key anywhere
 * in the KB. Both are DERIVED here (see deriveShubhAshubh() / deriveTier())
 * — documented, not invented per-verdict.
 */
final class VastuVerdictMatcher
{
    /**
     * 8-direction (classical Ashtadikpalaka) zone names + CENTER
     * (Brahmasthan), matching the granularity actually used throughout
     * vastu_kb_entries.raw_json best/avoid arrays and vastu_kb_color_rules
     * scope_key — confirmed by direct inspection, NOT the geometry engine's
     * 16/32-point compass (VastuGeometryMath::ZONE_16_NAMES / ZONE_32_NAMES).
     */
    private const ZONE_8_NAMES = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];

    /**
     * Canonical room-type slugs, taken verbatim from vastu_kb_entries
     * entry_id=RZ-01 raw_json->matrix keys (the KB's own room-type
     * vocabulary) — used as the normalization TARGET for free-text
     * vastu_rooms.name values, since vastu_rooms has no controlled room-type
     * column (confirmed via DESCRIBE vastu_rooms — only `name` varchar(191)
     * exists). Keyword lists are intentionally generous (English + common
     * Hinglish terms) since real user-entered room names vary widely.
     *
     * ASSUMPTION (documented, not asked about per task constraints): a room
     * name that matches none of these keyword sets normalizes to null,
     * which VastuVerdictService treats as a zero-hit case to log — never a
     * forced/guessed room type.
     */
    private const ROOM_TYPE_KEYWORDS = [
        'main_entrance'    => ['entrance', 'entry', 'gate', 'main door', 'foyer'],
        'living_room'      => ['living', 'drawing', 'hall', 'lounge'],
        'kitchen'          => ['kitchen', 'rasoi'],
        'master_bedroom'   => ['master bedroom', 'master bed', 'primary bedroom', 'main bedroom'],
        'children_bedroom' => ['children', 'kids', 'kid room', 'child room'],
        'guest_bedroom'    => ['guest'],
        'pooja_room'       => ['pooja', 'puja', 'prayer', 'mandir'],
        'dining_room'      => ['dining'],
        'study_room'       => ['study', 'office', 'work room'],
        'store_room'       => ['store', 'storage', 'utility'],
        'toilet'           => ['toilet', 'bathroom', 'washroom', 'wc', 'restroom'],
        'staircase'        => ['stair'],
        'balcony'          => ['balcony', 'terrace', 'deck'],
        'meditation_room'  => ['meditation', 'yoga'],
        // Generic "bedroom" (no master/children/guest qualifier) has no
        // dedicated matrix key in RZ-01 — mapped to master_bedroom as the
        // closest documented fallback (a bedroom is a bedroom for placement
        // purposes absent a more specific label). Ordered LAST so specific
        // matches above always win first.
        'master_bedroom'   => ['bedroom', 'bed room'],
    ];

    /**
     * Derives the 8-direction Vastu zone DIRECTLY from a true bearing,
     * rather than collapsing an already-computed 16-point zone_16 string.
     *
     * WHY (documented assumption): half of the 16-point compass names
     * (NNE, ENE, ESE, SSE, SSW, WSW, WNW, NNW) sit EXACTLY equidistant
     * between their two neighboring 8-point directions (e.g. SSW = 202.5deg
     * is exactly 22.5deg from both S=180 and SW=225). Snapping the zone_16
     * *string* to one or the other would require an arbitrary, undocumented
     * tie-break and silently double-rounds the original bearing. Re-deriving
     * straight from the bearing (same sector-math approach as
     * VastuGeometryMath::bearingToZone, just with 8 sectors of 45deg instead
     * of 16 of 22.5deg) avoids that entirely and is exact for AmbNiwas's own
     * real fixture value (203.8deg -> SW, 21.2deg from the SW center, not a
     * boundary case at 8-direction granularity).
     */
    public static function bearingToZone8(float $bearing): string
    {
        return self::bearingToZone8WithBoundary($bearing, 0.0)['zone'];
    }

    /**
     * Boundary-aware variant of bearingToZone8(). Computes 8-direction
     * boundary-case status INDEPENDENTLY of the geometry engine's 16-point
     * boundary_case flag (VastuGeometryMath::bearingToZone16/32) — reusing
     * that flag directly would be a granularity mismatch: a bearing can sit
     * exactly on a 16-point sector edge without being anywhere near an
     * 8-point edge, and vice versa (8-point sectors are 45deg wide vs
     * 16-point's 22.5deg). This applies the identical sector-math approach
     * (same style as VastuGeometryMath::bearingToZone) at the 8-point width,
     * using the same $boundaryTolerance value the geometry layer already
     * uses (vastu_geometry.boundary_tolerance_degrees via SettingsService)
     * so the two layers stay conceptually consistent without literally
     * sharing code across the geometry/rules boundary (spec Section 10).
     *
     * @return array{zone: string, boundary_case: bool, adjacent_zone: ?string}
     */
    public static function bearingToZone8WithBoundary(float $bearing, float $boundaryToleranceDeg): array
    {
        $b = fmod($bearing, 360.0);
        if ($b < 0) {
            $b += 360.0;
        }
        $count = count(self::ZONE_8_NAMES);
        $index = ((int) round($b / 45.0)) % $count;
        $zone = self::ZONE_8_NAMES[$index];

        $lowerEdge = fmod((($index - 0.5) * 45.0) + 360.0, 360.0);
        $upperEdge = fmod((($index + 0.5) * 45.0) + 360.0, 360.0);
        $distToLower = min(abs($b - $lowerEdge), 360.0 - abs($b - $lowerEdge));
        $distToUpper = min(abs($b - $upperEdge), 360.0 - abs($b - $upperEdge));
        $boundaryCase = min($distToLower, $distToUpper) <= $boundaryToleranceDeg;

        $adjacentZone = null;
        if ($boundaryCase) {
            $adjacentIndex = $distToLower <= $distToUpper
                ? ($index - 1 + $count) % $count
                : ($index + 1) % $count;
            $adjacentZone = self::ZONE_8_NAMES[$adjacentIndex];
        }

        return ['zone' => $zone, 'boundary_case' => $boundaryCase, 'adjacent_zone' => $adjacentZone];
    }

    /**
     * Normalizes a free-text room name (vastu_rooms.name) into the KB's
     * room-type slug vocabulary (RZ-01 matrix keys). Case-insensitive
     * substring match against ROOM_TYPE_KEYWORDS; first match wins in
     * declaration order (most specific keys listed first).
     *
     * @return string|null null = no confident match; caller must treat as
     *                      a zero-hit case, never guess.
     */
    public static function normalizeRoomType(string $roomName): ?string
    {
        $needle = mb_strtolower(trim($roomName));
        if ($needle === '') {
            return null;
        }

        foreach (self::ROOM_TYPE_KEYWORDS as $slug => $keywords) {
            foreach ($keywords as $keyword) {
                if (str_contains($needle, $keyword)) {
                    return $slug;
                }
            }
        }

        return null;
    }

    /**
     * Interprets a KB entry's best/alt/avoid arrays (either top-level, for
     * single-topic entries like KI-01, or a matrix sub-object, for RZ-01)
     * against a given 8-direction zone.
     *
     * shubh_ashubh derivation (documented assumption — no literal field
     * exists in the schema): zone in `best` => 'shubh'; zone in `avoid` =>
     * 'ashubh'; zone in `alt` or `fallback` (secondary/acceptable-fallback
     * directions — `alt` on RZ-01 matrix entries, `fallback` on DE-01) is
     * treated as a MILD 'shubh' since it is explicitly listed as
     * acceptable, not merely unlisted; zone absent from all arrays => null
     * (no verdict — the entry doesn't speak to this zone, a legitimate
     * zero-hit against THIS entry, not an error).
     *
     * DATA-QUALITY NOTE (found while testing this against live data, not
     * assumed up front): not every KB entry follows the array convention —
     * e.g. KI-05 (appliances_storage) encodes its guidance as a single
     * compound descriptive STRING because it covers several different
     * appliances each with their own direction, not one reducible list. A
     * non-array value under best/avoid/alt/fallback is treated the same as
     * an absent key: this entry structurally can't be matched by simple
     * zone-membership, which is a legitimate "no verdict from this row"
     * outcome, not a crash, and not a reason to reach into the string with
     * ad-hoc parsing that would risk misreading it.
     *
     * @param array{best?: mixed, alt?: mixed, fallback?: mixed, avoid?: mixed} $bestAvoidBlock
     * @return 'shubh'|'ashubh'|null
     */
    public static function deriveShubhAshubh(array $bestAvoidBlock, string $zone8): ?string
    {
        $best = $bestAvoidBlock['best'] ?? [];
        $avoid = $bestAvoidBlock['avoid'] ?? [];
        $alt = $bestAvoidBlock['alt'] ?? [];

        if (is_array($best) && in_array($zone8, $best, true)) {
            return 'shubh';
        }
        if (is_array($avoid) && in_array($zone8, $avoid, true)) {
            return 'ashubh';
        }
        if (is_array($alt) && in_array($zone8, $alt, true)) {
            return 'shubh';
        }
        $fallback = $bestAvoidBlock['fallback'] ?? [];
        if (is_array($fallback) && in_array($zone8, $fallback, true)) {
            return 'shubh';
        }
        return null;
    }

    /**
     * Resolves the severity for a specific zone, preferring a per-direction
     * override (raw_json->severity_if_wrong, mirrored in the
     * vastu_kb_severity_overrides table) over the entry's severity_default.
     * Overrides in this KB are keyed inconsistently (plain zone codes like
     * "SW", but also compound keys like "NE_toilet" or "master_in_NE" on
     * RZ-01) — this only matches a PLAIN zone-code key exactly; compound
     * keys require room-type context RZ-01 already encodes elsewhere in its
     * matrix and are intentionally left to fall back to severity_default
     * rather than guessed at via partial string matching.
     *
     * @param array<string,string> $severityOverrides zone_code => level
     */
    public static function resolveSeverity(array $severityOverrides, string $zone8, ?string $severityDefault): ?string
    {
        return $severityOverrides[$zone8] ?? $severityDefault;
    }

    /**
     * Derives the classical/popular_unverified tier for a KB entry.
     *
     * WHY (documented assumption — no literal tier field exists anywhere in
     * the schema, confirmed by inspecting vastu_kb_entries, raw_json, and
     * vastu_kb_sources directly): entry_type='foundation' rows (RZ-00, RZ-02,
     * RZ-03 — the direction/deity/element mapping and the Vastu Purusha
     * Mandala explainer itself) encode the bedrock classical doctrine that
     * every other rule derives from. Every other entry_type ('rule',
     * 'status') is cross-referenced from real-estate brands, product
     * vendors, and astrology/consultant websites (vastu_kb_sources
     * source_key values are overwhelmingly commercial/modern-web — no
     * classical Sanskrit text citation, e.g. Mayamata/Manasara, appears
     * anywhere in the sources table), so they are tagged
     * 'popular_unverified' per the task's own naming for that tier.
     */
    public static function deriveTier(string $entryType): string
    {
        return $entryType === 'foundation' ? 'classical' : 'popular_unverified';
    }
}
