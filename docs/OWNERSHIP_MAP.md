# Ownership Map — Phase 2.2

> **Superseded:** this audit describes the v1 `apps/vastu-griha` source tree, which was deleted (v1 was superseded by `apps/vastu-griha/v2`). Paths below no longer exist; kept for historical record only.

Status: documentation only

This document records ownership for the runtime surface used by the consolidated Vastu Griha product and its adjacent platform files. It does not change code, move files, or redefine the product architecture.

The governing product direction is `docs/PRODUCT_ARCHITECTURE.md`; this map explains runtime ownership and dependency responsibility under that target.

## 1) Ownership model

### Ownership rules

- Every runtime screen has exactly one canonical owner.
- Every Zustand store has exactly one canonical owner.
- Every runtime component has one primary purpose.
- Files that are currently unused are still documented, but their archive readiness is explicit and conservative.

### Readiness legend

- SAFE: no current runtime consumer, or a clear one-file replacement exists.
- LIKELY SAFE: likely removable, but some launcher or UX coupling remains.
- NEEDS REVIEW: duplicate or overlapping behavior exists; removal may affect navigation or persistence.
- DO NOT TOUCH: currently canonical, actively used, or not proven safe.

## 2) Screen ownership matrix

| Screen | Purpose | Entry Point | Exit Point | Parent | Children | Canonical? | Dependencies | Store Ownership | Business Logic Owner | UI Owner | Archive Candidate? |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Dashboard | Project start / resume / project management | `App.jsx` route branch (`welcome`/`dashboard`) | Onboarding or Planner Workspace | App router | none | Yes | `projectStore`, `uiStore`, `canvasStore` | `projectStore` | `ProjectDashboard` | `ProjectDashboard` | No |
| Onboarding | Guided plot/project bootstrap | Dashboard CTA / `step_shape` launcher | Planner Workspace | App router | Planner Workspace | Yes | `uiStore`, `projectStore`, `canvasStore`, `Compass` | `projectStore` (plot/bootstrap) | `OnboardingWizard` | `OnboardingWizard` | No |
| Planner Workspace | Core orchestration shell | Dashboard / Onboarding / resume | Dashboard / Settings / Export | App router | Canvas, Analysis, Report, Shop, AI Chat, Asset Gallery, Project Settings | Yes | `uiStore`, `projectStore`, `canvasStore`, `historyStore`, `settingsStore` | `uiStore` for navigation, `canvasStore` for layout | `PlannerWorkspace` | `PlannerWorkspace` | No |
| Canvas | Layout editing | Planner Workspace `designer` / upload flow | Analysis / Report | Planner Workspace | room tools, backdrop, drag/edit controls | Yes | `canvasStore`, `projectStore`, `settingsStore`, `AnalysisPanel` | `canvasStore` | `Canvas` | `Canvas` | No |
| Analysis | Vastu scoring / issue diagnosis | Planner Workspace `analysis` tab | Report / Shop / AI guidance | Planner Workspace | analysis sections / issue lists | Yes | `AnalysisPanel`, `projectStore`, `canvasStore` | derived from `projectStore` + `canvasStore` | `AnalysisPanel` | `AnalysisPanel` | No |
| Report | Printable summary / export input | Planner Workspace `reports` tab | Export | Planner Workspace | report sections | Yes | `ReportGenerator`, `AnalysisPanel`, `projectStore` | derived/report state | `ReportGenerator` | `ReportGenerator` | No |
| Shop | Remedies / product recommendations | Planner Workspace `shop` tab | Checkout / Export | Planner Workspace | product cards | Yes | `BanjaraBazaarShop`, `AnalysisPanel` | derived from analysis | `BanjaraBazaarShop` | `BanjaraBazaarShop` | No |
| AI Chat | Conversational guidance | Planner Workspace `chat` tab / AI prompts | Analysis / Canvas / Report | Planner Workspace | message thread / quick replies | Yes | `AiChat`, `AnalysisPanel`, `projectStore` | read-only derived context | `AiChat` | `AiChat` | No |
| Asset Gallery | Asset browser / placement preview | Planner Workspace `assets` tab | Planner Workspace | Planner Workspace | preview modal | Yes | `AssetGallery`, `AssetLoader` | read-only, asset-local state | `AssetGallery` | `AssetGallery` | No |
| Project Settings | Theme, collaboration, account preferences | Planner Workspace profile/settings surfaces | Dashboard / back to workspace | Planner Workspace | settings panels | Yes (embedded) | `uiStore` | `uiStore` | `PlannerWorkspace` (settings section) | `PlannerWorkspace` | Maybe, if later extracted |
| Export | Save / print / final artifact | Report / workspace final action | External share / file save | Planner Workspace | none | Yes (embedded) | `ReportGenerator`, `projectStore` | derived from report/project | `ReportGenerator` (export controls) | `ReportGenerator` | No |

