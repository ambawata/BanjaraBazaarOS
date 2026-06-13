<?php
declare(strict_types=1);

namespace Backend\Services;

use Backend\Config\Config;
use Backend\Helpers\PasswordHelper;
use Backend\Core\Database;
use Backend\Core\Request;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use PDO;
use RuntimeException;

final class AuthService
{
    private PDO $pdo;
    private SettingsService $settings;
    private RbacService $rbac;
    private AuthAuditService $audit;

    public function __construct()
    {
        $this->pdo = Database::connection();
        $this->settings = new SettingsService();
        $this->rbac = new RbacService();
        $this->audit = new AuthAuditService();
    }

    public function login(string $identifier, string $password, Request $request, string $deviceLabel = null): array
    {
        $user = $this->findUserByIdentifier($identifier);
        $ipAddress = $this->resolveIpAddress($request);
        $userAgent = $request->header('User-Agent');
        $minLength = $this->settings->int('auth.password_min_length', 10);

        if ($user === null) {
            $this->audit->log(null, 'auth.login.failure', $request, ['identifier' => $identifier]);
            throw new RuntimeException('Invalid credentials.', 401);
        }

        if ($user['locked_until'] !== null && strtotime($user['locked_until']) > time()) {
            $this->audit->log((int) $user['id'], 'auth.login.locked', $request, ['locked_until' => $user['locked_until']]);
            throw new RuntimeException('Account temporarily locked.', 423);
        }

        if (!is_string($user['password_hash']) || $user['password_hash'] === '') {
            $this->audit->log((int) $user['id'], 'auth.login.failure', $request, ['reason' => 'password_not_set']);
            throw new RuntimeException('Password is not configured for this account.', 401);
        }

        if (!PasswordHelper::isValidStrength($password, $minLength)) {
            $this->incrementFailedLogin($user, $request);
            throw new RuntimeException('Invalid credentials.', 401);
        }

        if (!PasswordHelper::verify($password, $user['password_hash'])) {
            $this->incrementFailedLogin($user, $request);
            throw new RuntimeException('Invalid credentials.', 401);
        }

        $this->resetFailedLogin($user);

        if (PasswordHelper::needsRehash($user['password_hash'])) {
            $this->upgradePasswordHash((int) $user['id'], $password);
        }

        $roles = $this->rbac->getRolesForUser((int) $user['id']);
        $permissions = $this->rbac->getPermissionsForUser((int) $user['id']);

        if ($user['status'] !== 'active') {
            $this->audit->log((int) $user['id'], 'auth.login.denied', $request, ['status' => $user['status']]);
            throw new RuntimeException('Account is not active.', 403);
        }

        $tokens = $this->issueTokens((int) $user['id'], $user['email'], $roles, $permissions, $deviceLabel, $ipAddress, $userAgent);
        $this->audit->log((int) $user['id'], 'auth.login.success', $request, ['device_label' => $deviceLabel, 'ip_address' => $ipAddress]);

        return array_merge($tokens, [
            'user' => [
                'id'    => (int) $user['id'],
                'email' => $user['email'],
                'name'  => $user['full_name'],
                'roles' => $roles,
            ],
        ]);
    }

    public function refresh(string $refreshToken, Request $request, string $deviceLabel = null): array
    {
        $session = $this->findRefreshSession($refreshToken);
        $ipAddress = $this->resolveIpAddress($request);
        $userAgent = $request->header('User-Agent');

        if ($session === null) {
            $this->audit->log(null, 'auth.refresh.failure', $request, ['reason' => 'token_not_found']);
            throw new RuntimeException('Refresh token invalid or expired.', 401);
        }

        if ($session['revoked_at'] !== null) {
            $this->audit->log((int) $session['user_id'], 'auth.refresh.failure', $request, ['reason' => 'revoked']);
            throw new RuntimeException('Refresh token invalid or expired.', 401);
        }

        if ($session['expires_at'] !== null && strtotime($session['expires_at']) < time()) {
            $this->audit->log((int) $session['user_id'], 'auth.refresh.failure', $request, ['reason' => 'expired']);
            throw new RuntimeException('Refresh token invalid or expired.', 401);
        }

        $user = $this->findUserById((int) $session['user_id']);
        if ($user === null || $user['status'] !== 'active') {
            $this->audit->log((int) $session['user_id'], 'auth.refresh.denied', $request, ['status' => $user['status'] ?? 'missing']);
            throw new RuntimeException('Refresh token invalid or expired.', 401);
        }

        $roles = $this->rbac->getRolesForUser((int) $user['id']);
        $permissions = $this->rbac->getPermissionsForUser((int) $user['id']);

        $this->revokeRefreshSession((int) $session['id']);
        $tokens = $this->issueTokens((int) $user['id'], $user['email'], $roles, $permissions, $deviceLabel, $ipAddress, $userAgent);
        $this->audit->log((int) $user['id'], 'auth.refresh.success', $request, ['device_label' => $deviceLabel]);

        return $tokens;
    }

