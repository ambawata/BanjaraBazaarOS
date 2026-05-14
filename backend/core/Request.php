<?php
declare(strict_types=1);

namespace Backend\Core;

final class Request
{
    /** @var array<string,mixed> Mutable bag for middleware/handlers to attach state (e.g. auth claims). */
    public array $attributes = [];

    private function __construct(
        public readonly string $method,
        public readonly string $path,
        public readonly array  $query,
        public readonly array  $headers,
        public readonly ?array $json,
        public readonly string $rawBody,
    ) {}

    public static function capture(): self
    {
        $method = strtoupper($_SERVER['REQUEST_METHOD'] ?? 'GET');
        $uri    = $_SERVER['REQUEST_URI'] ?? '/';
        $path   = parse_url($uri, PHP_URL_PATH) ?: '/';

        $headers = self::collectHeaders();
        $raw     = file_get_contents('php://input') ?: '';
        $json    = null;

        $ctype = $headers['Content-Type'] ?? '';
        if ($raw !== '' && stripos($ctype, 'application/json') !== false) {
            $decoded = json_decode($raw, true);
            if (is_array($decoded)) {
                $json = $decoded;
            }
        }

        return new self(
            method:  $method,
            path:    $path,
            query:   $_GET,
            headers: $headers,
            json:    $json,
            rawBody: $raw,
        );
    }

    public function method(): string { return $this->method; }
    public function path(): string   { return $this->path; }

    public function header(string $name): ?string
    {
        return $this->headers[$name]
            ?? $this->headers[ucwords(strtolower($name), '-')]
            ?? null;
    }

    public function bearerToken(): ?string
    {
        $auth = $this->header('Authorization') ?? '';
        return preg_match('/^Bearer\s+(.+)$/i', $auth, $m) ? trim($m[1]) : null;
    }

    public function input(string $key, mixed $default = null): mixed
    {
        return $this->json[$key] ?? $this->query[$key] ?? $default;
    }

    /** @return array<string,string> */
    private static function collectHeaders(): array
    {
        if (function_exists('getallheaders')) {
            $h = getallheaders();
            if (is_array($h)) {
                $out = [];
                foreach ($h as $k => $v) {
                    $out[ucwords(strtolower((string) $k), '-')] = (string) $v;
                }
                return $out;
            }
        }
        $out = [];
        foreach ($_SERVER as $k => $v) {
            if (str_starts_with($k, 'HTTP_')) {
                $name = ucwords(strtolower(str_replace('_', '-', substr($k, 5))), '-');
                $out[$name] = (string) $v;
            } elseif (in_array($k, ['CONTENT_TYPE', 'CONTENT_LENGTH'], true)) {
                $name = ucwords(strtolower(str_replace('_', '-', $k)), '-');
                $out[$name] = (string) $v;
            }
        }
        return $out;
    }
}
