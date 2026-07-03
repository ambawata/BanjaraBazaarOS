# Phase 2.1 Repository Inventory

Date: 2026-07-03

This is the repository cleanup inventory for Phase 2.1. Nothing moves yet.

## Classification policy

- CORE: required for the production platform or the target Vastu Griha consolidation path.
- OPTIONAL: adjacent runtime surface that can stay supported but is not part of the target Vastu Griha product core.
- PLUGIN: future swappable extension point; none are currently implemented as separate plugin files.
- LEGACY: placeholder, scratch, or superseded file that is not part of the target architecture.
- ARCHIVE: nothing is archived yet.

## Summary counts

| Category | Files |
|---|---:|
| CORE | 287 |
| OPTIONAL | 74 |
| LEGACY | 3 |
| PLUGIN | 0 |
| ARCHIVE | 0 |
| Total tracked files | 364 |

## Repository weight by subtree

| Subtree | Files | Category |
|---|---:|---|
| `apps/vastu-griha/` | 217 | CORE |
| `apps/admin-panel/` | 51 | OPTIONAL |
| `backend/` | 33 | CORE |
| `apps/vendor-portal/` | 23 | OPTIONAL |
| `docs/` | 9 | CORE |
| `scripts/` | 8 | CORE |
| `storage/` | 6 | CORE |
| `shared/` | 4 | CORE |
| `database/` | 3 | CORE |
| `public/` | 2 | CORE |
| root repo files (`README.md`, `.env.example`, `.gitignore`, `composer.*`, `a`) | 6 | mixed |

## Root-level files

| File | Category | Reason |
|---|---|---|
| `.env.example` | CORE | Environment template for the platform. |
| `.gitignore` | CORE | Repository hygiene. |
| `README.md` | CORE | Repo-level orientation and architecture overview. |
| `composer.json` | CORE | PHP backend root package. |
| `composer.lock` | CORE | Locked PHP dependency graph. |
| `a` | LEGACY | Zero-byte scratch file; not part of the architecture. |

## Apps

### `apps/vastu-griha/` — CORE

This is the target product core.

#### Runtime / build files

- `apps/vastu-griha/index.html`
- `apps/vastu-griha/package.json`
- `apps/vastu-griha/package-lock.json`
- `apps/vastu-griha/vite.config.js`
- `apps/vastu-griha/scripts/compile-manifest.js`
- `apps/vastu-griha/scripts/generate-furniture.js`
- `apps/vastu-griha/NOTES.md`

#### Source files

- `apps/vastu-griha/src/App.jsx`
- `apps/vastu-griha/src/main.jsx`
- `apps/vastu-griha/src/index.css`
- `apps/vastu-griha/src/assets/constants.jsx`
- `apps/vastu-griha/src/components/AiChat.jsx`
- `apps/vastu-griha/src/components/AiDesigner.jsx`
- `apps/vastu-griha/src/components/AnalysisPanel.jsx`
- `apps/vastu-griha/src/components/AssetGallery.jsx`
- `apps/vastu-griha/src/components/BanjaraBazaarShop.jsx`
- `apps/vastu-griha/src/components/Canvas.jsx`
- `apps/vastu-griha/src/components/Compass.jsx`
- `apps/vastu-griha/src/components/FloorPlanUpload.jsx`
- `apps/vastu-griha/src/components/PlotBoundaryDrawer.jsx`
- `apps/vastu-griha/src/components/PlotConfig.jsx`
- `apps/vastu-griha/src/components/ReportGenerator.jsx`
- `apps/vastu-griha/src/features/dashboard/ProjectDashboard.jsx`
- `apps/vastu-griha/src/features/onboarding/OnboardingWizard.jsx`
- `apps/vastu-griha/src/features/planner/PlannerWorkspace.jsx`
- `apps/vastu-griha/src/lib/AssetLoader.js`
- `apps/vastu-griha/src/lib/geometry/compassEngine.js`
- `apps/vastu-griha/src/lib/geometry/coordinateSystem.js`
- `apps/vastu-griha/src/lib/geometry/geometryUtils.js`
- `apps/vastu-griha/src/lib/geometry/measurementEngine.js`
- `apps/vastu-griha/src/lib/geometry/roomEngine.js`
- `apps/vastu-griha/src/lib/geometry/rotationEngine.js`
- `apps/vastu-griha/src/lib/geometry/snapEngine.js`
- `apps/vastu-griha/src/lib/geometry/validationEngine.js`
- `apps/vastu-griha/src/lib/geometry/wallEngine.js`
- `apps/vastu-griha/src/stores/authStore.js`
- `apps/vastu-griha/src/stores/canvasStore.js`
- `apps/vastu-griha/src/stores/historyStore.js`
- `apps/vastu-griha/src/stores/projectStore.js`
- `apps/vastu-griha/src/stores/settingsStore.js`
- `apps/vastu-griha/src/stores/uiStore.js`

