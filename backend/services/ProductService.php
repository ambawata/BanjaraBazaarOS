<?php
declare(strict_types=1);

namespace Backend\Services;

use Backend\Core\Database;
use Backend\Core\Request;
use PDO;
use RuntimeException;

final class ProductService
{
    private const PRODUCT_STATUSES = ['draft', 'pending', 'approved', 'rejected'];
    private const MAX_LIST_LIMIT = 100;

    private PDO $pdo;
    private ProductAuditService $audit;
    private SettingsService $settings;

    public function __construct()
    {
        $this->pdo = Database::connection();
        $this->audit = new ProductAuditService();
        $this->settings = new SettingsService();
    }

    /**
     * Create a new product (vendor action).
     * Product starts in 'draft' status.
     *
     * @param int $vendorId
     * @param array<string,mixed> $payload
     * @param Request $request
     * @return array<string,mixed>
     */
    public function create(int $vendorId, array $payload, Request $request): array
    {
        $this->assertVendorActive($vendorId);

        [$data, $errors] = $this->validateProductPayload($payload);
        if ($errors !== []) {
            throw new RuntimeException(json_encode(['errors' => $errors]), 422);
        }

        $this->pdo->beginTransaction();
        try {
            // Generate SEO slug
            $slug = $this->generateSlug($data['name'], $vendorId);

            // Insert product
            $stmt = $this->pdo->prepare(
                'INSERT INTO `products`
                 (`vendor_id`, `sku`, `slug`, `name`, `description`, `price`, `currency`, `status`, `tags`, `metadata`, `stock_quantity`, `created_at`, `updated_at`)
                 VALUES (:vendor_id, :sku, :slug, :name, :description, :price, :currency, :status, :tags, :metadata, :stock_quantity, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)'
            );
            $stmt->execute([
                'vendor_id'      => $vendorId,
                'sku'            => $data['sku'] ?: null,
                'slug'           => $slug,
                'name'           => $data['name'],
                'description'    => $data['description'] ?: null,
                'price'          => $data['price'],
                'currency'       => $data['currency'] ?: 'INR',
                'status'         => 'draft',
                'tags'           => $data['tags'] ? json_encode($data['tags'], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) : null,
                'metadata'       => $data['metadata'] ? json_encode($data['metadata'], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) : null,
                'stock_quantity' => (int) ($data['stock_quantity'] ?? 0),
            ]);

            $productId = (int) $this->pdo->lastInsertId();

            // Handle images if provided
            if (!empty($data['images'])) {
                $this->addImages($productId, $data['images']);
            }

            $this->audit->log($productId, $vendorId, 'product.created', $request, metadata: ['name' => $data['name']]);

            $this->pdo->commit();
        } catch (\Throwable $e) {
            $this->pdo->rollBack();
            throw $e;
        }

        return $this->getById($productId);
    }

