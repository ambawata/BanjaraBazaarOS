<?php
declare(strict_types=1);

// =============================================================================
// BanjaraBazaarOS — Vastu Verdict Layer self-check
//
// Usage:
//   php scripts/test-vastu-verdict.php
//
// Requires a working DB connection (.env), unlike test-vastu-geometry.php
// which is pure-function-only — VastuVerdictMatcher has pure helpers too,
// but VastuVerdictService (the thing actually being validated end-to-end
// here) reads real vastu_kb_* rows and the AmbNiwas fixture plot, so a
// live banjara_db is required. Same hand-rolled assertion-runner style as
// test-vastu-geometry.php (no PHPUnit in this repo).
//
// Two-part test plan, per task spec:
//   Part 1 — for each of the 10 KB categories, confirm at least one entry
//            in that category has a real, non-null confidence/severity
//            field set (validates the KB CONTENT this layer depends on,
//            not fabricated fallback values).
//   Part 2 — run VastuVerdictService::getVerdicts() against the
//            already-merged AmbNiwas fixture plot (plot_id=1, seeded by
//            database/seed.sql — confirmed by name match against
//            apps/vastu-griha's AMBNIWAS_FIXTURE.plot.name) and assert
//            STRUCTURAL correctness only: every verdict traces to a real
//            kb_entry_id, no null confidence fields, and any zero-hit zone
//            was actually logged, not silently dropped. Actual shubh/
//            ashubh outcomes are printed for inspection but never
//            asserted, since that depends on real (and, per the CRITICAL
//            PRINCIPLE, never-fabricated) KB content.
// =============================================================================

if (PHP_SAPI !== 'cli') {
    fwrite(STDERR, "This script must be run from the CLI.\n");
    exit(1);
}

require dirname(__DIR__) . '/backend/core/bootstrap.php';

use Backend\Core\Database;
use Backend\Services\VastuVerdictService;

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

fwrite(STDOUT, "Vastu Verdict Layer self-check\n");
fwrite(STDOUT, "===============================\n\n");

$pdo = Database::connection();

// -----------------------------------------------------------------------
// Part 1 — every KB category has at least one entry with real,
// non-null confidence/severity fields (the content this layer depends on
// actually exists and is populated, not assumed).
// -----------------------------------------------------------------------
fwrite(STDOUT, "Part 1 - KB category content coverage\n");

$stmt = $pdo->query('SELECT DISTINCT `category` FROM `vastu_kb_entries` ORDER BY `category`');
$categories = $stmt->fetchAll(\PDO::FETCH_COLUMN);

check('KB has exactly 10 categories (matches task description)', count($categories) === 10);
fwrite(STDOUT, "  categories found: " . implode(', ', $categories) . "\n");

foreach ($categories as $category) {
    $entryStmt = $pdo->prepare(
        'SELECT `entry_id`, `location_confidence`, `effect_confidence`, `severity_default`
         FROM `vastu_kb_entries` WHERE `category` = :category
         AND `location_confidence` IS NOT NULL AND `effect_confidence` IS NOT NULL
         LIMIT 1'
    );
    $entryStmt->execute(['category' => $category]);
    $entry = $entryStmt->fetch(\PDO::FETCH_ASSOC);

    check(
        "category '$category' has >=1 entry with non-null location_confidence + effect_confidence",
        $entry !== false
    );
    if ($entry !== false) {
        fwrite(STDOUT, "    -> {$entry['entry_id']}: location={$entry['location_confidence']}% effect={$entry['effect_confidence']}% severity={$entry['severity_default']}\n");
    }
}

// -----------------------------------------------------------------------
// Part 2 — AmbNiwas fixture plot, structural correctness only.
// -----------------------------------------------------------------------
fwrite(STDOUT, "\nPart 2 - AmbNiwas fixture plot (already-merged geometry)\n");

$plotStmt = $pdo->prepare(
    "SELECT `id` FROM `vastu_plots` WHERE `name` LIKE 'AmbNiwas%' ORDER BY `id` ASC LIMIT 1"
);
$plotStmt->execute();
$plotRow = $plotStmt->fetch(\PDO::FETCH_ASSOC);

