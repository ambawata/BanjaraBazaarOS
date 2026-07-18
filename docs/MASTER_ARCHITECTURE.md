# Master Architecture Audit — Vastu Griha

> **Superseded:** this audit describes the v1 `apps/vastu-griha` source tree, which was deleted (v1 was superseded by `apps/vastu-griha/v2`). Paths below no longer exist; kept for historical record only.

Audit date: 2026-07-03

Scope: `apps/vastu-griha`

## What is the current source of truth?

The app currently has one source tree for application code under `apps/vastu-griha/src`. The runtime build output still exists in `apps/vastu-griha/dist` after a build, but it is not the source of truth.

## Top-level architecture

| Layer | Canonical files | Notes |
|---|---|---|
| App router | `apps/vastu-griha/src/App.jsx` | Chooses between dashboard, onboarding wizard, and planner workspace from `screenState`. |
| Global UI state | `apps/vastu-griha/src/stores/uiStore.js` | Stores `screenState`, `activeTab`, theme, modal flags, and mobile detection. |
| Project persistence | `apps/vastu-griha/src/stores/projectStore.js` | Loads/saves projects via `localStorage` key `vg-projects-list`. Also seeds demo projects in memory. |
| Canvas persistence | `apps/vastu-griha/src/stores/canvasStore.js` | Autosaves layout data to `localStorage` key `vg-layout-project`. |
| Dashboard | `apps/vastu-griha/src/features/dashboard/ProjectDashboard.jsx` | Project manager / home screen entry point. |
| Onboarding | `apps/vastu-griha/src/features/onboarding/OnboardingWizard.jsx` | Step-based layout generation flow that ends in the workspace. |
| Planner workspace | `apps/vastu-griha/src/features/planner/PlannerWorkspace.jsx` | Main canvas/editor workspace, with tabs for design, upload, analysis, shop, reports, and assets. |
| Analysis engine | `apps/vastu-griha/src/components/AnalysisPanel.jsx` | Canonical room-evaluation logic via `VASTU_RULES` and `evaluateRoom()`. |

## Inventory summary

Counts below are file-level counts from the current `src` tree.

| Category | Count | What was counted |
|---|---:|---|
| React component modules | 15 | Exported React component files in `src` |
| Routes | 3 | Top-level render branches in `App.jsx` |
| Screen states | 10 | Unique `screenState` values used in the app |
| Zustand stores | 6 | Files in `src/stores` |
| Custom hooks | 0 | No dedicated custom hook files under `src` |
| Utility modules | 10 | Helper modules under `src/lib` plus `AssetLoader.js` |
| Confirmed duplicate flow clusters | 4 | Home/welcome, planner setup, upload entry, preview surfaces |
| Confirmed archive candidates | 0 | No whole file is currently safe to archive without a later extraction step |

## Screen-state inventory

The app currently uses these `screenState` values:

- `welcome`
- `dashboard`
- `workspace`
- `step_prop`
- `step_size`
- `step_shape`
- `step_preferences`
- `step_summary`
- `designing`
- `preview`

## Data flow

1. `ProjectDashboard` calls `loadProjects()` on mount.
2. `projectStore.loadProjects()` reads `localStorage["vg-projects-list"]`.
3. If present, that list replaces the in-memory project array.
4. If absent, the store keeps its initial seeded demo projects.
5. `canvasStore` separately restores and autosaves the current layout in `localStorage["vg-layout-project"]`.
6. The analysis UI reads the canonical rule engine from `AnalysisPanel`.

## Evidence

- `apps/vastu-griha/src/App.jsx:28-45`
- `apps/vastu-griha/src/stores/uiStore.js:4-5`
- `apps/vastu-griha/src/stores/projectStore.js:1-156`
- `apps/vastu-griha/src/stores/canvasStore.js:1-159`
- `apps/vastu-griha/src/components/AnalysisPanel.jsx:3, 296-346`

