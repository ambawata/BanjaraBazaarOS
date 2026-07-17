<?php
declare(strict_types=1);

// =============================================================================
// BanjaraBazaarOS — schema + seed migration runner
//
// Usage:
//   php scripts/migrate.php              # apply schema, migrations, seed
//   php scripts/migrate.php --no-seed    # apply schema + migrations only
//
// All SQL files are written to be idempotent (CREATE IF NOT EXISTS,
// INSERT ... ON DUPLICATE KEY / INSERT IGNORE), so re-runs are safe.
//
// GAP THIS FILE FIXES (see PR referencing PR #2's Verdict Layer): the
// vastu_kb_* tables that backend/services/VastuVerdictService.php reads
// were previously only reachable by manually running
// scripts/seed_vastu_kb.php — a fresh clone of main + a fresh empty
// database + `composer migrate` alone would leave the Verdict Layer
// pointed at tables that don't exist. This runner now also applies every
// *.sql file under database/migrations/ (filename-sorted, so dated
// filenames like 2026_07_10_... apply in chronological order) and then
// invokes scripts/seed_vastu_kb.php (if present) to populate that schema
// from knowledge-base/vastu_kb_enriched.json — both steps are additive to
// the existing schema.sql/seed.sql flow, nothing about that flow changed.
// =============================================================================

if (PHP_SAPI !== 'cli') {
    fwrite(STDERR, "This script must be run from the CLI.\n");
    exit(1);
}

require dirname(__DIR__) . '/backend/core/bootstrap.php';

use Backend\Core\Database;

$opts    = getopt('', ['no-seed']);
$runSeed = !array_key_exists('no-seed', $opts);

$root         = dirname(__DIR__);
$schemaSql    = $root . '/database/schema.sql';
$seedSql      = $root . '/database/seed.sql';
$migrationDir = $root . '/database/migrations';
$kbSeedScript = $root . '/scripts/seed_vastu_kb.php';

function apply(string $label, string $path, PDO $pdo): void
{
    fwrite(STDOUT, "→ Applying $label  ($path)\n");

    if (!is_file($path)) {
        fwrite(STDERR, "  ✗ File not found.\n");
        exit(1);
    }
    $sql = file_get_contents($path);
    if ($sql === false || trim($sql) === '') {
        fwrite(STDERR, "  ✗ Empty file.\n");
        exit(1);
    }
    try {
        $pdo->exec($sql);
        fwrite(STDOUT, "  ✓ Done.\n");
    } catch (Throwable $e) {
        fwrite(STDERR, "  ✗ Failed: " . $e->getMessage() . "\n");
        exit(1);
    }
}

/**
 * Applies every *.sql file directly under $dir, filename-sorted. No-op
 * (not an error) if the directory doesn't exist, so this runner still
 * works fine on a checkout that has no database/migrations/ at all.
 */
function applyMigrationsDir(string $dir, PDO $pdo): void
{
    if (!is_dir($dir)) {
        fwrite(STDOUT, "→ No database/migrations/ directory — skipping.\n");
        return;
    }

    $files = glob($dir . '/*.sql') ?: [];
    sort($files);

    if ($files === []) {
        fwrite(STDOUT, "→ database/migrations/ exists but has no .sql files — skipping.\n");
        return;
    }

    foreach ($files as $file) {
        apply('migration: ' . basename($file), $file, $pdo);
    }
}

/**
 * Runs scripts/seed_vastu_kb.php as a genuinely separate CLI subprocess
 * (rather than require()-ing it in-process) because that script has its
 * own top-level exit() calls on failure — including it directly would
 * terminate this migrator's process too. A subprocess with its own exit
 * code is the safe way to reuse it unmodified.
 */
function runKbSeed(string $scriptPath): void
{
    if (!is_file($scriptPath)) {
        fwrite(STDOUT, "→ scripts/seed_vastu_kb.php not present — skipping KB seed.\n");
        return;
    }

    fwrite(STDOUT, "→ Running KB seed  ($scriptPath)\n");
    $phpBinary = PHP_BINARY !== '' ? PHP_BINARY : 'php';
    $exitCode = 0;
    passthru(escapeshellarg($phpBinary) . ' ' . escapeshellarg($scriptPath), $exitCode);

    if ($exitCode !== 0) {
        fwrite(STDERR, "  ✗ KB seed failed (exit code $exitCode).\n");
        exit(1);
    }
    fwrite(STDOUT, "  ✓ Done.\n");
}

fwrite(STDOUT, "BanjaraBazaarOS migrator\n");
fwrite(STDOUT, "------------------------\n");

try {
    $pdo = Database::connection();
} catch (Throwable $e) {
    fwrite(STDERR, "DB connection failed: " . $e->getMessage() . "\n");
    fwrite(STDERR, "Check your .env (DB_HOST/DB_PORT/DB_NAME/DB_USER/DB_PASS).\n");
    exit(1);
}
fwrite(STDOUT, "Connected to MySQL.\n\n");

apply('schema', $schemaSql, $pdo);
applyMigrationsDir($migrationDir, $pdo);

if ($runSeed) {
    apply('seed', $seedSql, $pdo);
    runKbSeed($kbSeedScript);
} else {
    fwrite(STDOUT, "\nSeed skipped (--no-seed).\n");
}

fwrite(STDOUT, "\nAll done.\n");
