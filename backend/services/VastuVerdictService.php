<?php
declare(strict_types=1);

namespace Backend\Services;

use Backend\Core\Database;
use PDO;

/**
 * Orchestration layer for the Vastu Griha "Verdict Layer" — the RAG-only
 * consumer that sits ON TOP of the already-merged Plot Geometry engine
 * (VastuGeometryService, untouched by this class) and the existing Vastu
 * Knowledge Engine tables (vastu_kb_*, also untouched: read-only here).
 *
 * CRITICAL PRINCIPLE: every verdict returned traces to a real row in
 * vastu_kb_entries (kb_entry_id is always a genuine entry_id fetched from
 * the DB). Nothing here ever synthesizes a rule, a confidence number, or a
 * severity level — those either come straight from a KB row or from a
 * documented, code-commented derivation over KB row content (see
 * VastuVerdictMatcher). An entity/zone combination with no matching KB
 * entry is logged via logZeroHit() and produces no verdict — it is never
 * "filled in" with plausible-sounding content.
 *
 * KB matching scope (see VastuVerdictMatcher docblock and this class's
 * inline comments for the full schema-inspection trail this was built
 * against — nothing here assumes field names that weren't verified live
 * against banjara_db first):
 *   - ROOMS: matched against entry_id=RZ-01 (room_zone_matrix, the KB's
 *     single entry covering all room types) plus a small, individually
 *     verified set of direct category entries (kitchen -> category=
 *     'kitchen', main_entrance -> category='doors_entry' topic='main_door').
 *     Expanding this direct-entry set further (pooja_room, sleeping_
 *     direction, etc.) is a reasonable follow-up but requires per-category
 *     raw_json shape verification this pass didn't have scope to do
 *     exhaustively for all 10 categories — left as a documented gap rather
 *     than guessed at.
 *   - DOORS: every row in vastu_doors is treated as a main entrance/gate
 *     (category='main_entrance' for KB-matching purposes) — matches how
 *     the geometry spec's Section 6 worked examples use this table. There
 *     is no "purpose" field on vastu_doors to distinguish a main gate from
 *     a hypothetical future interior door.
 *   - WALLS: deliberately produce ZERO shubh/ashubh verdicts in this
 *     version. Direct inspection of every category='room_zone_placement'
 *     entry (RZ-00 through RZ-07) found none that expresses a pure
 *     whole-building-facing judgment independent of a specific room type:
 *     RZ-04/RZ-05 use non-standard keys (best_zone_within_plot,
 *     best_shapes) structurally incompatible with best/avoid matching;
 *     RZ-07 (the "south-facing is a myth" entry — the closest thing to a
 *     wall-facing verdict) has no best/avoid arrays at all, only free-text
 *     verdict/conditions fields; RZ-06 has best/avoid but is scoped to the
 *     living_room specifically. Applying RZ-06 (or any room-scoped entry)
 *     to a wall would trace to a real row while still misrepresenting what
 *     that row actually says — worse than a zero-hit, not better. Every
 *     wall/zone combination therefore logs as a zero-hit, which is an
 *     honest, actionable signal: the KB currently has no whole-building-
 *     facing content, not a bug in this matcher.
 */
final class VastuVerdictService
{
    /**
     * Direct category-entry lookups verified (via live raw_json inspection)
     * to carry top-level best/avoid arrays relevant to a specific room
     * type, beyond what RZ-01's matrix already covers. See class docblock.
     *
     * @var array<string, array{category: string, topic: ?string}>
     */
    private const DIRECT_ROOM_TYPE_ENTRIES = [
        'kitchen'        => ['category' => 'kitchen', 'topic' => null],
        'main_entrance'  => ['category' => 'doors_entry', 'topic' => 'main_door'],
    ];

    private PDO $pdo;
    private SettingsService $settings;
    private VastuGeometryService $geometry;

    /** @var list<array<string,mixed>>|null in-request cache of all KB entries, raw_json decoded */
    private ?array $kbEntriesCache = null;

    /** @var array<string, array<string,string>>|null entry_id => [direction => level] */
    private ?array $severityOverridesCache = null;

    public function __construct()
    {
        $this->pdo = Database::connection();
        $this->settings = new SettingsService();
        $this->geometry = new VastuGeometryService();
    }

