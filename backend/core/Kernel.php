<?php
declare(strict_types=1);

namespace Backend\Core;

use Backend\Middleware\CorsMiddleware;
use Backend\Middleware\JsonMiddleware;
use Backend\Middleware\Middleware;

final class Kernel
{
    private Router $router;

    /** @var list<Middleware> */
    private array $globalMiddleware;

    public function __construct()
    {
        $this->router = new Router();
        $this->globalMiddleware = [
            new CorsMiddleware(),
            new JsonMiddleware(),
        ];
    }

    public function loadRoutes(string $path): void
    {
        if (!is_file($path)) {
            throw new \RuntimeException("Route file not found: $path");
        }
        $loader = require $path;
        if (!is_callable($loader)) {
            throw new \RuntimeException("Route file must return a callable: $path");
        }
        $loader($this->router);
    }

    public function handle(Request $request): Response
    {
        foreach ($this->globalMiddleware as $mw) {
            $early = $mw->handle($request);
            if ($early instanceof Response) {
                return $early;
            }
        }
        return $this->router->dispatch($request);
    }
}
