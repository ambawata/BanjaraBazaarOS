<?php
declare(strict_types=1);

// =============================================================================
// BanjaraBazaarOS — front controller
// Single entry point for /api/v1/*. Deployed as the document root on Hostinger.
// =============================================================================

require dirname(__DIR__) . '/backend/core/bootstrap.php';

use Backend\Core\Kernel;
use Backend\Core\Request;

$kernel = new Kernel();
$kernel->loadRoutes(dirname(__DIR__) . '/backend/api/v1/routes.php');
$kernel->handle(Request::capture())->send();
