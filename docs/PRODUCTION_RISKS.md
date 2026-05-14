# BanjaraBazaarOS Production Risks Tracker

## Purpose
This tracker identifies production risks, mitigation actions, and safe workflows for deployment, scaling, AI usage, and Git management.

## Risk Categories

### 1. Auth and session security
- Risk: weak password handling, stale refresh tokens, session hijacking.
- Mitigation:
  - enforce strong password policy with `auth.password_min_length`.
  - store only hashed tokens in `sessions`.
  - use `auth_audit_log` to audit suspicious activity.
  - expire sessions and refresh tokens cleanly.

### 2. Database and schema changes
- Risk: direct production schema edits, migration drift, data loss.
- Mitigation:
  - treat `/database/schema.sql` as a single source of truth.
  - use migration scripts for any schema evolution.
  - back up the database before deploys.
  - keep `SET FOREIGN_KEY_CHECKS` controlled and use idempotent seed SQL.

### 3. Vendor onboarding and approval flow
- Risk: unauthorized vendor activation, incomplete onboarding data, misconfigured vendor permissions.
- Mitigation:
  - require manual approval if `vendor.approval_required` is enabled.
  - keep vendor statuses explicit: `pending`, `active`, `rejected`, `suspended`.
  - capture approval/rejection reasons and audit actions.

### 4. Role and permission management
- Risk: privilege escalation or incorrect permission grants.
- Mitigation:
  - seed immutable system roles.
  - keep destructive rights restricted to `master_admin`.
  - manage permissions through `roles`, `permissions`, and `role_permissions` tables.

### 5. Operational stability
- Risk: unmonitored deployments, broken API surface, missing health checks.
- Mitigation:
  - use `/api/v1/health` endpoint for readiness checks.
  - deploy backend and frontend separately with verification steps.
  - review logs in `storage/logs` and audit events in `auth_audit_log` and `vendor_audit_log`.

## Deployment Workflow
1. Branch from main for any change.
2. Validate locally and run existing tests or quality checks.
3. Create or update documentation for the change.
4. Apply schema changes through migration tooling, not raw prod edits.
5. Deploy backend code first, then run DB migrations, then deploy frontend assets.
6. Confirm deployment with `/api/v1/health` and smoke tests.
7. Keep rollback steps ready: revert code, restore backup, redeploy stable state.

## Scaling Stages and Risk Focus
### Stage 0: Prototype
- Focus: correctness, architecture, API stability.
- Risks: incomplete auth flows, missing audit coverage.
- Actions: keep changes small and review docs.

### Stage 1: Early production
- Focus: vendor onboarding, basic marketplace operations.
- Risks: role misconfiguration, onboarding abuse, manual process gaps.
- Actions: harden approval workflows and log decisions.

### Stage 2: Growth
- Focus: catalog browsing, inventory, order workflow.
- Risks: performance bottlenecks, query scaling, user concurrency.
- Actions: add caching, optimize DB indexes, improve monitoring.

### Stage 3: Marketplace maturity
- Focus: high-throughput commerce, resilience, multi-vendor scale.
- Risks: operational outages, data integrity, rollout failures.
- Actions: use staging, gradual rollout, alerting, and backup automation.

## AI Workflow Rules
- Use AI only to generate or refine documentation and planning content.
- Do not permit AI to directly change backend logic or API contracts without human approval.
- Clearly label AI-generated drafts and verify them against the current codebase.
- Keep AI contributions documented in `/docs` or issue trackers.
- Use AI as an assistant for summarization, not as an authoritative source without review.

## Git Safety Workflow
- Use feature branches for every change.
- Open PRs or merge requests for review before merging to main.
- Keep commit history clean and avoid large unrelated changes in one commit.
- Use clear commit messages and include references to docs or issue IDs when applicable.
- Protect the `main` branch and require at least one review before merge.
- Document any schema or API contract change before merge.