    public function logout(string $refreshToken, Request $request): void
    {
        $session = $this->findRefreshSession($refreshToken);
        $userId = null;
        if ($session !== null) {
            $userId = (int) $session['user_id'];
            $this->revokeRefreshSession((int) $session['id']);
        }

        $this->audit->log($userId, 'auth.logout.success', $request, ['token_present' => $session !== null]);
    }

    public function validateAccessToken(string $token): array
    {
        $secret = Config::string('JWT_SECRET');
        if ($secret === '') {
            throw new RuntimeException('JWT_SECRET is not configured.');
        }

        $claims = JWT::decode($token, new Key($secret, 'HS256'));
        if (!isset($claims->sub) || !is_numeric((string) $claims->sub)) {
            throw new RuntimeException('Invalid access token.');
        }

        $userId = (int) $claims->sub;
        $user = $this->findUserById($userId);
        if ($user === null || $user['status'] !== 'active') {
            throw new RuntimeException('User account is not active.');
        }

        return [
            'user_id'     => $userId,
            'email'       => $user['email'],
            'roles'       => $this->rbac->getRolesForUser($userId),
            'permissions' => $this->rbac->getPermissionsForUser($userId),
            'issued_at'   => $claims->iat ?? null,
            'expires_at'  => $claims->exp ?? null,
        ];
    }

