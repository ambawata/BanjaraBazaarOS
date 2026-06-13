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
            $status = \Backend\Helpers\JsonResponse::statusFromThrowable($e, 401);
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
            $status = \Backend\Helpers\JsonResponse::statusFromThrowable($e, 401);
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

    // ---- Phase-1 vendor onboarding -----------------------------------------
    $r->post('/api/v1/vendors/register', function (Request $request): Response {
        try {
            $service = new \Backend\Services\VendorRegistrationService();
            $result = $service->register($request->json ?? [], $request);
            return \Backend\Helpers\JsonResponse::success($result, 201);
        } catch (\Throwable $e) {
            $status = \Backend\Helpers\JsonResponse::statusFromThrowable($e, 400);
            $message = $e->getMessage();
            if ($status === 422) {
                $payload = json_decode($message, true);
                if (is_array($payload) && isset($payload['errors'])) {
                    return \Backend\Helpers\JsonResponse::validation($payload['errors']);
                }
            }
            return \Backend\Helpers\JsonResponse::error('vendor_registration_failed', $message, $status);
        }
    });

    $r->post('/api/v1/vendors/apply', function (Request $request): Response {
        try {
            $service = new \Backend\Services\VendorService();
            $result = $service->apply($request->json ?? [], $request);
            return \Backend\Helpers\JsonResponse::success($result, 201);
        } catch (\Throwable $e) {
            $status = \Backend\Helpers\JsonResponse::statusFromThrowable($e, 400);
            $message = $e->getMessage();
            if ($status === 422) {
                $payload = json_decode($message, true);
                if (is_array($payload) && isset($payload['errors'])) {
                    return \Backend\Helpers\JsonResponse::validation($payload['errors']);
                }
            }
            return \Backend\Helpers\JsonResponse::error('vendor_application_failed', $message, $status);
        }
    });

    $r->get('/api/v1/vendors/me', function (Request $request): Response {
        $auth = $request->attributes['auth'] ?? [];
        $userId = isset($auth['user_id']) ? (int) $auth['user_id'] : null;
        if ($userId === null) {
            return \Backend\Helpers\JsonResponse::unauthorized();
        }

        $service = new \Backend\Services\VendorService();
        $vendor = $service->getByUserId($userId);
        if ($vendor === null) {
            return \Backend\Helpers\JsonResponse::error('not_found', 'Vendor profile not found.', 404);
        }
        return \Backend\Helpers\JsonResponse::success($vendor);
    }, [new \Backend\Middleware\AuthMiddleware(require: true)]);

    $r->get('/api/v1/vendors/applications', function (Request $request): Response {
        $service = new \Backend\Services\VendorService();
        return \Backend\Helpers\JsonResponse::success($service->listApplications());
    }, [new \Backend\Middleware\AuthMiddleware(require: true), new \Backend\Middleware\RoleMiddleware(['admin', 'master_admin'])]);

    $r->post('/api/v1/vendors/{vendor_id}/approve', function (Request $request, array $params): Response {
        $vendorId = (int) ($params['vendor_id'] ?? 0);
        if ($vendorId <= 0) {
            return \Backend\Helpers\JsonResponse::validation(['vendor_id' => 'Vendor id is required.']);
        }

        $auth = $request->attributes['auth'] ?? [];
        $actorId = isset($auth['user_id']) ? (int) $auth['user_id'] : null;
        $notes = trim((string) ($request->input('notes', '') ?? '')) ?: null;

        try {
            $service = new \Backend\Services\VendorService();
            $result = $service->approve($vendorId, $actorId ?? 0, $request, $notes);
            return \Backend\Helpers\JsonResponse::success($result);
        } catch (\Throwable $e) {
            $status = \Backend\Helpers\JsonResponse::statusFromThrowable($e, 400);
            return \Backend\Helpers\JsonResponse::error('vendor_approval_failed', $e->getMessage(), $status);
        }
    }, [new \Backend\Middleware\AuthMiddleware(require: true), new \Backend\Middleware\RoleMiddleware(['admin', 'master_admin'])]);

    $r->post('/api/v1/vendors/{vendor_id}/reject', function (Request $request, array $params): Response {
        $vendorId = (int) ($params['vendor_id'] ?? 0);
        $reason = trim((string) ($request->input('reason', '') ?? ''));

        if ($vendorId <= 0) {
            return \Backend\Helpers\JsonResponse::validation(['vendor_id' => 'Vendor id is required.']);
        }
        if ($reason === '') {
            return \Backend\Helpers\JsonResponse::validation(['reason' => 'Rejection reason is required.']);
        }

        $auth = $request->attributes['auth'] ?? [];
        $actorId = isset($auth['user_id']) ? (int) $auth['user_id'] : null;

        try {
            $service = new \Backend\Services\VendorService();
            $result = $service->reject($vendorId, $actorId ?? 0, $request, $reason);
            return \Backend\Helpers\JsonResponse::success($result);
        } catch (\Throwable $e) {
            $status = \Backend\Helpers\JsonResponse::statusFromThrowable($e, 400);
            $message = $e->getMessage();
            if ($status === 422) {
                $payload = json_decode($message, true);
                if (is_array($payload) && isset($payload['errors'])) {
                    return \Backend\Helpers\JsonResponse::validation($payload['errors']);
                }
            }
            return \Backend\Helpers\JsonResponse::error('vendor_rejection_failed', $message, $status);
        }
    }, [new \Backend\Middleware\AuthMiddleware(require: true), new \Backend\Middleware\RoleMiddleware(['admin', 'master_admin'])]);

    $r->post('/api/v1/vendors/{vendor_id}/suspend', function (Request $request, array $params): Response {
        $vendorId = (int) ($params['vendor_id'] ?? 0);
        $reason = trim((string) ($request->input('reason', '') ?? ''));

        if ($vendorId <= 0) {
            return \Backend\Helpers\JsonResponse::validation(['vendor_id' => 'Vendor id is required.']);
        }
        if ($reason === '') {
            return \Backend\Helpers\JsonResponse::validation(['reason' => 'Suspension reason is required.']);
        }

        $auth = $request->attributes['auth'] ?? [];
        $actorId = isset($auth['user_id']) ? (int) $auth['user_id'] : null;

        try {
            $service = new \Backend\Services\VendorService();
            $result = $service->suspend($vendorId, $actorId ?? 0, $request, $reason);
            return \Backend\Helpers\JsonResponse::success($result);
        } catch (\Throwable $e) {
            $status = \Backend\Helpers\JsonResponse::statusFromThrowable($e, 400);
            $message = $e->getMessage();
            if ($status === 422) {
                $payload = json_decode($message, true);
                if (is_array($payload) && isset($payload['errors'])) {
                    return \Backend\Helpers\JsonResponse::validation($payload['errors']);
                }
            }
            return \Backend\Helpers\JsonResponse::error('vendor_suspension_failed', $message, $status);
        }
    }, [new \Backend\Middleware\AuthMiddleware(require: true), new \Backend\Middleware\RoleMiddleware(['admin', 'master_admin'])]);

    // ---- Phase-2 product catalog -------------------------------------------
    $r->post('/api/v1/products', function (Request $request): Response {
        $auth = $request->attributes['auth'] ?? [];
        $userId = isset($auth['user_id']) ? (int) $auth['user_id'] : null;
        if ($userId === null) {
            return \Backend\Helpers\JsonResponse::unauthorized();
        }

        // Get vendor ID from user
        try {
            $vendorService = new \Backend\Services\VendorService();
            $vendor = $vendorService->getByUserId($userId);
            if ($vendor === null) {
                return \Backend\Helpers\JsonResponse::error('vendor_not_found', 'No vendor profile found for this user.', 404);
            }
            $vendorId = (int) $vendor['id'];

            $service = new \Backend\Services\ProductService();
            $result = $service->create($vendorId, $request->json ?? [], $request);
            return \Backend\Helpers\JsonResponse::success($result, 201);
        } catch (\Throwable $e) {
            $status = \Backend\Helpers\JsonResponse::statusFromThrowable($e, 400);
            $message = $e->getMessage();
            if ($status === 422) {
                $payload = json_decode($message, true);
                if (is_array($payload) && isset($payload['errors'])) {
                    return \Backend\Helpers\JsonResponse::validation($payload['errors']);
                }
            }
            return \Backend\Helpers\JsonResponse::error('product_creation_failed', $message, $status);
        }
    }, [new \Backend\Middleware\AuthMiddleware(require: true), new \Backend\Middleware\RoleMiddleware(['vendor'])]);

    $r->get('/api/v1/products', function (Request $request): Response {
        $auth = $request->attributes['auth'] ?? [];
        $userId = isset($auth['user_id']) ? (int) $auth['user_id'] : null;
        if ($userId === null) {
            return \Backend\Helpers\JsonResponse::unauthorized();
        }

        try {
            $vendorService = new \Backend\Services\VendorService();
            $vendor = $vendorService->getByUserId($userId);
            if ($vendor === null) {
                return \Backend\Helpers\JsonResponse::error('vendor_not_found', 'No vendor profile found for this user.', 404);
            }
            $vendorId = (int) $vendor['id'];

            $limit = (int) ($request->input('limit', 20));
            $offset = (int) ($request->input('offset', 0));
            $status = $request->input('status') ? (string) $request->input('status') : null;

            $service = new \Backend\Services\ProductService();
            $result = $service->listByVendor($vendorId, $limit, $offset, $status);
            return \Backend\Helpers\JsonResponse::success($result);
        } catch (\Throwable $e) {
            $status = \Backend\Helpers\JsonResponse::statusFromThrowable($e, 400);
            $message = $e->getMessage();
            if ($status === 422) {
                $payload = json_decode($message, true);
                if (is_array($payload) && isset($payload['errors'])) {
                    return \Backend\Helpers\JsonResponse::validation($payload['errors']);
                }
            }
            return \Backend\Helpers\JsonResponse::error('product_list_failed', $message, $status);
        }
    }, [new \Backend\Middleware\AuthMiddleware(require: true), new \Backend\Middleware\RoleMiddleware(['vendor'])]);

    $r->patch('/api/v1/products/{product_id}', function (Request $request, array $params): Response {
        $productId = (int) ($params['product_id'] ?? 0);
        if ($productId <= 0) {
            return \Backend\Helpers\JsonResponse::validation(['product_id' => 'Product ID is required.']);
        }

        $auth = $request->attributes['auth'] ?? [];
        $userId = isset($auth['user_id']) ? (int) $auth['user_id'] : null;
        if ($userId === null) {
            return \Backend\Helpers\JsonResponse::unauthorized();
        }

        try {
            $vendorService = new \Backend\Services\VendorService();
            $vendor = $vendorService->getByUserId($userId);
            if ($vendor === null) {
                return \Backend\Helpers\JsonResponse::error('vendor_not_found', 'No vendor profile found for this user.', 404);
            }
            $vendorId = (int) $vendor['id'];

            $service = new \Backend\Services\ProductService();
            $result = $service->update($productId, $vendorId, $request->json ?? [], $request);
            return \Backend\Helpers\JsonResponse::success($result);
        } catch (\Throwable $e) {
            $status = \Backend\Helpers\JsonResponse::statusFromThrowable($e, 400);
            $message = $e->getMessage();
            if ($status === 422) {
                $payload = json_decode($message, true);
                if (is_array($payload) && isset($payload['errors'])) {
                    return \Backend\Helpers\JsonResponse::validation($payload['errors']);
                }
            }
            return \Backend\Helpers\JsonResponse::error('product_update_failed', $message, $status);
        }
    }, [new \Backend\Middleware\AuthMiddleware(require: true), new \Backend\Middleware\RoleMiddleware(['vendor'])]);

    $r->post('/api/v1/products/{product_id}/submit', function (Request $request, array $params): Response {
        $productId = (int) ($params['product_id'] ?? 0);
        if ($productId <= 0) {
            return \Backend\Helpers\JsonResponse::validation(['product_id' => 'Product ID is required.']);
        }

        $auth = $request->attributes['auth'] ?? [];
        $userId = isset($auth['user_id']) ? (int) $auth['user_id'] : null;
        if ($userId === null) {
            return \Backend\Helpers\JsonResponse::unauthorized();
        }

        try {
            $vendorService = new \Backend\Services\VendorService();
            $vendor = $vendorService->getByUserId($userId);
            if ($vendor === null) {
                return \Backend\Helpers\JsonResponse::error('vendor_not_found', 'No vendor profile found for this user.', 404);
            }
            $vendorId = (int) $vendor['id'];

            $service = new \Backend\Services\ProductService();
            $result = $service->submitForApproval($productId, $vendorId, $request);
            return \Backend\Helpers\JsonResponse::success($result);
        } catch (\Throwable $e) {
            $status = \Backend\Helpers\JsonResponse::statusFromThrowable($e, 400);
            return \Backend\Helpers\JsonResponse::error('product_submit_failed', $e->getMessage(), $status);
        }
    }, [new \Backend\Middleware\AuthMiddleware(require: true), new \Backend\Middleware\RoleMiddleware(['vendor'])]);

    $r->post('/api/v1/products/{product_id}/approve', function (Request $request, array $params): Response {
        $productId = (int) ($params['product_id'] ?? 0);
        if ($productId <= 0) {
            return \Backend\Helpers\JsonResponse::validation(['product_id' => 'Product ID is required.']);
        }

        $auth = $request->attributes['auth'] ?? [];
        $userId = isset($auth['user_id']) ? (int) $auth['user_id'] : null;
        if ($userId === null) {
            return \Backend\Helpers\JsonResponse::unauthorized();
        }

        try {
            $service = new \Backend\Services\ProductService();
            // Fetch product to get vendor_id
            $product = $service->getById($productId);
            if ($product === null) {
                return \Backend\Helpers\JsonResponse::error('product_not_found', 'Product not found.', 404);
            }

            $notes = trim((string) ($request->input('notes', '') ?? '')) ?: null;
            $result = $service->approve($productId, (int) $product['vendor_id'], $userId, $request, $notes);
            return \Backend\Helpers\JsonResponse::success($result);
        } catch (\Throwable $e) {
            $status = \Backend\Helpers\JsonResponse::statusFromThrowable($e, 400);
            return \Backend\Helpers\JsonResponse::error('product_approval_failed', $e->getMessage(), $status);
        }
    }, [new \Backend\Middleware\AuthMiddleware(require: true), new \Backend\Middleware\RoleMiddleware(['admin', 'master_admin'])]);

    $r->post('/api/v1/products/{product_id}/reject', function (Request $request, array $params): Response {
        $productId = (int) ($params['product_id'] ?? 0);
        $reason = trim((string) ($request->input('reason', '') ?? ''));

        if ($productId <= 0) {
            return \Backend\Helpers\JsonResponse::validation(['product_id' => 'Product ID is required.']);
        }
        if ($reason === '') {
            return \Backend\Helpers\JsonResponse::validation(['reason' => 'Rejection reason is required.']);
        }

        $auth = $request->attributes['auth'] ?? [];
        $userId = isset($auth['user_id']) ? (int) $auth['user_id'] : null;
        if ($userId === null) {
            return \Backend\Helpers\JsonResponse::unauthorized();
        }

        try {
            $service = new \Backend\Services\ProductService();
            // Fetch product to get vendor_id
            $product = $service->getById($productId);
            if ($product === null) {
                return \Backend\Helpers\JsonResponse::error('product_not_found', 'Product not found.', 404);
            }

            $result = $service->reject($productId, (int) $product['vendor_id'], $userId, $request, $reason);
            return \Backend\Helpers\JsonResponse::success($result);
        } catch (\Throwable $e) {
            $status = \Backend\Helpers\JsonResponse::statusFromThrowable($e, 400);
            $message = $e->getMessage();
            if ($status === 422) {
                $payload = json_decode($message, true);
                if (is_array($payload) && isset($payload['errors'])) {
                    return \Backend\Helpers\JsonResponse::validation($payload['errors']);
                }
            }
            return \Backend\Helpers\JsonResponse::error('product_rejection_failed', $message, $status);
        }
    }, [new \Backend\Middleware\AuthMiddleware(require: true), new \Backend\Middleware\RoleMiddleware(['admin', 'master_admin'])]);

    $r->get('/api/v1/products/admin/pending', function (Request $request): Response {
        $limit = (int) ($request->input('limit', 20));
        $offset = (int) ($request->input('offset', 0));

        try {
            $service = new \Backend\Services\ProductService();
            $result = $service->listPending($limit, $offset);
            return \Backend\Helpers\JsonResponse::success($result);
        } catch (\Throwable $e) {
            $status = \Backend\Helpers\JsonResponse::statusFromThrowable($e, 400);
            return \Backend\Helpers\JsonResponse::error('product_list_failed', $e->getMessage(), $status);
        }
    }, [new \Backend\Middleware\AuthMiddleware(require: true), new \Backend\Middleware\RoleMiddleware(['admin', 'master_admin'])]);
};
