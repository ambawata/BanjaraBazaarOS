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
-- Phase 1 — Section B.1: Vendor Onboarding
-- =============================================================================

CREATE TABLE IF NOT EXISTS `vendors` (
  `id`               BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id`          BIGINT UNSIGNED NOT NULL,
  `slug`             VARCHAR(100)    NOT NULL,
  `status`           ENUM('pending','active','rejected','suspended') NOT NULL DEFAULT 'pending',
  `approved_at`      TIMESTAMP       NULL,
  `rejected_at`      TIMESTAMP       NULL,
  `rejected_reason`  VARCHAR(255)    NULL,
  `suspended_at`     TIMESTAMP       NULL,
  `suspended_reason` VARCHAR(255)    NULL,
  `created_at`       TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`       TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at`       TIMESTAMP       NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_vendors_slug` (`slug`),
  UNIQUE KEY `uq_vendors_user_id` (`user_id`),
  KEY `idx_vendors_status` (`status`),
  KEY `idx_vendors_user_id` (`user_id`),
  KEY `idx_vendors_created_at` (`created_at`),
  KEY `idx_vendors_deleted_at` (`deleted_at`),
  CONSTRAINT `fk_vendors_user_id` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `vendor_profiles` (
  `id`                BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `vendor_id`         BIGINT UNSIGNED NOT NULL,
  `business_name`     VARCHAR(191)    NOT NULL,
  `gst_number`        VARCHAR(20)     NULL,
  `pan_number`        VARCHAR(20)     NULL,
  `business_type`     VARCHAR(100)    NULL,
  `business_category` VARCHAR(100)    NULL,
  `address_line1`     VARCHAR(255)    NULL,
  `address_line2`     VARCHAR(255)    NULL,
  `city`              VARCHAR(100)    NULL,
  `state`             VARCHAR(100)    NULL,
  `postal_code`       VARCHAR(20)     NULL,
  `country`           VARCHAR(100)    NOT NULL DEFAULT 'India',
  `website`           VARCHAR(191)    NULL,
  `contact_name`      VARCHAR(150)    NULL,
  `contact_email`     VARCHAR(191)    NULL,
  `contact_phone`     VARCHAR(20)     NULL,
  `business_metadata` JSON            NULL,
  `created_at`        TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`        TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at`        TIMESTAMP       NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_vendor_profiles_vendor_id` (`vendor_id`),
  KEY `idx_vendor_profiles_gst_number` (`gst_number`),
  KEY `idx_vendor_profiles_business_category` (`business_category`),
  KEY `idx_vendor_profiles_contact_email` (`contact_email`),
  KEY `idx_vendor_profiles_deleted_at` (`deleted_at`),
  CONSTRAINT `fk_vendor_profiles_vendor_id` FOREIGN KEY (`vendor_id`) REFERENCES `vendors`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `vendor_audit_log` (
  `id`           BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `vendor_id`    BIGINT UNSIGNED NOT NULL,
  `user_id`      BIGINT UNSIGNED NULL,
  `event`        VARCHAR(100)    NOT NULL,
  `ip_address`   VARCHAR(45)     NULL,
  `user_agent`   VARCHAR(255)    NULL,
  `metadata`     JSON            NULL,
  `created_at`   TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_vendor_audit_log_vendor_id` (`vendor_id`),
  KEY `idx_vendor_audit_log_user_id` (`user_id`),
  KEY `idx_vendor_audit_log_event` (`event`),
  KEY `idx_vendor_audit_log_created_at` (`created_at`),
  KEY `idx_vendor_audit_log_vendor_created` (`vendor_id`, `created_at`),
  CONSTRAINT `fk_vendor_audit_log_vendor_id` FOREIGN KEY (`vendor_id`) REFERENCES `vendors`(`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_vendor_audit_log_user_id` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL
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
`expires_at` TIMESTAMP NULL,  `revoked_at`    TIMESTAMP       NULL,
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
  `expires_at` TIMESTAMP NULL,
  `used_at`    TIMESTAMP NULL,  `created_at` TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
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
-- Phase 2 — Section A: Products & Inventory (vendor catalogs)
-- =============================================================================

CREATE TABLE IF NOT EXISTS `products` (
  `id`                BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `vendor_id`         BIGINT UNSIGNED NOT NULL,
  `sku`               VARCHAR(100)    NULL,                 -- Optional: vendor's internal SKU
  `slug`              VARCHAR(100)    NOT NULL,            -- SEO-friendly, unique per vendor
  `name`              VARCHAR(255)    NOT NULL,
  `description`       LONGTEXT        NULL,
  `price`             DECIMAL(12,2)   NOT NULL,            -- Base price (pre-discounts)
  `currency`          VARCHAR(10)     NOT NULL DEFAULT 'INR',
  `status`            ENUM('draft','pending','approved','rejected') NOT NULL DEFAULT 'draft',
  `rejection_reason`  VARCHAR(255)    NULL,
  `approved_at`       TIMESTAMP       NULL,
  `rejected_at`       TIMESTAMP       NULL,
  `category_id`       BIGINT UNSIGNED NULL,                -- For future category feature
  `tags`              JSON            NULL,                -- e.g. ["handmade", "eco-friendly"]
  `metadata`          JSON            NULL,                -- Extended attributes (color, size, etc.)
  `stock_quantity`    INT UNSIGNED    NOT NULL DEFAULT 0,
  `stock_reserved`    INT UNSIGNED    NOT NULL DEFAULT 0,  -- Units in carts/orders
  `created_at`        TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`        TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at`        TIMESTAMP       NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_products_vendor_slug` (`vendor_id`, `slug`),
  KEY `idx_products_vendor_id` (`vendor_id`),
  KEY `idx_products_status` (`status`),
  KEY `idx_products_created_at` (`created_at`),
  KEY `idx_products_deleted_at` (`deleted_at`),
  KEY `idx_products_slug` (`slug`),
  CONSTRAINT `fk_products_vendor_id` FOREIGN KEY (`vendor_id`) REFERENCES `vendors`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `product_images` (
  `id`           BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `product_id`   BIGINT UNSIGNED NOT NULL,
  `file_path`    VARCHAR(255)    NOT NULL,                 -- Relative path: /storage/uploads/products/...
  `alt_text`     VARCHAR(255)    NULL,
  `display_order` TINYINT UNSIGNED NOT NULL DEFAULT 0,    -- Sort order for product gallery
  `is_primary`   TINYINT(1)      NOT NULL DEFAULT 0,      -- Thumbnail image
  `created_at`   TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_product_images_product_id` (`product_id`),
  KEY `idx_product_images_is_primary` (`is_primary`),
  CONSTRAINT `fk_product_images_product_id` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `product_audit_log` (
  `id`           BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `product_id`   BIGINT UNSIGNED NOT NULL,
  `vendor_id`    BIGINT UNSIGNED NOT NULL,
  `user_id`      BIGINT UNSIGNED NULL,                    -- Admin/reviewer ID for approvals
  `event`        VARCHAR(100)    NOT NULL,                -- e.g., "product.created", "product.approved"
  `ip_address`   VARCHAR(45)     NULL,
  `user_agent`   VARCHAR(255)    NULL,
  `metadata`     JSON            NULL,
  `created_at`   TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_pal_product_id` (`product_id`),
  KEY `idx_pal_vendor_id` (`vendor_id`),
  KEY `idx_pal_user_id` (`user_id`),
  KEY `idx_pal_event` (`event`),
  KEY `idx_pal_created_at` (`created_at`),
  KEY `idx_pal_vendor_created` (`vendor_id`, `created_at`),
  CONSTRAINT `fk_pal_product_id` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_pal_vendor_id` FOREIGN KEY (`vendor_id`) REFERENCES `vendors`(`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_pal_user_id` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- Vastu Griha — Section: Plot Geometry & True North Calibration (geometry layer)
--
-- Additive module, independent of the Phase 1-5 commerce roadmap above.
-- Implements the entities from docs/VastuGriha_Geometry_Specification_v0.1.md
-- Section 8 (Data Model Quick Reference). Geometry only — no Vastu rule,
-- deity-mapping, verdict, or remedy tables here (spec Section 10).
--
-- `created_by` is added on `vastu_plots` beyond the spec's literal field
-- list: every other authenticated/owned resource in this schema (e.g.
-- `settings.updated_by`) carries an owning/acting user reference, and these
-- endpoints sit behind JWT auth, so plots need the same for basic
-- multi-tenant scoping. `created_at` is likewise added to every child table
-- even though the task's table list only spells it out for `vastu_plots`
-- and `vastu_calibrations` — this repo's own schema convention (see header
-- comment) requires created_at on every entity table for operability, and
-- adding it is additive/non-breaking. No other fields beyond the given
-- lists were introduced.
-- =============================================================================

CREATE TABLE IF NOT EXISTS `vastu_plots` (
  `id`                     BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name`                   VARCHAR(191)    NOT NULL,
  `boundary_vertices`      JSON            NOT NULL,          -- [{x,y}, ...] in local planar feet (spec 0.1/2)
  `centroid_x`             DECIMAL(12,4)   NOT NULL DEFAULT 0,
  `centroid_y`             DECIMAL(12,4)   NOT NULL DEFAULT 0,
  `true_north_rotation_r`  DECIMAL(7,4)    NOT NULL DEFAULT 0, -- signed degrees, spec Section 1
  `confidence_tier`        ENUM('tier1_survey','tier2_satellite','tier3_compass') NOT NULL,
  `created_by`             BIGINT UNSIGNED NULL,
  `created_at`             TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`             TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_vastu_plots_created_by` (`created_by`),
  CONSTRAINT `fk_vastu_plots_created_by` FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `vastu_walls` (
  `id`                    BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `plot_id`                BIGINT UNSIGNED NOT NULL,
  `corner_start_x`         DECIMAL(12,4)   NOT NULL,
  `corner_start_y`         DECIMAL(12,4)   NOT NULL,
  `corner_end_x`           DECIMAL(12,4)   NOT NULL,
  `corner_end_y`           DECIMAL(12,4)   NOT NULL,
  `length_ft`              DECIMAL(10,4)   NOT NULL,
  `facing_bearing_true`    DECIMAL(7,4)    NOT NULL,          -- true bearing, spec Section 3
  `created_at`             TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_vastu_walls_plot_id` (`plot_id`),
  CONSTRAINT `fk_vastu_walls_plot_id` FOREIGN KEY (`plot_id`) REFERENCES `vastu_plots`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `vastu_padas` (
  `id`                    BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `wall_id`                BIGINT UNSIGNED NOT NULL,
  `pada_index`             TINYINT UNSIGNED NOT NULL,
  `start_ft`               DECIMAL(10,4)   NOT NULL,
  `end_ft`                 DECIMAL(10,4)   NOT NULL,
  `midpoint_x`             DECIMAL(12,4)   NOT NULL,
  `midpoint_y`             DECIMAL(12,4)   NOT NULL,
  `bearing_from_centroid`  DECIMAL(7,4)    NOT NULL,          -- plan bearing (pre true-north correction)
  `zone_16`                VARCHAR(8)      NOT NULL,
  `zone_32`                VARCHAR(8)      NOT NULL,
  `created_at`             TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_vastu_padas_wall_index` (`wall_id`, `pada_index`),
  KEY `idx_vastu_padas_wall_id` (`wall_id`),
  CONSTRAINT `fk_vastu_padas_wall_id` FOREIGN KEY (`wall_id`) REFERENCES `vastu_walls`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `vastu_rooms` (
  `id`                    BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `plot_id`                BIGINT UNSIGNED NOT NULL,
  `name`                   VARCHAR(191)    NOT NULL,
  `polygon_vertices`       JSON            NOT NULL,          -- [{x,y}, ...] in local planar feet (spec 5)
  `centroid_x`             DECIMAL(12,4)   NOT NULL,
  `centroid_y`             DECIMAL(12,4)   NOT NULL,
  `bearing_from_centroid`  DECIMAL(7,4)    NOT NULL,          -- plan bearing (pre true-north correction)
  `zone_16`                VARCHAR(8)      NOT NULL,
  `zone_32`                VARCHAR(8)      NOT NULL,
  `created_at`             TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_vastu_rooms_plot_id` (`plot_id`),
  CONSTRAINT `fk_vastu_rooms_plot_id` FOREIGN KEY (`plot_id`) REFERENCES `vastu_plots`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `vastu_doors` (
  `id`                    BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `wall_id`                BIGINT UNSIGNED NOT NULL,
  `position_x`             DECIMAL(12,4)   NOT NULL,
  `position_y`             DECIMAL(12,4)   NOT NULL,
  `pada_id`                BIGINT UNSIGNED NULL,
  `spans_pada_ids`         JSON            NULL,              -- [pada_id, pada_id] when spanning a boundary (spec 6.4)
  `bearing_from_centroid`  DECIMAL(7,4)    NOT NULL,          -- plan bearing (pre true-north correction)
  `zone_16`                VARCHAR(8)      NOT NULL,
  `zone_32`                VARCHAR(8)      NOT NULL,
  `created_at`             TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_vastu_doors_wall_id` (`wall_id`),
  KEY `idx_vastu_doors_pada_id` (`pada_id`),
  CONSTRAINT `fk_vastu_doors_wall_id` FOREIGN KEY (`wall_id`) REFERENCES `vastu_walls`(`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_vastu_doors_pada_id` FOREIGN KEY (`pada_id`) REFERENCES `vastu_padas`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `vastu_calibrations` (
  `id`                     BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `plot_id`                BIGINT UNSIGNED NOT NULL,
  `reference_wall_id`      BIGINT UNSIGNED NOT NULL,
  `raw_reading_degrees`    DECIMAL(7,4)    NOT NULL,
  `true_reading_degrees`   DECIMAL(7,4)    NOT NULL,
  `offset_degrees`         DECIMAL(7,4)    NOT NULL,
  `calibrated_at`          TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_vastu_calibrations_plot_id` (`plot_id`),
  KEY `idx_vastu_calibrations_reference_wall_id` (`reference_wall_id`),
  CONSTRAINT `fk_vastu_calibrations_plot_id` FOREIGN KEY (`plot_id`) REFERENCES `vastu_plots`(`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_vastu_calibrations_reference_wall_id` FOREIGN KEY (`reference_wall_id`) REFERENCES `vastu_walls`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- Later phases (placeholders only — do not implement until scheduled)
-- =============================================================================
-- TODO(phase-3): categories, product_variants
-- TODO(phase-4): carts, orders, order_items, payments, shipments
-- TODO(phase-5): reviews, messaging, notifications

SET FOREIGN_KEY_CHECKS = 1;
