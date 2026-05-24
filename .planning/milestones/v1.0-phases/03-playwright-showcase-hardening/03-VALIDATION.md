---
phase: 3
slug: playwright-showcase-hardening
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-05-21
---

# Phase 3 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Playwright 1.60.0 + @axe-core/playwright 4.11.3 |
| **Config file** | `playwright.config.ts` (root — Wave 0 installs) |
| **Quick run command** | `pnpm exec playwright test --project=chromium --grep @smoke` |
| **Full suite command** | `pnpm exec playwright test --project=chromium` |
| **Estimated runtime** | ~30 seconds |

---

## Sampling Rate

- **After every task commit:** Run `pnpm exec playwright test --project=chromium`
- **After every plan wave:** Full suite green
- **Before `/gsd:verify-work`:** Full suite green + CI job green
- **Max feedback latency:** 30 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------------|-----------|-------------------|-------------|--------|
| 3-01-01 | 01 | 1 | SHOW-01 | N/A | e2e | `pnpm exec playwright test e2e/landing.spec.ts` | ❌ W0 | ⬜ pending |
| 3-01-02 | 01 | 1 | SHOW-01 | N/A | e2e | `pnpm exec playwright test e2e/navigation.spec.ts` | ❌ W0 | ⬜ pending |
| 3-01-03 | 01 | 1 | SHOW-01 | N/A | e2e | `pnpm exec playwright test e2e/about.spec.ts` | ❌ W0 | ⬜ pending |
| 3-01-04 | 01 | 1 | SHOW-01, SHOW-02 | N/A | e2e | `pnpm exec playwright test e2e/ide-interactions.spec.ts` | ❌ W0 | ⬜ pending |
| 3-01-05 | 01 | 1 | HARD-01 | WCAG AA zero violations | e2e (axe) | `pnpm exec playwright test --grep WCAG` | ❌ W0 | ⬜ pending |
| 3-02-01 | 02 | 1 | HARD-03 | No user input rendered | e2e | `pnpm exec playwright test e2e/landing.spec.ts --grep og` | ❌ W0 | ⬜ pending |
| 3-02-02 | 02 | 1 | HARD-04 | N/A | e2e | `curl -s http://localhost:3000/robots.txt` | ❌ W0 | ⬜ pending |
| 3-03-01 | 03 | 2 | SHOW-02 | N/A | e2e | `pnpm exec playwright test e2e/ide-interactions.spec.ts` | ❌ W0 | ⬜ pending |
| 3-04-01 | 04 | 2 | HARD-05 | N/A | CI gate | GitHub Actions (automatic) | ❌ W0 | ⬜ pending |
| 3-05-01 | 05 | 3 | SHOW-03 | GITHUB_TOKEN never client-side | manual | Inspect devtools Network tab | — | ⬜ pending |
| 3-06-01 | 06 | 3 | HARD-01, HARD-02 | N/A | manual | Vercel Speed Insights post-deploy | — | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `playwright.config.ts` — must exist before any spec can run
- [ ] `e2e/landing.spec.ts` — SHOW-01, HARD-01, HARD-03, HARD-04
- [ ] `e2e/navigation.spec.ts` — SHOW-01 nav flows
- [ ] `e2e/about.spec.ts` — SHOW-01 about render, HARD-01
- [ ] `e2e/ide-interactions.spec.ts` — SHOW-01 file-click, SHOW-02 sidebar
- [ ] `pnpm add -D @playwright/test @axe-core/playwright && pnpm exec playwright install --with-deps chromium`

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| GITHUB_TOKEN never exposed client-side | SHOW-03 | Runtime env var check | DevTools Network tab: no Authorization header in client requests |
| LCP < 2s on 4G | HARD-02 | Vercel Speed Insights post-deploy | Deploy → Speed Insights dashboard → Landing page LCP |
| CI Playwright job green | HARD-05 | GitHub Actions gate | Push to main → Actions tab → playwright-tests job green |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
