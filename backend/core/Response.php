<?php
declare(strict_types=1);

namespace Backend\Core;

final class Response
{
    /** @param array<string,string> $headers */
    public function __construct(
        public readonly int    $status  = 200,
        public readonly string $body    = '',
        public readonly array  $headers = [],
    ) {}

    /** @param array<string,string> $headers */
    public static function json(mixed $data, int $status = 200, array $headers = []): self
    {
        $body = json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        if ($body === false) {
            $body = '{"error":"encoding_failed"}';
            $status = 500;
        }
        return new self(
            status:  $status,
            body:    $body,
            headers: array_merge(['Content-Type' => 'application/json; charset=utf-8'], $headers),
        );
    }

    public static function noContent(int $status = 204): self
    {
        return new self(status: $status, body: '', headers: []);
    }

    public function send(): void
    {
        if (!headers_sent()) {
            http_response_code($this->status);
            foreach ($this->headers as $name => $value) {
                header("$name: $value");
            }
        }
        echo $this->body;
    }
}
