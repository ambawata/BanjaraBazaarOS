# BanjaraBazaarOS Master Roadmap

## Purpose
This document is the canonical product and delivery roadmap for BanjaraBazaarOS. It captures current scope, execution phases, production readiness expectations, scaling stages, deployment workflow, and team rules for AI-driven work.

## Project Vision
BanjaraBazaarOS is an open-source web-first marketplace platform inspired by India's local bazaar ecosystem. It is designed as a progressive web application suite with modular frontend apps, a shared backend API, and a DB-driven auth and permissions system.

## Current Phase
- **Phase 1: Identity, Auth, and Vendor Onboarding**
- Completed: database schema Phase 1, auth service routes, vendor onboarding API surface, role/permission catalog, baseline system roles, master_admin bootstrap user, settings table, auth audit logging.
- Focus: secure login, refresh/logout, session and refresh-token management, vendor application lifecycle, admin/vendor workflow separation.

## Roadmap Summary
### Phase 1 — Core platform foundation
- Identity: `users`, `roles`, `permissions`, `user_roles`
- Auth: login, refresh, logout, sessions, refresh tokens, verification codes, auth audit logs
- Vendor onboarding: `vendors`, `vendor_profiles`, application status, admin approval/reject/suspend actions
- Settings: DB-driven config for runtime feature flags and auth policy
- System roles: `customer`, `vendor`, `staff`, `admin`, `master_admin`

### Phase 2 — Vendor marketplace foundation
- Vendor storefront and profile management
- Vendor KYC / document collection
- Vendor app permissions and onboarding experience
- Product catalog and inventory scaffolding for vendors
- Vendor-facing APIs and shared vendor app components

### Phase 3 — Marketplace catalog
- Product categories and catalog hierarchy
- Product variants, pricing, and stock management
- Vendor product publishing workflow
- Search, filtering, and browsing support

### Phase 4 — Commerce core
- Shopping cart and checkout workflow
- Orders, order items, payments, and shipments
- Payment gateway integration and settlement flow
- Order status, returns, and refunds

### Phase 5 — Engagement and growth
- Reviews, ratings, and vendor feedback
- Messaging between customers, vendors, and staff
- Notifications, alerts, and event-driven updates
- Marketing tools, promotions, and campaign support

## Phased Execution Plan
### Phase 1 deliverables
- Stable API v1 route table
- Auth surface: `/auth/login`, `/auth/refresh`, `/auth/logout`
- Vendor application endpoints and status management
- DB schema + seed bootstrap data
- Health check endpoint for readiness and monitoring

### Phase 2 deliverables
- Vendor portal MVP ready for onboarding and storefront setup
- KYC document capture and vendor profile enrichment
- System-level permission extension for vendor app actions
- Shared UI and API contracts for vendor workflows

### Phase 3 deliverables
- Marketplace catalog backend support
- Product listing management for vendors
- Inventory and variant support
- Basic browsing and search semantics in shared types

### Phase 4 deliverables
- E-commerce workflow enabled in backend and frontend
- Order lifecycle and payment gateway readiness
- Shipping and fulfillment metadata support
- Transactional email and notification hooks

### Phase 5 deliverables
- Interaction layer for reviews and messaging
- Notification engine for user engagement
- Platform growth and retention tooling
- Operational dashboards and analytics primitives

## Deployment Workflow
1. Develop in a feature branch.
2. Keep runtime code and API contracts stable; add docs for any behavior changes.
3. Run schema changes through migration scripts, not direct production edits.
4. Validate with local or staging MySQL before applying to production.
5. Deploy in order: backend API -> database migration -> frontend app assets.
6. Monitor health endpoint `/api/v1/health` after deployment.
7. Roll back by reverting deployments and restoring DB from backups if needed.

## Scaling Stages
### Stage 0: Prototype / POC
- API-only validation of auth and onboarding
- Minimal production traffic
- Basic metrics and logs

### Stage 1: Early production
- Stable auth and vendor approval flows
- First merchant signups and customer visits
- Manual operational support with audit visibility

### Stage 2: Growth
- More vendors, product catalogs, shopping workflows
- Increased demand on database and caching
- Begin performance tuning and query optimization

### Stage 3: Marketplace maturity
- Multi-tenant scale with hundreds of vendors
- High-read product browsing and order throughput
- Resilient API, staged rollout, and monitoring dashboards

## AI Workflow Rules
- Use documentation as the single source of truth for project decisions.
- Prefer explicit, structured markdown for all AI-assisted notes.
- Do not allow AI edits that change backend runtime behavior without human review.
- Log AI-generated suggestions in documentation, then validate by a reviewer.
- Keep AI contributions traceable: reference issue/feature IDs and date in notes.

## Git Safety Workflow
- Always use feature branches for changes.
- Protect `main`/`master` and require pull requests or review before merge.
- Keep commits small, focused, and descriptive.
- Do not apply schema changes directly in production; use migration files.
- Update docs concurrently with code changes to keep the source of truth accurate.