## 3) Store ownership matrix

| Store | Purpose | Persistent? | Temporary? | Derived? | Who writes? | Who reads? | Who owns? | Can it be split? | Can it be removed? | Risk |
|---|---|---|---|---|---|---|---|---|---|---|
| `authStore` | Future authentication/session state | No current persistence | Mostly persistent when enabled | No | No current runtime writers | No current runtime readers | Platform/auth layer | Yes, if auth grows | Possibly, if auth is out-of-scope for current runtime | Low in current tree, medium conceptually |
| `canvasStore` | Rooms, image settings, boundary points, autosave/recovery | Yes, via `vg-layout-project` | Some transient UI state | Partly (`loadFromLocalStorage`) | Canvas editing actions, dashboard open-project path, onboarding generation | Canvas, Planner Workspace, Project Dashboard, App startup restore | Canvas / layout ownership | Could split image settings from rooms later | Not in Phase 2.2 | High |
| `historyStore` | Undo/redo stack | No | Yes | No | `canvasStore` only | `canvasStore` only | Canvas subsystem | Could be merged into canvas store later | No, until canvas stack is consolidated | Medium |
| `projectStore` | Projects, onboarding inputs, active project, activity log | Yes, via `vg-projects-list` | Mixed | No (seed data is initial state) | Project CRUD actions, onboarding, dashboard create/open flows | Dashboard, onboarding, planner, canvas, report | Project lifecycle owner | Could split onboarding vs project list later | No | High |
| `settingsStore` | Grid/snapping/wall config | No | Yes | No | Canvas / settings controls | Canvas | Editor settings owner | Yes | Possibly, if settings move into UI or project metadata | Medium |
| `uiStore` | Global screen state, tabs, theme, modals, collaboration UI | Theme only (`vg-theme`) | Mostly temporary UI | No | App startup, dashboard, onboarding, planner, collaboration controls | App router, dashboard, onboarding, planner, canvas | Shell / navigation owner | Could be split into navigation + workspace UI later | No | High |

## 4) Runtime dependency validation

### A. Orphan components

| Finding | Evidence | Recommendation | Confidence |
|---|---|---|---|
| `AiDesigner.jsx` has no current importers | `rg -n "AiDesigner" apps/vastu-griha/src` returns only its own file | Keep documented; likely archive candidate later | 97% |
| `FloorPlanUpload.jsx` has no current importers | `rg -n "FloorPlanUpload" apps/vastu-griha/src` returns only its own file | Keep documented; likely archive candidate later | 97% |
| `authStore.js` has no current importers | `rg -n "authStore" apps/vastu-griha/src` returns no consumers | Keep documented; do not remove until auth plan exists | 90% |

### B. Circular imports

| Finding | Evidence | Recommendation | Confidence |
|---|---|---|---|
| No direct circular import detected in the current Vastu Griha source scan | Current import graph shows one-way component/store flow: `App -> screens -> workspace -> components/stores` | No action | 83% |

### C. Dead imports / dead selectors

| Finding | Evidence | Recommendation | Confidence |
|---|---|---|---|
| `OnboardingWizard` destructures `screenState` from `uiStore` but does not use it | `src/features/onboarding/OnboardingWizard.jsx:8` | Keep documented; remove only during later code cleanup | 96% |
| The planner still contains a local `welcome` branch that duplicates dashboard entry semantics | `src/features/planner/PlannerWorkspace.jsx:289-290, 570-585` | Do not change in Phase 2.2; requires consolidation decision later | 99% |

### D. Hidden / implicit dependencies

| Finding | Evidence | Recommendation | Confidence |
|---|---|---|---|
| `ProjectDashboard` writes `vg-layout-project` directly when opening a project | `src/features/dashboard/ProjectDashboard.jsx:102-112` | Keep ownership documented; later move into one persistence pipeline | 99% |
| `canvasStore` also writes `vg-layout-project` on autosave | `src/stores/canvasStore.js:7-14` | Accept for now; this is the current persistence coupling to be consolidated in Phase 2.6 | 99% |
| `Canvas`, `ReportGenerator`, and `AiChat` all depend on `AnalysisPanel` named exports | `src/components/Canvas.jsx`, `ReportGenerator.jsx`, `AiChat.jsx`, `AnalysisPanel.jsx` | Canonical analysis owner remains `AnalysisPanel` for now | 99% |
| Asset previews are resolved indirectly through `AssetLoader` and the asset manifest rather than direct component imports | `src/lib/AssetLoader.js`, `src/components/AssetGallery.jsx`, planner asset usage | Document as an asset-system dependency, not a code import cycle | 88% |

