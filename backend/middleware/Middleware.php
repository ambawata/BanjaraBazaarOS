<?php
declare(strict_types=1);

namespace Backend\Middleware;

use Backend\Core\Request;
use Backend\Core\Response;

interface Middleware
{
    /**
     * Run before the route handler.
     * Return a Response to short-circuit; return null to continue the chain.
     */
    public function handle(Request $request): ?Response;
}
