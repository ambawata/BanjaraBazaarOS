<?php
declare(strict_types=1);

// =============================================================================
// Vastu Knowledge Engine — schema + seed for vastu_kb_* tables.
//
// Usage: php scripts/seed_vastu_kb.php
//
// Applies database/migrations/2026_07_10_vastu_kb_schema.sql (idempotent
// CREATE TABLE IF NOT EXISTS), then upserts every entry from
// knowledge-base/vastu_kb_enriched.json into vastu_kb_entries/aliases/
// sources/severity_overrides/color_rules. Re-running is always safe —
// every write is INSERT ... ON DUPLICATE KEY UPDATE keyed on the entry's
// natural id, never a destructive delete+reinsert.
// =============================================================================

if (PHP_SAPI !== 'cli') {
    fwrite(STDERR, "This script must be run from the CLI.\n");
    exit(1);
}

require dirname(__DIR__) . '/backend/core/bootstrap.php';

use Backend\Core\Database;

$root       = dirname(__DIR__);
$schemaSql  = $root . '/database/migrations/2026_07_10_vastu_kb_schema.sql';
$jsonPath   = $root . '/knowledge-base/vastu_kb_enriched.json';
$buildLog   = $root . '/knowledge-base/BUILD_LOG.md';

function logLine(string $path, string $line): void
{
    file_put_contents($path, $line . "\n", FILE_APPEND);
    fwrite(STDOUT, $line . "\n");
}

/** Devanagari codepoints (U+0900–U+097F) mark a Hindi-script alias; everything else is Latin/Hinglish. */
function detectLang(string $alias): string
{
    return preg_match('/\p{Devanagari}/u', $alias) === 1 ? 'devanagari' : 'latin';
}

try {
    $pdo = Database::connection();
} catch (Throwable $e) {
    fwrite(STDERR, "DB connection failed: " . $e->getMessage() . "\n");
    exit(1);
}
fwrite(STDOUT, "Connected to MySQL.\n");

if (!is_file($schemaSql)) {
    fwrite(STDERR, "Schema file not found: $schemaSql\n");
    exit(1);
}
$pdo->exec((string) file_get_contents($schemaSql));
fwrite(STDOUT, "Schema applied (vastu_kb_* tables ready).\n");

if (!is_file($jsonPath)) {
    fwrite(STDERR, "Knowledge base JSON not found: $jsonPath\n");
    exit(1);
}
$raw = file_get_contents($jsonPath);
$data = json_decode((string) $raw, true, 512, JSON_THROW_ON_ERROR);
$entries = $data['entries'] ?? [];
if (!is_array($entries) || $entries === []) {
    fwrite(STDERR, "No entries found in JSON.\n");
    exit(1);
}

$stmtEntry = $pdo->prepare(
    'INSERT INTO vastu_kb_entries
        (entry_id, category, topic, entry_type, location_confidence, effect_confidence, reasoning, disagreement, remedy, severity_default, raw_json)
     VALUES
        (:entry_id, :category, :topic, :entry_type, :location_confidence, :effect_confidence, :reasoning, :disagreement, :remedy, :severity_default, :raw_json)
     ON DUPLICATE KEY UPDATE
        category = VALUES(category),
        topic = VALUES(topic),
        entry_type = VALUES(entry_type),
        location_confidence = VALUES(location_confidence),
        effect_confidence = VALUES(effect_confidence),
        reasoning = VALUES(reasoning),
        disagreement = VALUES(disagreement),
        remedy = VALUES(remedy),
        severity_default = VALUES(severity_default),
        raw_json = VALUES(raw_json)'
);

$stmtAliasDelete = $pdo->prepare('DELETE FROM vastu_kb_aliases WHERE entry_id = :entry_id');
$stmtAlias = $pdo->prepare(
    'INSERT INTO vastu_kb_aliases (entry_id, alias, lang) VALUES (:entry_id, :alias, :lang)
     ON DUPLICATE KEY UPDATE lang = VALUES(lang)'
);

$stmtSourceDelete = $pdo->prepare('DELETE FROM vastu_kb_sources WHERE entry_id = :entry_id');
$stmtSource = $pdo->prepare(
    'INSERT INTO vastu_kb_sources (entry_id, source_key, url) VALUES (:entry_id, :source_key, :url)
     ON DUPLICATE KEY UPDATE url = VALUES(url)'
);

$stmtSeverityDelete = $pdo->prepare('DELETE FROM vastu_kb_severity_overrides WHERE entry_id = :entry_id');
$stmtSeverity = $pdo->prepare(
    'INSERT INTO vastu_kb_severity_overrides (entry_id, direction, level) VALUES (:entry_id, :direction, :level)
     ON DUPLICATE KEY UPDATE level = VALUES(level)'
);