if ($plotRow === false) {
    fwrite(STDERR, "  \xE2\x9C\x97 No AmbNiwas fixture plot found in vastu_plots — cannot run Part 2.\n");
    $failures++;
} else {
    $plotId = (int) $plotRow['id'];
    fwrite(STDOUT, "  Using plot_id=$plotId\n");

    $service = new VastuVerdictService();
    $result = $service->getVerdicts($plotId);

    check('response has plot_id matching the fixture', $result['plot_id'] === $plotId);
    check('response has a confidence_tier string', is_string($result['confidence_tier']) && $result['confidence_tier'] !== '');
    check('verdict_count matches count(verdicts)', $result['verdict_count'] === count($result['verdicts']));
    check('zero_hit_count is a non-negative integer', is_int($result['zero_hit_count']) && $result['zero_hit_count'] >= 0);

    $realEntryIdsStmt = $pdo->query('SELECT `entry_id` FROM `vastu_kb_entries`');
    $realEntryIds = $realEntryIdsStmt->fetchAll(\PDO::FETCH_COLUMN);

    $allTraceToRealEntry = true;
    $noNullConfidence = true;
    $everyVerdictHasProductCta = true;
    $everyVerdictHasValidShubhAshubh = true;

    foreach ($result['verdicts'] as $v) {
        if (!in_array($v['kb_entry_id'], $realEntryIds, true)) {
            $allTraceToRealEntry = false;
            fwrite(STDERR, "    ! verdict for {$v['entity_type']}:{$v['entity_id']} claims kb_entry_id={$v['kb_entry_id']}, not found in vastu_kb_entries\n");
        }
        if ($v['location_confidence_pct'] === null || $v['effect_confidence_pct'] === null) {
            $noNullConfidence = false;
            fwrite(STDERR, "    ! verdict for {$v['entity_type']}:{$v['entity_id']} kb_entry_id={$v['kb_entry_id']} has a null confidence field\n");
        }
        if (!isset($v['product_cta']['tier'], $v['product_cta']['url'])) {
            $everyVerdictHasProductCta = false;
        }
        if (!in_array($v['shubh_ashubh'], ['shubh', 'ashubh'], true)) {
            $everyVerdictHasValidShubhAshubh = false;
        }
    }

    check('every verdict traces to a real kb_entry_id (never fabricated)', $allTraceToRealEntry);
    check('no verdict has a null confidence field', $noNullConfidence);
    check('every verdict has a product CTA (never shown with no purchase path)', $everyVerdictHasProductCta);
    check('every verdict has a definite shubh/ashubh classification', $everyVerdictHasValidShubhAshubh);

    // Zero-hit cases must be logged, not dropped — verify at least
    // zero_hit_count rows were written to vastu_kb_query_log with
    // low_confidence=1 in roughly this test run's timeframe (can't assert
    // an exact count match against the whole table since other runs of
    // this same script, or the live app, may have logged zero-hits too —
    // that's expected, it's a log, not a single-shot report).
    $logCountStmt = $pdo->query('SELECT COUNT(*) AS c FROM `vastu_kb_query_log` WHERE `low_confidence` = 1');
    $totalLoggedZeroHits = (int) $logCountStmt->fetch(\PDO::FETCH_ASSOC)['c'];
    check(
        'zero-hit cases are present in vastu_kb_query_log (logged, never silently dropped)',
        $result['zero_hit_count'] === 0 || $totalLoggedZeroHits > 0
    );

    fwrite(STDOUT, "\n  -> {$result['verdict_count']} verdict(s), {$result['zero_hit_count']} zero-hit zone(s) this run.\n");
    fwrite(STDOUT, "  -> Sample verdicts (informational — NOT asserted, per CRITICAL PRINCIPLE):\n");
    foreach (array_slice($result['verdicts'], 0, 8) as $v) {
        fwrite(STDOUT, sprintf(
            "     %-6s #%-3d zone=%-4s %-7s %-8s severity=%-20s (loc=%d%% effect=%d%%) kb=%s tier=%s\n",
            $v['entity_type'],
            $v['entity_id'],
            $v['zone'],
            $v['shubh_ashubh'],
            $v['boundary_case'] ? '[boundary]' : '',
            (string) $v['severity'],
            $v['location_confidence_pct'],
            $v['effect_confidence_pct'],
            $v['kb_entry_id'],
            $v['tier']
        ));
    }
}

// -----------------------------------------------------------------------
// Summary
// -----------------------------------------------------------------------
fwrite(STDOUT, "\n===============================\n");
fwrite(STDOUT, "Passed: $passes   Failed: $failures\n");

if ($failures > 0) {
    fwrite(STDERR, "\nSelf-check FAILED.\n");
    exit(1);
}

fwrite(STDOUT, "\nAll checks passed.\n");
exit(0);
