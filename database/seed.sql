-- =============================================================================
-- BanjaraBazaarOS — Seed Data (Phase 1)
-- Idempotent inserts. Safe to re-run. Apply AFTER schema.sql.
--
-- Loads:
--   1. The 5 baseline system roles
--   2. Phase-1 permission catalog (system-level only; per-module perms land later)
--   3. Role -> permission mappings
--   4. A bootstrap master_admin user (NULL password — forced setup on first login)
--   5. Default settings rows
-- =============================================================================

SET NAMES utf8mb4;

-- =============================================================================
-- 1. Roles  (5 system roles — never delete these)
-- =============================================================================
INSERT INTO `roles` (`slug`, `label`, `description`, `is_system`) VALUES
  ('customer',     'Customer',     'End shopper. Default role for self-signup.',                 1),
  ('vendor',       'Vendor',       'Seller with a storefront and product listings.',             1),
  ('staff',        'Staff',        'Operations staff with limited internal access.',             1),
  ('admin',        'Admin',        'Platform admin. Full operational control.',                  1),
  ('master_admin', 'Master Admin', 'Root administrator. Owns destructive + role-grant rights.',  1)
ON DUPLICATE KEY UPDATE
  `label`       = VALUES(`label`),
  `description` = VALUES(`description`),
  `is_system`   = VALUES(`is_system`);

-- =============================================================================
-- 2. Permission catalog (Phase 1 — system surface only)
--    Format: <module>.<resource>.<action>
-- =============================================================================
INSERT INTO `permissions` (`slug`, `label`, `module`, `description`) VALUES
  -- System / settings
  ('system.settings.view',   'View settings',          'system', 'Read DB-driven settings.'),
  ('system.settings.update', 'Update settings',        'system', 'Modify DB-driven settings.'),
  -- Users
  ('users.view',             'View users',             'users',  'List and read user records.'),
  ('users.create',           'Create users',           'users',  'Provision new user accounts.'),
  ('users.update',           'Update users',           'users',  'Edit user profile + status.'),
  ('users.delete',           'Delete users',           'users',  'Soft-delete user accounts.'),
  ('users.assign_roles',     'Assign roles',           'users',  'Grant or revoke roles on a user.'),
  -- Roles
  ('roles.view',             'View roles',             'roles',  'List roles and their permissions.'),
  ('roles.create',           'Create roles',           'roles',  'Create non-system roles.'),
  ('roles.update',           'Update roles',           'roles',  'Edit role labels and grants.'),
  ('roles.delete',           'Delete roles',           'roles',  'Delete non-system roles.'),
  -- Audit
  ('audit.view',             'View audit log',         'audit',  'Read auth + admin audit trail.'),
  ('vendors.apply',          'Apply to become vendor', 'vendors', 'Submit a vendor onboarding application.'),
  ('vendors.view',           'View vendor applications','vendors','Read vendor application and profile data.'),
  ('vendors.manage',         'Manage vendor profile',  'vendors','Update own vendor profile.'),
  ('vendors.approve',        'Approve vendors',       'vendors','Approve vendor onboarding requests.'),
  ('vendors.reject',         'Reject vendors',        'vendors','Reject vendor onboarding requests.'),
  ('vendors.suspend',        'Suspend vendors',       'vendors','Suspend or reactivate vendors.')
ON DUPLICATE KEY UPDATE
  `label`       = VALUES(`label`),
  `module`      = VALUES(`module`),
  `description` = VALUES(`description`);

-- =============================================================================
-- 3. Role -> permission mappings
--    master_admin: every permission
--    admin:        every permission EXCEPT users.delete + roles.delete (master-only)
--    staff:        read-only on users + audit.view
--    vendor:       (none at system level — gets vendor-app perms in Phase 2)
--    customer:     (none at system level)
-- =============================================================================

-- master_admin — grant ALL
INSERT IGNORE INTO `role_permissions` (`role_id`, `permission_id`)
SELECT r.id, p.id
FROM `roles` r CROSS JOIN `permissions` p
WHERE r.slug = 'master_admin';

