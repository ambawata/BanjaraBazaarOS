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

    // ---- Vastu Knowledge Engine ----------------------------------------------
    $r->get('/api/v1/vastu/search', function (Request $request): Response {
        $q = (string) $request->input('q', '');
        try {
            $service = new \Backend\Services\VastuKbService();
            return \Backend\Helpers\JsonResponse::success($service->search($q));
        } catch (\Throwable $e) {
            $status = \Backend\Helpers\JsonResponse::statusFromThrowable($e, 400);
            return \Backend\Helpers\JsonResponse::error('vastu_search_failed', $e->getMessage(), $status);
        }
    });

    $r->get('/api/v1/vastu/top-topics', function (Request $request): Response {
        try {
            $service = new \Backend\Services\VastuKbService();
            return \Backend\Helpers\JsonResponse::success(['results' => $service->topTopics()]);
        } catch (\Throwable $e) {
            $status = \Backend\Helpers\JsonResponse::statusFromThrowable($e, 400);
            return \Backend\Helpers\JsonResponse::error('vastu_top_topics_failed', $e->getMessage(), $status);
        }
    });

    // Admin-facing worklist of zero/low-confidence searches — no UI, just
    // JSON, checked periodically to prioritize new knowledge-base entries.
    $r->get('/api/v1/vastu/zero-hit-report', function (Request $request): Response {
        $days = (int) $request->input('days', 30);
        try {
            $service = new \Backend\Services\VastuKbService();
            return \Backend\Helpers\JsonResponse::success([
                'days'    => max(1, $days),
                'results' => $service->zeroHitReport($days),
            ]);
        } catch (\Throwable $e) {
            $status = \Backend\Helpers\JsonResponse::statusFromThrowable($e, 400);
            return \Backend\Helpers\JsonResponse::error('vastu_zero_hit_report_failed', $e->getMessage(), $status);
        }
    });

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

    // ---- Vastu Griha — Plot Geometry & True North Calibration (additive) ---
    // Geometry layer only (docs/VastuGriha_Geometry_Specification_v0.1.md
    // Section 10) — no Vastu verdicts/remedies are ever produced here.
    // ASSUMPTION: gated by AuthMiddleware only (any authenticated user), no
    // RoleMiddleware — the current role catalog (customer/vendor/staff/
    // admin/master_admin) has no role specific to this module yet. Narrow
    // to a dedicated role once product defines who may create plots.
    $r->post('/api/v1/vastu-geometry/plots', function (Request $request): Response {
        $auth = $request->attributes['auth'] ?? [];
        $userId = isset($auth['user_id']) ? (int) $auth['user_id'] : null;

        try {
            $service = new \Backend\Services\VastuGeometryService();
            $result = $service->createPlot($userId, $request->json ?? []);
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
            return \Backend\Helpers\JsonResponse::error('vastu_plot_creation_failed', $message, $status);
        }
    }, [new \Backend\Middleware\AuthMiddleware(require: true)]);

    $r->post('/api/v1/vastu-geometry/plots/{id}/walls', function (Request $request, array $params): Response {
        $plotId = (int) ($params['id'] ?? 0);
        if ($plotId <= 0) {
            return \Backend\Helpers\JsonResponse::validation(['id' => 'Plot id is required.']);
        }

        try {
            $service = new \Backend\Services\VastuGeometryService();
            $result = $service->addWalls($plotId, $request->json ?? []);
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
            return \Backend\Helpers\JsonResponse::error('vastu_wall_creation_failed', $message, $status);
        }
    }, [new \Backend\Middleware\AuthMiddleware(require: true)]);

    $r->post('/api/v1/vastu-geometry/plots/{id}/rooms', function (Request $request, array $params): Response {
        $plotId = (int) ($params['id'] ?? 0);
        if ($plotId <= 0) {
            return \Backend\Helpers\JsonResponse::validation(['id' => 'Plot id is required.']);
        }

        try {
            $service = new \Backend\Services\VastuGeometryService();
            $result = $service->addRoom($plotId, $request->json ?? []);
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
            return \Backend\Helpers\JsonResponse::error('vastu_room_creation_failed', $message, $status);
        }
    }, [new \Backend\Middleware\AuthMiddleware(require: true)]);

    $r->post('/api/v1/vastu-geometry/plots/{id}/doors', function (Request $request, array $params): Response {
        $plotId = (int) ($params['id'] ?? 0);
        if ($plotId <= 0) {
            return \Backend\Helpers\JsonResponse::validation(['id' => 'Plot id is required.']);
        }

        try {
            $service = new \Backend\Services\VastuGeometryService();
            $result = $service->addDoor($plotId, $request->json ?? []);
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
            return \Backend\Helpers\JsonResponse::error('vastu_door_creation_failed', $message, $status);
        }
    }, [new \Backend\Middleware\AuthMiddleware(require: true)]);

    $r->post('/api/v1/vastu-geometry/plots/{id}/calibrate', function (Request $request, array $params): Response {
        $plotId = (int) ($params['id'] ?? 0);
        if ($plotId <= 0) {
            return \Backend\Helpers\JsonResponse::validation(['id' => 'Plot id is required.']);
        }

        try {
            $service = new \Backend\Services\VastuGeometryService();
            $result = $service->calibrate($plotId, $request->json ?? []);
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
            return \Backend\Helpers\JsonResponse::error('vastu_calibration_failed', $message, $status);
        }
    }, [new \Backend\Middleware\AuthMiddleware(require: true)]);

    $r->get('/api/v1/vastu-geometry/plots/{id}/full', function (Request $request, array $params): Response {
        $plotId = (int) ($params['id'] ?? 0);
        if ($plotId <= 0) {
            return \Backend\Helpers\JsonResponse::validation(['id' => 'Plot id is required.']);
        }

        try {
            $service = new \Backend\Services\VastuGeometryService();
            $result = $service->getFullGeometry($plotId);
            return \Backend\Helpers\JsonResponse::success($result);
        } catch (\Throwable $e) {
            $status = \Backend\Helpers\JsonResponse::statusFromThrowable($e, 400);
            return \Backend\Helpers\JsonResponse::error('vastu_plot_fetch_failed', $e->getMessage(), $status);
        }
    }, [new \Backend\Middleware\AuthMiddleware(require: true)]);

    // ---- Vastu Verdict Layer --------------------------------------------
    // RAG consumer layer on top of the geometry engine (above) and the
    // Vastu Knowledge Engine (vastu_kb_* tables) — see
    // backend/services/VastuVerdictService.php for the full matching
    // design and the schema-inspection trail it was built against. This
    // endpoint never modifies geometry or KB data; read-only aggregation.
    $r->get('/api/v1/vastu-geometry/plots/{id}/verdicts', function (Request $request, array $params): Response {
        $plotId = (int) ($params['id'] ?? 0);
        if ($plotId <= 0) {
            return \Backend\Helpers\JsonResponse::validation(['id' => 'Plot id is required.']);
        }

        try {
            $service = new \Backend\Services\VastuVerdictService();
            $result = $service->getVerdicts($plotId);
            return \Backend\Helpers\JsonResponse::success($result);
        } catch (\Throwable $e) {
            $status = \Backend\Helpers\JsonResponse::statusFromThrowable($e, 400);
            return \Backend\Helpers\JsonResponse::error('vastu_verdict_fetch_failed', $e->getMessage(), $status);
        }
    }, [new \Backend\Middleware\AuthMiddleware(require: true)]);

    // ---- Consumer "My Home" onboarding wizard --------------------------
    // Thin wrapper endpoints only — see
    // backend/services/VastuMapOnboardingService.php. Delegates every
    // actual computation to the existing, untouched VastuGeometryService /
    // VastuGeometryMath / VastuVerdictMatcher. Same auth convention as the
    // rest of this module (any authenticated user, no dedicated role yet).
    $r->post('/api/v1/vastu-geometry/plots/from-map', function (Request $request): Response {
        $auth = $request->attributes['auth'] ?? [];
        $userId = isset($auth['user_id']) ? (int) $auth['user_id'] : null;

        try {
            $service = new \Backend\Services\VastuMapOnboardingService();
            $result = $service->createPlotFromMap($userId, $request->json ?? []);
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
            return \Backend\Helpers\JsonResponse::error('vastu_map_plot_creation_failed', $message, $status);
        }
    }, [new \Backend\Middleware\AuthMiddleware(require: true)]);

    $r->get('/api/v1/vastu-geometry/plots/{id}/zone-grid', function (Request $request, array $params): Response {
        $plotId = (int) ($params['id'] ?? 0);
        if ($plotId <= 0) {
            return \Backend\Helpers\JsonResponse::validation(['id' => 'Plot id is required.']);
        }

        try {
            $service = new \Backend\Services\VastuMapOnboardingService();
            $result = $service->getZoneGrid($plotId);
            return \Backend\Helpers\JsonResponse::success($result);
        } catch (\Throwable $e) {
            $status = \Backend\Helpers\JsonResponse::statusFromThrowable($e, 400);
            return \Backend\Helpers\JsonResponse::error('vastu_zone_grid_fetch_failed', $e->getMessage(), $status);
        }
    }, [new \Backend\Middleware\AuthMiddleware(require: true)]);
};
