# Duplicate Report — Vastu Griha

Audit date: 2026-07-03

This report lists the duplicate or overlapping flows found in the current source tree. I have separated confirmed duplicates from areas that look similar but are not yet safe to archive.

## Confirmed duplicate / overlapping flow clusters

| Category | Canonical file | Duplicate file / flow | Why it is considered duplicate | Proposed archive location | Risk of removal |
|---|---|---|---|---|---|
| Welcome / home flow | `apps/vastu-griha/src/features/dashboard/ProjectDashboard.jsx` | `apps/vastu-griha/src/features/planner/PlannerWorkspace.jsx` (`screenState === 'welcome'`) | Two separate home-entry paths exist. `App.jsx` already routes `welcome` to `ProjectDashboard`, but `PlannerWorkspace` still contains its own welcome render branch and mobile Home button. | Inline branch removal first; if extracted later, `archive/features/planner/welcome-branch/` | Medium-high: mobile Home transitions can still point at the old state. |
| Dashboard-like landing | `apps/vastu-griha/src/features/dashboard/ProjectDashboard.jsx` | `apps/vastu-griha/src/features/planner/PlannerWorkspace.jsx` welcome branch | Both present a “start here / home” experience. One is the project manager; the other is a duplicated home screen living inside the planner. | Inline branch removal first; if extracted later, `archive/features/planner/home-landing/` | Medium: user-facing navigation regressions if any old `welcome` state remains. |
| Planner setup flow | `apps/vastu-griha/src/features/onboarding/OnboardingWizard.jsx` | `apps/vastu-griha/src/features/planner/PlannerWorkspace.jsx` home/dashboard cards | The wizard generates layout state and then routes into the planner; the planner home also offers “upload / draw / audit” entry cards. They overlap in “start planning” intent. | Not archive-safe yet; keep as distinct flows until a later extraction decision. | Medium: these are related but not identical workflows. |
| Upload entry flow | `apps/vastu-griha/src/features/dashboard/ProjectDashboard.jsx` quick route to upload | `apps/vastu-griha/src/features/planner/PlannerWorkspace.jsx` upload tab / upload panel | Both enter the same upload workflow. The dashboard is only a launcher; the workspace owns the actual editor. | `archive/entrypoints/dashboard-upload-card/` if extracted later | Low-medium: launcher removal is safe only if an equivalent launcher remains. |
| Preview surfaces | `apps/vastu-griha/src/components/Canvas.jsx` and `apps/vastu-griha/src/features/dashboard/ProjectDashboard.jsx` mini previews | `apps/vastu-griha/src/components/AssetGallery.jsx` room preview modal | Multiple preview surfaces exist, but they do different jobs (layout thumbnail, room preview, editor rendering). No single safe archive target yet. | Not archive-safe yet | Low: these are overlapping UX surfaces, not a direct code duplicate. |

## Analysis implementation

| Status | Canonical file | Duplicate file | Notes |
|---|---|---|---|
| Single implementation only | `apps/vastu-griha/src/components/AnalysisPanel.jsx` | None found | `Canvas.jsx`, `ReportGenerator.jsx`, and `AiChat.jsx` all import the same engine (`evaluateRoom` / `VASTU_RULES`). I did not find a second analysis engine in the current tree. |

## Explicit non-findings

- No `MobileAppContainer.jsx` exists in the current source tree.
- No `getVastuRoomAnalysis` implementation exists in the current source tree.
- No separate preview or dashboard component file is ready to archive yet; the overlap is mostly inline state-routing and entry-point duplication.

## Evidence

- `apps/vastu-griha/src/App.jsx:35-45`
- `apps/vastu-griha/src/features/dashboard/ProjectDashboard.jsx:43-46, 217-218, 337-349`
- `apps/vastu-griha/src/features/planner/PlannerWorkspace.jsx:289-290, 570-585, 611-645`
- `apps/vastu-griha/src/features/onboarding/OnboardingWizard.jsx:57, 105-108, 548-558`
- `apps/vastu-griha/src/components/AnalysisPanel.jsx:3, 296-346`
- `apps/vastu-griha/src/components/Canvas.jsx:2, 331`
- `apps/vastu-griha/src/components/ReportGenerator.jsx:2, 7`
- `apps/vastu-griha/src/components/AiChat.jsx:2, 93`

