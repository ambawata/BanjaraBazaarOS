-- BanjaraBazaarOS — Seed Data
-- Idempotent inserts for the 5 baseline roles + a bootstrap master-admin record.
-- Run AFTER schema.sql. Safe to re-run.

SET NAMES utf8mb4;

-- =============================================================================
-- Roles (matches role-permission system in /backend/middleware)
-- =============================================================================
-- TODO(phase-1): INSERT IGNORE INTO roles (slug, label) VALUES
--   ('customer',     'Customer'),
--   ('vendor',       'Vendor'),
--   ('staff',        'Staff'),
--   ('admin',        'Admin'),
--   ('master_admin', 'Master Admin');

-- =============================================================================
-- Bootstrap master-admin user (credentials must be rotated on first deploy)
-- =============================================================================
-- TODO(phase-1): insert one master_admin user with a placeholder password hash.
