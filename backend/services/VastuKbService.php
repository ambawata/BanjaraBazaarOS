<?php
declare(strict_types=1);

namespace Backend\Services;

use Backend\Core\Database;
use PDO;

/**
 * Vastu Knowledge Engine — search + discovery over the vastu_kb_* tables.
 *
 * Every hit carries the normalized "headline" fields (best direction, avoid,
 * confidence, remedy) AND the full original knowledge-base entry under
 * `detail` (from raw_json), so two-layer notes, nested matrices, and any
 * field shape the dataset uses are never dropped regardless of entry type.
 */
final class VastuKbService
{
    private const REMEDY_CAVEAT = 'Most remedies mitigate, not cure — relocation is the ideal fix.';
    private const TOP_TOPICS_LIMIT = 20;

    // Same cutoff the ranking already uses to decide whether a match is worth
    // showing at all (see the array_filter in search() below) — reused here
    // as the "low confidence" line for query logging rather than inventing a
    // second threshold that could drift out of sync with the real one.
    private const LOW_CONFIDENCE_SCORE_THRESHOLD = 30;

    // Generic English/Hindi/Hinglish filler words. Excluded only from token-
    // overlap scoring (tier 3) — without this, "kis disha mein" (which
    // appears in dozens of unrelated aliases) drowns out the one real
    // content word ("toilet", "almari", ...) that actually identifies topic.
    private const STOPWORDS = [
        'kis', 'disha', 'mein', 'me', 'hai', 'ka', 'ki', 'ke', 'kaha', 'kahan',
        'kaun', 'si', 'sa', 'rakhein', 'rakhna', 'rakhe', 'rakhun', 'chahiye',
        'hona', 'lagaye', 'lagana', 'the', 'a', 'an', 'is', 'for', 'of', 'in',
        'to', 'should', 'be', 'placed', 'direction', 'vastu',
        // Devanagari equivalents of the same fillers.
        'दिशा', 'में', 'है', 'का', 'की', 'के', 'कहाँ', 'कहा', 'कौन', 'सी',
        'रखें', 'रखे', 'रखना', 'चाहिए', 'होना', 'लगाएं', 'लगाना', 'को', 'से',
    ];

    private PDO $pdo;

    public function __construct()
    {
        $this->pdo = Database::connection();
    }

    /**
     * @return array{query: string, results: list<array<string,mixed>>}
     */
    public function search(string $q): array
    {
        $q = trim($q);
        if ($q === '') {
            return ['query' => $q, 'results' => []];
        }
        $qNorm = self::normalize($q);
        $qWords = self::contentWords($qNorm);

        // Scored in PHP rather than SQL: real user phrases ("toilet kis disha
        // mein", "almari kahan rakhein") rarely appear as an exact substring
        // of a stored alias even when they mean the same thing, because word
        // order and filler words (kis/mein/hai/chahiye) vary. Token overlap
        // is what makes matching genuinely Hinglish-tolerant; the dataset is
        // small (a few hundred aliases) so scoring it all in PHP is cheap.
        $bestScorePerEntry = [];

        $aliasRows = $this->pdo->query('SELECT entry_id, alias FROM vastu_kb_aliases')->fetchAll();
        foreach ($aliasRows as $row) {
            $aliasNorm = self::normalize((string) $row['alias']);
            $score = 0;
            if ($aliasNorm === $qNorm) {
                $score = 100;
            } elseif (str_contains($aliasNorm, $qNorm) || str_contains($qNorm, $aliasNorm)) {
                $score = 80;
            } elseif ($qWords !== []) {
                $aliasWords = self::contentWords($aliasNorm);
                $overlap = count(array_intersect($qWords, $aliasWords));
                if ($overlap > 0) {
                    $score = (int) round(70 * ($overlap / count($qWords)));
                }
            }
            if ($score > 0) {
                $entryId = (string) $row['entry_id'];
                $bestScorePerEntry[$entryId] = max($bestScorePerEntry[$entryId] ?? 0, $score);
            }
        }

        $topicRows = $this->pdo->query('SELECT entry_id, category, topic FROM vastu_kb_entries')->fetchAll();
        foreach ($topicRows as $row) {
            $haystack = self::normalize($row['category'] . ' ' . str_replace('_', ' ', $row['topic']));
            if (str_contains($haystack, $qNorm)) {
                $entryId = (string) $row['entry_id'];
                $bestScorePerEntry[$entryId] = max($bestScorePerEntry[$entryId] ?? 0, 40);
            }
        }

        // Captured before the >=30 filter below so a query where every match
        // scored under the cutoff still logs its best near-miss score,
        // instead of logging 0/null indistinguishably from a true zero-hit.
        $topScore = $bestScorePerEntry === [] ? 0 : max($bestScorePerEntry);

        // Drop stray single-filler-word overlaps (e.g. only "kis" or "mein"
        // matched) so the result list stays a short, sensible set rather than
        // padding out to near the whole knowledge base.
        $bestScorePerEntry = array_filter($bestScorePerEntry, fn (int $score) => $score >= self::LOW_CONFIDENCE_SCORE_THRESHOLD);
        arsort($bestScorePerEntry);
        $topIds = array_slice(array_keys($bestScorePerEntry), 0, 10);

        $results = [];
        foreach ($topIds as $entryId) {
            $entry = $this->loadEntry($entryId);
            if ($entry !== null) {
                $results[] = $entry;
            }
        }

        $this->logQuery($q, $topIds, count($results), $topScore);

        return ['query' => $q, 'results' => $results];
    }

