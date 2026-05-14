<?php
declare(strict_types=1);

namespace Backend\Core;

use Backend\Middleware\Middleware;

final class Router
{
    /**
     * @var list<array{method:string,path:string,handler:callable,middleware:list<Middleware>}>
     */
    private array $routes = [];

    /** @param list<Middleware> $middleware */
    public function add(string $method, string $path, callable $handler, array $middleware = []): void
    {
        $this->routes[] = [
            'method'     => strtoupper($method),
            'path'       => $path,
            'handler'    => $handler,
            'middleware' => $middleware,
        ];
    }

    public function get(string $path, callable $h, array $mw = []): void    { $this->add('GET',    $path, $h, $mw); }
    public function post(string $path, callable $h, array $mw = []): void   { $this->add('POST',   $path, $h, $mw); }
    public function put(string $path, callable $h, array $mw = []): void    { $this->add('PUT',    $path, $h, $mw); }
    public function patch(string $path, callable $h, array $mw = []): void  { $this->add('PATCH',  $path, $h, $mw); }
    public function delete(string $path, callable $h, array $mw = []): void { $this->add('DELETE', $path, $h, $mw); }

    public function dispatch(Request $request): Response
    {
        $method = $request->method();
        $path   = $request->path();

        $methodAllowed = false;
        foreach ($this->routes as $r) {
            $params = $this->match($r['path'], $path);
            if ($params === null) continue;

            if ($r['method'] !== $method) {
                $methodAllowed = true; // path matches but wrong verb
                continue;
            }

            foreach ($r['middleware'] as $mw) {
                $early = $mw->handle($request);
                if ($early instanceof Response) {
                    return $early;
                }
            }

            $result = ($r['handler'])($request, $params);
            return $result instanceof Response ? $result : Response::json($result);
        }

        if ($methodAllowed) {
            return Response::json(
                ['error' => 'method_not_allowed', 'method' => $method, 'path' => $path],
                405
            );
        }
        return Response::json(['error' => 'not_found', 'path' => $path], 404);
    }

    /** @return array<string,string>|null */
    private function match(string $pattern, string $path): ?array
    {
        $regex = preg_replace('#\{([a-zA-Z_][a-zA-Z0-9_]*)\}#', '(?P<$1>[^/]+)', $pattern);
        if (!preg_match('#^' . $regex . '$#', $path, $m)) return null;
        return array_filter($m, 'is_string', ARRAY_FILTER_USE_KEY);
    }
}