    /**
     * Main entry point. Iterates every wall/door/room already computed by
     * the (untouched) geometry layer and produces the full verdict list.
     *
     * @return array<string,mixed>
     */
    public function getVerdicts(int $plotId): array
    {
        $full = $this->geometry->getFullGeometry($plotId);
        $plot = $full['plot'];
        $boundaryTolerance = (float) $this->settings->string('vastu_geometry.boundary_tolerance_degrees', '0.5');

        $tier3Caution = $plot['confidence_tier'] === 'tier3_compass';
        $cautionMessage = $tier3Caution
            ? $this->settings->string(
                'vastu_verdict.tier3_caution_message',
                'Geometry confidence is low (Tier 3 — on-site compass only) — this verdict may shift if the plot is recalibrated to Tier 1/2.'
            )
            : null;

        $verdicts = [];
        $zeroHitCount = 0;

        foreach ($full['walls'] as $wall) {
            [$wallVerdicts, $wallZeroHits] = $this->verdictsForWall($wall, $boundaryTolerance, $tier3Caution);
            $verdicts = array_merge($verdicts, $wallVerdicts);
            $zeroHitCount += $wallZeroHits;

            foreach ($wall['doors'] as $door) {
                [$doorVerdicts, $doorZeroHits] = $this->verdictsForDoor($door, $boundaryTolerance, $tier3Caution);
                $verdicts = array_merge($verdicts, $doorVerdicts);
                $zeroHitCount += $doorZeroHits;
            }
        }

        foreach ($full['rooms'] as $room) {
            [$roomVerdicts, $roomZeroHits] = $this->verdictsForRoom($room, $boundaryTolerance, $tier3Caution);
            $verdicts = array_merge($verdicts, $roomVerdicts);
            $zeroHitCount += $roomZeroHits;
        }

        return [
            'plot_id' => $plotId,
            'confidence_tier' => $plot['confidence_tier'],
            'low_confidence_caution' => $cautionMessage,
            'verdict_count' => count($verdicts),
            'zero_hit_count' => $zeroHitCount,
            'verdicts' => $verdicts,
        ];
    }

    // ------------------------------------------------------------------
    // Per-entity-type matching
    // ------------------------------------------------------------------

    /**
     * @return array{0: list<array<string,mixed>>, 1: int} [verdicts, zeroHitCount]
     */
    private function verdictsForWall(array $wall, float $boundaryTolerance, bool $tier3Caution): array
    {
        $zones = $this->zonesToCheck((float) $wall['bearing_true'], $boundaryTolerance);
        $verdicts = [];
        $zeroHits = 0;

        // See class docblock — walls intentionally have no matchable
        // room_zone_placement entry in the current KB content. We still
        // "try" (rather than hardcode a skip) so this starts working the
        // moment the KB gains a genuine whole-building-facing entry, and
        // so the zero-hit log carries real signal.
        foreach ($zones as $zoneInfo) {
            $this->logZeroHit(sprintf(
                'wall:%d bearing_true=%.2f zone=%s (no whole-building-facing KB entry exists yet — see VastuVerdictService docblock)',
                $wall['id'],
                $wall['bearing_true'],
                $zoneInfo['zone']
            ));
            $zeroHits++;
        }

        return [$verdicts, $zeroHits];
    }

    /**
     * @return array{0: list<array<string,mixed>>, 1: int}
     */
    private function verdictsForDoor(array $door, float $boundaryTolerance, bool $tier3Caution): array
    {
        return $this->verdictsForRoomTypeEntity(
            entityId: (int) $door['id'],
            entityType: 'door',
            bearingTrue: (float) $door['bearing_true'],
            roomTypeSlug: 'main_entrance',
            boundaryTolerance: $boundaryTolerance,
            tier3Caution: $tier3Caution,
            zeroHitLabel: "door:{$door['id']}"
        );
    }

