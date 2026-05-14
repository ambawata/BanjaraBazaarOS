<?php
declare(strict_types=1);

namespace Backend\Middleware;

use Backend\Config\Config;
use Backend\Core\Request;
use Backend\Helpers\JsonResponse;
use Backend\Services\AuthService;

final class AuthMiddleware implements Middleware
{
    public function __construct(private readonly bool $require = false) {}

    public function handle(Request $request): ?\Backend\Core\Response
    {
        $token = $request->bearerToken();

        if ($token === null) {
            return $this->require ? JsonResponse::unauthorized() : null;
        }

        $secret = Config::string('JWT_SECRET');
        if ($secret === '') {
            return JsonResponse::serverError('JWT_SECRET is not configured.');
        }

        try {
            $service = new AuthService();
            $request->attributes['auth'] = $service->validateAccessToken($token);
            return null;
        } catch (\Throwable) {
            return JsonResponse::unauthorized('Invalid or expired access token.');
        }
    }
}
