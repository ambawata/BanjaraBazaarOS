# Feature Matrix — Vastu Griha

Audit date: 2026-07-03

This matrix maps the current visible features to the files that own them.

| Feature | Canonical file(s) | Notes |
|---|---|---|
| Project dashboard / landing | `apps/vastu-griha/src/features/dashboard/ProjectDashboard.jsx` | Main project manager view; also the `welcome`/`dashboard` destination in `App.jsx`. |
| Onboarding wizard | `apps/vastu-griha/src/features/onboarding/OnboardingWizard.jsx` | Step-by-step plot setup and room generation. |
| Planner workspace | `apps/vastu-griha/src/features/planner/PlannerWorkspace.jsx` | Main editor, canvas, upload, analysis, shop, reports, and assets tabs. |
| Canvas editing | `apps/vastu-griha/src/components/Canvas.jsx` | Renders and mutates room layout state. |
| Room analysis | `apps/vastu-griha/src/components/AnalysisPanel.jsx` | Canonical scoring / rule evaluation. |
| AI chat | `apps/vastu-griha/src/components/AiChat.jsx` | Uses `VASTU_RULES` for guidance. |
| Reports | `apps/vastu-griha/src/components/ReportGenerator.jsx` | Uses canonical evaluation output. |
| Shop / remedies | `apps/vastu-griha/src/components/BanjaraBazaarShop.jsx` | Consumes analysis output and suggestions. |
| Asset browser | `apps/vastu-griha/src/components/AssetGallery.jsx` | Includes room preview and placement checks. |
| Floor-plan upload | `apps/vastu-griha/src/components/FloorPlanUpload.jsx` | Upload panel reused by the workspace upload UI. |
| Plot configuration | `apps/vastu-griha/src/components/PlotConfig.jsx` | Plot dimension / orientation controls. |
| Boundary drawing | `apps/vastu-griha/src/components/PlotBoundaryDrawer.jsx` | Manual polygon drawing support. |
| Compass / orientation | `apps/vastu-griha/src/components/Compass.jsx` | Direction / tilt rendering. |

## Entry-point matrix

| Entry point | What it opens |
|---|---|
| `screenState === 'welcome'` | `ProjectDashboard` |
| `screenState === 'dashboard'` | `ProjectDashboard` |
| Wizard states (`step_prop`, `step_size`, `step_shape`, `step_preferences`, `step_summary`, `designing`, `preview`) | `OnboardingWizard` |
| Any other `screenState` | `PlannerWorkspace` |

## Persistence matrix

| Storage key | Owner | Purpose |
|---|---|---|
| `vg-projects-list` | `projectStore` | Persist project list. |
| `vg-layout-project` | `canvasStore` and `ProjectDashboard` | Persist current layout snapshot. |
| `vg-theme` | `uiStore` | Persist theme choice. |
| `vg-dismiss-tip` | `PlannerWorkspace` | Persist a dismissed tip flag. |
| `vastu_favorites` | `AssetGallery` | Persist favorites. |
| `vastu_recently_used` | `AssetGallery` | Persist recent assets. |

## Feature notes

- `ProjectDashboard` is the only place that loads the project list from localStorage at startup.
- `OnboardingWizard` is a generator flow, not a separate project persistence layer.
- `PlannerWorkspace` is the canonical editing surface, even though it still contains its own home/welcome branch.