#### Asset families

All asset families below are CORE because they feed the planner, preview, and placement surfaces.

Each family contains the same canonical artifact set:

- `metadata.json`
- `thumbnail.svg`
- `preview.svg`
- `planner-top.svg`
- `planner-outline.svg`

Families:

- `apps/vastu-griha/assets/avatars/expert/`
- `apps/vastu-griha/assets/backgrounds/grid-pattern/`
- `apps/vastu-griha/assets/decor/mirror/`
- `apps/vastu-griha/assets/furniture/armchair/`
- `apps/vastu-griha/assets/furniture/bed/`
- `apps/vastu-griha/assets/furniture/bench/`
- `apps/vastu-griha/assets/furniture/bookshelf/`
- `apps/vastu-griha/assets/furniture/bunk-bed/`
- `apps/vastu-griha/assets/furniture/carpet/`
- `apps/vastu-griha/assets/furniture/ceiling-fan/`
- `apps/vastu-griha/assets/furniture/coffee-table/`
- `apps/vastu-griha/assets/furniture/console-table/`
- `apps/vastu-griha/assets/furniture/curtains/`
- `apps/vastu-griha/assets/furniture/dining-chair/`
- `apps/vastu-griha/assets/furniture/dining-table/`
- `apps/vastu-griha/assets/furniture/floor-lamp/`
- `apps/vastu-griha/assets/furniture/mirror/`
- `apps/vastu-griha/assets/furniture/office-chair/`
- `apps/vastu-griha/assets/furniture/office-desk/`
- `apps/vastu-griha/assets/furniture/ottoman/`
- `apps/vastu-griha/assets/furniture/plant-stand/`
- `apps/vastu-griha/assets/furniture/recliner/`
- `apps/vastu-griha/assets/furniture/side-table/`
- `apps/vastu-griha/assets/furniture/sofa/`
- `apps/vastu-griha/assets/furniture/study-table/`
- `apps/vastu-griha/assets/furniture/table-lamp/`
- `apps/vastu-griha/assets/furniture/tv-unit/`
- `apps/vastu-griha/assets/furniture/wall-shelf/`
- `apps/vastu-griha/assets/furniture/wardrobe/`
- `apps/vastu-griha/assets/plants/tulsi/`
- `apps/vastu-griha/assets/rooms/room-bedroom/`
- `apps/vastu-griha/assets/structure/main-door/`
- `apps/vastu-griha/assets/symbols/swastika/`
- `apps/vastu-griha/assets/utilities/water-tank/`
- `apps/vastu-griha/assets/vastu/pyramid/`

### `apps/admin-panel/` — OPTIONAL

This is a separate operational surface, not part of the Vastu Griha core target.

