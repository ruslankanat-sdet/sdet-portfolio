---
phase: 9
slug: recruiter-view
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-05-28
---

# Phase 9 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 2 (unit) + Playwright 1.60.0 (E2E) |
| **Config file** | `vitest.config.ts` (unit) · `playwright.config.ts` (E2E) |
| **Quick run command** | `pnpm test` |
| **Full suite command** | `pnpm ci-check` |
| **Estimated runtime** | ~10s (unit) · ~30s (E2E) |

---

## Sampling Rate

- **After every task commit:** Run `pnpm test`
- **After every plan wave:** Run `pnpm exec playwright test`
- **Before `/gsd:verify-work`:** Full suite (`pnpm ci-check`) must be green
- **Max feedback latency:** ~10 seconds (unit)

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 9-01-01 | 01 | 1 | REC-01 | — | No dangerouslySetInnerHTML; rel=noopener on external links | unit | `pnpm test -- Masthead` | ❌ W0 | ⬜ pending |
| 9-01-02 | 01 | 1 | REC-02 | — | window.print() only; no server call | unit | `pnpm test -- Hero` | ❌ W0 | ⬜ pending |
| 9-01-03 | 01 | 1 | REC-03 | — | Static hardcoded content only | unit | `pnpm test -- Metrics` | ❌ W0 | ⬜ pending |
| 9-01-04 | 01 | 1 | REC-04 | — | Static hardcoded content only | unit | `pnpm test -- RecruiterView` | ❌ W0 | ⬜ pending |
| 9-02-01 | 02 | 1 | REC-05 | — | Static hardcoded content only | unit | `pnpm test -- Timeline` | ❌ W0 | ⬜ pending |
| 9-02-02 | 02 | 1 | REC-06 | — | Static hardcoded content only | unit | `pnpm test -- RecruiterView` | ❌ W0 | ⬜ pending |
| 9-02-03 | 02 | 1 | REC-07 | — | Static hardcoded content only | unit | `pnpm test -- AvailabilityCard` | ❌ W0 | ⬜ pending |
| 9-02-04 | 02 | 1 | REC-08 | — | rel=noopener on GitHub/LinkedIn links | unit | `pnpm test -- RecruiterFooter` | ❌ W0 | ⬜ pending |
| 9-03-01 | 03 | 2 | REC-10 | — | No overflow at 375px viewport | E2E | `pnpm exec playwright test recruiter` | ❌ W0 | ⬜ pending |
| 9-03-02 | 03 | 2 | REC-01–08 | — | Full recruiter view visible in browser | E2E | `pnpm exec playwright test recruiter` | ❌ W0 | ⬜ pending |
| 9-03-03 | 03 | 2 | DOOR-03 | — | Recruiter door click shows real content | E2E (update) | `pnpm exec playwright test landing` | ✅ update | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `src/components/recruiter/__tests__/RecruiterView.test.tsx` — render stubs for REC-01 through REC-08 component assertions
- [ ] `e2e/recruiter.spec.ts` — E2E spec with localStorage pre-seed for REC-01–08, REC-10

*Existing test infrastructure (Vitest + Playwright) is fully set up from Phase 6 — no new framework install required.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Print layout fits A4 without overflow | REC-09 (Phase 10) | window.print() output requires visual inspection | Open recruiter view in browser, Ctrl+P, verify one-page layout |
| Sticky masthead visible on scroll | REC-01 | CSS sticky position behavior | Scroll recruiter view in browser; confirm masthead stays visible at top |
| avail-pulse animation runs | REC-02 | CSS animation visual check | Confirm green availability dot pulses on page load |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 10s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
