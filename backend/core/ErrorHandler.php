<?php
declare(strict_types=1);

namespace Backend\Core;

use Backend\Config\Config;

final class ErrorHandler
{
    public static function register(): void
    {
        set_error_handler([self::class, 'handleError']);
        set_exception_handler([self::class, 'handleException']);
        register_shutdown_function([self::class, 'handleShutdown']);
    }

    public static function handleError(int $severity, string $message, string $file, int $line): bool
    {
        if (!(error_reporting() & $severity)) return false;
        throw new \ErrorException($message, 0, $severity, $file, $line);
    }

    public static function handleException(\Throwable $e): void
    {
        $debug = Config::bool('APP_DEBUG', false);

        $payload = [
            'error'   => 'server_error',
            'message' => $debug ? $e->getMessage() : 'An unexpected error occurred.',
        ];
        if ($debug) {
            $payload['exception'] = $e::class;
            $payload['where']     = $e->getFile() . ':' . $e->getLine();
            $payload['trace']     = explode("\n", $e->getTraceAsString());
        }
        error_log('[BanjaraBazaarOS] ' . $e::class . ': ' . $e->getMessage() . ' @ ' . $e->getFile() . ':' . $e->getLine());

        Response::json($payload, 500)->send();
    }

    public static function handleShutdown(): void
    {
        $err = error_get_last();
        if ($err === null) return;
        if (!in_array($err['type'], [E_ERROR, E_PARSE, E_CORE_ERROR, E_COMPILE_ERROR], true)) return;

        $debug = Config::bool('APP_DEBUG', false);
        Response::json([
            'error'   => 'fatal_error',
            'message' => $debug ? $err['message'] : 'Fatal error.',
        ], 500)->send();
    }
}
