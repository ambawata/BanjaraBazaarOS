<?php
declare(strict_types=1);

namespace Backend\Services;

use Backend\Core\Database;
use Backend\Core\Request;
use PDO;

final class VendorAuditService
{
    private PDO $pdo;

    public function __construct()
    {
        $this->pdo = Database::connection();
    }

    public function log(int $vendorId, ?int $userId, string $event, Request $request, array $metadata = []): void
    {
        $ipAddress = $this->resolveIpAddress($request);
        $userAgent = $request->header('User-Agent');
        $metadataJson = json_encode($metadata, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        if ($metadataJson === false) {
            $metadataJson = '{}';
        }

        $stmt = $this->pdo->prepare(
            'INSERT INTO `vendor_audit_log` (`vendor_id`, `user_id`, `event`, `ip_address`, `user_agent`, `metadata`) VALUES (:vendor_id, :user_id, :event, :ip_address, :user_agent, :metadata)'
        );
        $stmt->execute([
            'vendor_id'  => $vendorId,
            'user_id'    => $userId,
            'event'      => $event,
            'ip_address' => $ipAddress,
            'user_agent' => $userAgent,
            'metadata'   => $metadataJson,
        ]);
    }

    private function resolveIpAddress(Request $request): ?string
    {
        $forwarded = $request->header('X-Forwarded-For');
        if ($forwarded !== null && trim($forwarded) !== '') {
            $parts = explode(',', $forwarded);
            return trim($parts[0]);
        }
        return $_SERVER['REMOTE_ADDR'] ?? null;
    }
}
