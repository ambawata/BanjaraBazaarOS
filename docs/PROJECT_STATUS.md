# BanjaraBazaarOS Project Status

## Purpose
This document captures the current state of the BanjaraBazaarOS project, including completed milestones, backend/auth/vendor status, ongoing work, and near-term priorities.

## Current Completed Milestones
- Repository scaffolded with `/apps`, `/backend`, `/shared`, `/database`, `/storage`, and vendor dependencies.
- Backend API skeleton implemented in `/backend/api/v1/routes.php`.
- Core backend utilities established in `/backend/core` and `/backend/helpers`.
- Database schema Phase 1 created in `/database/schema.sql`.
- Seed data established baseline system roles, permissions, master admin user, and runtime settings in `/database/seed.sql`.
- Auth service and vendor service implemented in `/backend/services`.
- Health endpoint added to `/api/v1/health` with DB readiness checks.
- Role-based vendor onboarding enabled with admin approval, rejection, suspension, and vendor profile status.

## Current Backend Status
- Backend stack: PHP 8 + MySQL, REST API under `/api/v1/`.
- Route table includes health, auth, vendor application, vendor status, and vendor admin actions.
- Shared backend components include request/response handling, middleware, database bootstrap, and JSON response helpers.
- Phase 1 is in progress; architecture is intentionally modular to support future app-specific APIs.

## Current Auth Status
- Login: `/api/v1/auth/login`
- Refresh: `/api/v1/auth/refresh`
- Logout: `/api/v1/auth/logout`
- Session model supports both `session` and `refresh` token types.
- Auth verification table supports password reset, email verification, and OTP flows.
- Auth audit logging captures security events and denial reasons.
- System roles and permissions exist for secure access control.

## Current Vendor Status
- Vendor onboarding table and profile table exist.
- Vendor application endpoint: `/api/v1/vendors/apply`.
- Vendor self-service lookup: `/api/v1/vendors/me`.
- Admin/vendor management endpoints: `/api/v1/vendors/applications`, `/api/v1/vendors/{vendor_id}/approve`, `/api/v1/vendors/{vendor_id}/reject`, `/api/v1/vendors/{vendor_id}/suspend`.
- Vendor lifecycle statuses: `pending`, `active`, `rejected`, `suspended`.
- Vendor application permissions are seeded for the system-level vendor role.

## Current Feature Status
- `users`, `roles`, `permissions`, `user_roles`, `settings`, `sessions`, `auth_verifications`, `auth_audit_log` are implemented and seeded.
- Phase 1 DB schema covers identity, auth, role matrix, vendor onboarding, settings, and audit.
- Placeholder schema notes exist for Phase 2 and beyond, but these are not implemented yet.

## Ongoing Work and Near-Term Priorities
1. Document frontend app setup for each PWA in `/apps/*`.
2. Extend vendor onboarding with KYC and storefront configuration.
3. Build vendor-facing app permissions and permissions mapping in Phase 2.
4. Implement Phase 2 product catalog and inventory backend support.
5. Add migration scripts and documented deploy process for schema changes.

## Notes
- No backend architecture or runtime code has been modified by this documentation effort.
- API and database schema remain unchanged in this docs update.
- All project status and roadmap content is centralized in the `/docs` folder.
