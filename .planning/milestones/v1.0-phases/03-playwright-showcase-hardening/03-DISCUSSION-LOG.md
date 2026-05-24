# Phase 3: Playwright Showcase + Hardening — Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-21
**Phase:** 03-playwright-showcase-hardening
**Areas discussed:** IDE test file display

---

## IDE Test File Display

### What gets shown in the sidebar?

| Option | Description | Selected |
|--------|-------------|----------|
| All .spec.ts files + playwright.config.ts | Shows all test files and config — most complete view | ✓ |
| Just .spec.ts test files | Cleaner sidebar, visitor focuses on tests only | |
| You decide | Leave to planner | |

**User's choice:** All `.spec.ts` files + `playwright.config.ts`
**Notes:** User wants visitors to see the full test setup, not just individual test files.

---

### Test execution mechanism

| Option | Description | Selected |
|--------|-------------|----------|
| Show results in terminal pane | Real execution results streamed to terminal pane | ✓ |
| Link to CI run | Terminal shows last CI run results, no live execution | |
| Simulated / pre-recorded run | Static LogEntry rows played back, zero infra | |

**User's choice:** Show results in the terminal pane (real execution)
**Notes:** User explicitly wants tests to execute for real within the site experience.

---

### Execution backend

| Option | Description | Selected |
|--------|-------------|----------|
| GitHub Actions trigger | API route triggers workflow_dispatch, polls results into terminal pane | ✓ |
| Pre-generated at build time | Playwright runs during build, output saved as JSON | |
| Simulated run | Static scripted LogEntry rows | |

**User's choice:** GitHub Actions trigger
**Notes:** GITHUB_TOKEN needed in Vercel env vars. Most SDET-credible approach — tests run for real in CI, results are real.

---

### Test file location and sidebar folder

| Option | Description | Selected |
|--------|-------------|----------|
| e2e/ at repo root, shown as tests/ in sidebar | Playwright convention + clean sidebar label | ✓ |
| src/tests/ in src dir | Tidier monorepo but less conventional | |
| You decide | Leave to planner | |

**User's choice:** `e2e/` at repo root, displayed as `tests/` folder in sidebar

---

## Claude's Discretion

- Exact Playwright job placement in ci.yml
- Polling UX details (spinner, LogEntry styling for in-progress states)
- Whether axe-core accessibility check lives in each spec or a shared helper
- playwright.config.ts configuration details
- OG image design (colors, layout)
- robots.txt / sitemap.xml content
- LCP verification approach (Vercel Speed Insights vs Playwright DevTools Protocol)

## Deferred Ideas

- Real-time SSE log streaming (GitHub API doesn't expose live logs)
- Firefox + WebKit CI matrix (Chromium only in Phase 3)
- Lighthouse CI in GitHub Actions (Vercel Speed Insights sufficient for v1)
- Visual regression testing
- Live test execution against external demo site (out of scope per REQUIREMENTS.md)
