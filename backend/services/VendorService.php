<?php
declare(strict_types=1);

namespace Backend\Services;

use Backend\Core\Database;
use Backend\Core\Request;
use Backend\Helpers\PasswordHelper;
use PDO;
use RuntimeException;

final class VendorService
{
    private PDO $pdo;
    private SettingsService $settings;
    private VendorAuditService $audit;
    private RbacService $rbac;

    public function __construct()
    {
        $this->pdo = Database::connection();
        $this->settings = new SettingsService();
        $this->audit = new VendorAuditService();
        $this->rbac = new RbacService();
    }

    public function apply(array $payload, Request $request): array
    {
        if (!$this->settings->bool('feature.vendor_signup_open', false)) {
            throw new RuntimeException('Vendor sign-up is not currently open.', 403);
        }

        [$data, $errors] = $this->validateApplicationPayload($payload);
        if ($errors !== []) {
            throw new RuntimeException(json_encode(['errors' => $errors]), 422);
        }

        if ($this->findUserByEmail($data['email']) !== null) {
            throw new RuntimeException('Email address is already registered.', 409);
        }

        $passwordHash = PasswordHelper::hash($data['password']);
        $userId = $this->createUser($data['email'], $data['phone'], $data['full_name'], $passwordHash);
        $status = $this->settings->bool('vendor.approval_required', true) ? 'pending' : 'active';
        $vendorId = $this->createVendor($userId, $status);
        $this->createVendorProfile($vendorId, $data);

        if ($status === 'active') {
            $this->assignRole($userId, 'vendor');
        }

        $this->audit->log($vendorId, null, 'vendor.application.submitted', $request, ['status' => $status]);
        if ($status === 'active') {
            $this->audit->log($vendorId, null, 'vendor.application.auto_approved', $request, []);
        }

        return $this->getById($vendorId);
    }

    public function approve(int $vendorId, int $actorId, Request $request, ?string $notes = null): array
    {
        $vendor = $this->findVendorById($vendorId);
        if ($vendor === null) {
            throw new RuntimeException('Vendor application not found.', 404);
        }

        if ($vendor['status'] === 'active') {
            throw new RuntimeException('Vendor is already active.', 400);
        }

        $this->pdo->prepare(
            'UPDATE `vendors` SET `status` = :status, `approved_at` = CURRENT_TIMESTAMP, `rejected_at` = NULL, `rejected_reason` = NULL, `suspended_at` = NULL, `suspended_reason` = NULL WHERE `id` = :id'
        )->execute(['status' => 'active', 'id' => $vendorId]);

        $this->assignRole((int) $vendor['user_id'], 'vendor');
        $this->audit->log($vendorId, $actorId, 'vendor.application.approved', $request, ['notes' => $notes]);

        return $this->getById($vendorId);
    }

    public function reject(int $vendorId, int $actorId, Request $request, string $reason): array
    {
        $vendor = $this->findVendorById($vendorId);
        if ($vendor === null) {
            throw new RuntimeException('Vendor application not found.', 404);
        }

        if ($vendor['status'] === 'rejected') {
            throw new RuntimeException('Vendor is already rejected.', 400);
        }

        $this->pdo->prepare(
            'UPDATE `vendors` SET `status` = :status, `rejected_at` = CURRENT_TIMESTAMP, `rejected_reason` = :reason WHERE `id` = :id'
        )->execute(['status' => 'rejected', 'reason' => $reason, 'id' => $vendorId]);

        $this->audit->log($vendorId, $actorId, 'vendor.application.rejected', $request, ['reason' => $reason]);

        return $this->getById($vendorId);
    }

    public function suspend(int $vendorId, int $actorId, Request $request, string $reason): array
    {
        $vendor = $this->findVendorById($vendorId);
        if ($vendor === null) {
            throw new RuntimeException('Vendor application not found.', 404);
        }

        if ($vendor['status'] === 'suspended') {
            throw new RuntimeException('Vendor is already suspended.', 400);
        }

        $this->pdo->prepare(
            'UPDATE `vendors` SET `status` = :status, `suspended_at` = CURRENT_TIMESTAMP, `suspended_reason` = :reason WHERE `id` = :id'
        )->execute(['status' => 'suspended', 'reason' => $reason, 'id' => $vendorId]);

        $this->audit->log($vendorId, $actorId, 'vendor.account.suspended', $request, ['reason' => $reason]);

        return $this->getById($vendorId);
    }

