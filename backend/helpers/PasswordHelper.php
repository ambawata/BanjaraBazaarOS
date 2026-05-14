<?php
declare(strict_types=1);

namespace Backend\Helpers;

final class PasswordHelper
{
    public static function hash(string $password): string
    {
        $algo = defined('PASSWORD_ARGON2ID') ? PASSWORD_ARGON2ID : PASSWORD_BCRYPT;
        $options = $algo === PASSWORD_ARGON2ID ? ['memory_cost' => 1 << 16, 'time_cost' => 4, 'threads' => 2] : ['cost' => 12];

        $hash = password_hash($password, $algo, $options);
        if (!is_string($hash)) {
            throw new \RuntimeException('Failed to generate password hash.');
        }
        return $hash;
    }

    public static function verify(string $password, string $hash): bool
    {
        return password_verify($password, $hash);
    }

    public static function needsRehash(string $hash): bool
    {
        $algo = defined('PASSWORD_ARGON2ID') ? PASSWORD_ARGON2ID : PASSWORD_BCRYPT;
        $options = $algo === PASSWORD_ARGON2ID ? ['memory_cost' => 1 << 16, 'time_cost' => 4, 'threads' => 2] : ['cost' => 12];

        return password_needs_rehash($hash, $algo, $options);
    }

    public static function isValidStrength(string $password, int $minLength): bool
    {
        return mb_strlen($password) >= $minLength;
    }
}
