<?php
declare(strict_types=1);

namespace Backend\Services;

use Backend\Core\Database;
use PDO;

final class RbacService
{
    private PDO $pdo;
    private ?array $roles = null;
    private ?array $permissions = null;

    public function __construct()
    {
        $this->pdo = Database::connection();
    }

    /** @return list<string> */
    public function getRolesForUser(int $userId): array
    {
        if ($this->roles !== null) {
            return $this->roles;
        }

        $stmt = $this->pdo->prepare('SELECT r.slug FROM `roles` r JOIN `user_roles` ur ON ur.role_id = r.id WHERE ur.user_id = :user_id');
        $stmt->execute(['user_id' => $userId]);
        $this->roles = array_map(
            fn(array $row) => (string) $row['slug'],
            $stmt->fetchAll(PDO::FETCH_ASSOC)
        );

        return $this->roles;
    }

    /** @return list<string> */
    public function getPermissionsForUser(int $userId): array
    {
        if ($this->permissions !== null) {
            return $this->permissions;
        }

        $stmt = $this->pdo->prepare(
            'SELECT DISTINCT p.slug
             FROM `permissions` p
             JOIN `role_permissions` rp ON rp.permission_id = p.id
             JOIN `user_roles` ur ON ur.role_id = rp.role_id
             WHERE ur.user_id = :user_id'
        );
        $stmt->execute(['user_id' => $userId]);
        $this->permissions = array_map(
            fn(array $row) => (string) $row['slug'],
            $stmt->fetchAll(PDO::FETCH_ASSOC)
        );

        return $this->permissions;
    }

    public function userHasPermission(int $userId, string $permissionSlug): bool
    {
        $stmt = $this->pdo->prepare(
            'SELECT 1
             FROM `permissions` p
             JOIN `role_permissions` rp ON rp.permission_id = p.id
             JOIN `user_roles` ur ON ur.role_id = rp.role_id
             WHERE ur.user_id = :user_id AND p.slug = :slug
             LIMIT 1'
        );
        $stmt->execute(['user_id' => $userId, 'slug' => $permissionSlug]);
        return (bool) $stmt->fetchColumn();
    }
}