-- admin — grant ALL except the master-only destructive ones
INSERT IGNORE INTO `role_permissions` (`role_id`, `permission_id`)
SELECT r.id, p.id
FROM `roles` r CROSS JOIN `permissions` p
WHERE r.slug = 'admin'
  AND p.slug NOT IN ('users.delete','roles.delete');

-- staff — read-only slice
INSERT IGNORE INTO `role_permissions` (`role_id`, `permission_id`)
SELECT r.id, p.id
FROM `roles` r JOIN `permissions` p
  ON p.slug IN ('users.view','roles.view','audit.view','system.settings.view')
WHERE r.slug = 'staff';

-- vendor — manage own vendor profile and application lifecycle
INSERT IGNORE INTO `role_permissions` (`role_id`, `permission_id`)
SELECT r.id, p.id
FROM `roles` r JOIN `permissions` p
  ON p.slug IN ('vendors.apply','vendors.view','vendors.manage')
WHERE r.slug = 'vendor';

-- =============================================================================
-- 4. Bootstrap master_admin user
--    NULL password_hash + status='pending_verification' forces a password
--    setup flow on first login via /api/v1/auth/setup-password.
--    Rotate / replace the email before going live.
-- =============================================================================
INSERT INTO `users` (`email`, `full_name`, `status`, `password_hash`)
VALUES ('master@banjarabazaar.online', 'Master Admin', 'pending_verification', NULL)
ON DUPLICATE KEY UPDATE `email` = VALUES(`email`);

-- Grant master_admin role to the bootstrap user
INSERT IGNORE INTO `user_roles` (`user_id`, `role_id`, `assigned_by`)
SELECT u.id, r.id, NULL
FROM `users` u JOIN `roles` r ON r.slug = 'master_admin'
WHERE u.email = 'master@banjarabazaar.online';

-- =============================================================================
-- 5. Default settings
-- =============================================================================
INSERT INTO `settings` (`key`, `value`, `value_type`, `group`, `is_public`, `description`) VALUES
  ('site.name',                 'BanjaraBazaar',         'string', 'general',  1, 'Public site name.'),
  ('site.tagline',              'Indias local bazaar.',  'string', 'general',  1, 'Public site tagline.'),
  ('site.support_email',        'support@banjarabazaar.online', 'string', 'general', 1, 'Customer support contact.'),
  ('auth.password_min_length',  '10',                    'int',    'auth',     0, 'Minimum password length.'),
  ('auth.session_ttl_minutes',  '120',                   'int',    'auth',     0, 'Session lifetime in minutes.'),
  ('auth.jwt_access_ttl_min',   '60',                    'int',    'auth',     0, 'JWT access token TTL.'),
  ('auth.jwt_refresh_ttl_days', '30',                    'int',    'auth',     0, 'JWT refresh token TTL.'),
  ('auth.max_failed_attempts',  '5',                     'int',    'auth',     0, 'Lock account after N failed logins.'),
  ('auth.lockout_minutes',      '15',                    'int',    'auth',     0, 'How long account stays locked.'),
  ('auth.otp_ttl_minutes',      '10',                    'int',    'auth',     0, 'Phone OTP / email code lifetime.'),
  ('feature.signup_open',       '1',                     'bool',   'features', 1, 'Allow self-signup as customer.'),
  ('feature.vendor_signup_open','0',                     'bool',   'features', 1, 'Allow self-signup as vendor (off until KYC ready).'),
  ('vendor.approval_required',  '1',                     'bool',   'vendor',   0, 'Require manual approval for new vendor applications.'),
  ('vendor.gst_required',       '1',                     'bool',   'vendor',   0, 'Require GST details for vendor onboarding.'),
  ('vendor.business_name_required','1',                  'bool',   'vendor',   0, 'Require business name for vendor applications.')
ON DUPLICATE KEY UPDATE
  `description` = VALUES(`description`),
  `value_type`  = VALUES(`value_type`),
  `group`       = VALUES(`group`),
  `is_public`   = VALUES(`is_public`);

