---
phase: 03-playwright-showcase-hardening
plan: "04"
subsystem: ci
tags: [ci, playwright, github-actions, chromium]
dependency_graph:
  requires: [03-01]
  provides: [HARD-05, playwright-tests-ci-job]
  affects: [.github/workflows/ci.yml]
tech_stack:
  added: []
  patterns: [github-actions-multi-job, playwright-ci-chromium-only, artifact-upload-on-failure]
key_files:
  modified:
    - .github/workflows/ci.yml
decisions:
  - "Used playwright-tests as the job name (not playwright) per PLAN.md spec"
  - "Playwright webServer block handles build+start lifecycle; no manual pnpm build step in playwright-tests job"
  - "Removed vitest placeholder stub — vitest is out of scope for Phase 3"
  - "upload-artifact runs on !cancelled() so report is available for both pass and fail"
metrics:
  duration: "2 minutes"
  completed: "2026-05-21T23:26:29Z"
  tasks_completed: 1
  tasks_total: 1
  files_modified: 1
---

# Phase 3 Plan 4: CI Playwright Job Summary

**One-liner:** Added dedicated `playwright-tests` CI job running Chromium-only Playwright suite after `quality-gate` passes, with HTML report artifact upload on failure.

## What Was Built

Extended `.github/workflows/ci.yml` from a single-job workflow to a two-job workflow:

1. **`quality-gate`** (existing, modified): Removed the Phase 2 vitest stub (the `if [ -f vitest.config.ts ]` guard with "Phase 3 wires this" echo). The job now ends cleanly after lint, typecheck, and build.

2. **`playwright-tests`** (new): Runs after `quality-gate` passes. 7 steps in order:
   - Checkout, pnpm 9 setup, Node 20 setup with pnpm cache
   - `pnpm install --frozen-lockfile`
   - `pnpm exec playwright install --with-deps chromium` (OS packages + Chromium)
   - `pnpm exec playwright test --project=chromium` with `CI: true` (webServer block auto-builds and starts the server)
   - `actions/upload-artifact@v4` uploads `playwright-report/` on `!cancelled()` with 7-day retention

## Decisions Made

| Decision | Rationale |
|----------|-----------|
| No separate `pnpm build` step in playwright-tests | `playwright.config.ts` webServer.command is `pnpm build && pnpm start`; Playwright's webServer handles the full build+start+teardown lifecycle automatically when `reuseExistingServer: false` in CI |
| `timeout-minutes: 15` | 12 spec tests with 1 worker in CI expected to complete in under 5 minutes; 15-minute ceiling leaves 3x headroom for cold starts and browser bootstrap |
| `if: ${{ !cancelled() }}` on artifact upload | Uploads on both pass and fail; skips only if the job was manually cancelled. Enables post-mortem HTML report access without requiring test failure |
| Chromium only | D-13 locked decision; Firefox and WebKit explicitly out of scope for v1 CI |

## Verification Checklist

All automated checks passed:

- [x] `playwright-tests:` job present in ci.yml
- [x] `needs: quality-gate` dependency set
- [x] `playwright install --with-deps chromium` present
- [x] `pnpm exec playwright test` command present
- [x] `upload-artifact` step present
- [x] `playwright-report` artifact path present
- [x] "Phase 3 wires this" vitest stub removed
- [x] `vitest.config.ts` conditional check removed
- [x] YAML syntax valid (python3 yaml.safe_load verification)

## Task Commits

| Task | Description | Commit |
|------|-------------|--------|
| 1 | Append playwright-tests job and remove vitest stub | c24de71 |

## Deviations from Plan

None — plan executed exactly as written. The PATTERNS.md showed a slightly different structure (job named `playwright` with a separate `pnpm build` step), but the PLAN.md's explicit directives took precedence: job named `playwright-tests`, no manual build step (webServer handles it).

## First CI Run Outcome

The CI run outcome will be known after the worktree is merged to main and pushed. The GitHub Actions UI will show two distinct jobs: `quality-gate` and `playwright-tests`. The Playwright suite result depends on whether plans 03-01 through 03-03 assertions align with the current site state.

## Known Stubs

None — this plan modifies only the CI workflow YAML. No UI components, no data stubs.

## Threat Flags

None — no new network endpoints, auth paths, or schema changes introduced. The CI job uses the default read-only GITHUB_TOKEN (T-03-CIToken accepted in threat model).

## Self-Check: PASSED

- `.github/workflows/ci.yml` exists and contains `playwright-tests:` job
- Commit `c24de71` exists in git log
- No file deletions in commit