    /**
     * Fire-and-forget usage log — never allowed to break or slow down a
     * search response. No requester identity is recorded (no IP, no user
     * id, no session): just the query text and how well it matched, so
     * this stays aggregate usage data, not per-user tracking.
     *
     * @param list<string> $matchedEntryIds
     */
    private function logQuery(string $query, array $matchedEntryIds, int $resultCount, int $topScore): void
    {
        try {
            $lowConfidence = $resultCount === 0 || $topScore < self::LOW_CONFIDENCE_SCORE_THRESHOLD;
            $stmt = $this->pdo->prepare(
                'INSERT INTO vastu_kb_query_log
                    (query_text, matched_entry_ids, result_count, matched_top_score, low_confidence)
                 VALUES
                    (:query_text, :matched_entry_ids, :result_count, :matched_top_score, :low_confidence)'
            );
            $stmt->execute([
                'query_text'        => $query,
                'matched_entry_ids' => $matchedEntryIds === [] ? null : implode(',', $matchedEntryIds),
                'result_count'      => $resultCount,
                'matched_top_score' => $topScore,
                'low_confidence'    => $lowConfidence ? 1 : 0,
            ]);
        } catch (\Throwable $e) {
            error_log('vastu_kb query log insert failed: ' . $e->getMessage());
        }
    }

    /**
     * Zero/low-confidence queries from the last N days, deduplicated by
     * normalized query text and sorted by frequency — the worklist for
     * prioritizing new knowledge-base entries.
     *
     * @return list<array<string,mixed>>
     */
    public function zeroHitReport(int $days): array
    {
        // $days is cast to int above and clamped, so it's safe to interpolate
        // directly — MySQL's native (non-emulated) prepares don't reliably
        // accept a bound parameter inside INTERVAL ? DAY.
        $days = max(1, $days);
        $stmt = $this->pdo->query(
            "SELECT
                LOWER(TRIM(query_text)) AS normalized_query,
                COUNT(*) AS frequency,
                MAX(query_text) AS example_query_text,
                MAX(result_count) AS best_result_count,
                MAX(matched_top_score) AS best_top_score,
                MAX(created_at) AS last_seen
             FROM vastu_kb_query_log
             WHERE low_confidence = 1
               AND created_at >= (NOW() - INTERVAL {$days} DAY)
             GROUP BY LOWER(TRIM(query_text))
             ORDER BY frequency DESC, last_seen DESC
             LIMIT 200"
        );
        return $stmt->fetchAll();
    }

    private static function normalize(string $s): string
    {
        return trim(preg_replace('/\s+/', ' ', mb_strtolower($s)) ?? '');
    }

    /** @return list<string> */
    private static function contentWords(string $normalized): array
    {
        $words = array_filter(explode(' ', $normalized), fn (string $w) => $w !== '');
        return array_values(array_diff($words, self::STOPWORDS));
    }

    /** @return list<array<string,mixed>> */
    public function topTopics(): array
    {
        $stmt = $this->pdo->prepare(
            "SELECT entry_id FROM vastu_kb_entries
             WHERE entry_type IN ('rule', 'foundation')
             ORDER BY category ASC, topic ASC
             LIMIT :limit"
        );
        $stmt->bindValue('limit', self::TOP_TOPICS_LIMIT, PDO::PARAM_INT);
        $stmt->execute();
        $ids = $stmt->fetchAll(PDO::FETCH_COLUMN);

        $results = [];
        foreach ($ids as $entryId) {
            $entry = $this->loadEntry((string) $entryId);
            if ($entry !== null) {
                $results[] = $entry;
            }
        }

        return $results;
    }

    /** @return array<string,mixed>|null */
    private function loadEntry(string $entryId): ?array
    {
        $stmt = $this->pdo->prepare('SELECT * FROM vastu_kb_entries WHERE entry_id = :entry_id');
        $stmt->execute(['entry_id' => $entryId]);
        $row = $stmt->fetch();
        if ($row === false) {
            return null;
        }

        $raw = json_decode((string) $row['raw_json'], true) ?? [];

        $sourcesStmt = $this->pdo->prepare('SELECT source_key FROM vastu_kb_sources WHERE entry_id = :entry_id');
        $sourcesStmt->execute(['entry_id' => $entryId]);
        $sources = $sourcesStmt->fetchAll(PDO::FETCH_COLUMN);

        $overridesStmt = $this->pdo->prepare(
            'SELECT direction, level FROM vastu_kb_severity_overrides WHERE entry_id = :entry_id'
        );
        $overridesStmt->execute(['entry_id' => $entryId]);
        $overrides = [];
        foreach ($overridesStmt->fetchAll() as $o) {
            $overrides[$o['direction']] = $o['level'];
        }

        $hasTwoLayers = isset($raw['best_beginner'], $raw['best_advanced_16zone'])
            || isset($raw['matrix'])
            || (is_string($row['disagreement']) && $row['disagreement'] !== '');

        return [
            'entry_id'             => $row['entry_id'],
            'category'             => $row['category'],
            'topic'                => $row['topic'],
            'entry_type'           => $row['entry_type'],
            'best_direction'       => $raw['best'] ?? $raw['best_beginner'] ?? null,
            'avoid'                => $raw['avoid'] ?? null,
            'confidence'           => [
                'location' => $row['location_confidence'] !== null ? (int) $row['location_confidence'] : null,
                'effect'   => $row['effect_confidence'] !== null ? (int) $row['effect_confidence'] : null,
                'basis'    => 'source consensus',
            ],
            'both_sides'           => [
                'has_disagreement' => $hasTwoLayers,
                'note'             => $row['disagreement'],
            ],
            'remedy'               => $row['remedy'] !== null ? [
                'text'   => $row['remedy'],
                'caveat' => self::REMEDY_CAVEAT,
            ] : null,
            'severity'             => [
                'default'   => $row['severity_default'],
                'overrides' => $overrides,
            ],
            'sources'              => $sources,
            'detail'               => $raw,
        ];
    }
}
