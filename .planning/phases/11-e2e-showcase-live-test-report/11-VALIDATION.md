---
phase: 11
slug: e2e-showcase-live-test-report
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-06-01
---

# Phase 11 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Playwright 1.60 + Vitest 4.x |
| **Config file** | `playwright.config.ts` / `vitest.config.ts` |
| **Quick run command** | `pnpm test` |
| **Full suite command** | `pnpm exec playwright test --project=chromium` |
| **Estimated runtime** | ~15s (unit) / ~60s (E2E) |

---

## Sampling Rate

- **After every task commit:** Run `pnpm typecheck && pnpm test`
- **After every plan wave:** Run `pnpm exec playwright test --project=chromium`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 30 seconds (unit), 90 seconds (E2E)

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 11-01-01 | 01 | 1 | E2E-01, E2E-02 | — | N/A | unit + E2E | `pnpm test && pnpm exec playwright test e2e/ide-interactions.spec.ts --project=chromium` | ✅ | ⬜ pending |
| 11-01-02 | 01 | 1 | E2E-01 | — | N/A | unit + E2E | `pnpm test && pnpm exec playwright test e2e/ide-interactions.spec.ts --project=chromium` | ✅ | ⬜ pending |
| 11-01-03 | 01 | 1 | E2E-01, E2E-02 | — | N/A | E2E | `pnpm exec playwright test e2e/ide-interactions.spec.ts --project=chromium` | ✅ | ⬜ pending |
| 11-02-01 | 02 | 1 | RUN-01, RUN-02 | T-11-04 | No dangerouslySetInnerHTML; rel="noopener noreferrer" on anchor | unit | `pnpm typecheck && pnpm test` | ✅ | ⬜ pending |
| 11-02-02 | 02 | 1 | RUN-01, RUN-02 | T-11-02, T-11-03 | run_id validated with /^\d+$/; route returns only {jobs, run_started_at, updated_at} | unit | `pnpm typecheck && pnpm test` | ✅ | ⬜ pending |
| 11-02-03 | 02 | 1 | RUN-01, RUN-02 | — | buildLogEntries is pure — testable without live CI | unit | `pnpm test` | ❌ W0 | ⬜ pending |
| 11-03-01 | 03 | 3 | RPT-01 | — | N/A | unit | `pnpm typecheck` | ✅ | ⬜ pending |
| 11-03-02 | 03 | 3 | RPT-01 | — | N/A | CI | Push triggers deploy-report job | ✅ | ⬜ pending |
| 11-03-CP | 03 | 3 | RPT-01 | — | N/A | manual | GitHub Pages Settings check | N/A | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `src/components/ide/__tests__/buildLogEntries.test.ts` — unit tests for `buildLogEntries()` covering: queued state (emits '⏳ Queued:' info entries), in_progress state (emits '▶ Running:' info entries), all-complete state (emits 'Jobs: N/N passed · Xs' summary and 'View Report →' link entry when failed=0), all-failed state (emits 'Jobs: 0/N passed' summary, no link entry). Mock `GitHubJobsPayload` data — no live CI call needed. RUN-01 and RUN-02.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Terminal streams queued→running→complete on live CI dispatch | RUN-01 | Requires live GitHub Actions workflow_dispatch; cannot mock CI polling loop in Playwright | Click "Run Smoke Test" in IDE; observe terminal messages for each phase |
| "Jobs: N/N passed · Xs" shown with real duration | RUN-02 | Duration computed from live run timestamps | On CI completion, verify summary line shows wall-clock time |
| "View Report →" opens Playwright HTML report | RPT-01 | GitHub Pages deployment requires a live CI push | After enabling Pages + pushing, click link and verify HTML report opens |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references (11-02-03 → buildLogEntries.test.ts)
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s (unit), 90s (E2E)
- [ ] `nyquist_compliant: true` set in frontmatter when sign-off complete

**Approval:** pending
