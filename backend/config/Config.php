<?php
declare(strict_types=1);

namespace Backend\Config;

/**
 * Typed environment accessor. Reads from $_ENV / $_SERVER / getenv()
 * so it works with vlucas/phpdotenv as well as host-provided env vars.
 */
final class Config
{
    public static function string(string $key, string $default = ''): string
    {
        $v = $_ENV[$key] ?? $_SERVER[$key] ?? getenv($key);
        return ($v === false || $v === null || $v === '') ? $default : (string) $v;
    }

    public static function int(string $key, int $default = 0): int
    {
        $v = self::string($key, (string) $default);
        return is_numeric($v) ? (int) $v : $default;
    }

    public static function bool(string $key, bool $default = false): bool
    {
        $raw = $_ENV[$key] ?? $_SERVER[$key] ?? getenv($key);
        if ($raw === false || $raw === null || $raw === '') return $default;
        return in_array(strtolower((string) $raw), ['1', 'true', 'on', 'yes'], true);
    }

    /** @param list<string> $default @return list<string> */
    public static function csv(string $key, array $default = []): array
    {
        $v = self::string($key, '');
        if ($v === '') return $default;
        return array_values(array_filter(array_map('trim', explode(',', $v)), fn($s) => $s !== ''));
    }
}