### E. Dynamic imports

| Finding | Evidence | Recommendation | Confidence |
|---|---|---|---|
| No runtime `import()` usage found in the current Vastu Griha source scan | `rg -n "import\\(" apps/vastu-griha/src` yields no runtime dynamic imports | No action | 92% |

## 5) Canonical screen validation

This section proves whether there is exactly one runtime implementation for each major screen.

| Screen | Canonical implementation | Duplicate | Reason | Risk | Recommendation |
|---|---|---|---|---|---|
| Dashboard | `apps/vastu-griha/src/features/dashboard/ProjectDashboard.jsx` | `apps/vastu-griha/src/features/planner/PlannerWorkspace.jsx` welcome branch | The planner still carries a separate home/welcome path even though `App.jsx` already routes `welcome` to the dashboard | High | Do not fix in Phase 2.2; archive/remove later only after consolidation approval |
| Onboarding | `apps/vastu-griha/src/features/onboarding/OnboardingWizard.jsx` | None found | Single runtime onboarding implementation | Low | Keep |
| Planner Workspace | `apps/vastu-griha/src/features/planner/PlannerWorkspace.jsx` | None found | Single runtime workspace shell | Low | Keep |
| Canvas | `apps/vastu-griha/src/components/Canvas.jsx` | None found | Single runtime canvas editor | Low | Keep |
| Analysis | `apps/vastu-griha/src/components/AnalysisPanel.jsx` | None found | Single canonical analysis engine and UI | Low | Keep |
| Report | `apps/vastu-griha/src/components/ReportGenerator.jsx` | None found | Single report pipeline implementation | Low | Keep |
| Shop | `apps/vastu-griha/src/components/BanjaraBazaarShop.jsx` | None found | Single shop/remedy surface | Low | Keep |
| AI Chat | `apps/vastu-griha/src/components/AiChat.jsx` | None found | Single AI chat surface | Low | Keep |
| Asset Gallery | `apps/vastu-griha/src/components/AssetGallery.jsx` | None found | Single asset-browser implementation | Low | Keep |

## 6) Archive readiness summary

| Candidate | Readiness | Why | Confidence | Risk |
|---|---|---|---|---|
| `apps/vastu-griha/src/components/AiDesigner.jsx` | SAFE | No current importer | 97% | Low |
| `apps/vastu-griha/src/components/FloorPlanUpload.jsx` | SAFE | No current importer | 97% | Low |
| `apps/vastu-griha/src/stores/authStore.js` | NEEDS REVIEW | Unused now, but auth may return as a platform concern | 90% | Medium |
| `apps/vastu-griha/src/features/planner/PlannerWorkspace.jsx` welcome branch | NEEDS REVIEW | Duplicate dashboard-like flow still wired into mobile Home | 99% | High |
| `apps/customer-homepage/.gitkeep` | SAFE | Placeholder only | 99% | Low |
| `apps/staff-app/.gitkeep` | SAFE | Placeholder only | 99% | Low |
| `a` | SAFE | Zero-byte scratch artifact | 99% | Low |
| `apps/vastu-griha/assets/*` families | DO NOT TOUCH | Asset system is canonical and heavily referenced indirectly through the manifest | 88% | High |

## 7) Runtime ownership map — core Vastu Griha runtime files

### App shell and screens

