<?php
declare(strict_types=1);

namespace Backend\Middleware;

use Backend\Core\Request;
use Backend\Core\Response;

/**
 * Reject malformed JSON bodies up-front so route handlers can trust $request->json.
 */
final class JsonMiddleware implements Middleware
{
    public function handle(Request $request): ?Response
    {
        $ctype = strtolower($request->header('Content-Type') ?? '');
        if (str_starts_with($ctype, 'application/json')
            && $request->rawBody !== ''
            && $request->json === null) {
            return Response::json(
                ['error' => 'invalid_json', 'message' => 'Request body is not valid JSON.'],
                400
            );
        }
        return null;
    }
}