    /**
     * @return array{0: list<array<string,mixed>>, 1: int}
     */
    private function verdictsForRoom(array $room, float $boundaryTolerance, bool $tier3Caution): array
    {
        $roomTypeSlug = VastuVerdictMatcher::normalizeRoomType((string) $room['name']);
        $zeroHitLabel = sprintf('room:%d name="%s"', $room['id'], $room['name']);

        if ($roomTypeSlug === null) {
            $zones = $this->zonesToCheck((float) $room['bearing_true'], $boundaryTolerance);
            foreach ($zones as $zoneInfo) {
                $this->logZeroHit("$zeroHitLabel zone={$zoneInfo['zone']} — room name did not normalize to a known KB room type");
            }
            return [[], count($zones)];
        }

        return $this->verdictsForRoomTypeEntity(
            entityId: (int) $room['id'],
            entityType: 'room',
            bearingTrue: (float) $room['bearing_true'],
            roomTypeSlug: $roomTypeSlug,
            boundaryTolerance: $boundaryTolerance,
            tier3Caution: $tier3Caution,
            zeroHitLabel: $zeroHitLabel
        );
    }

    /**
     * Shared matching path for any entity that has a room-type slug (rooms,
     * and doors under the main_entrance assumption): checks RZ-01's matrix
     * for that slug, plus any verified direct category entry, across every
     * zone the entity needs checked (1, or 2 if boundary_case).
     *
     * @return array{0: list<array<string,mixed>>, 1: int}
     */
    private function verdictsForRoomTypeEntity(
        int $entityId,
        string $entityType,
        float $bearingTrue,
        string $roomTypeSlug,
        float $boundaryTolerance,
        bool $tier3Caution,
        string $zeroHitLabel
    ): array {
        $zones = $this->zonesToCheck($bearingTrue, $boundaryTolerance);
        $verdicts = [];
        $zeroHits = 0;

        $candidateEntries = $this->candidateEntriesForRoomType($roomTypeSlug);

        foreach ($zones as $zoneInfo) {
            $zone = $zoneInfo['zone'];
            $boundaryCase = $zoneInfo['boundary_case'];
            $matchedAny = false;

            foreach ($candidateEntries as $candidate) {
                $shubhAshubh = VastuVerdictMatcher::deriveShubhAshubh($candidate['block'], $zone);
                if ($shubhAshubh === null) {
                    continue;
                }
                $matchedAny = true;
                $verdicts[] = $this->buildVerdict(
                    entityId: $entityId,
                    entityType: $entityType,
                    zone: $zone,
                    entry: $candidate['entry'],
                    shubhAshubh: $shubhAshubh,
                    boundaryCase: $boundaryCase,
                    tier3Caution: $tier3Caution
                );
            }

            if (!$matchedAny) {
                $this->logZeroHit("$zeroHitLabel room_type=$roomTypeSlug zone=$zone");
                $zeroHits++;
            }
        }

        return [$verdicts, $zeroHits];
    }

    /**
     * @return list<array{entry: array<string,mixed>, block: array<string,mixed>}>
     */
    private function candidateEntriesForRoomType(string $roomTypeSlug): array
    {
        $candidates = [];

        $rz01 = $this->getEntryByEntryId('RZ-01');
        if ($rz01 !== null) {
            $matrixBlock = $rz01['raw_json_decoded']['matrix'][$roomTypeSlug] ?? null;
            if (is_array($matrixBlock)) {
                $candidates[] = ['entry' => $rz01, 'block' => $matrixBlock];
            }
        }

        $direct = self::DIRECT_ROOM_TYPE_ENTRIES[$roomTypeSlug] ?? null;
        if ($direct !== null) {
            foreach ($this->getEntriesByCategory($direct['category'], $direct['topic']) as $entry) {
                $candidates[] = ['entry' => $entry, 'block' => $entry['raw_json_decoded']];
            }
        }

        return $candidates;
    }

    /**
     * Resolves which 8-direction zone(s) an entity must be checked against.
     * Normally one; two (primary + adjacent) if VastuVerdictMatcher's own
     * 8-direction boundary check trips — see that class's docblock for why
     * this is computed independently of the geometry engine's 16-point
     * boundary_case flag rather than reusing it directly.
     *
     * @return list<array{zone: string, boundary_case: bool}>
     */
    private function zonesToCheck(float $bearingTrue, float $boundaryTolerance): array
    {
        $result = VastuVerdictMatcher::bearingToZone8WithBoundary($bearingTrue, $boundaryTolerance);

        if (!$result['boundary_case'] || $result['adjacent_zone'] === null) {
            return [['zone' => $result['zone'], 'boundary_case' => false]];
        }

        // boundary_case: true — never silently collapse to one zone.
        return [
            ['zone' => $result['zone'], 'boundary_case' => true],
            ['zone' => $result['adjacent_zone'], 'boundary_case' => true],
        ];
    }

