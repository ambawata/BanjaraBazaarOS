# Migration Plan — Architecture-First Consolidation

> **Superseded:** this plan targeted the v1 `apps/vastu-griha` source tree, which was deleted (v1 was superseded by `apps/vastu-griha/v2`). The consolidation described below was never executed against v1; kept for historical record only.

Audit date: 2026-07-03

This plan intentionally stops before any architectural removal. It is meant to be reviewed and approved before code consolidation begins.

## Phase 1 — Repository audit

Status: complete

Deliverables:

- architecture inventory
- feature matrix
- duplicate report
- dependency graph
- migration plan

Approval gate:

- Confirm canonical dashboard, planner, upload, preview, and analysis paths
- Confirm which overlap is safe to archive later

## Phase 2 — Isolate archive candidates

Goal:

- Move only the file-level duplicates that are proven dead after dependency verification
- Keep behavior unchanged

Safety rule:

- After every archive move, run a build
- If the build breaks, restore the file immediately and flag it for decision

## Phase 3 — Consolidate routing

Goal:

- Keep one top-level routing tree in `App.jsx`
- Eliminate duplicate `welcome` / dashboard entry wiring
- Leave all screen-state transitions explicit and centralized

## Phase 4 — Consolidate dashboard UX

Goal:

- Make `ProjectDashboard` the single home entry point
- Keep planner workspace entry points as workspace actions only

## Phase 5 — Consolidate upload and preview surfaces

Goal:

- Ensure only one canonical upload workflow
- Keep preview surfaces distinct only when they serve different jobs

## Phase 6 — Consolidate analysis engine

Goal:

- Keep `AnalysisPanel.evaluateRoom()` as the canonical engine unless a side-by-side review says otherwise
- Do not introduce new scoring logic without explicit approval

## Phase 7 — Verify and release

Required evidence:

- build passes
- git diff is reviewed
- runtime screenshot / browser verification is captured when the environment allows it

## Open decisions still requiring approval

- Whether the planner welcome branch should be removed first or extracted into a separate archival shell
- Whether any preview surface should be merged or preserved as a separate UX
- Whether the project seed/demo data should remain in-memory or be replaced with persisted empty-state bootstrapping