-- =============================================================================
-- 6. Vastu Griha — Plot Geometry & True North Calibration settings
--    Business-rule values (pada count, boundary/cross-check tolerances) live
--    here rather than as PHP magic numbers, per the existing
--    "business rules are database-driven" convention (see SettingsService).
--    DECIMAL degree values are stored as value_type='string' and cast to
--    float in code — the `settings.value_type` enum has no float variant.
-- =============================================================================
INSERT INTO `settings` (`key`, `value`, `value_type`, `group`, `is_public`, `description`) VALUES
  ('vastu_geometry.pada_count',                        '9',   'int',    'vastu_geometry', 1, 'Padas per wall (classical 9x9 Vastu Purusha Mandala).'),
  ('vastu_geometry.boundary_tolerance_degrees',         '0.5', 'string', 'vastu_geometry', 1, 'Sector-edge proximity, in degrees, that flags a bearing as a boundary_case (spec Section 3).'),
  ('vastu_geometry.calibration_cross_check_tolerance_degrees', '2.0', 'string', 'vastu_geometry', 1, 'Max allowed deviation, in degrees, for a calibration second-wall cross-check to pass.')
ON DUPLICATE KEY UPDATE
  `description` = VALUES(`description`),
  `value_type`  = VALUES(`value_type`),
  `group`       = VALUES(`group`),
  `is_public`   = VALUES(`is_public`);

-- =============================================================================
-- 7. Vastu Griha — Built-in test fixture (AmbNiwas)
--
--    Tier 2 confidence (satellite pixel-bearing measurement, cross-validated
--    across two independent screenshots per spec Section 1) — NOT Tier 1
--    land-survey ground truth. Labeled as such via confidence_tier below;
--    do not treat this fixture as verified ground truth elsewhere.
--
--    Boundary vertices form a 200ft x 200ft square centered on the origin,
--    chosen so the shoelace centroid is exactly (0,0) by hand-verifiable
--    symmetry, which keeps this fixture auditable without running code.
--    The front/gate wall is the south edge; its plan bearing (bearing from
--    centroid to wall midpoint, before true-north correction) is exactly
--    180.0 deg (due south) by the same symmetry, so:
--      true_bearing = plan_bearing + R = 180.0 + 23.8 = 203.8 (SSW)
--    matching the validated AmbNiwas front-wall reading. See
--    scripts/test-vastu-geometry.php for the automated self-check that
--    reproduces this number through the actual VastuGeometryMath pipeline.
-- =============================================================================
INSERT INTO `vastu_plots` (`name`, `boundary_vertices`, `centroid_x`, `centroid_y`, `true_north_rotation_r`, `confidence_tier`)
SELECT
  'AmbNiwas (fixture — Tier 2 satellite, cross-validated)',
  JSON_ARRAY(
    JSON_OBJECT('x', -100, 'y', -100),
    JSON_OBJECT('x',  100, 'y', -100),
    JSON_OBJECT('x',  100, 'y',  100),
    JSON_OBJECT('x', -100, 'y',  100)
  ),
  0, 0, 23.8, 'tier2_satellite'
WHERE NOT EXISTS (
  SELECT 1 FROM `vastu_plots` WHERE `name` = 'AmbNiwas (fixture — Tier 2 satellite, cross-validated)'
);

INSERT INTO `vastu_walls` (`plot_id`, `corner_start_x`, `corner_start_y`, `corner_end_x`, `corner_end_y`, `length_ft`, `facing_bearing_true`)
SELECT p.`id`, -20, -100, 20, -100, 40.0, 203.8
FROM `vastu_plots` p
WHERE p.`name` = 'AmbNiwas (fixture — Tier 2 satellite, cross-validated)'
  AND NOT EXISTS (
    SELECT 1 FROM `vastu_walls` w WHERE w.`plot_id` = p.`id` AND w.`facing_bearing_true` = 203.8
  );
