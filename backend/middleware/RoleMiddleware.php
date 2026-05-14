<?php
declare(strict_types=1);

namespace Backend\Middleware;

use Backend\Core\Request;
use Backend\Core\Response;

/**
 * Phase 1 stub. Requires the authenticated user (set by AuthMiddleware)
 * to hold at least one of the listed role slugs.
 *
 * Usage:
 *   $r->get('/api/v1/admin/users', $handler, [
 *       new AuthMiddleware(require: true),
 *       new RoleMiddleware(['admin', 'master_admin']),
 *   ]);
 */
final class RoleMiddleware implements Middleware
{
    /** @param list<string> $allowed */
    public function __construct(private readonly array $allowed) {}

    public function handle(Request $request): ?Response
    {
        $auth  = $request->attributes['auth'] ?? null;
        $roles = is_array($auth) ? ($auth['roles'] ?? []) : [];

        if (!is_array($roles) || count(array_intersect($this->allowed, $roles)) === 0) {
            return Response::json(['error' => 'forbidden'], 403);
        }
        return null;
    }
}