    /**
     * Update product (vendor action).
     * Can only update if status is 'draft' or 'rejected'.
     *
     * @param int $productId
     * @param int $vendorId
     * @param array<string,mixed> $payload
     * @param Request $request
     * @return array<string,mixed>
     */
    public function update(int $productId, int $vendorId, array $payload, Request $request): array
    {
        $this->assertVendorActive($vendorId);

        $product = $this->getProductById($productId);
        if ($product === null || (int) $product['vendor_id'] !== $vendorId) {
            throw new RuntimeException('Product not found.', 404);
        }

        // Only allow edit in draft or rejected state
        if (!in_array($product['status'], ['draft', 'rejected'], true)) {
            throw new RuntimeException('Cannot edit product in ' . $product['status'] . ' status.', 400);
        }

        [$data, $errors] = $this->validateProductPayload($payload, false);
        if ($errors !== []) {
            throw new RuntimeException(json_encode(['errors' => $errors]), 422);
        }

        $this->pdo->beginTransaction();
        try {
            $updates = [];
            $params = ['id' => $productId];

            if (array_key_exists('name', $data)) {
                $updates[] = '`name` = :name';
                $params['name'] = $data['name'];
            }
            if (array_key_exists('description', $data)) {
                $updates[] = '`description` = :description';
                $params['description'] = $data['description'] ?: null;
            }
            if (array_key_exists('price', $data)) {
                $updates[] = '`price` = :price';
                $params['price'] = $data['price'];
            }
            if (array_key_exists('sku', $data)) {
                $updates[] = '`sku` = :sku';
                $params['sku'] = $data['sku'] ?: null;
            }
            if (array_key_exists('currency', $data)) {
                $updates[] = '`currency` = :currency';
                $params['currency'] = $data['currency'];
            }
            if (array_key_exists('stock_quantity', $data)) {
                $updates[] = '`stock_quantity` = :stock_quantity';
                $params['stock_quantity'] = (int) $data['stock_quantity'];
            }
            if (array_key_exists('tags', $data)) {
                $updates[] = '`tags` = :tags';
                $params['tags'] = $data['tags'] ? json_encode($data['tags'], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) : null;
            }
            if (array_key_exists('metadata', $data)) {
                $updates[] = '`metadata` = :metadata';
                $params['metadata'] = $data['metadata'] ? json_encode($data['metadata'], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) : null;
            }

            if ($updates !== []) {
                $updates[] = '`updated_at` = CURRENT_TIMESTAMP';
                $sql = 'UPDATE `products` SET ' . implode(', ', $updates) . ' WHERE `id` = :id';
                $this->pdo->prepare($sql)->execute($params);
            }

            // Handle image replacements if provided
            if (array_key_exists('images', $data)) {
                $this->pdo->prepare('DELETE FROM `product_images` WHERE `product_id` = :product_id')->execute(['product_id' => $productId]);
                if (!empty($data['images'])) {
                    $this->addImages($productId, $data['images']);
                }
            }

            $this->audit->log($productId, $vendorId, 'product.updated', $request, metadata: $data);

            $this->pdo->commit();
        } catch (\Throwable $e) {
            $this->pdo->rollBack();
            throw $e;
        }

        return $this->getById($productId);
    }

    /**
     * Submit product for approval (vendor action).
     * Product must be in draft status.
     *
     * @param int $productId
     * @param int $vendorId
     * @param Request $request
     * @return array<string,mixed>
     */
    public function submitForApproval(int $productId, int $vendorId, Request $request): array
    {
        $this->assertVendorActive($vendorId);

        $product = $this->getProductById($productId);
        if ($product === null || (int) $product['vendor_id'] !== $vendorId) {
            throw new RuntimeException('Product not found.', 404);
        }

        if (!in_array($product['status'], ['draft', 'rejected'], true)) {
            throw new RuntimeException('Only draft or rejected products can be submitted for approval.', 400);
        }

        $this->pdo->prepare(
            'UPDATE `products` SET `status` = :status, `rejection_reason` = NULL, `rejected_at` = NULL, `updated_at` = CURRENT_TIMESTAMP WHERE `id` = :id'
        )->execute(['status' => 'pending', 'id' => $productId]);

        $this->audit->log($productId, $vendorId, 'product.submitted', $request);

        return $this->getById($productId);
    }

    /**
     * Approve product (admin/reviewer action).
     *
     * @param int $productId
     * @param int $vendorId
     * @param int $approverUserId admin/reviewer user ID
     * @param Request $request
     * @param string|null $notes optional notes
     * @return array<string,mixed>
     */
    public function approve(int $productId, int $vendorId, int $approverUserId, Request $request, ?string $notes = null): array
    {
        $product = $this->getProductById($productId);
        if ($product === null) {
            throw new RuntimeException('Product not found.', 404);
        }

        if ($product['status'] !== 'pending') {
            throw new RuntimeException('Only pending products can be approved.', 400);
        }
        $this->assertVendorActive((int) $product['vendor_id']);

        $this->pdo->prepare(
            'UPDATE `products` SET `status` = :status, `approved_at` = CURRENT_TIMESTAMP, `rejection_reason` = NULL, `rejected_at` = NULL, `updated_at` = CURRENT_TIMESTAMP WHERE `id` = :id'
        )->execute(['status' => 'approved', 'id' => $productId]);

        $this->audit->log($productId, $vendorId, 'product.approved', $request, $approverUserId, ['notes' => $notes]);

        return $this->getById($productId);
    }