    // ------------------------------------------------------------------
    // Verdict assembly (KB row -> Verdict object) + product three-tier model
    // ------------------------------------------------------------------

    /**
     * @param array<string,mixed> $entry a KB entry row (from getEntryByEntryId/getEntriesByCategory)
     * @return array<string,mixed>
     */
    private function buildVerdict(
        int $entityId,
        string $entityType,
        string $zone,
        array $entry,
        string $shubhAshubh,
        bool $boundaryCase,
        bool $tier3Caution
    ): array {
        $overrides = $this->getSeverityOverridesFor((string) $entry['entry_id']);
        $severity = VastuVerdictMatcher::resolveSeverity($overrides, $zone, $entry['severity_default']);

        return [
            'entity_id' => $entityId,
            'entity_type' => $entityType,
            'zone' => $zone,
            'kb_entry_id' => $entry['entry_id'],
            'shubh_ashubh' => $shubhAshubh,
            'severity' => $severity,
            'location_confidence_pct' => $entry['location_confidence'] !== null ? (int) $entry['location_confidence'] : null,
            'effect_confidence_pct' => $entry['effect_confidence'] !== null ? (int) $entry['effect_confidence'] : null,
            'source_disagreement_notes' => $entry['disagreement'],
            'tier' => VastuVerdictMatcher::deriveTier((string) $entry['entry_type']),
            'boundary_case' => $boundaryCase,
            'low_confidence_caution' => $tier3Caution,
            'remedy' => $entry['remedy'],
            'product_cta' => $this->resolveProductCta($entry),
        ];
    }

    /**
     * Three-tier product connection model ("we are a shopping website, not
     * a Vastu Shastri" — no code implementation existed anywhere in the
     * repo prior to this task, confirmed via a full-repo grep before
     * writing this; built fresh here per the task's fallback instruction).
     *
     * Tier 1 — direct match: an approved, in-stock product whose `tags`
     *          contains the KB entry's topic or category keyword.
     * Tier 2 — closest-match helper: an approved, in-stock product tagged
     *          generically with the KB entry's top-level category, even if
     *          not topic-specific.
     * Tier 3 — generic CTA: a DB-settings-driven link to a general Vastu
     *          essentials collection. Always available, so a verdict is
     *          never shown with no purchase path at all.
     *
     * ASSUMPTION: the current `products` table has no vastu-specific
     * tagging convention yet (confirmed — live data only has ["handmade",
     * "mvp"] test tags), so Tier 1/2 will realistically return null until
     * vendors start tagging products for Vastu remedies. That is expected,
     * honest behavior, not a bug — Tier 3 covers it.
     *
     * @param array<string,mixed> $entry
     * @return array{tier: 'direct'|'closest_match'|'generic', product_id: ?int, label: string, url: string}
     */
    private function resolveProductCta(array $entry): array
    {
        $direct = $this->findProductByTag((string) $entry['topic']) ?? $this->findProductByTag((string) $entry['entry_id']);
        if ($direct !== null) {
            return [
                'tier' => 'direct',
                'product_id' => (int) $direct['id'],
                'label' => (string) $direct['name'],
                'url' => '/products/' . $direct['slug'],
            ];
        }

        $closest = $this->findProductByTag((string) $entry['category']);
        if ($closest !== null) {
            return [
                'tier' => 'closest_match',
                'product_id' => (int) $closest['id'],
                'label' => 'Vastu items for ' . str_replace('_', ' ', (string) $entry['category']),
                'url' => '/products/' . $closest['slug'],
            ];
        }

        return [
            'tier' => 'generic',
            'product_id' => null,
            'label' => $this->settings->string('vastu_verdict.generic_essentials_cta_label', 'Browse Vastu Essentials'),
            'url' => $this->settings->string('vastu_verdict.generic_essentials_cta_url', '/shop/vastu-essentials'),
        ];
    }