    private function findUserByIdentifier(string $identifier): ?array
    {
        $stmt = $this->pdo->prepare(
            'SELECT * FROM `users` WHERE (LOWER(`email`) = LOWER(:email_identifier) OR `phone` = :phone_identifier) AND `deleted_at` IS NULL LIMIT 1'
        );
        $stmt->execute([
            'email_identifier' => $identifier,
            'phone_identifier' => $identifier,
        ]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        return $user === false ? null : $user;
    }

    private function findUserById(int $userId): ?array
    {
        $stmt = $this->pdo->prepare('SELECT * FROM `users` WHERE `id` = :user_id AND `deleted_at` IS NULL LIMIT 1');
        $stmt->execute(['user_id' => $userId]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        return $user === false ? null : $user;
    }

    private function findRefreshSession(string $refreshToken): ?array
    {
        $hash = hash('sha256', $refreshToken);
        $stmt = $this->pdo->prepare("SELECT * FROM `sessions` WHERE `token_hash` = :token_hash AND `type` = 'refresh' LIMIT 1");
        $stmt->execute(['token_hash' => $hash]);
        $session = $stmt->fetch(PDO::FETCH_ASSOC);
        return $session === false ? null : $session;
    }

    private function revokeRefreshSession(int $sessionId): void
    {
        $stmt = $this->pdo->prepare('UPDATE `sessions` SET `revoked_at` = CURRENT_TIMESTAMP WHERE `id` = :id AND `revoked_at` IS NULL');
        $stmt->execute(['id' => $sessionId]);
    }

    private function issueTokens(int $userId, string $email, array $roles, array $permissions, ?string $deviceLabel, ?string $ipAddress, ?string $userAgent): array
    {
        $accessToken = $this->createAccessToken($userId, $email, $roles, $permissions);
        $refreshToken = $this->createRefreshToken($userId, $deviceLabel, $ipAddress, $userAgent);
        $expiresIn = $this->settings->int('auth.jwt_access_ttl_min', 60) * 60;
        return [
            'access_token' => $accessToken,
            'expires_in'   => $expiresIn,
            'refresh_token' => $refreshToken,
        ];
    }

    private function createAccessToken(int $userId, string $email, array $roles, array $permissions): string
    {
        $secret = Config::string('JWT_SECRET');
        if ($secret === '') {
            throw new RuntimeException('JWT_SECRET is not configured.');
        }

        $issuedAt = time();
        $ttlMinutes = $this->settings->int('auth.jwt_access_ttl_min', 60);
        $payload = [
            'iss' => 'banjarabazaar-os',
            'sub' => (string) $userId,
            'email' => $email,
            'roles' => $roles,
            'permissions' => $permissions,
            'iat' => $issuedAt,
            'nbf' => $issuedAt,
            'exp' => $issuedAt + ($ttlMinutes * 60),
        ];

        return JWT::encode($payload, $secret, 'HS256');
    }

    private function createRefreshToken(int $userId, ?string $deviceLabel, ?string $ipAddress, ?string $userAgent): string
    {
        $token = bin2hex(random_bytes(32));
        $hash = hash('sha256', $token);
        $ttlDays = $this->settings->int('auth.jwt_refresh_ttl_days', 30);
        $expiresAt = date('Y-m-d H:i:s', time() + $ttlDays * 86400);

        $stmt = $this->pdo->prepare(
            "INSERT INTO `sessions` (`user_id`, `type`, `token_hash`, `device_label`, `ip_address`, `user_agent`, `last_activity`, `expires_at`, `created_at`) VALUES (:user_id, 'refresh', :token_hash, :device_label, :ip_address, :user_agent, CURRENT_TIMESTAMP, :expires_at, CURRENT_TIMESTAMP)"
        );
        $stmt->execute([
            'user_id' => $userId,
            'token_hash' => $hash,
            'device_label' => $deviceLabel,
            'ip_address' => $ipAddress,
            'user_agent' => $userAgent,
            'expires_at' => $expiresAt,
        ]);

        return $token;
    }

    private function incrementFailedLogin(array $user, Request $request): void
    {
        $failedAttempts = (int) $user['failed_login_attempts'] + 1;
        $maxFailedAttempts = $this->settings->int('auth.max_failed_attempts', 5);
        $lockedUntil = null;
        if ($failedAttempts >= $maxFailedAttempts) {
            $lockoutMinutes = $this->settings->int('auth.lockout_minutes', 15);
            $lockedUntil = date('Y-m-d H:i:s', time() + $lockoutMinutes * 60);
        }

        $stmt = $this->pdo->prepare('UPDATE `users` SET `failed_login_attempts` = :failed_login_attempts, `locked_until` = :locked_until WHERE `id` = :id');
        $stmt->execute([
            'failed_login_attempts' => $failedAttempts,
            'locked_until' => $lockedUntil,
            'id' => $user['id'],
        ]);

        $this->audit->log((int) $user['id'], 'auth.login.failure', $request, ['failed_attempts' => $failedAttempts]);
    }

    private function resetFailedLogin(array $user): void
    {
        $stmt = $this->pdo->prepare('UPDATE `users` SET `failed_login_attempts` = 0, `locked_until` = NULL, `last_login_at` = CURRENT_TIMESTAMP WHERE `id` = :id');
        $stmt->execute(['id' => $user['id']]);
    }

    private function upgradePasswordHash(int $userId, string $password): void
    {
        $hash = PasswordHelper::hash($password);
        $stmt = $this->pdo->prepare('UPDATE `users` SET `password_hash` = :password_hash WHERE `id` = :id');
        $stmt->execute(['password_hash' => $hash, 'id' => $userId]);
    }

    private function resolveIpAddress(Request $request): ?string
    {
        $forwarded = $request->header('X-Forwarded-For');
        if ($forwarded !== null && trim($forwarded) !== '') {
            $parts = explode(',', $forwarded);
            return trim($parts[0]);
        }
        return $_SERVER['REMOTE_ADDR'] ?? null;
    }
}