    /**
     * Reject product (admin/reviewer action).
     *
     * @param int $productId
     * @param int $vendorId
     * @param int $approverUserId
     * @param Request $request
     * @param string $reason rejection reason
     * @return array<string,mixed>
     */
    public function reject(int $productId, int $vendorId, int $approverUserId, Request $request, string $reason): array
    {
        $product = $this->getProductById($productId);
        if ($product === null) {
            throw new RuntimeException('Product not found.', 404);
        }

        if ($product['status'] !== 'pending') {
            throw new RuntimeException('Only pending products can be rejected.', 400);
        }
        $reason = $this->cleanString($reason, 255);
        if ($reason === '') {
            throw new RuntimeException(json_encode(['errors' => ['reason' => 'Rejection reason is required.']]), 422);
        }

        $this->pdo->prepare(
            'UPDATE `products` SET `status` = :status, `rejected_at` = CURRENT_TIMESTAMP, `rejection_reason` = :reason, `updated_at` = CURRENT_TIMESTAMP WHERE `id` = :id'
        )->execute(['status' => 'rejected', 'reason' => $reason, 'id' => $productId]);

        $this->audit->log($productId, $vendorId, 'product.rejected', $request, $approverUserId, ['reason' => $reason]);

        return $this->getById($productId);
    }

    /**
     * List vendor's products with pagination.
     *
     * @param int $vendorId
     * @param int $limit
     * @param int $offset
     * @param string|null $status filter by status (e.g., 'approved')
     * @return array<string,mixed>
     */
    public function listByVendor(int $vendorId, int $limit = 20, int $offset = 0, ?string $status = null): array
    {
        $this->assertVendorActive($vendorId);
        $limit = max(1, min($limit, self::MAX_LIST_LIMIT));
        $offset = max(0, $offset);

        $where = '`vendor_id` = :vendor_id AND `deleted_at` IS NULL';
        $params = ['vendor_id' => $vendorId];

        if ($status !== null) {
            if (!in_array($status, self::PRODUCT_STATUSES, true)) {
                throw new RuntimeException(json_encode(['errors' => ['status' => 'Invalid product status filter.']]), 422);
            }
            $where .= ' AND `status` = :status';
            $params['status'] = $status;
        }

        $countStmt = $this->pdo->prepare("SELECT COUNT(*) as cnt FROM `products` WHERE $where");
        $countStmt->execute($params);
        $total = (int) $countStmt->fetch(PDO::FETCH_ASSOC)['cnt'];

        $stmt = $this->pdo->prepare(
            "SELECT * FROM `products` WHERE $where ORDER BY `created_at` DESC LIMIT :limit OFFSET :offset"
        );
        $stmt->execute(array_merge($params, ['limit' => $limit, 'offset' => $offset]));

        $products = [];
        foreach ($stmt->fetchAll(PDO::FETCH_ASSOC) as $row) {
            $products[] = $this->hydrateProduct($row);
        }

        return [
            'items' => $products,
            'total' => $total,
            'limit' => $limit,
            'offset' => $offset,
        ];
    }

    /**
     * List all pending products (admin view).
     *
     * @param int $limit
     * @param int $offset
     * @return array<string,mixed>
     */
    public function listPending(int $limit = 20, int $offset = 0): array
    {
        $limit = max(1, min($limit, self::MAX_LIST_LIMIT));
        $offset = max(0, $offset);

        $countStmt = $this->pdo->query("SELECT COUNT(*) as cnt FROM `products` WHERE `status` = 'pending' AND `deleted_at` IS NULL");
        $total = (int) $countStmt->fetch(PDO::FETCH_ASSOC)['cnt'];

        $stmt = $this->pdo->prepare(
            "SELECT * FROM `products` WHERE `status` = 'pending' AND `deleted_at` IS NULL ORDER BY `created_at` ASC LIMIT :limit OFFSET :offset"
        );
        $stmt->execute(['limit' => $limit, 'offset' => $offset]);

        $products = [];
        foreach ($stmt->fetchAll(PDO::FETCH_ASSOC) as $row) {
            $products[] = $this->hydrateProduct($row);
        }

        return [
            'items' => $products,
            'total' => $total,
            'limit' => $limit,
            'offset' => $offset,
        ];
    }

