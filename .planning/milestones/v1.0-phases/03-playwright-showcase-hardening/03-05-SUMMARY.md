---
phase: 03-playwright-showcase-hardening
plan: "05"
subsystem: ide-shell / github-actions-integration
tags:
  - api-routes
  - github-actions
  - polling
  - security
dependency_graph:
  requires:
    - 03-04
  provides:
    - real-ci-trigger-from-ide
    - github-actions-status-polling
  affects:
    - src/components/ide/IDEShell.tsx
    - src/app/api/run-tests/route.ts
    - src/app/api/run-status/[run_id]/route.ts
tech_stack:
  added: []
  patterns:
    - recursive-setTimout-polling
    - next15-dynamic-route-params-promise
    - server-side-token-proxy
key_files:
  created:
    - src/app/api/run-tests/route.ts
    - src/app/api/run-status/[run_id]/route.ts
  modified:
    - src/components/ide/IDEShell.tsx
decisions:
  - "Run-status route uses dynamic segment [run_id] with positive-integer regex validation before GitHub URL interpolation (T-03-INJECT)"
  - "No rate limiting on run-tests in v1 — Upstash Redis cut from scope; acceptable for low-traffic portfolio (T-03-DOS accepted)"
  - "buildLogEntries kept module-scoped in IDEShell.tsx rather than extracted — single use-site, no benefit to splitting"
  - "First poll fires 5s after dispatch (not immediately) to allow GitHub Actions to register the new run"
metrics:
  duration_minutes: 25
  completed_date: "2026-05-22"
  tasks_completed: 3
  tasks_total: 3
  files_changed: 3
---

# Phase 03 Plan 05: Real GitHub Actions CI Trigger and Polling Summary

Real-time GitHub Actions workflow_dispatch trigger wired into the IDEShell Run Smoke Test button, with 5-second polling of job status surfaced as LogEntry rows in the terminal pane; GITHUB_TOKEN kept server-side throughout via two new Node-runtime API routes.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Create /api/run-tests route handler | `674f19e` (pre-existing) | `src/app/api/run-tests/route.ts` |
| 2 | Create /api/run-status/[run_id] dynamic route | `b197eff` | `src/app/api/run-status/[run_id]/route.ts` |
| 3 | Refactor runSmoke in IDEShell.tsx | `0e8313d` | `src/components/ide/IDEShell.tsx` |

## What Was Built

### Task 1 — /api/run-tests (POST)

Node-runtime route handler that:
- Guards GITHUB_TOKEN, GH_OWNER, GH_REPO — returns HTTP 503 with `CI trigger not configured` if any are missing
- POSTs to `https://api.github.com/repos/{owner}/{repo}/actions/workflows/ci.yml/dispatches` with `return_run_details: true` to get `workflow_run_id` directly in the response (no race-condition polling for the run ID)
- Returns `{ runId, url }` — token never in response body (T-03-01 mitigated)
- Comments inline documenting the deferred rate-limiting gap (T-03-DOS accepted)

### Task 2 — /api/run-status/[run_id] (GET)

Dynamic Next.js App Router route (`[run_id]` segment) that:
- Awaits `context.params` as a Promise (Next.js 15 requirement)
- Validates `run_id` with `/^\d+$/` before interpolating into the GitHub URL (T-03-INJECT mitigated)
- Returns HTTP 400 for non-integer run_id values
- Proxies `GET /repos/{owner}/{repo}/actions/runs/{run_id}/jobs` to the caller — pure pass-through, token server-side only

### Task 3 — IDEShell.tsx runSmoke refactor

Two changes scoped to the runSmoke callback and a new module-scoped helper:

**`buildLogEntries(data)`** maps GitHub job/step status to LogEntry kinds:
- `in_progress` → `kind: 'info'` with `> Running: {name}` (per Pitfall 6 — no `running` LogKind)
- `completed/success` → `kind: 'pass'`
- `completed/failure` → `kind: 'fail'` (with per-step failure rows appended)
- `completed/cancelled` → `kind: 'warn'`
- `queued` → `kind: 'info'` with `[queued]` prefix
- All-complete summary row: `kind: 'ok'` or `kind: 'fail'` with pass/fail/total counts

**`runSmoke`** (now async):
1. POSTs to `/api/run-tests`, surfaces 503 as a `warn` row rather than crashing
2. Appends two `info` rows: run ID queued + GitHub URL
3. Starts recursive `setTimeout(poll, 5000)` — not `setInterval`, prevents overlapping calls
4. Each poll calls `/api/run-status/${runId}`, replaces the full log list with `buildLogEntries()` output
5. Stops when all jobs have `status === 'completed'`; any fetch error surfaces as a `fail` row and halts polling

All surrounding state, the keyboard shortcut effect (Cmd/Ctrl+Enter), and the initial `SAMPLE_LOGS.slice(0, 8)` static paint (D-10) are preserved unchanged.

## Deviations from Plan

None — plan executed exactly as written. The `LogKind` type import was added to IDEShell.tsx alongside the existing type imports; this was an oversight in the original file (it used `LogKind` indirectly through `LogEntry` but never needed it explicitly before), not a plan deviation.

## Security

| Threat | Mitigation | Status |
|--------|-----------|--------|
| T-03-01: GITHUB_TOKEN disclosure | Token read only in Node route handlers; response returns only numeric runId and public html_url | Mitigated |
| T-03-INJECT: run_id path injection | `/^\d+$/` regex validation before URL interpolation; returns 400 on failure | Mitigated |
| T-03-DOS: button spam | No rate limiting in v1 (Upstash Redis deferred); commented in source | Accepted |

## Known Stubs

None. The run-tests and run-status routes require live GITHUB_TOKEN, GH_OWNER, GH_REPO environment variables set in Vercel. Without them the UI shows an explanatory warn row — this is intentional graceful degradation, not a stub.

## User Setup Required

The following env vars must be added to the Vercel project before this plan's outcome works in production:

| Variable | Source | Scope |
|----------|--------|-------|
| `GITHUB_TOKEN` | GitHub → Settings → Developer Settings → Fine-grained tokens; Actions Read+Write on sdet-portfolio only. Mark as Sensitive. | Production |
| `GH_OWNER` | Literal `ruslankanat-sdet` | Production |
| `GH_REPO` | Literal `sdet-portfolio` | Production |

## Threat Flags

None — no new network endpoints, auth paths, or schema changes beyond what the plan's threat model covers.

## Self-Check: PASSED

- FOUND: `src/app/api/run-tests/route.ts`
- FOUND: `src/app/api/run-status/[run_id]/route.ts`
- FOUND: `src/components/ide/IDEShell.tsx`
- FOUND: `.planning/phases/03-playwright-showcase-hardening/03-05-SUMMARY.md`
- FOUND commit `674f19e` (task 1 — /api/run-tests)
- FOUND commit `b197eff` (task 2 — /api/run-status/[run_id])
- FOUND commit `0e8313d` (task 3 — IDEShell runSmoke refactor)