| File | Owner | Purpose | Imported By | Imports | Uses Store(s) | Writes Store(s) | Reads Store(s) | Uses localStorage? | Uses Assets? | Uses Geometry? | Uses Analysis? | Uses AI? | Uses Report? | Uses Shop? | Used On Which Screen? | Replaceable? | Archive Candidate? | Risk Level | Confidence % |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---:|
| `apps/vastu-griha/src/App.jsx` | App/router owner | Top-level runtime router and startup restore | `main.jsx` | `uiStore`, `canvasStore`, `ProjectDashboard`, `OnboardingWizard`, `PlannerWorkspace` | `uiStore`, `canvasStore` | `uiStore` (startup state switch) | `uiStore`, `canvasStore` | No direct writes | No | No | No | No | No | No | All screens | No | No | High | 99 |
| `apps/vastu-griha/src/features/dashboard/ProjectDashboard.jsx` | Dashboard owner | Project list, start/resume, project creation, launcher cards | `App.jsx` | `projectStore`, `uiStore`, `canvasStore` | `projectStore`, `uiStore`, `canvasStore` | `projectStore` via CRUD; `uiStore` navigation | same stores | Yes (`vg-layout-project` + `vg-projects-list` via store) | Yes (thumbnail previews) | No | Indirect via project scores | No | No | No | Dashboard | No | No | High | 99 |
| `apps/vastu-griha/src/features/onboarding/OnboardingWizard.jsx` | Onboarding owner | Guided plot bootstrap and layout generation | `App.jsx` | `Compass`, `uiStore`, `projectStore`, `canvasStore` | `uiStore`, `projectStore`, `canvasStore` | `uiStore` navigation; `projectStore` plot; `canvasStore` rooms | same stores | No | Yes (Compass) | No | No | No | No | No | Onboarding | No | No | High | 99 |
| `apps/vastu-griha/src/features/planner/PlannerWorkspace.jsx` | Planner Workspace owner | Core workspace shell, tabs, canvas orchestration | `App.jsx` | `Canvas`, `Compass`, `PlotBoundaryDrawer`, `AnalysisPanel`, `BanjaraBazaarShop`, `ReportGenerator`, `AiChat`, `PlotConfig`, `AssetGallery`, `constants`, `uiStore`, `projectStore`, `canvasStore` | `uiStore`, `projectStore`, `canvasStore` | Many UI setters; workspace actions; canvas actions | same stores | Yes (`vg-dismiss-tip`) | Yes (logo, asset gallery, icons) | Yes (workspace canvas/editor) | Yes | Yes | Yes | Yes | Planner Workspace | No | No | High | 99 |
| `apps/vastu-griha/src/components/Canvas.jsx` | Canvas owner | Room editing / render surface | `PlannerWorkspace.jsx` | `AnalysisPanel.evaluateRoom`, `canvasStore`, `projectStore`, `settingsStore`, `uiStore`, `snapEngine`, `coordinateSystem` | `canvasStore`, `projectStore`, `settingsStore`, `uiStore` | `canvasStore` on edit actions | same stores | No | Yes (icons / SVGs) | Yes | Yes | No | No | No | Canvas | No | No | High | 99 |
| `apps/vastu-griha/src/components/AnalysisPanel.jsx` | Analysis owner | Canonical Vastu rules and analysis UI | `PlannerWorkspace.jsx`, `Canvas.jsx`, `ReportGenerator.jsx`, `AiChat.jsx` | React only | none directly; analysis consumers read named exports | none | none | No | No | No | Yes | Indirect | Indirect | Yes | Analysis | No | No | High | 99 |
| `apps/vastu-griha/src/components/ReportGenerator.jsx` | Report owner | Printable report composition | `PlannerWorkspace.jsx` | `evaluateRoom` from `AnalysisPanel` | none directly | none | none | No | No | No | Yes | No | Yes | No | Report | No | No | High | 99 |
| `apps/vastu-griha/src/components/BanjaraBazaarShop.jsx` | Shop owner | Remedy/product recommendations and checkout prompt | `PlannerWorkspace.jsx` | React only | none directly | none | none | No | No | No | Yes (derived issues) | No | No | Yes | Shop | No | No | High | 98 |
| `apps/vastu-griha/src/components/AiChat.jsx` | AI Chat owner | Conversational guidance and wizard-like helper | `PlannerWorkspace.jsx` | `VASTU_RULES` from `AnalysisPanel` | none directly | none | none | No | No | No | Yes | Yes | No | No | AI Chat | No | No | High | 98 |
| `apps/vastu-griha/src/components/AssetGallery.jsx` | Asset gallery owner | Browse/select placement assets and preview them | `PlannerWorkspace.jsx` | `AssetLoader` | local state only | local state only | local state only | Yes (`vastu_favorites`, `vastu_recently_used`) | Yes | Yes (placement preview) | Indirect only | No | No | No | Asset Gallery | No | No | Medium | 98 |
| `apps/vastu-griha/src/components/PlotConfig.jsx` | Plot config owner | Plot size / orientation controls | `PlannerWorkspace.jsx` | `projectStore` | `projectStore` | `projectStore.setPlot()` | `projectStore.plot` | No | No | No | No | No | No | No | Workspace settings panel | Possibly | No | Medium | 96 |
| `apps/vastu-griha/src/components/PlotBoundaryDrawer.jsx` | Boundary drawer owner | Tap-to-place polygon boundary tool | `PlannerWorkspace.jsx` | React hooks only | none directly | parent callback only | parent callback only | No | No | No | No | No | No | No | Planner Workspace upload / boundary tool | Possibly | No | Medium | 94 |
| `apps/vastu-griha/src/components/Compass.jsx` | Compass owner | Direction / tilt visualization | `OnboardingWizard.jsx`, `PlannerWorkspace.jsx` | React only | none | none | none | No | No | No | No | No | No | No | Onboarding / Workspace | No | No | Low | 99 |

