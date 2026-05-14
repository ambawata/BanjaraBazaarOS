-- =============================================================================
-- BanjaraBazaarOS — Database Schema
-- Engine: MySQL 8.x  /  Charset: utf8mb4 / utf8mb4_unicode_ci
--
-- This file is the single source of truth for the database structure.
-- Tables are added incrementally per phase. Do NOT hand-edit prod DB —
-- always evolve this file and re-apply through a migration script.
--
-- Conventions:
--   * Engine = InnoDB, charset = utf8mb4, collation = utf8mb4_unicode_ci
--   * IDs:   BIGINT UNSIGNED, AUTO_INCREMENT
--   * Soft delete via deleted_at TIMESTAMP NULL where appropriate
--   * Timestamps: created_at / updated_at on every entity table
--   * Slugs:  VARCHAR(64), UNIQUE — used for stable cross-system refs
--   * Email/phone fields: VARCHAR(191) for legacy MySQL/MariaDB index safety
-- =============================================================================

SET NAMES utf8mb4;
SET time_zone = '+00:00';
SET FOREIGN_KEY_CHECKS = 0;

-- =============================================================================
-- Phase 1 — Section A: Identity (users)
-- =============================================================================

CREATE TABLE IF NOT EXISTS `users` (
  `id`                    BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `email`                 VARCHAR(191)    NOT NULL,
  `phone`                 VARCHAR(20)     NULL,
  `password_hash`         VARCHAR(255)    NULL,        -- NULL allowed: SSO / pending-setup
  `full_name`             VARCHAR(150)    NOT NULL,
  `status`                ENUM('active','suspended','pending_verification','deleted')
                                          NOT NULL DEFAULT 'pending_verification',
  `email_verified_at`     TIMESTAMP       NULL,
  `phone_verified_at`     TIMESTAMP       NULL,
  `last_login_at`         TIMESTAMP       NULL,
  `failed_login_attempts` TINYINT UNSIGNED NOT NULL DEFAULT 0,
  `locked_until`          TIMESTAMP       NULL,
  `created_at`            TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`            TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP
                                          ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at`            TIMESTAMP       NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_users_email` (`email`),
  UNIQUE KEY `uq_users_phone` (`phone`),
  KEY `idx_users_status`     (`status`),
  KEY `idx_users_deleted_at` (`deleted_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- Phase 1 — Section B: Roles & Permissions (role-permission matrix)
-- =============================================================================

CREATE TABLE IF NOT EXISTS `roles` (
  `id`          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `slug`        VARCHAR(64)     NOT NULL,
  `label`       VARCHAR(100)    NOT NULL,
  `description` VARCHAR(255)    NULL,
  `is_system`   TINYINT(1)      NOT NULL DEFAULT 0,    -- system roles cannot be deleted
  `created_at`  TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`  TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP
                                ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_roles_slug` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `permissions` (
  `id`          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `slug`        VARCHAR(100)    NOT NULL,              -- e.g., "users.create", "orders.refund"
  `label`       VARCHAR(150)    NOT NULL,
  `module`      VARCHAR(64)     NOT NULL,              -- grouping: "system", "catalog", ...
  `description` VARCHAR(255)    NULL,
  `created_at`  TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_permissions_slug` (`slug`),
  KEY `idx_permissions_module` (`module`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `role_permissions` (
  `role_id`       BIGINT UNSIGNED NOT NULL,
  `permission_id` BIGINT UNSIGNED NOT NULL,
  `created_at`    TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`role_id`,`permission_id`),
  KEY `idx_rp_permission` (`permission_id`),
  CONSTRAINT `fk_rp_role`       FOREIGN KEY (`role_id`)       REFERENCES `roles`(`id`)       ON DELETE CASCADE,
  CONSTRAINT `fk_rp_permission` FOREIGN KEY (`permission_id`) REFERENCES `permissions`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `user_roles` (
  `user_id`     BIGINT UNSIGNED NOT NULL,
  `role_id`     BIGINT UNSIGNED NOT NULL,
  `assigned_by` BIGINT UNSIGNED NULL,                  -- which user granted this role
  `assigned_at` TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`,`role_id`),
  KEY `idx_ur_role`     (`role_id`),
  KEY `idx_ur_assigner` (`assigned_by`),
  CONSTRAINT `fk_ur_user`     FOREIGN KEY (`user_id`)     REFERENCES `users`(`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_ur_role`     FOREIGN KEY (`role_id`)     REFERENCES `roles`(`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_ur_assigner` FOREIGN KEY (`assigned_by`) REFERENCES `users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- Phase 1 — Section C: Sessions & Refresh Tokens (JWT/session-ready)
-- One table covers both auth surfaces:
--   * type='session' — server-side session record (works with PHP session id)
--   * type='refresh' — JWT refresh-token entry, revocable
-- The short-lived access JWT itself is NOT stored.
-- =============================================================================

CREATE TABLE IF NOT EXISTS `sessions` (
  `id`            BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id`       BIGINT UNSIGNED NOT NULL,
  `type`          ENUM('session','refresh') NOT NULL DEFAULT 'session',
  `token_hash`    CHAR(64)        NOT NULL,            -- sha256 of the opaque token
  `device_label`  VARCHAR(100)    NULL,
  `ip_address`    VARCHAR(45)     NULL,                -- IPv6 max
  `user_agent`    VARCHAR(255)    NULL,
  `last_activity` TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `expires_at`    TIMESTAMP       NOT NULL,
  `revoked_at`    TIMESTAMP       NULL,
  `created_at`    TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_sessions_token_hash` (`token_hash`),
  KEY `idx_sessions_user`    (`user_id`),
  KEY `idx_sessions_expires` (`expires_at`),
  CONSTRAINT `fk_sessions_user` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- Phase 1 — Section D: Auth Verifications (password reset / email verify / OTP)
-- Single table for short-lived single-use codes; cleaned up by a cron job.
-- =============================================================================

CREATE TABLE IF NOT EXISTS `auth_verifications` (
  `id`         BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id`    BIGINT UNSIGNED NOT NULL,
  `type`       ENUM('password_reset','password_setup','email_verify','phone_otp')
                               NOT NULL,
  `code_hash`  VARCHAR(255)    NOT NULL,               -- hash of OTP/token, never the plaintext
  `meta`       JSON            NULL,                   -- e.g., destination phone/email if different
  `expires_at` TIMESTAMP       NOT NULL,
  `used_at`    TIMESTAMP       NULL,
  `created_at` TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_av_user_type` (`user_id`,`type`),
  KEY `idx_av_expires`   (`expires_at`),
  CONSTRAINT `fk_av_user` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- Phase 1 — Section E: DB-driven Settings
-- Runtime config the admin panel can mutate without code deploys.
-- =============================================================================

CREATE TABLE IF NOT EXISTS `settings` (
  `id`          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `key`         VARCHAR(191)    NOT NULL,
  `value`       LONGTEXT        NULL,
  `value_type`  ENUM('string','int','bool','json') NOT NULL DEFAULT 'string',
  `group`       VARCHAR(64)     NOT NULL DEFAULT 'general',
  `is_public`   TINYINT(1)      NOT NULL DEFAULT 0,    -- exposed to unauthenticated clients?
  `description` VARCHAR(255)    NULL,
  `updated_by`  BIGINT UNSIGNED NULL,
  `created_at`  TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`  TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP
                                ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_settings_key` (`key`),
  KEY `idx_settings_group`  (`group`),
  KEY `idx_settings_public` (`is_public`),
  CONSTRAINT `fk_settings_updated_by` FOREIGN KEY (`updated_by`) REFERENCES `users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- Phase 1 — Section F: Auth Audit Log
-- Append-only record of security-relevant auth events. Never UPDATE/DELETE.
-- =============================================================================

CREATE TABLE IF NOT EXISTS `auth_audit_log` (
  `id`          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id`     BIGINT UNSIGNED NULL,                  -- NULL = anonymous (e.g., failed login w/ unknown email)
  `event`       VARCHAR(100)    NOT NULL,              -- e.g., "auth.login.success", "auth.password.reset"
  `ip_address`  VARCHAR(45)     NULL,
  `user_agent`  VARCHAR(255)    NULL,
  `metadata`    JSON            NULL,
  `created_at`  TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_aal_user`       (`user_id`),
  KEY `idx_aal_event`      (`event`),
  KEY `idx_aal_created_at` (`created_at`),
  CONSTRAINT `fk_aal_user` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- Later phases (placeholders only — do not implement until scheduled)
-- =============================================================================
-- TODO(phase-2): vendors, vendor_profiles, kyc_documents
-- TODO(phase-3): categories, products, product_variants, inventory
-- TODO(phase-4): carts, orders, order_items, payments, shipments
-- TODO(phase-5): reviews, messaging, notifications

SET FOREIGN_KEY_CHECKS = 1;
