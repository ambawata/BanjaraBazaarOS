<?php
declare(strict_types=1);

namespace Backend\Middleware;

use Backend\Core\Request;
use Backend\Helpers\JsonResponse;
use Backend\Services\RbacService;

final class RoleMiddleware implements Middleware
{
    /** @param list<string> $allowed */
    public function __construct(private readonly array $allowed) {}

    public function handle(Request $request): ?\Backend\Core\Response
    {
        $auth = $request->attributes['auth'] ?? null;
        if (!is_array($auth) || !isset($auth['user_id'])) {
            return JsonResponse::unauthorized();
        }

        $roles = (new RbacService())->getRolesForUser((int) $auth['user_id']);
        if (count(array_intersect($this->allowed, $roles)) === 0) {
            return JsonResponse::forbidden();
        }

        return null;
    }
}