### Store files

| File | Owner | Purpose | Imported By | Imports | Uses Store(s) | Writes Store(s) | Reads Store(s) | Uses localStorage? | Uses Assets? | Uses Geometry? | Uses Analysis? | Uses AI? | Uses Report? | Uses Shop? | Used On Which Screen? | Replaceable? | Archive Candidate? | Risk Level | Confidence % |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---:|
| `apps/vastu-griha/src/stores/uiStore.js` | UI/navigation owner | Global screen state, tabs, theme, collaboration UI | `App.jsx`, `ProjectDashboard.jsx`, `OnboardingWizard.jsx`, `PlannerWorkspace.jsx`, `Canvas.jsx` | `zustand` | `uiStore` itself | many UI actions | `screenState`, `activeTab`, `theme`, `isMobile`, modals, collaboration state | Theme only (`vg-theme`) | No | No | No | No | No | No | App shell + all screens | Maybe later split nav vs UI | No | High | 99 |
| `apps/vastu-griha/src/stores/projectStore.js` | Project lifecycle owner | Project list, onboarding defaults, plot state, project activity log | `App.jsx` indirectly via startup flow; `ProjectDashboard.jsx`, `OnboardingWizard.jsx`, `PlannerWorkspace.jsx`, `PlotConfig.jsx`, `Canvas.jsx`, `ReportGenerator.jsx` | `zustand` | `projectStore` itself | project CRUD / onboarding plot setters | `projects`, `activities`, `onboarding`, `plot` | `vg-projects-list` | No | No | Indirect via plot/layout in consumers | No | No | No | Dashboard / Onboarding / Workspace / Canvas / Report | Maybe later split onboarding vs project persistence | No | High | 99 |
| `apps/vastu-griha/src/stores/canvasStore.js` | Canvas state owner | Rooms, boundary points, backdrop image settings, autosave/recovery | `App.jsx`, `ProjectDashboard.jsx`, `OnboardingWizard.jsx`, `PlannerWorkspace.jsx`, `Canvas.jsx`, `FloorPlanUpload.jsx` | `zustand`, `historyStore`, `projectStore` | `canvasStore` itself | all canvas mutation actions | `rooms`, `boundaryPoints`, `imageSettings` | `vg-layout-project` | No | Yes | Indirect via `Canvas` | No | No | No | Canvas / Workspace / Dashboard open-project path | Maybe later split image settings from layout | No | High | 99 |
| `apps/vastu-griha/src/stores/historyStore.js` | Undo stack owner | Undo/redo snapshots for canvas edits | `canvasStore.js` | `zustand` | `historyStore` itself | pushState / undo / redo | `past`, `future` | No | No | No | No | No | No | No | Canvas | Could be merged into canvasStore | No | Medium | 99 |
| `apps/vastu-griha/src/stores/settingsStore.js` | Editor settings owner | Grid, snap, wall thickness settings | `Canvas.jsx` | `zustand` | `settingsStore` itself | setting setters | `gridSize`, `snapToGrid`, `autosaveInterval`, wall thickness values | No | No | No | No | No | No | No | Canvas | Could be folded into UI or project metadata later | No | Medium | 98 |
| `apps/vastu-griha/src/stores/authStore.js` | Auth/session owner | Future authentication state | none in current runtime | `zustand` | none | none | none | No | No | No | No | No | No | No | N/A | Yes, if auth remains external | Maybe later | Medium | 90 |

## 8) Runtime ownership map — support files and optional surfaces

### Optional Vastu Griha components

