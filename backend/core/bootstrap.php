<?php
declare(strict_types=1);

// =============================================================================
// BanjaraBazaarOS — backend bootstrap
// Loads Composer autoloader, environment, error handler. Required by both
// the HTTP front controller (public/index.php) and CLI scripts (scripts/*.php).
// =============================================================================

$root = dirname(__DIR__, 2);

$autoload = $root . '/vendor/autoload.php';
if (!is_file($autoload)) {
    if (PHP_SAPI === 'cli') {
        fwrite(STDERR, "Composer dependencies not installed. Run: composer install\n");
        exit(1);
    }
    http_response_code(500);
    header('Content-Type: application/json');
    echo json_encode([
        'error'   => 'server_misconfigured',
        'message' => 'Run "composer install" in the project root.',
    ]);
    exit;
}
require $autoload;

// Load .env (optional in production where vars come from the host)
if (is_file($root . '/.env')) {
    $dotenv = Dotenv\Dotenv::createImmutable($root);
    $dotenv->safeLoad();
}

date_default_timezone_set($_ENV['APP_TIMEZONE'] ?? 'UTC');

// HTTP-style error handler is only useful for the web SAPI.
if (PHP_SAPI !== 'cli') {
    Backend\Core\ErrorHandler::register();
}