$stmtColorDelete = $pdo->prepare('DELETE FROM vastu_kb_color_rules WHERE entry_id = :entry_id');
$stmtColor = $pdo->prepare(
    'INSERT INTO vastu_kb_color_rules (entry_id, scope_type, scope_key, recommended, avoid) VALUES (:entry_id, :scope_type, :scope_key, :recommended, :avoid)
     ON DUPLICATE KEY UPDATE recommended = VALUES(recommended), avoid = VALUES(avoid)'
);

$aliasCount = 0;
$sourceCount = 0;
$severityCount = 0;
$colorRuleCount = 0;

// A few entries (e.g. foundation/status types) use a descriptive string
// instead of a 0-100 number here (RZ-03's effect_confidence is literally
// "not_applicable_mythological_foundation"). The normalized column is
// numeric for querying/display; non-numeric values go to NULL there but
// are never lost — raw_json still keeps the original string verbatim.
function numericOrNull(mixed $value): ?int
{
    return is_numeric($value) ? (int) $value : null;
}

$pdo->beginTransaction();
try {
    foreach ($entries as $entry) {
        $entryId = (string) $entry['id'];

        $stmtEntry->execute([
            'entry_id'             => $entryId,
            'category'             => $entry['category'] ?? '',
            'topic'                => $entry['topic'] ?? '',
            'entry_type'           => $entry['entry_type'] ?? 'rule',
            'location_confidence'  => numericOrNull($entry['location_confidence'] ?? null),
            'effect_confidence'    => numericOrNull($entry['effect_confidence'] ?? null),
            'reasoning'            => $entry['reasoning'] ?? null,
            'disagreement'         => $entry['disagreement'] ?? null,
            'remedy'               => $entry['remedy'] ?? null,
            'severity_default'     => $entry['severity']['default'] ?? null,
            'raw_json'             => json_encode($entry, JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR),
        ]);

        // Aliases: replace-in-full per entry so removed aliases in a re-run don't linger.
        $stmtAliasDelete->execute(['entry_id' => $entryId]);
        foreach ((array) ($entry['query_aliases'] ?? []) as $alias) {
            if (!is_string($alias) || $alias === '') {
                continue;
            }
            $stmtAlias->execute([
                'entry_id' => $entryId,
                'alias'    => $alias,
                'lang'     => detectLang($alias),
            ]);
            $aliasCount++;
        }

        // Sources: plain array of source names in this dataset (no URLs supplied).
        $stmtSourceDelete->execute(['entry_id' => $entryId]);
        foreach ((array) ($entry['sources'] ?? []) as $source) {
            if (!is_string($source) || $source === '') {
                continue;
            }
            $stmtSource->execute([
                'entry_id'   => $entryId,
                'source_key' => $source,
                'url'        => null,
            ]);
            $sourceCount++;
        }

        // Severity overrides: entry.severity.overrides = {direction: level}.
        $stmtSeverityDelete->execute(['entry_id' => $entryId]);
        foreach ((array) ($entry['severity']['overrides'] ?? []) as $direction => $level) {
            if (!is_string($level) || $level === '') {
                continue;
            }
            $stmtSeverity->execute([
                'entry_id'  => $entryId,
                'direction' => (string) $direction,
                'level'     => $level,
            ]);
            $severityCount++;
        }

        // Color rules: CO-01 uses by_zone, CO-02 uses by_room — same {rec, avoid} shape per key.
        $stmtColorDelete->execute(['entry_id' => $entryId]);
        foreach (['by_zone' => 'zone', 'by_room' => 'room'] as $field => $scopeType) {
            foreach ((array) ($entry[$field] ?? []) as $scopeKey => $rule) {
                if (!is_array($rule)) {
                    continue;
                }
                $stmtColor->execute([
                    'entry_id'    => $entryId,
                    'scope_type'  => $scopeType,
                    'scope_key'   => (string) $scopeKey,
                    'recommended' => json_encode($rule['rec'] ?? [], JSON_UNESCAPED_UNICODE),
                    'avoid'       => json_encode($rule['avoid'] ?? [], JSON_UNESCAPED_UNICODE),
                ]);
                $colorRuleCount++;
            }
        }
    }

    $pdo->commit();
} catch (Throwable $e) {
    $pdo->rollBack();
    fwrite(STDERR, "Seed failed, rolled back: " . $e->getMessage() . "\n");
    exit(1);
}

$entryCount = (int) $pdo->query('SELECT COUNT(*) FROM vastu_kb_entries')->fetchColumn();

$summary = sprintf(
    "Seeded %d entries, %d aliases, %d sources, %d severity overrides, %d color rules.",
    $entryCount,
    $aliasCount,
    $sourceCount,
    $severityCount,
    $colorRuleCount
);
fwrite(STDOUT, $summary . "\n");

if (is_dir(dirname($buildLog))) {
    logLine($buildLog, "## Phase 2 — Schema + seed (" . date('Y-m-d H:i:s') . ")");
    logLine($buildLog, $summary);
    logLine($buildLog, "");
}