    public function getById(int $vendorId): array
    {
        $stmt = $this->pdo->prepare(
            'SELECT v.*, u.email AS user_email, u.full_name AS user_full_name, p.business_name, p.gst_number, p.pan_number, p.business_type, p.business_category, p.address_line1, p.address_line2, p.city, p.state, p.postal_code, p.country, p.website, p.contact_name, p.contact_email, p.contact_phone, p.business_metadata
             FROM `vendors` v
             JOIN `users` u ON u.id = v.user_id
             JOIN `vendor_profiles` p ON p.vendor_id = v.id
             WHERE v.id = :id LIMIT 1'
        );
        $stmt->execute(['id' => $vendorId]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        if ($row === false) {
            throw new RuntimeException('Vendor application not found.', 404);
        }

        return $this->hydrateVendorRow($row);
    }

    public function getByUserId(int $userId): ?array
    {
        $stmt = $this->pdo->prepare(
            'SELECT v.*, p.business_name, p.gst_number, p.pan_number, p.business_type, p.business_category, p.address_line1, p.address_line2, p.city, p.state, p.postal_code, p.country, p.website, p.contact_name, p.contact_email, p.contact_phone, p.business_metadata
             FROM `vendors` v
             JOIN `vendor_profiles` p ON p.vendor_id = v.id
             WHERE v.user_id = :user_id LIMIT 1'
        );
        $stmt->execute(['user_id' => $userId]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        return $row === false ? null : $this->hydrateVendorRow($row);
    }

    public function listApplications(): array
    {
        $stmt = $this->pdo->query(
            'SELECT v.id, v.user_id, v.status, v.created_at, v.updated_at, u.email AS user_email, u.full_name AS user_full_name, p.business_name, p.gst_number
             FROM `vendors` v
             JOIN `users` u ON u.id = v.user_id
             JOIN `vendor_profiles` p ON p.vendor_id = v.id
             ORDER BY v.created_at DESC'
        );

        return array_map([
            $this,
            'hydrateVendorRow',
        ], $stmt->fetchAll(PDO::FETCH_ASSOC));
    }

    private function hydrateVendorRow(array $row): array
    {
        return [
            'id' => (int) $row['id'],
            'user_id' => (int) $row['user_id'],
            'slug' => (string) $row['slug'],
            'status' => (string) $row['status'],
            'approved_at' => $row['approved_at'] ?? null,
            'rejected_at' => $row['rejected_at'] ?? null,
            'rejected_reason' => $row['rejected_reason'] ?? null,
            'suspended_at' => $row['suspended_at'] ?? null,
            'suspended_reason' => $row['suspended_reason'] ?? null,
            'created_at' => $row['created_at'],
            'updated_at' => $row['updated_at'],
            'user' => [
                'email' => $row['user_email'],
                'full_name' => $row['user_full_name'],
            ],
            'profile' => [
                'business_name' => $row['business_name'],
                'gst_number' => $row['gst_number'],
                'pan_number' => $row['pan_number'],
                'business_type' => $row['business_type'],
                'business_category' => $row['business_category'],
                'address_line1' => $row['address_line1'],
                'address_line2' => $row['address_line2'],
                'city' => $row['city'],
                'state' => $row['state'],
                'postal_code' => $row['postal_code'],
                'country' => $row['country'],
                'website' => $row['website'],
                'contact_name' => $row['contact_name'],
                'contact_email' => $row['contact_email'],
                'contact_phone' => $row['contact_phone'],
                'business_metadata' => $row['business_metadata'] !== null ? json_decode($row['business_metadata'], true) : null,
            ],
        ];
    }

    /** @return array{0:array<string,mixed>,1:array<string,string>} */
    private function validateApplicationPayload(array $payload): array
    {
        $errors = [];
        $data = [
            'email' => trim((string) ($payload['email'] ?? '')),
            'phone' => trim((string) ($payload['phone'] ?? '')),
            'full_name' => trim((string) ($payload['full_name'] ?? '')),
            'password' => (string) ($payload['password'] ?? ''),
            'business_name' => trim((string) ($payload['business_name'] ?? '')),
            'gst_number' => strtoupper(trim((string) ($payload['gst_number'] ?? ''))),
            'pan_number' => strtoupper(trim((string) ($payload['pan_number'] ?? ''))),
            'business_type' => trim((string) ($payload['business_type'] ?? '')),
            'business_category' => trim((string) ($payload['business_category'] ?? '')),
            'address_line1' => trim((string) ($payload['address_line1'] ?? '')),
            'address_line2' => trim((string) ($payload['address_line2'] ?? '')),
            'city' => trim((string) ($payload['city'] ?? '')),
            'state' => trim((string) ($payload['state'] ?? '')),
            'postal_code' => trim((string) ($payload['postal_code'] ?? '')),
            'country' => trim((string) ($payload['country'] ?? 'India')),
            'website' => trim((string) ($payload['website'] ?? '')),
            'contact_name' => trim((string) ($payload['contact_name'] ?? '')),
            'contact_email' => trim((string) ($payload['contact_email'] ?? '')),
            'contact_phone' => trim((string) ($payload['contact_phone'] ?? '')),
            'business_metadata' => is_array($payload['business_metadata'] ?? null) ? $payload['business_metadata'] : [],
        ];

        if ($data['email'] === '' || !filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
            $errors['email'] = 'A valid email address is required.';
        }

        if ($data['full_name'] === '') {
            $errors['full_name'] = 'Full name is required.';
        }

        $minLength = $this->settings->int('auth.password_min_length', 10);
        if ($data['password'] === '' || mb_strlen($data['password']) < $minLength) {
            $errors['password'] = sprintf('Password must be at least %d characters.', $minLength);
        }

        if ($this->settings->bool('vendor.business_name_required', true) && $data['business_name'] === '') {
            $errors['business_name'] = 'Business name is required.';
        }

        if ($this->settings->bool('vendor.gst_required', true)) {
            if ($data['gst_number'] === '') {
                $errors['gst_number'] = 'GST number is required.';
            } elseif (!preg_match('/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[A-Z0-9]{1}[Z]{1}[A-Z0-9]{1}$/', $data['gst_number'])) {
                $errors['gst_number'] = 'GST number must be a valid 15-character GSTIN.';
            }
        } elseif ($data['gst_number'] !== '' && !preg_match('/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[A-Z0-9]{1}[Z]{1}[A-Z0-9]{1}$/', $data['gst_number'])) {
            $errors['gst_number'] = 'GST number must be a valid 15-character GSTIN.';
        }

        if ($data['pan_number'] !== '' && !preg_match('/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/', $data['pan_number'])) {
            $errors['pan_number'] = 'PAN number must be a valid 10-character PAN.';
        }

        if ($data['contact_email'] !== '' && !filter_var($data['contact_email'], FILTER_VALIDATE_EMAIL)) {
            $errors['contact_email'] = 'Contact email must be valid.';
        }

        return [$data, $errors];
    }

    private function findUserByEmail(string $email): ?array
    {
        $stmt = $this->pdo->prepare('SELECT * FROM `users` WHERE LOWER(`email`) = LOWER(:email) AND `deleted_at` IS NULL LIMIT 1');
        $stmt->execute(['email' => $email]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        return $user === false ? null : $user;
    }

    private function findVendorById(int $vendorId): ?array
    {
        $stmt = $this->pdo->prepare('SELECT * FROM `vendors` WHERE `id` = :id LIMIT 1');
        $stmt->execute(['id' => $vendorId]);
        $vendor = $stmt->fetch(PDO::FETCH_ASSOC);
        return $vendor === false ? null : $vendor;
    }

    private function createUser(string $email, ?string $phone, string $fullName, string $passwordHash): int
    {
        $stmt = $this->pdo->prepare(
            'INSERT INTO `users` (`email`, `phone`, `full_name`, `password_hash`, `status`, `created_at`, `updated_at`) VALUES (:email, :phone, :full_name, :password_hash, :status, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)'
        );
        $stmt->execute([
            'email' => $email,
            'phone' => $phone,
            'full_name' => $fullName,
            'password_hash' => $passwordHash,
            'status' => 'active',
        ]);

        return (int) $this->pdo->lastInsertId();
    }

    private function createVendor(int $userId, string $status): int
    {
        $slug = 'vendor-' . bin2hex(random_bytes(8));
        $stmt = $this->pdo->prepare(
            'INSERT INTO `vendors` (`user_id`, `slug`, `status`, `created_at`, `updated_at`) VALUES (:user_id, :slug, :status, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)'
        );
        $stmt->execute(['user_id' => $userId, 'slug' => $slug, 'status' => $status]);

        return (int) $this->pdo->lastInsertId();
    }

    private function createVendorProfile(int $vendorId, array $data): void
    {
        $stmt = $this->pdo->prepare(
            'INSERT INTO `vendor_profiles` (`vendor_id`, `business_name`, `gst_number`, `pan_number`, `business_type`, `business_category`, `address_line1`, `address_line2`, `city`, `state`, `postal_code`, `country`, `website`, `contact_name`, `contact_email`, `contact_phone`, `business_metadata`, `created_at`, `updated_at`) VALUES (:vendor_id, :business_name, :gst_number, :pan_number, :business_type, :business_category, :address_line1, :address_line2, :city, :state, :postal_code, :country, :website, :contact_name, :contact_email, :contact_phone, :business_metadata, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)'
        );
        $stmt->execute([
            'vendor_id' => $vendorId,
            'business_name' => $data['business_name'],
            'gst_number' => $data['gst_number'] ?: null,
            'pan_number' => $data['pan_number'] ?: null,
            'business_type' => $data['business_type'] ?: null,
            'business_category' => $data['business_category'] ?: null,
            'address_line1' => $data['address_line1'] ?: null,
            'address_line2' => $data['address_line2'] ?: null,
            'city' => $data['city'] ?: null,
            'state' => $data['state'] ?: null,
            'postal_code' => $data['postal_code'] ?: null,
            'country' => $data['country'] ?: 'India',
            'website' => $data['website'] ?: null,
            'contact_name' => $data['contact_name'] ?: null,
            'contact_email' => $data['contact_email'] ?: null,
            'contact_phone' => $data['contact_phone'] ?: null,
            'business_metadata' => json_encode($data['business_metadata'], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
        ]);
    }

    private function assignRole(int $userId, string $roleSlug): void
    {
        $stmt = $this->pdo->prepare(
            'INSERT IGNORE INTO `user_roles` (`user_id`, `role_id`, `assigned_by`, `assigned_at`)
             SELECT :user_id, r.id, NULL, CURRENT_TIMESTAMP
             FROM `roles` r
             WHERE r.slug = :slug'
        );
        $stmt->execute(['user_id' => $userId, 'slug' => $roleSlug]);
    }
}
