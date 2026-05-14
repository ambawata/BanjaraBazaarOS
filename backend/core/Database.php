<?php
declare(strict_types=1);

namespace Backend\Core;

use Backend\Config\Config;
use PDO;

final class Database
{
    private static ?PDO $pdo = null;

    public static function connection(): PDO
    {
        if (self::$pdo instanceof PDO) {
            return self::$pdo;
        }

        $host    = Config::string('DB_HOST', '127.0.0.1');
        $port    = Config::int('DB_PORT', 3306);
        $name    = Config::string('DB_NAME', '');
        $user    = Config::string('DB_USER', '');
        $pass    = Config::string('DB_PASS', '');
        $charset = Config::string('DB_CHARSET', 'utf8mb4');

        $dsn = "mysql:host=$host;port=$port;dbname=$name;charset=$charset";

        self::$pdo = new PDO($dsn, $user, $pass, [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
            PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES $charset COLLATE utf8mb4_unicode_ci",
        ]);

        return self::$pdo;
    }

    public static function ping(): bool
    {
        try {
            self::connection()->query('SELECT 1');
            return true;
        } catch (\Throwable) {
            return false;
        }
    }
}