| File | Owner | Purpose | Imported By | Imports | Uses Store(s) | Writes Store(s) | Reads Store(s) | Uses localStorage? | Uses Assets? | Uses Geometry? | Uses Analysis? | Uses AI? | Uses Report? | Uses Shop? | Used On Which Screen? | Replaceable? | Archive Candidate? | Risk Level | Confidence % |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---:|
| `apps/vastu-griha/src/components/AiDesigner.jsx` | Optional launcher owner | Template-based layout starter UI | none currently | none | none | none | none | No | No | No | No | No | No | No | Design starter surface (unused) | Yes | Yes | Low | 97 |
| `apps/vastu-griha/src/components/FloorPlanUpload.jsx` | Optional upload owner | Floor-plan upload / overlay controls | none currently | `canvasStore` | `canvasStore` | `canvasStore` | `imageSettings` | Yes (`vg-layout-project` indirectly through canvas store) | Yes | No | No | No | No | No | Upload / import surface (unused) | Yes | Yes | Low | 97 |

### Shared geometry / utility modules

| File | Owner | Purpose | Imported By | Imports | Uses Store(s) | Writes Store(s) | Reads Store(s) | Uses localStorage? | Uses Assets? | Uses Geometry? | Uses Analysis? | Uses AI? | Uses Report? | Uses Shop? | Used On Which Screen? | Replaceable? | Archive Candidate? | Risk Level | Confidence % |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---:|
| `apps/vastu-griha/src/lib/AssetLoader.js` | Asset system owner | Resolve asset family URLs for preview / planner / thumbnail artifacts | `AssetGallery.jsx` and asset consumers | none | none | none | none | No | Yes | No | No | No | No | No | Asset Gallery / Canvas / Workspace | No | No | Low | 99 |
| `apps/vastu-griha/src/lib/geometry/compassEngine.js` | Geometry engine owner | Compass / orientation math | geometry consumers | none | none | none | none | No | No | Yes | No | No | No | No | Canvas / Planner | No | No | Low | 96 |
| `apps/vastu-griha/src/lib/geometry/coordinateSystem.js` | Geometry engine owner | Coordinate transforms | `Canvas.jsx` | none | none | none | none | No | No | Yes | No | No | No | No | Canvas | No | No | Low | 99 |
| `apps/vastu-griha/src/lib/geometry/geometryUtils.js` | Geometry engine owner | Geometry helpers | geometry consumers | none | none | none | none | No | No | Yes | No | No | No | No | Canvas / Planner | No | No | Low | 96 |
| `apps/vastu-griha/src/lib/geometry/measurementEngine.js` | Geometry engine owner | Measurement helpers | geometry consumers | none | none | none | none | No | No | Yes | No | No | No | No | Canvas / Planner | No | No | Low | 96 |
| `apps/vastu-griha/src/lib/geometry/roomEngine.js` | Geometry engine owner | Room placement geometry | geometry consumers | none | none | none | none | No | No | Yes | No | No | No | No | Canvas / Planner | No | No | Low | 96 |
| `apps/vastu-griha/src/lib/geometry/rotationEngine.js` | Geometry engine owner | Rotation helpers | geometry consumers | none | none | none | none | No | No | Yes | No | No | No | No | Canvas / Planner | No | No | Low | 96 |
| `apps/vastu-griha/src/lib/geometry/snapEngine.js` | Geometry engine owner | Grid snap helpers | `Canvas.jsx` | none | none | none | none | No | No | Yes | No | No | No | No | Canvas | No | No | Low | 99 |
| `apps/vastu-griha/src/lib/geometry/validationEngine.js` | Geometry engine owner | Shape / plot validation | geometry consumers | none | none | none | none | No | No | Yes | No | No | No | No | Planner / Canvas | No | No | Low | 96 |
| `apps/vastu-griha/src/lib/geometry/wallEngine.js` | Geometry engine owner | Wall geometry helpers | geometry consumers | none | none | none | none | No | No | Yes | No | No | No | No | Planner / Canvas | No | No | Low | 96 |

### Backend runtime ownership

