# Milestones

## v1.0 — SDET Portfolio Site MVP

**Shipped:** 2026-05-23
**Phases:** 1-3 | **Plans:** 14 | **Timeline:** 9 days (2026-05-14 → 2026-05-23)
**Files changed:** 132 | **Lines added:** ~29,329

### Delivered

Dark IDE-style portfolio site live on Vercel — real Playwright E2E tests displayed in the IDE chrome, MDX resume with PDF download, GitHub Actions CI integration, WCAG AA accessibility pass, OG social preview cards, and a Run Smoke Test button that dispatches real CI and polls results into the terminal pane.

### Key Accomplishments

1. Dark IDE chrome live on Vercel (sidebar + editor pane + terminal) with TypeScript syntax highlighting via hand-rolled tokenizer
2. MDX resume at `/about` with downloadable PDF; nav + footer consistent across every page
3. Real Playwright E2E test files displayed in IDE sidebar; clicking shows TypeScript source with full syntax highlighting
4. GitHub Actions CI running Playwright suite on every push to `main`
5. OG cards, `robots.txt`, `sitemap.xml` — site shareable and indexable
6. Run Smoke Test dispatches real `workflow_dispatch` and polls CI status into terminal pane

### Requirements

**22/22 satisfied.** Two requirements needed post-phase quick fixes before close:
- SHOW-03: `workflow_dispatch` + `res.json()` on 204 (fixed in q01, commit 31bffb4)
- CONT-05: Double footer on /about (fixed in q02, commit 8918ef9)

### Known Deferred Items at Close: 0

### Archives

- Roadmap: [milestones/v1.0-ROADMAP.md](milestones/v1.0-ROADMAP.md)
- Requirements: [milestones/v1.0-REQUIREMENTS.md](milestones/v1.0-REQUIREMENTS.md)
- Audit: [milestones/v1.0-MILESTONE-AUDIT.md](milestones/v1.0-MILESTONE-AUDIT.md)
- Phases: [milestones/v1.0-phases/](milestones/v1.0-phases/)
