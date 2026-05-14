# BanjaraBazaarOS

Open-source digital marketplace platform inspired by India's local bazaar ecosystem.

Live: [banjarabazaar.online](https://banjarabazaar.online)

## Architecture (at a glance)

Unified **web-first + PWA** platform. Four apps, one backend, one API, one auth/session system. No native mobile builds — every app is an installable Progressive Web App.

| App | Path | Audience |
|---|---|---|
| Customer Homepage | `/apps/customer-homepage` | End shoppers |
| Vendor Portal | `/apps/vendor-portal` | Sellers / vendors |
| Staff App | `/apps/staff-app` | Operations staff |
| Admin Panel | `/apps/admin-panel` | Admins + Master Admin |

**Roles:** `customer` · `vendor` · `staff` · `admin` · `master_admin`

## Stack

- **Frontend:** React + Vite per app, mobile-first, PWA (manifest + service worker)
- **Backend:** PHP 8 + MySQL on Hostinger, REST under `/api/v1/`
- **Shared:** `/shared/ui`, `/shared/utils`, `/shared/constants`, `/shared/types`
- **Auth:** JWT/session-ready with DB-driven role-permission system
- **Config:** DB-driven runtime settings + environment files

## Repository Layout

```
/apps        — 4 React+Vite PWAs (customer-homepage, vendor-portal, staff-app, admin-panel)
/backend     — PHP API (api, core, config, middleware, services, models, helpers)
/shared      — Cross-app UI components, utils, constants, types
/database    — schema.sql, seed.sql (single source of truth)
/storage     — Runtime uploads/qr/exports/logs/cache/temp (contents gitignored)
```

## Decoupling rule

Frontend apps consume `/api/v1/*` only. They never import backend internals. API contracts live in `/shared/types`. Services in `/backend/services` are reusable and framework-independent — the same API could be consumed by a future partner integration or admin tool.

## Getting started

> Phase 1 is in progress: building the database schema and auth layer. Per-app setup instructions will land as each app is scaffolded.

1. Copy `.env.example` to `.env` and fill in DB + JWT secrets.
2. Apply `database/schema.sql` then `database/seed.sql` to your MySQL instance.
3. (Frontend apps and backend bootstrap will be documented as they land.)
