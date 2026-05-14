<?php
declare(strict_types=1);

namespace Backend\Services;

use Backend\Core\Database;
use Backend\Config\Config;
use PDO;

final class SettingsService
{
    private static ?array $cache = null;
    private PDO $pdo;

    public function __construct()
    {
        $this->pdo = Database::connection();
    }

    /** @return array<string,array{value:string,value_type:string}> */
    private function all(): array
    {
        if (self::$cache !== null) {
            return self::$cache;
        }

        self::$cache = [];
        $stmt = $this->pdo->query('SELECT `key`, `value`, `value_type` FROM `settings`');
        foreach ($stmt->fetchAll(PDO::FETCH_ASSOC) as $row) {
            self::$cache[(string) $row['key']] = [
                'value'      => (string) $row['value'],
                'value_type' => (string) $row['value_type'],
            ];
        }

        return self::$cache;
    }

    public function string(string $key, string $default = ''): string
    {
        $settings = $this->all();
        if (isset($settings[$key])) {
            return $settings[$key]['value'];
        }
        return Config::string($key, $default);
    }

    public function int(string $key, int $default = 0): int
    {
        $value = $this->string($key, (string) $default);
        return is_numeric($value) ? (int) $value : $default;
    }

    public function bool(string $key, bool $default = false): bool
    {
        $value = $this->string($key, $default ? '1' : '0');
        return in_array(strtolower($value), ['1', 'true', 'on', 'yes'], true);
    }

    public function json(string $key, array $default = []): array
    {
        $value = $this->string($key, '');
        if ($value === '') {
            return $default;
        }

        $decoded = json_decode($value, true);
        return is_array($decoded) ? $decoded : $default;
    }
}
