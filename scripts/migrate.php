<?php
declare(strict_types=1);

// =============================================================================
// BanjaraBazaarOS — schema + seed migration runner
//
// Usage:
//   php scripts/migrate.php              # apply schema then seed
//   php scripts/migrate.php --no-seed    # apply schema only
//
// Both SQL files are written to be idempotent (CREATE IF NOT EXISTS,
// INSERT ... ON DUPLICATE KEY / INSERT IGNORE), so re-runs are safe.
// =============================================================================

if (PHP_SAPI !== 'cli') {
    fwrite(STDERR, "This script must be run from the CLI.\n");
    exit(1);
}

require dirname(__DIR__) . '/backend/core/bootstrap.php';

use Backend\Core\Database;

$opts    = getopt('', ['no-seed']);
$runSeed = !array_key_exists('no-seed', $opts);

$root      = dirname(__DIR__);
$schemaSql = $root . '/database/schema.sql';
$seedSql   = $root . '/database/seed.sql';

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

if ($runSeed) {
    apply('seed', $seedSql, $pdo);
} else {
    fwrite(STDOUT, "\nSeed skipped (--no-seed).\n");
}

fwrite(STDOUT, "\nAll done.\n");
