<?php
declare(strict_types=1);

namespace Backend\Services;

use Backend\Core\Database;
use Backend\Core\Request;
use Backend\Helpers\PasswordHelper;
use PDO;
use RuntimeException;

final class VendorRegistrationService
{
    private PDO $pdo;
    private SettingsService $settings;
    private VendorAuditService $audit;

    public function __construct()
    {
        $this->pdo = Database::connection();
        $this->settings = new SettingsService();
        $this->audit = new VendorAuditService();
    }

    public function register(array $payload, Request $request): array
    {
        if (!$this->settings->bool('feature.vendor_signup_open', false)) {
            throw new RuntimeException('Vendor registration is not currently open.', 403);
        }

        [$data, $errors] = $this->validateRegistrationPayload($payload);
        if ($errors !== []) {
            throw new RuntimeException(json_encode(['errors' => $errors]), 422);
        }

        if ($this->emailExists($data['email'])) {
            throw new RuntimeException('Email address is already registered.', 409);
        }

        $this->pdo->beginTransaction();
        try {
            $userId = $this->createUser($data);
            $vendorId = $this->createVendor($userId);
            $this->createVendorProfile($vendorId, $data);

            $status = 'pending';
            if (!$this->settings->bool('vendor.approval_required', true)) {
                $status = 'active';
                $this->updateVendorStatus($vendorId, $status);
                $this->assignVendorRole($userId);
            }

            $this->audit->log($vendorId, null, 'vendor.registration.submitted', $request, ['status' => $status]);
            if ($status === 'active') {
                $this->audit->log($vendorId, null, 'vendor.registration.auto_approved', $request, []);
            }

            $this->pdo->commit();
        } catch (\Throwable $e) {
            $this->pdo->rollBack();
            throw $e;
        }

        return $this->getVendorData($vendorId);
    }

    /** @return array{0:array<string,mixed>,1:array<string,string>} */
    private function validateRegistrationPayload(array $payload): array
    {
        $errors = [];
        $data = [
            'email' => strtolower(trim((string) ($payload['email'] ?? ''))),
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
            'contact_email' => strtolower(trim((string) ($payload['contact_email'] ?? ''))),
            'contact_phone' => trim((string) ($payload['contact_phone'] ?? '')),
            'business_metadata' => is_array($payload['business_metadata'] ?? null) ? $payload['business_metadata'] : [],
        ];

        if ($data['email'] === '' || !filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
            $errors['email'] = 'A valid email address is required.';
        }

        if ($data['full_name'] === '') {
            $errors['full_name'] = 'Full name is required.';
        }

        if ($data['phone'] === '') {
            $errors['phone'] = 'Phone number is required.';
        } elseif (strlen($data['phone']) < 10 || strlen($data['phone']) > 20) {
            $errors['phone'] = 'Phone number must be between 10-20 characters.';
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
            } elseif (!$this->isValidGstin($data['gst_number'])) {
                $errors['gst_number'] = 'GST number must be a valid 15-character GSTIN.';
            }
        } elseif ($data['gst_number'] !== '' && !$this->isValidGstin($data['gst_number'])) {
            $errors['gst_number'] = 'GST number must be a valid 15-character GSTIN.';
        }

        if ($data['pan_number'] !== '' && !$this->isValidPan($data['pan_number'])) {
            $errors['pan_number'] = 'PAN number must be a valid 10-character PAN.';
        }

        if ($data['contact_email'] !== '' && !filter_var($data['contact_email'], FILTER_VALIDATE_EMAIL)) {
            $errors['contact_email'] = 'Contact email must be valid.';
        }

        if ($data['website'] !== '' && !filter_var($data['website'], FILTER_VALIDATE_URL)) {
            $errors['website'] = 'Website must be a valid URL.';
        }

