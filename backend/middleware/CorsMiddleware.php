<?php
declare(strict_types=1);

namespace Backend\Middleware;

use Backend\Config\Config;
use Backend\Core\Request;
use Backend\Core\Response;

final class CorsMiddleware implements Middleware
{
    public function handle(Request $request): ?Response
    {
        $allowed = Config::csv('CORS_ALLOWED_ORIGINS');
        $origin  = $request->header('Origin');

        if ($origin !== null && in_array($origin, $allowed, true)) {
            header("Access-Control-Allow-Origin: $origin");
            header('Vary: Origin');
            header('Access-Control-Allow-Credentials: true');
            header('Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS');
            header('Access-Control-Allow-Headers: Authorization, Content-Type, X-Requested-With');
            header('Access-Control-Max-Age: 600');
        }

        if ($request->method() === 'OPTIONS') {
            return Response::noContent(204);
        }
        return null;
    }
}