- `apps/admin-panel/.gitkeep`
- `apps/admin-panel/index.html`
- `apps/admin-panel/package.json`
- `apps/admin-panel/package-lock.json`
- `apps/admin-panel/postcss.config.js`
- `apps/admin-panel/tailwind.config.js`
- `apps/admin-panel/vite.config.js`
- `apps/admin-panel/src/App.jsx`
- `apps/admin-panel/src/main.jsx`
- `apps/admin-panel/src/index.css`
- `apps/admin-panel/src/data/mockData.js`
- `apps/admin-panel/src/store/useStore.js`
- `apps/admin-panel/src/components/Layout/AppShell.jsx`
- `apps/admin-panel/src/components/Layout/Sidebar.jsx`
- `apps/admin-panel/src/components/Layout/Topbar.jsx`
- `apps/admin-panel/src/components/UI/Toast.jsx`
- `apps/admin-panel/src/pages/ApprovalQueue.jsx`
- `apps/admin-panel/src/pages/AuditLogs.jsx`
- `apps/admin-panel/src/pages/Dashboard.jsx`
- `apps/admin-panel/src/pages/DeadStock.jsx`
- `apps/admin-panel/src/pages/Inventory.jsx`
- `apps/admin-panel/src/pages/Login.jsx`
- `apps/admin-panel/src/pages/Settlements.jsx`
- `apps/admin-panel/src/pages/Vendors.jsx`
- `apps/admin-panel/src/screens/ActiveProducts.jsx`
- `apps/admin-panel/src/screens/Advances.jsx`
- `apps/admin-panel/src/screens/Analytics.jsx`
- `apps/admin-panel/src/screens/ApprovalQueue.jsx`
- `apps/admin-panel/src/screens/Attendance.jsx`
- `apps/admin-panel/src/screens/AuditLogs.jsx`
- `apps/admin-panel/src/screens/Backup.jsx`
- `apps/admin-panel/src/screens/CashFlow.jsx`
- `apps/admin-panel/src/screens/Customers.jsx`
- `apps/admin-panel/src/screens/Damage.jsx`
- `apps/admin-panel/src/screens/Dashboard.jsx`
- `apps/admin-panel/src/screens/DeadStock.jsx`
- `apps/admin-panel/src/screens/Expenses.jsx`
- `apps/admin-panel/src/screens/Floor.jsx`
- `apps/admin-panel/src/screens/GST.jsx`
- `apps/admin-panel/src/screens/InventoryScreen.jsx`
- `apps/admin-panel/src/screens/Invoices.jsx`
- `apps/admin-panel/src/screens/Negotiations.jsx`
- `apps/admin-panel/src/screens/Notifications.jsx`
- `apps/admin-panel/src/screens/Pickup.jsx`
- `apps/admin-panel/src/screens/Roles.jsx`
- `apps/admin-panel/src/screens/Sales.jsx`
- `apps/admin-panel/src/screens/Settings.jsx`
- `apps/admin-panel/src/screens/Settlements.jsx`
- `apps/admin-panel/src/screens/StaffDirectory.jsx`
- `apps/admin-panel/src/screens/VendorsScreen.jsx`
- `apps/admin-panel/src/screens/WhatsApp.jsx`

### `apps/vendor-portal/` — OPTIONAL

Separate commerce/vendor surface.

- `apps/vendor-portal/.gitkeep`
- `apps/vendor-portal/index.html`
- `apps/vendor-portal/package.json`
- `apps/vendor-portal/package-lock.json`
- `apps/vendor-portal/postcss.config.js`
- `apps/vendor-portal/tailwind.config.js`
- `apps/vendor-portal/vite.config.js`
- `apps/vendor-portal/p.daysSinceLastSale`
- `apps/vendor-portal/src/App.jsx`
- `apps/vendor-portal/src/main.jsx`
- `apps/vendor-portal/src/index.css`
- `apps/vendor-portal/src/data/mockData.js`
- `apps/vendor-portal/src/store/useStore.js`
- `apps/vendor-portal/src/components/AppShell.jsx`
- `apps/vendor-portal/src/components/Sidebar.jsx`
- `apps/vendor-portal/src/components/Toast.jsx`
- `apps/vendor-portal/src/pages/AddProduct.jsx`
- `apps/vendor-portal/src/pages/Dashboard.jsx`
- `apps/vendor-portal/src/pages/DeadStockAlerts.jsx`
- `apps/vendor-portal/src/pages/Earnings.jsx`
- `apps/vendor-portal/src/pages/Login.jsx`
- `apps/vendor-portal/src/pages/MyProducts.jsx`
- `apps/vendor-portal/src/pages/Profile.jsx`

### `apps/customer-homepage/` — LEGACY

- `apps/customer-homepage/.gitkeep`