    /**
     * Get product by ID with images.
     *
     * @param int $productId
     * @return array<string,mixed>|null
     */
    public function getById(int $productId): ?array
    {
        $product = $this->getProductById($productId);
        if ($product === null) {
            return null;
        }

        return $this->hydrateProduct($product);
    }

    /**
     * Validate product payload.
     *
     * @param array<string,mixed> $payload
     * @param bool $requireAll require all fields
     * @return array{0:array<string,mixed>,1:array<string,string>}
     */
    private function validateProductPayload(array $payload, bool $requireAll = true): array
    {
        $errors = [];
        $data = [];
        $knownFields = ['name', 'description', 'price', 'sku', 'currency', 'stock_quantity', 'tags', 'metadata', 'images'];

        if (!$requireAll && !$this->hasAnyKey($payload, $knownFields)) {
            $errors['_payload'] = 'At least one product field is required.';
            return [$data, $errors];
        }

        if ($requireAll || array_key_exists('name', $payload)) {
            $data['name'] = $this->cleanString($payload['name'] ?? '', 255);
        }

        if ($requireAll || array_key_exists('description', $payload)) {
            $data['description'] = $this->cleanString($payload['description'] ?? '', 5000);
        }

        if ($requireAll || array_key_exists('price', $payload)) {
            $rawPrice = $payload['price'] ?? null;
            if ($rawPrice === null || $rawPrice === '' || !is_numeric($rawPrice)) {
                $errors['price'] = 'Price must be a valid number.';
            } else {
                $data['price'] = round((float) $rawPrice, 2);
            }
        }

        if ($requireAll || array_key_exists('sku', $payload)) {
            $data['sku'] = $this->cleanString($payload['sku'] ?? '', 100);
        }

        if ($requireAll || array_key_exists('currency', $payload)) {
            $currency = strtoupper($this->cleanString($payload['currency'] ?? 'INR', 10));
            $data['currency'] = $currency === '' ? 'INR' : $currency;
        }

        if ($requireAll || array_key_exists('stock_quantity', $payload)) {
            $rawStock = $payload['stock_quantity'] ?? 0;
            if ($rawStock === '' || !is_numeric($rawStock)) {
                $errors['stock_quantity'] = 'Stock quantity must be a valid number.';
            } else {
                $data['stock_quantity'] = (int) $rawStock;
            }
        }

        if ($requireAll || array_key_exists('tags', $payload)) {
            if (isset($payload['tags']) && !is_array($payload['tags'])) {
                $errors['tags'] = 'Tags must be an array.';
            } else {
                $data['tags'] = $this->sanitizeStringList($payload['tags'] ?? [], 64, 25);
            }
        }

        if ($requireAll || array_key_exists('metadata', $payload)) {
            if (isset($payload['metadata']) && !is_array($payload['metadata'])) {
                $errors['metadata'] = 'Metadata must be an object.';
            } else {
                $data['metadata'] = is_array($payload['metadata'] ?? null) ? $payload['metadata'] : [];
            }
        }

        if ($requireAll || array_key_exists('images', $payload)) {
            if (isset($payload['images']) && !is_array($payload['images'])) {
                $errors['images'] = 'Images must be an array.';
            } else {
                $data['images'] = $this->sanitizeImages($payload['images'] ?? [], $errors);
            }
        }

        if ($requireAll) {
            if (($data['name'] ?? '') === '') {
                $errors['name'] = 'Product name is required.';
            }
            if (isset($data['price']) && $data['price'] <= 0) {
                $errors['price'] = 'Price must be greater than 0.';
            }
        } else {
            if (array_key_exists('name', $payload) && ($data['name'] ?? '') === '') {
                $errors['name'] = 'Product name cannot be empty.';
            }
            if (array_key_exists('price', $payload) && isset($data['price']) && $data['price'] <= 0) {
                $errors['price'] = 'Price must be greater than 0.';
            }
        }

        if (isset($data['currency']) && !preg_match('/^[A-Z]{3,10}$/', $data['currency'])) {
            $errors['currency'] = 'Currency must be 3-10 uppercase letters.';
        }

        if (isset($data['stock_quantity']) && $data['stock_quantity'] < 0) {
            $errors['stock_quantity'] = 'Stock quantity cannot be negative.';
        }

        return [$data, $errors];
    }