        return [$data, $errors];
    }

    private function isValidGstin(string $gstin): bool
    {
        return preg_match('/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[A-Z0-9]{1}[Z]{1}[A-Z0-9]{1}$/', $gstin) === 1;
    }

    private function isValidPan(string $pan): bool
    {
        return preg_match('/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/', $pan) === 1;
    }

    private function emailExists(string $email): bool
    {
        $stmt = $this->pdo->prepare(
            'SELECT 1 FROM `users` WHERE LOWER(`email`) = LOWER(:email) AND `deleted_at` IS NULL LIMIT 1'
        );
        $stmt->execute(['email' => $email]);
        return $stmt->rowCount() > 0;
    }

    private function createUser(array $data): int
    {
        $passwordHash = PasswordHelper::hash($data['password']);
        $stmt = $this->pdo->prepare(
            'INSERT INTO `users` (`email`, `phone`, `full_name`, `password_hash`, `status`, `created_at`, `updated_at`)
             VALUES (:email, :phone, :full_name, :password_hash, :status, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)'
        );
        $stmt->execute([
            'email' => $data['email'],
            'phone' => $data['phone'] ?: null,
            'full_name' => $data['full_name'],
            'password_hash' => $passwordHash,
            'status' => 'active',
        ]);

        return (int) $this->pdo->lastInsertId();
    }

    private function createVendor(int $userId): int
    {
        $slug = 'vendor-' . bin2hex(random_bytes(8));
        $stmt = $this->pdo->prepare(
            'INSERT INTO `vendors` (`user_id`, `slug`, `status`, `created_at`, `updated_at`)
             VALUES (:user_id, :slug, :status, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)'
        );
        $stmt->execute([
            'user_id' => $userId,
            'slug' => $slug,
            'status' => 'pending',
        ]);

        return (int) $this->pdo->lastInsertId();
    }

    private function createVendorProfile(int $vendorId, array $data): void
    {
        $stmt = $this->pdo->prepare(
            'INSERT INTO `vendor_profiles`
             (`vendor_id`, `business_name`, `gst_number`, `pan_number`, `business_type`, `business_category`,
              `address_line1`, `address_line2`, `city`, `state`, `postal_code`, `country`, `website`,
              `contact_name`, `contact_email`, `contact_phone`, `business_metadata`, `created_at`, `updated_at`)
             VALUES (:vendor_id, :business_name, :gst_number, :pan_number, :business_type, :business_category,
              :address_line1, :address_line2, :city, :state, :postal_code, :country, :website,
              :contact_name, :contact_email, :contact_phone, :business_metadata, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)'
        );
        $stmt->execute([
            'vendor_id' => $vendorId,
            'business_name' => $data['business_name'] ?: null,
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

    private function updateVendorStatus(int $vendorId, string $status): void
    {
        $stmt = $this->pdo->prepare('UPDATE `vendors` SET `status` = :status, `updated_at` = CURRENT_TIMESTAMP WHERE `id` = :id');
        $stmt->execute(['status' => $status, 'id' => $vendorId]);
    }

    private function getVendorData(int $vendorId): array
    {
        $stmt = $this->pdo->prepare(
            'SELECT v.*, u.email AS user_email, u.full_name, p.business_name, p.gst_number, p.pan_number,
                    p.business_type, p.business_category, p.address_line1, p.address_line2, p.city, p.state,
                    p.postal_code, p.country, p.website, p.contact_name, p.contact_email, p.contact_phone,
                    p.business_metadata
             FROM `vendors` v
             JOIN `users` u ON u.id = v.user_id
             JOIN `vendor_profiles` p ON p.vendor_id = v.id
             WHERE v.id = :id LIMIT 1'
        );
        $stmt->execute(['id' => $vendorId]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($row === false) {
            throw new RuntimeException('Vendor registration failed: vendor not found.', 500);
        }

        return [
            'id' => (int) $row['id'],
            'user_id' => (int) $row['user_id'],
            'slug' => (string) $row['slug'],
            'status' => (string) $row['status'],
            'created_at' => (string) $row['created_at'],
            'updated_at' => (string) $row['updated_at'],
            'user' => [
                'email' => (string) $row['user_email'],
                'full_name' => (string) $row['full_name'],
            ],
            'profile' => [
                'business_name' => (string) ($row['business_name'] ?? ''),
                'gst_number' => $row['gst_number'] ?? null,
                'pan_number' => $row['pan_number'] ?? null,
                'business_type' => $row['business_type'] ?? null,
                'business_category' => $row['business_category'] ?? null,
                'city' => $row['city'] ?? null,
                'state' => $row['state'] ?? null,
                'country' => $row['country'] ?? 'India',
            ],
        ];
    }

    private function assignVendorRole(int $userId): void
    {
        $stmt = $this->pdo->prepare(
            'INSERT IGNORE INTO `user_roles` (`user_id`, `role_id`, `assigned_by`, `assigned_at`)
             SELECT :user_id, r.id, NULL, CURRENT_TIMESTAMP
             FROM `roles` r
             WHERE r.slug = :slug'
        );
        $stmt->execute(['user_id' => $userId, 'slug' => 'vendor']);
    }
}
