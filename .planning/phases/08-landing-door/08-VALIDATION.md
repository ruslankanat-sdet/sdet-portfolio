---
phase: 8
slug: landing-door
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-05-27
---

# Phase 8 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 4.1.7 (unit) + Playwright 1.60.0 (E2E) |
| **Config file** | `vitest.config.ts` (unit), `playwright.config.ts` (E2E) |
| **Quick run command** | `pnpm vitest run src/components/door` |
| **Full suite command** | `pnpm vitest run && pnpm playwright test` |
| **Estimated runtime** | ~20 seconds (unit: ~5s, E2E: ~15s) |

---

## Sampling Rate

- **After every task commit:** Run `pnpm vitest run src/components/door`
- **After every plan wave:** Run `pnpm vitest run && pnpm playwright test`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 20 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 08-01-01 | 01 | 1 | DOOR-01 | — | N/A | unit | `pnpm vitest run src/components/door` | ❌ W0 | ⬜ pending |
| 08-01-02 | 01 | 1 | DOOR-01 | — | N/A | unit | same | ❌ W0 | ⬜ pending |
| 08-01-03 | 01 | 1 | DOOR-02 | — | localStorage write is gated behind enum check | unit | same | ❌ W0 | ⬜ pending |
| 08-02-01 | 02 | 2 | DOOR-01 | — | N/A | e2e | `pnpm playwright test e2e/landing.spec.ts` | ❌ W0 | ⬜ pending |
| 08-02-02 | 02 | 2 | DOOR-03 | — | N/A | e2e | same | ❌ W0 | ⬜ pending |
| 08-02-03 | 02 | 2 | DOOR-04 | — | N/A | e2e | same | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `src/components/door/__tests__/DoorScreen.test.tsx` — unit tests for DOOR-01, DOOR-02 (render, click, keyboard)
- [ ] `e2e/landing.spec.ts` door-specific tests — DOOR-01 E2E (door at `/` with no localStorage), DOOR-03 (return visitor bypass), DOOR-04 (`?reset` clears mode)
- [ ] Update `e2e/landing.spec.ts`, `e2e/navigation.spec.ts`, `e2e/ide-interactions.spec.ts` — add `page.addInitScript(() => localStorage.setItem('resume-mode', 'ide'))` to all `goto('/')` tests that expect IDE chrome (9 tests across 3 files)

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| flex-grow hover animation smooth on desktop | DOOR-01 | Visual — not assertable in unit/E2E | Open `http://localhost:3000` in Chrome and Safari; hover over each door half; confirm smooth expansion/contraction |
| Door stacks vertically on ≤760px mobile | DOOR-01 | Viewport-dependent — Playwright can check but layout assertion is brittle | Open devtools, set 375px width; confirm halves stack vertically with correct padding |
| `prefers-reduced-motion` disables animation | DOOR-01 | OS-level setting | Enable reduce motion in System Preferences/Accessibility; confirm door shows correctly without animation |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 20s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