    /** @param list<string> $keys */
    private function hasAnyKey(array $payload, array $keys): bool
    {
        foreach ($keys as $key) {
            if (array_key_exists($key, $payload)) {
                return true;
            }
        }
        return false;
    }

    private function cleanString(mixed $value, int $maxLength): string
    {
        $clean = strip_tags((string) $value);
        $clean = preg_replace('/[\x00-\x1F\x7F]/', ' ', $clean) ?? $clean;
        $clean = preg_replace('/\s+/', ' ', $clean) ?? $clean;
        return mb_substr(trim($clean), 0, $maxLength);
    }

    private function sanitizeStringList(array $values, int $maxLength, int $maxItems): array
    {
        $clean = [];
        foreach (array_slice($values, 0, $maxItems) as $value) {
            if (!is_scalar($value)) {
                continue;
            }
            $item = $this->cleanString($value, $maxLength);
            if ($item !== '') {
                $clean[] = $item;
            }
        }
        return array_values(array_unique($clean));
    }

    private function sanitizeImages(array $images, array &$errors): array
    {
        $clean = [];
        foreach (array_slice($images, 0, 10) as $index => $image) {
            if (!is_array($image)) {
                $errors["images.$index"] = 'Each image must be an object.';
                continue;
            }

            $filePath = $this->cleanString($image['file_path'] ?? '', 255);
            if ($filePath === '') {
                $errors["images.$index.file_path"] = 'Image file path is required.';
                continue;
            }

            $clean[] = [
                'file_path' => $filePath,
                'alt_text' => $this->cleanString($image['alt_text'] ?? '', 255),
            ];
        }
        return $clean;
    }

    /**
     * Generate SEO-friendly slug.
     *
     * @param string $name
     * @param int $vendorId
     * @return string
     */
    private function generateSlug(string $name, int $vendorId): string
    {
        // Base slug from name: lowercase, replace spaces/special chars with hyphens
        $slug = strtolower(trim(preg_replace('/[^a-z0-9]+/i', '-', $name) ?? ''));
        $slug = trim($slug, '-');

        // Ensure uniqueness per vendor
        $stmt = $this->pdo->prepare(
            'SELECT COUNT(*) as cnt FROM `products` WHERE `vendor_id` = :vendor_id AND `slug` LIKE :slug_pattern AND `deleted_at` IS NULL'
        );

        $counter = 1;
        $baseSlug = $slug;
        while (true) {
            $pattern = $counter === 1 ? $slug : $baseSlug . '-' . ($counter - 1);
            $stmt->execute(['vendor_id' => $vendorId, 'slug_pattern' => $pattern]);
            $count = (int) $stmt->fetch(PDO::FETCH_ASSOC)['cnt'];

            if ($count === 0) {
                return $pattern;
            }

            $counter++;
        }
    }