### `apps/staff-app/` — LEGACY

- `apps/staff-app/.gitkeep`

## Backend, shared, database, public, scripts, storage

### `backend/` — CORE

- `backend/api/v1/.gitkeep`
- `backend/api/v1/routes.php`
- `backend/config/.gitkeep`
- `backend/config/Config.php`
- `backend/config/env.template`
- `backend/core/.gitkeep`
- `backend/core/Database.php`
- `backend/core/ErrorHandler.php`
- `backend/core/Kernel.php`
- `backend/core/Request.php`
- `backend/core/Response.php`
- `backend/core/Router.php`
- `backend/core/bootstrap.php`
- `backend/helpers/.gitkeep`
- `backend/helpers/JsonResponse.php`
- `backend/helpers/PasswordHelper.php`
- `backend/middleware/.gitkeep`
- `backend/middleware/AuthMiddleware.php`
- `backend/middleware/CorsMiddleware.php`
- `backend/middleware/JsonMiddleware.php`
- `backend/middleware/Middleware.php`
- `backend/middleware/RoleMiddleware.php`
- `backend/models/.gitkeep`
- `backend/services/.gitkeep`
- `backend/services/AuthAuditService.php`
- `backend/services/AuthService.php`
- `backend/services/ProductAuditService.php`
- `backend/services/ProductService.php`
- `backend/services/RbacService.php`
- `backend/services/SettingsService.php`
- `backend/services/VendorAuditService.php`
- `backend/services/VendorRegistrationService.php`
- `backend/services/VendorService.php`

### `database/` — CORE

- `database/.gitkeep`
- `database/schema.sql`
- `database/seed.sql`

### `shared/` — CORE

- `shared/constants/.gitkeep`
- `shared/types/.gitkeep`
- `shared/ui/.gitkeep`
- `shared/utils/.gitkeep`

### `public/` — CORE

- `public/.htaccess`
- `public/index.php`

### `scripts/` — CORE

- `scripts/migrate.php`
- `scripts/api-tests/01-vendor-registration.ps1`
- `scripts/api-tests/02-login.ps1`
- `scripts/api-tests/03-product-crud.ps1`
- `scripts/api-tests/04-approval-flow.ps1`
- `scripts/api-tests/05-protected-routes.ps1`
- `scripts/api-tests/BbApiTestHelpers.ps1`
- `scripts/api-tests/run-all.ps1`

### `storage/` — CORE

- `storage/cache/.gitkeep`
- `storage/exports/.gitkeep`
- `storage/logs/.gitkeep`
- `storage/qr/.gitkeep`
- `storage/temp/.gitkeep`
- `storage/uploads/.gitkeep`

## Docs

All current docs are CORE because they define the governing architecture and product governance.

- `docs/MASTER_ROADMAP.md`
- `docs/PRODUCTION_RISKS.md`
- `docs/PRODUCT_UPLOAD_API.md`
- `docs/PROJECT_STATUS.md`
- `docs/VENDOR_AUTHENTICATION.md`
- `docs/VENDOR_AUTHENTICATION_TESTING.md`
- `docs/VENDOR_AUTH_QUICK_REFERENCE.md`
- `docs/VENDOR_REGISTRATION_TESTING.md`
- `docs/postman_vendor_registration_collection.json`
- `docs/MASTER_ARCHITECTURE.md`
- `docs/FEATURE_MATRIX.md`
- `docs/DUPLICATE_REPORT.md`
- `docs/DEPENDENCY_GRAPH.md`
- `docs/MIGRATION_PLAN.md`
- `docs/SECOND_PASS_AUDIT.md`
- `docs/PRODUCT_ARCHITECTURE.md`

## Category notes

- CORE files are the production platform, support code, or governing architecture documents.
- OPTIONAL files are adjacent runtime surfaces that can remain in the repository without being part of the Vastu Griha consolidation target.
- LEGACY files are placeholders or scratch artifacts.
- PLUGIN and ARCHIVE are currently empty categories in the tracked tree.

## Inventory conclusion

Every tracked file is covered by one of the category rules above. No runtime code is being changed in this phase, and nothing is moved to archive yet.

