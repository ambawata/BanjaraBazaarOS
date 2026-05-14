-- BanjaraBazaarOS — Database Schema
-- Engine: MySQL 8.x  /  Charset: utf8mb4 / utf8mb4_unicode_ci
-- This file is the single source of truth for the database structure.
-- Tables are added incrementally as features land. Do NOT hand-edit prod DB —
-- always evolve this file and re-apply through a migration script.

SET NAMES utf8mb4;
SET time_zone = '+00:00';

-- =============================================================================
-- Section 1: Auth & Roles  (Phase 1)
-- =============================================================================
-- TODO(phase-1): users, roles, user_roles, sessions, password_resets

-- =============================================================================
-- Section 2: Settings (DB-driven runtime config)
-- =============================================================================
-- TODO(phase-1): settings(key VARCHAR PK, value TEXT, group VARCHAR, updated_by, updated_at)

-- =============================================================================
-- Section 3: Catalog, Orders, Vendors, etc.  (later phases)
-- =============================================================================
-- TODO: vendors, products, categories, orders, order_items, payments, ...