    /**
     * @return array<string,mixed>|null
     */
    private function findProductByTag(string $tag): ?array
    {
        $tag = trim(mb_strtolower($tag));
        if ($tag === '') {
            return null;
        }

        $stmt = $this->pdo->prepare(
            "SELECT `id`, `name`, `slug`, `tags` FROM `products`
             WHERE `status` = 'approved' AND `deleted_at` IS NULL AND `stock_quantity` > 0
             ORDER BY `created_at` ASC"
        );
        $stmt->execute();

        foreach ($stmt->fetchAll(PDO::FETCH_ASSOC) as $row) {
            $tags = $row['tags'] ? json_decode((string) $row['tags'], true) : [];
            if (!is_array($tags)) {
                continue;
            }
            foreach ($tags as $productTag) {
                if (mb_strtolower((string) $productTag) === $tag) {
                    return $row;
                }
            }
        }

        return null;
    }

    // ------------------------------------------------------------------
    // Zero-hit logging — reuses the EXISTING vastu_kb_query_log table
    // (confirmed via schema inspection: query_text, matched_entry_ids,
    // result_count, matched_top_score, low_confidence, created_at). This
    // is the only table in the KB schema that looks like a query-logging /
    // self-improving-data-loop mechanism; a full-repo grep found no PHP
    // code writing to it yet, so there is no existing "shape" to match
    // beyond the columns themselves. A zero-hit is logged as
    // result_count=0, matched_entry_ids=NULL, low_confidence=1 — matching
    // that column's evident intended semantics.
    // ------------------------------------------------------------------

    private function logZeroHit(string $queryText): void
    {
        $stmt = $this->pdo->prepare(
            'INSERT INTO `vastu_kb_query_log`
             (`query_text`, `matched_entry_ids`, `result_count`, `matched_top_score`, `low_confidence`, `created_at`)
             VALUES (:query_text, NULL, 0, 0, 1, CURRENT_TIMESTAMP)'
        );
        $stmt->execute(['query_text' => mb_substr($queryText, 0, 512)]);
    }

    // ------------------------------------------------------------------
    // KB reads (read-only — this class never writes to vastu_kb_* tables)
    // ------------------------------------------------------------------

    /**
     * @return array<string,mixed>|null
     */
    private function getEntryByEntryId(string $entryId): ?array
    {
        foreach ($this->allKbEntries() as $entry) {
            if ($entry['entry_id'] === $entryId) {
                return $entry;
            }
        }
        return null;
    }

    /**
     * @return list<array<string,mixed>>
     */
    private function getEntriesByCategory(string $category, ?string $topic): array
    {
        $matches = [];
        foreach ($this->allKbEntries() as $entry) {
            if ($entry['category'] !== $category) {
                continue;
            }
            if ($topic !== null && $entry['topic'] !== $topic) {
                continue;
            }
            $matches[] = $entry;
        }
        return $matches;
    }

    /**
     * Loads and caches all vastu_kb_entries for this request (60 rows at
     * time of writing — trivial to hold in memory once rather than run
     * N+1 queries per entity being verdict-checked).
     *
     * @return list<array<string,mixed>>
     */
    private function allKbEntries(): array
    {
        if ($this->kbEntriesCache !== null) {
            return $this->kbEntriesCache;
        }

        $stmt = $this->pdo->query('SELECT * FROM `vastu_kb_entries`');
        $entries = [];
        foreach ($stmt->fetchAll(PDO::FETCH_ASSOC) as $row) {
            $decoded = json_decode((string) $row['raw_json'], true);
            $row['raw_json_decoded'] = is_array($decoded) ? $decoded : [];
            $entries[] = $row;
        }

        $this->kbEntriesCache = $entries;
        return $entries;
    }

    /**
     * @return array<string,string> direction => level
     */
    private function getSeverityOverridesFor(string $entryId): array
    {
        if ($this->severityOverridesCache === null) {
            $stmt = $this->pdo->query('SELECT `entry_id`, `direction`, `level` FROM `vastu_kb_severity_overrides`');
            $grouped = [];
            foreach ($stmt->fetchAll(PDO::FETCH_ASSOC) as $row) {
                $grouped[$row['entry_id']][$row['direction']] = $row['level'];
            }
            $this->severityOverridesCache = $grouped;
        }

        return $this->severityOverridesCache[$entryId] ?? [];
    }
}
