<?php
declare(strict_types=1);

// =============================================================================
// /api/v1 route table. Loaded by Kernel::loadRoutes().
// =============================================================================

use Backend\Core\Database;
use Backend\Core\Request;
use Backend\Core\Response;
use Backend\Core\Router;

return function (Router $r): void {

    // ---- Health -------------------------------------------------------------
    $r->get('/api/v1/health', function (Request $req): Response {
        $dbOk = Database::ping();
        return Response::json([
            'status'  => $dbOk ? 'ok' : 'degraded',
            'service' => 'banjarabazaar-os',
            'phase'   => 1,
            'time'    => date('c'),
            'checks'  => [
                'db' => $dbOk ? 'up' : 'down',
            ],
        ], $dbOk ? 200 : 503);
    });

    // ---- Phase-1 auth surface ------------------------------------------------
    $r->post('/api/v1/auth/login', function (Request $request): Response {
        $identifier = trim((string) $request->input('email', $request->input('identifier', '')));
        $password = (string) $request->input('password', '');
        $deviceLabel = $request->input('device_label') ? (string) $request->input('device_label') : null;

        $errors = [];
        if ($identifier === '') {
            $errors['email'] = 'Email or identifier is required.';
        }
        if ($password === '') {
            $errors['password'] = 'Password is required.';
        }
        if ($errors !== []) {
            return \Backend\Helpers\JsonResponse::validation($errors);
        }

        try {
            $service = new \Backend\Services\AuthService();
            $result = $service->login($identifier, $password, $request, $deviceLabel);
            return \Backend\Helpers\JsonResponse::success($result);
        } catch (\Throwable $e) {
            $status = $e->getCode();
            if ($status < 100 || $status >= 600) {
                $status = 401;
            }
            return \Backend\Helpers\JsonResponse::error('authentication_failed', $e->getMessage(), $status);
        }
    });

    $r->post('/api/v1/auth/refresh', function (Request $request): Response {
        $refreshToken = (string) $request->input('refresh_token', '');
        if ($refreshToken === '') {
            return \Backend\Helpers\JsonResponse::validation(['refresh_token' => 'Refresh token is required.']);
        }

        try {
            $service = new \Backend\Services\AuthService();
            $result = $service->refresh($refreshToken, $request, (string) $request->input('device_label', '')); 
            return \Backend\Helpers\JsonResponse::success($result);
        } catch (\Throwable $e) {
            $status = $e->getCode();
            if ($status < 100 || $status >= 600) {
                $status = 401;
            }
            return \Backend\Helpers\JsonResponse::error('refresh_failed', $e->getMessage(), $status);
        }
    });

    $r->post('/api/v1/auth/logout', function (Request $request): Response {
        $refreshToken = (string) $request->input('refresh_token', '');
        if ($refreshToken === '') {
            return \Backend\Helpers\JsonResponse::validation(['refresh_token' => 'Refresh token is required.']);
        }

        $service = new \Backend\Services\AuthService();
        $service->logout($refreshToken, $request);
        return \Backend\Helpers\JsonResponse::success(['message' => 'Logged out successfully.']);
    });
};
