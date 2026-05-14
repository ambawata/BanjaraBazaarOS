<?php
declare(strict_types=1);

namespace Backend\Middleware;

use Backend\Config\Config;
use Backend\Core\Request;
use Backend\Core\Response;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;

/**
 * Phase 1 stub. Decodes the bearer JWT (if present) and attaches its claims
 * to $request->attributes['auth']. Does NOT enforce by default — pass
 * `require: true` to reject anonymous callers.
 *
 * Login / refresh / setup-password endpoints will populate these tokens
 * in the next slice.
 */
final class AuthMiddleware implements Middleware
{
    public function __construct(private readonly bool $require = false) {}

    public function handle(Request $request): ?Response
    {
        $token = $request->bearerToken();

        if ($token === null) {
            return $this->require
                ? Response::json(['error' => 'unauthenticated'], 401)
                : null;
        }

        $secret = Config::string('JWT_SECRET');
        if ($secret === '') {
            return Response::json(
                ['error' => 'server_misconfigured', 'message' => 'JWT_SECRET is not set.'],
                500
            );
        }

        try {
            $claims = JWT::decode($token, new Key($secret, 'HS256'));
            $request->attributes['auth'] = (array) $claims;
            return null;
        } catch (\Throwable $e) {
            return Response::json(
                ['error' => 'invalid_token', 'message' => $e->getMessage()],
                401
            );
        }
    }
}
