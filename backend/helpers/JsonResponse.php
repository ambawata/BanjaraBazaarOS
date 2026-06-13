<?php
declare(strict_types=1);

namespace Backend\Helpers;

use Backend\Core\Response;

final class JsonResponse
{
    public static function success(mixed $data = [], int $status = 200): Response
    {
        return Response::json([
            'status' => 'success',
            'data'   => $data,
        ], $status);
    }

    public static function created(mixed $data = []): Response
    {
        return self::success($data, 201);
    }

    public static function error(string $code, string $message, int $status = 400, array $meta = []): Response
    {
        $payload = [
            'status'  => 'error',
            'error'   => $code,
            'message' => $message,
        ];
        if ($meta !== []) {
            $payload['meta'] = $meta;
        }
        return Response::json($payload, $status);
    }

    public static function statusFromThrowable(\Throwable $e, int $fallback = 400): int
    {
        $code = $e->getCode();
        if (is_int($code) && $code >= 100 && $code < 600) {
            return $code;
        }

        if (is_string($code) && ctype_digit($code)) {
            $status = (int) $code;
            if ($status >= 100 && $status < 600) {
                return $status;
            }
        }

        return $fallback;
    }

    public static function validation(array $errors, int $status = 422): Response
    {
        return self::error('validation_failed', 'One or more fields are invalid.', $status, ['errors' => $errors]);
    }

    public static function unauthorized(string $message = 'Authentication required.'): Response
    {
        return self::error('unauthorized', $message, 401);
    }

    public static function forbidden(string $message = 'Access forbidden.'): Response
    {
        return self::error('forbidden', $message, 403);
    }

    public static function serverError(string $message = 'Server error.'): Response
    {
        return self::error('server_error', $message, 500);
    }
}
