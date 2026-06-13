<?php
declare(strict_types=1);

namespace Backend\Services;

use Backend\Core\Database;
use Backend\Core\Request;
use PDO;

final class ProductAuditService
{
    private PDO $pdo;

    public function __construct()
    {
        $this->pdo = Database::connection();
    }

    /**
     * Log a product-related event.
     *
     * @param int $productId product.id
     * @param int $vendorId vendors.id
     * @param string $event e.g., "product.created", "product.status_changed"
     * @param Request $request HTTP request object (for IP, user agent)
     * @param int|null $userId users.id (e.g., admin approving a product)
     * @param array<string,mixed> $metadata Additional event context
     */
    public function log(
        int $productId,
        int $vendorId,
        string $event,
        Request $request,
        ?int $userId = null,
        array $metadata = []
    ): void {
        $metadataJson = json_encode($metadata, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        if ($metadataJson === false) {
            $metadataJson = '{}';
        }

        $stmt = $this->pdo->prepare(
            'INSERT INTO `product_audit_log`
             (`product_id`, `vendor_id`, `user_id`, `event`, `ip_address`, `user_agent`, `metadata`, `created_at`)
             VALUES (:product_id, :vendor_id, :user_id, :event, :ip_address, :user_agent, :metadata, CURRENT_TIMESTAMP)'
        );

        $stmt->execute([
            'product_id'  => $productId,
            'vendor_id'   => $vendorId,
            'user_id'     => $userId,
            'event'       => $event,
            'ip_address'  => $this->resolveIpAddress($request),
            'user_agent'  => $request->header('User-Agent'),
            'metadata'    => $metadataJson,
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

    /**
     * Retrieve audit log for a product.
     *
     * @param int $productId
     * @param int $limit max records to fetch
     * @return array<int,array<string,mixed>>
     */
    public function getProductLog(int $productId, int $limit = 50): array
    {
        $stmt = $this->pdo->prepare(
            'SELECT * FROM `product_audit_log` WHERE `product_id` = :product_id ORDER BY `created_at` DESC LIMIT :limit'
        );
        $stmt->execute(['product_id' => $productId, 'limit' => $limit]);

        $logs = [];
        foreach ($stmt->fetchAll(PDO::FETCH_ASSOC) as $row) {
            $logs[] = [
                'id'         => (int) $row['id'],
                'product_id' => (int) $row['product_id'],
                'vendor_id'  => (int) $row['vendor_id'],
                'user_id'    => $row['user_id'] ? (int) $row['user_id'] : null,
                'event'      => (string) $row['event'],
                'ip_address' => (string) ($row['ip_address'] ?? ''),
                'user_agent' => (string) ($row['user_agent'] ?? ''),
                'metadata'   => json_decode((string) $row['metadata'], true) ?: [],
                'created_at' => (string) $row['created_at'],
            ];
        }

        return $logs;
    }

    /**
     * Retrieve audit log for a vendor's products.
     *
     * @param int $vendorId
     * @param int $limit
     * @return array<int,array<string,mixed>>
     */
    public function getVendorLog(int $vendorId, int $limit = 100): array
    {
        $stmt = $this->pdo->prepare(
            'SELECT * FROM `product_audit_log` WHERE `vendor_id` = :vendor_id ORDER BY `created_at` DESC LIMIT :limit'
        );
        $stmt->execute(['vendor_id' => $vendorId, 'limit' => $limit]);

        $logs = [];
        foreach ($stmt->fetchAll(PDO::FETCH_ASSOC) as $row) {
            $logs[] = [
                'id'         => (int) $row['id'],
                'product_id' => (int) $row['product_id'],
                'vendor_id'  => (int) $row['vendor_id'],
                'user_id'    => $row['user_id'] ? (int) $row['user_id'] : null,
                'event'      => (string) $row['event'],
                'ip_address' => (string) ($row['ip_address'] ?? ''),
                'user_agent' => (string) ($row['user_agent'] ?? ''),
                'metadata'   => json_decode((string) $row['metadata'], true) ?: [],
                'created_at' => (string) $row['created_at'],
            ];
        }

        return $logs;
    }
}
