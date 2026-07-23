<?php
declare(strict_types=1);

namespace Backend\Middleware;

use Backend\Config\Config;
use Backend\Core\Request;
use Backend\Core\Response;

final class CorsMiddleware implements Middleware
{
    public function handle(Request $request): ?Response
    {
        $allowed  = Config::csv('CORS_ALLOWED_ORIGINS');
        $patterns = Config::csv('CORS_ALLOWED_ORIGIN_PATTERNS');
        $origin   = $request->header('Origin');

        if ($origin !== null && (in_array($origin, $allowed, true) || self::matchesPattern($origin, $patterns))) {
            header("Access-Control-Allow-Origin: $origin");
            header('Vary: Origin');
            header('Access-Control-Allow-Credentials: true');
            header('Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS');
            header('Access-Control-Allow-Headers: Authorization, Content-Type, X-Requested-With');
            header('Access-Control-Max-Age: 600');
        }

        if ($request->method() === 'OPTIONS') {
            return Response::noContent(204);
        }
        return null;
    }

    /**
     * Single-wildcard prefix/suffix matching for CORS_ALLOWED_ORIGIN_PATTERNS
     * — e.g. "https://vastu-griha-*-teambb.vercel.app" matches both Vercel's
     * per-deployment preview URLs (vastu-griha-<hash>-teambb.vercel.app) and
     * per-branch alias URLs (vastu-griha-git-<branch>-teambb.vercel.app) for
     * this specific project + team, without a regex engine — deliberately
     * simple (no ReDoS risk, trivial to audit in a config review) since
     * CORS origin-matching is security-sensitive. A pattern with no '*' is
     * silently skipped (never matches) rather than erroring.
     *
     * @param list<string> $patterns
     */
    private static function matchesPattern(string $origin, array $patterns): bool
    {
        foreach ($patterns as $pattern) {
            $star = strpos($pattern, '*');
            if ($star === false) {
                continue;
            }
            $prefix = substr($pattern, 0, $star);
            $suffix = substr($pattern, $star + 1);
            if (
                strlen($origin) >= strlen($prefix) + strlen($suffix)
                && str_starts_with($origin, $prefix)
                && str_ends_with($origin, $suffix)
            ) {
                return true;
            }
        }
        return false;
    }
}
