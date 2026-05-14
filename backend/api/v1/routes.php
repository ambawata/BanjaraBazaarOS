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

    // ---- Phase-1 auth surface lands in the next slice -----------------------
    // POST   /api/v1/auth/login
    // POST   /api/v1/auth/refresh
    // POST   /api/v1/auth/logout
    // POST   /api/v1/auth/setup-password
    // POST   /api/v1/auth/forgot-password
    // POST   /api/v1/auth/reset-password
    // GET    /api/v1/auth/me
};