| Runtime area | Owner | Purpose | Imported By | Imports | Uses Store(s) | Writes Store(s) | Reads Store(s) | Uses localStorage? | Uses Assets? | Uses Geometry? | Uses Analysis? | Uses AI? | Uses Report? | Uses Shop? | Used On Which Screen? | Replaceable? | Archive Candidate? | Risk Level | Confidence % |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---:|
| `public/` front controller | Backend routing owner | PHP entry point / rewrite target | web server | PHP front controller files | N/A | N/A | N/A | No | No | No | No | No | No | No | All HTTP requests | No | No | High | 98 |
| `backend/core/*` | Backend core owner | Request/response/router/bootstrap layer | backend services and routes | PHP core includes | N/A | N/A | N/A | No | No | No | No | No | No | No | Backend API | No | No | High | 98 |
| `backend/middleware/*` | Backend middleware owner | Auth / CORS / JSON / role middleware | backend core/router | PHP middleware includes | N/A | N/A | N/A | No | No | No | No | No | No | No | Backend API | No | No | High | 97 |
| `backend/services/*` | Backend service layer owner | Auth, vendor, product, settings, audit services | backend routes/core | PHP services | N/A | N/A | N/A | No | No | No | No | No | No | No | Backend API | No | No | High | 97 |
| `backend/helpers/*` | Backend helper owner | JSON and password helpers | backend services/core | PHP helpers | N/A | N/A | N/A | No | No | No | No | No | No | No | Backend API | No | No | Medium | 96 |
| `backend/config/*` | Backend configuration owner | Config/env template | backend bootstrap | PHP config | N/A | N/A | N/A | No | No | No | No | No | No | No | Backend API | No | No | High | 98 |
| `backend/api/v1/routes.php` | API route owner | API route map | backend bootstrap | PHP route table | N/A | N/A | N/A | No | No | No | No | No | No | No | Backend API | No | No | High | 98 |
| `database/*.sql` | Data model owner | Schema and seed definitions | deployment / migration tooling | SQL schema/seed | N/A | N/A | N/A | No | No | No | No | No | No | No | Database layer | No | No | High | 97 |
| `shared/*` | Contract owner | Shared UI/util/type placeholders | future consumers | none | N/A | N/A | N/A | No | No | No | No | No | No | No | Cross-app future surface | Yes | Maybe | Medium | 90 |
| `scripts/api-tests/*` | Test automation owner | API test scripts | CI / developers | PowerShell scripts | N/A | N/A | N/A | No | No | No | No | No | No | No | Test harness | No | No | Medium | 95 |

### Other runtime surfaces

| Runtime area | Owner | Purpose | Imported By | Imports | Uses Store(s) | Writes Store(s) | Reads Store(s) | Uses localStorage? | Uses Assets? | Uses Geometry? | Uses Analysis? | Uses AI? | Uses Report? | Uses Shop? | Used On Which Screen? | Replaceable? | Archive Candidate? | Risk Level | Confidence % |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---:|
| `apps/admin-panel/*` | Optional admin surface owner | Admin / operations UI | admin panel app shell | app-local imports | yes, via app-local store | yes, within admin store | yes | Possibly | No | No | No | No | No | No | Admin screens | Yes as separate product surface | No | Medium | 92 |
| `apps/vendor-portal/*` | Optional vendor surface owner | Vendor commerce UI | vendor portal app shell | app-local imports | yes, via app-local store | yes, within vendor store | yes | Possibly | No | No | No | No | No | No | Vendor screens | Yes as separate product surface | No | Medium | 92 |
| `apps/customer-homepage/*` | Legacy placeholder owner | Placeholder customer app root | none | none | none | none | none | No | No | No | No | No | No | No | N/A | Yes | Yes | Low | 99 |
| `apps/staff-app/*` | Legacy placeholder owner | Placeholder staff app root | none | none | none | none | none | No | No | No | No | No | No | No | N/A | Yes | Yes | Low | 99 |

## 9) Asset family ownership

Asset families are grouped because each family uses the same ownership and runtime semantics across `metadata.json`, `thumbnail.svg`, `preview.svg`, `planner-top.svg`, and `planner-outline.svg`.