    /**
     * Add images to product.
     *
     * @param int $productId
     * @param array<int,array<string,mixed>> $images
     */
    private function addImages(int $productId, array $images): void
    {
        $stmt = $this->pdo->prepare(
            'INSERT INTO `product_images` (`product_id`, `file_path`, `alt_text`, `display_order`, `is_primary`, `created_at`)
             VALUES (:product_id, :file_path, :alt_text, :display_order, :is_primary, CURRENT_TIMESTAMP)'
        );

        $displayOrder = 0;
        $isPrimary = 1;

        foreach ($images as $image) {
            $filePath = trim((string) ($image['file_path'] ?? ''));
            if ($filePath === '') {
                continue;
            }

            $stmt->execute([
                'product_id'    => $productId,
                'file_path'     => $filePath,
                'alt_text'      => trim((string) ($image['alt_text'] ?? '')) ?: null,
                'display_order' => $displayOrder,
                'is_primary'    => $isPrimary,
            ]);

            $displayOrder++;
            $isPrimary = 0;
        }
    }

    /**
     * Hydrate product row with images.
     *
     * @param array<string,mixed> $row
     * @return array<string,mixed>
     */
    private function hydrateProduct(array $row): array
    {
        $productId = (int) $row['id'];

        // Fetch images
        $imgStmt = $this->pdo->prepare(
            'SELECT * FROM `product_images` WHERE `product_id` = :product_id ORDER BY `display_order` ASC'
        );
        $imgStmt->execute(['product_id' => $productId]);

        $images = [];
        foreach ($imgStmt->fetchAll(PDO::FETCH_ASSOC) as $img) {
            $images[] = [
                'id'            => (int) $img['id'],
                'file_path'     => (string) $img['file_path'],
                'alt_text'      => $img['alt_text'] ? (string) $img['alt_text'] : null,
                'display_order' => (int) $img['display_order'],
                'is_primary'    => (bool) $img['is_primary'],
            ];
        }

        return [
            'id'               => $productId,
            'vendor_id'        => (int) $row['vendor_id'],
            'sku'              => $row['sku'] ? (string) $row['sku'] : null,
            'slug'             => (string) $row['slug'],
            'name'             => (string) $row['name'],
            'description'      => $row['description'] ? (string) $row['description'] : null,
            'price'            => (float) $row['price'],
            'currency'         => (string) $row['currency'],
            'status'           => (string) $row['status'],
            'rejection_reason' => $row['rejection_reason'] ? (string) $row['rejection_reason'] : null,
            'approved_at'      => $row['approved_at'] ? (string) $row['approved_at'] : null,
            'rejected_at'      => $row['rejected_at'] ? (string) $row['rejected_at'] : null,
            'stock_quantity'   => (int) $row['stock_quantity'],
            'stock_reserved'   => (int) $row['stock_reserved'],
            'tags'             => $row['tags'] ? json_decode((string) $row['tags'], true) : [],
            'metadata'         => $row['metadata'] ? json_decode((string) $row['metadata'], true) : [],
            'images'           => $images,
            'created_at'       => (string) $row['created_at'],
            'updated_at'       => (string) $row['updated_at'],
        ];
    }

    /**
     * Get product row (internal use).
     *
     * @param int $productId
     * @return array<string,mixed>|null
     */
    private function getProductById(int $productId): ?array
    {
        $stmt = $this->pdo->prepare('SELECT * FROM `products` WHERE `id` = :id LIMIT 1');
        $stmt->execute(['id' => $productId]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        return $row !== false ? $row : null;
    }

    private function assertVendorActive(int $vendorId): array
    {
        $vendor = $this->getVendorById($vendorId);
        if ($vendor === null) {
            throw new RuntimeException('Vendor not found.', 404);
        }
        if ($vendor['status'] !== 'active') {
            throw new RuntimeException('Vendor is not active. Product actions are disabled.', 403);
        }

        return $vendor;
    }

    /**
     * Get vendor row (internal use).
     *
     * @param int $vendorId
     * @return array<string,mixed>|null
     */
    private function getVendorById(int $vendorId): ?array
    {
        $stmt = $this->pdo->prepare('SELECT * FROM `vendors` WHERE `id` = :id LIMIT 1');
        $stmt->execute(['id' => $vendorId]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        return $row !== false ? $row : null;
    }
}
