# Retrospective

## Milestone: v1.0 — SDET Portfolio Site MVP

**Shipped:** 2026-05-23
**Phases:** 3 | **Plans:** 14 | **Timeline:** 9 days

### What Was Built

- Dark IDE chrome live on Vercel: sidebar file explorer, editor pane, terminal log pane with TypeScript syntax highlighting via hand-rolled tokenizer
- MDX resume at `/about` with downloadable PDF; consistent nav + footer on all pages; recruiter path complete in one click
- Real Playwright E2E test files (4 spec files, 15 tests) displayed in IDE sidebar with click-to-view source
- GitHub Actions CI running full Playwright suite on every push to `main`
- OG cards, `robots.txt`, `sitemap.xml`, WCAG AA axe-core pass
- Run Smoke Test: dispatches real `workflow_dispatch` + polls CI status into terminal pane

### What Worked

- **Narrow scope held** — the 2026-05-18 pivot decision (IDE portfolio over AI toolkit) was correct. 9-day ship with zero backend is only possible because scope was deliberately constrained.
- **Static-first architecture** — no server processes, no database, no API keys eliminated entire categories of ops complexity. Every phase was deployable the moment it shipped.
- **Phase granularity was right** — 3 phases with 14 plans at ~19 min each hit a natural stopping point between phases without accumulating too much context debt.
- **Quick task format** — the two post-phase-3 fixes (q01, q02) were tiny and targeted. Using the quick task pattern kept them tracked without creating new phases.
- **Hand-rolled tokenizer** — avoided Shiki runtime complexity in a client-bundled module. XSS-safe ReactNode[] output, correct for the use case.

### What Was Inefficient

- **No VERIFICATION.md for any phase** — gsd-verify-work was skipped all 3 phases. The milestone audit caught two wiring bugs (SHOW-03, CONT-05) that a per-phase verify would have caught earlier.
- **REQUIREMENTS.md checkboxes not updated** — Phase 3 requirements were marked `[ ] Pending` at milestone close despite the work being done. The audit had to cross-reference SUMMARY.md files to determine true state.
- **VALIDATION.md never signed off** — Phases 1 and 3 had VALIDATION.md with `nyquist_compliant: false`; Phase 2 had none. These were drafted but never completed, accumulating process debt.
- **Double-footer bug** — the two-variant Footer pattern introduced a defect that wasn't caught until the milestone audit. A single rendering pass through the about route would have caught it.
- **workflow_dispatch 204 No Content** — calling `res.json()` on a 204 response is a standard HTTP mistake. Worth adding to a project-level gotchas list for future API route work.

### Patterns Established

- **`files-data.ts` as single source of truth for IDE content** — all sidebar files, test file content, and log entries live here. Client-bundled, no server-side reads.
- **CSS Modules + `var(--*)` design tokens** — no Tailwind in IDE components; raw CSS gives precise control over the IDE aesthetic without class-name conflicts.
- **Two-variant Footer: DON'T render in layout** — each page renders its own Footer variant; layout.tsx stays clean. (Learned from the CONT-05 double-footer bug.)
- **`workflow_dispatch` → 204 → GET /runs pattern** — GitHub's dispatch API returns 204 No Content; to find the newly created run ID, poll GET `/repos/{owner}/{repo}/actions/runs?event=workflow_dispatch&branch=main` and pick the most recent.
- **Playwright `webServer` block in playwright.config.ts** — handles build + start lifecycle in CI automatically; no manual `pnpm build && pnpm start` step needed in the CI job.

### Key Lessons

1. **Run gsd-verify-work after every phase** — the milestone audit found bugs that verify would have caught earlier. Add this to the phase exit checklist.
2. **Update REQUIREMENTS.md checkboxes at phase completion** — stale `[ ]` on done requirements creates confusion at milestone close. Takes 30 seconds, saves 30 minutes of audit cross-referencing.
3. **Test API response parsing explicitly** — `res.json()` on a 204 is a silent failure. Always check the response status code before calling `.json()`.
4. **Scope pivots need a full PROJECT.md + REQUIREMENTS.md sync** — the 2026-05-18 pivot was correctly decided but PROJECT.md still described the original AI toolkit at milestone close. The milestone completion is the first time the two aligned.
5. **UI testing is not optional even for "simple" layouts** — the double-footer defect on /about existed for the entire Phase 2 period. A quick visual check of every page would have caught it before the audit.

### Cost Observations

- No LLM calls in v1 (no API keys, no AI tools)
- Stack: Next.js 15, Vercel Hobby, GitHub Actions free tier — $0/month at low traffic
- Sessions: ~9 days of development across 3 phases

---

## Cross-Milestone Trends

| Milestone | Phases | Plans | Days | Verify Run | VALIDATION.md | Post-Close Fixes |
|-----------|--------|-------|------|-----------|---------------|-----------------|
| v1.0 MVP | 3 | 14 | 9 | 0/3 | 1/3 (partial) | 2 (q01, q02) |