| Family | Owner | Purpose | Imported By | Uses Store(s) | Uses localStorage? | Uses Assets? | Used On Which Screen? | Replaceable? | Archive Candidate? | Risk Level | Confidence % |
|---|---|---|---|---|---|---|---|---|---|---|---:|
| `apps/vastu-griha/assets/avatars/expert/` | Asset family owner | Expert avatar set | `AssetLoader` / asset consumers | none | No | Yes | Asset Gallery / Planner | No | No | Low | 98 |
| `apps/vastu-griha/assets/backgrounds/grid-pattern/` | Asset family owner | Grid/background pattern | `AssetLoader` / asset consumers | none | No | Yes | Planner / Canvas | No | No | Low | 98 |
| `apps/vastu-griha/assets/decor/mirror/` | Asset family owner | Decorative mirror asset | `AssetLoader` / asset consumers | none | No | Yes | Asset Gallery / Planner | No | No | Low | 98 |
| `apps/vastu-griha/assets/furniture/*` | Asset family owner | Furniture catalog assets | `AssetLoader` / asset consumers | none | No | Yes | Asset Gallery / Canvas / Planner | No | No | Low | 98 |
| `apps/vastu-griha/assets/plants/tulsi/` | Asset family owner | Plant asset family | `AssetLoader` / asset consumers | none | No | Yes | Asset Gallery / Planner | No | No | Low | 98 |
| `apps/vastu-griha/assets/rooms/room-bedroom/` | Asset family owner | Room template asset | `AssetLoader` / asset consumers | none | No | Yes | Asset Gallery / Planner | No | No | Low | 98 |
| `apps/vastu-griha/assets/structure/main-door/` | Asset family owner | Structural asset family | `AssetLoader` / asset consumers | none | No | Yes | Asset Gallery / Planner | No | No | Low | 98 |
| `apps/vastu-griha/assets/symbols/swastika/` | Asset family owner | Symbol asset family | `AssetLoader` / asset consumers | none | No | Yes | Asset Gallery / Planner | No | No | Low | 98 |
| `apps/vastu-griha/assets/utilities/water-tank/` | Asset family owner | Utility asset family | `AssetLoader` / asset consumers | none | No | Yes | Asset Gallery / Planner | No | No | Low | 98 |
| `apps/vastu-griha/assets/vastu/pyramid/` | Asset family owner | Vastu remedy asset family | `AssetLoader` / asset consumers | none | No | Yes | Asset Gallery / Shop / Planner | No | No | Low | 98 |
| `apps/vastu-griha/assets/asset-manifest.json` | Asset registry owner | Resolved asset index used at runtime | `AssetLoader` | none | No | Yes | Asset Gallery / Planner / Canvas | No | No | Medium | 95 |

## 10) Archive readiness evidence

### Safe

- `apps/vastu-griha/src/components/AiDesigner.jsx` — no importer found.
- `apps/vastu-griha/src/components/FloorPlanUpload.jsx` — no importer found.
- `apps/customer-homepage/.gitkeep` — placeholder only.
- `apps/staff-app/.gitkeep` — placeholder only.
- `a` — zero-byte scratch artifact.

### Likely safe

- `apps/admin-panel/*` and `apps/vendor-portal/*` as separate product surfaces, if the consolidation mandate is narrowed later to Vastu Griha only.
- `apps/vastu-griha/src/stores/authStore.js` if auth is later standardized elsewhere.

### Needs review

- `apps/vastu-griha/src/features/planner/PlannerWorkspace.jsx` welcome branch.
- `apps/vastu-griha/src/features/dashboard/ProjectDashboard.jsx` launcher duplication with planner home cards.
- `apps/vastu-griha/src/components/PlotConfig.jsx` vs workspace plot controls if the editor shell later absorbs all settings.

### Do not touch

- `apps/vastu-griha/src/components/AnalysisPanel.jsx`
- `apps/vastu-griha/src/components/Canvas.jsx`
- `apps/vastu-griha/src/components/ReportGenerator.jsx`
- `apps/vastu-griha/src/components/BanjaraBazaarShop.jsx`
- `apps/vastu-griha/src/components/AiChat.jsx`
- `apps/vastu-griha/src/stores/projectStore.js`
- `apps/vastu-griha/src/stores/canvasStore.js`
- `apps/vastu-griha/assets/*`

## 11) Dependency summary

### Runtime flow summary

- `App.jsx` is the only top-level router.
- `ProjectDashboard.jsx` is the canonical project entry surface.
- `OnboardingWizard.jsx` is the canonical guided bootstrap flow.
- `PlannerWorkspace.jsx` is the canonical runtime shell.
- `Canvas.jsx` is the canonical edit surface.
- `AnalysisPanel.jsx` is the canonical analysis engine.
- `ReportGenerator.jsx` is the canonical report/export composition layer.
- `BanjaraBazaarShop.jsx` is the canonical remedy commerce layer.
- `AiChat.jsx` is the canonical AI guidance layer.
- `AssetGallery.jsx` is the canonical asset selection / preview layer.

### Store ownership summary

- `projectStore` owns project metadata and persistence.
- `canvasStore` owns layout state and recovery.
- `uiStore` owns navigation state and global UI state.
- `historyStore` owns undo/redo memory.
- `settingsStore` owns editor settings.
- `authStore` is currently unused.

### Archive readiness summary

- The only clearly safe runtime-component removals are `AiDesigner.jsx` and `FloorPlanUpload.jsx`.
- The planner welcome branch remains a navigation risk and is not safe to move or delete in this phase.
- Asset families and canonical analysis components are not archive targets.

## 12) Final phase-2.2 checkpoint

- No runtime code changed.
- No files were moved.
- No files were renamed.
- No files were deleted.
- The ownership map is documented.

