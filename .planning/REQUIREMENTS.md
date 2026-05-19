# Requirements: SDET Portfolio Site

**Defined:** 2026-05-14
**Revised:** 2026-05-18 — pivot from AI toolkit to IDE-style portfolio with Playwright showcase
**Core Value:** A recruiter opens the page and immediately sees working code — real Playwright tests, real TypeScript — and thinks "I need to interview this person."

## v1 Requirements

Requirements for initial public launch. Each maps to a roadmap phase.

### Foundations & Deploy

- [x] **FOUND-01**: Next.js 15 App Router project initialized with TypeScript (strict), Tailwind v4 (or 3.4 fallback if shadcn v4-ready check fails), ESLint flat config, Prettier
- [x] **FOUND-02**: Repository deploys cleanly to Vercel on every push to `main`; preview deploys on PRs
- [x] **FOUND-03**: Vercel Analytics + Speed Insights installed (cookieless, no consent banner)
- [x] **FOUND-04**: Landing page statically rendered and deployed to a public Vercel URL; no API keys or external services required

### IDE Shell

- [x] **SHELL-01**: Dark IDE-style chrome — left sidebar file explorer, main editor pane, bottom terminal/log pane — using design tokens from the handoff
- [x] **SHELL-02**: Sidebar file explorer renders a list of `FileEntry` items (path, icon, language) as clickable rows
- [x] **SHELL-03**: Clicking a file entry loads its content into the editor pane with syntax highlighting (TypeScript via Shiki, restricted language set)
- [x] **SHELL-04**: Terminal/log pane renders `LogEntry` items (kind: info/warn/ok/pass/fail, text) as styled rows
- [x] **SHELL-05**: IDE chrome is responsive — sidebar is toggleable/collapsible on narrow viewports

### Resume & Content

- [ ] **CONT-01**: Landing page header strip identifies the candidate (name, title "Senior SDET / QA Automation Engineer", link to About) — visible to a 6-second-scan recruiter without scrolling
- [ ] **CONT-02**: `/about` page renders resume content from MDX — work history, projects, skills, contact
- [ ] **CONT-03**: Downloadable PDF resume linked from About; PDF content kept in sync with on-page version (no broken link, no stale dates)
- [ ] **CONT-04**: Primary navigation links landing ↔ about on every page; resume reachable in one click from anywhere
- [ ] **CONT-05**: Footer on every page includes contact email, GitHub link, LinkedIn link, and an explicit "no tracking" note

### Playwright Showcase

- [ ] **SHOW-01**: Real TypeScript Playwright E2E tests exist for the site's key flows (landing renders, nav works, About page renders, file click loads editor content)
- [ ] **SHOW-02**: The Playwright test files are listed in the IDE shell file explorer; clicking a test file displays the TypeScript source in the editor pane with full syntax highlighting
- [ ] **SHOW-03**: CI last-run status is surfaced in the terminal pane (static badge or link to GitHub Actions run)

### Hardening & Pre-Launch

- [ ] **HARD-01**: WCAG AA compliance verified — keyboard navigation, visible focus indicators, screen-reader labels on all interactive elements; automated axe-core pass returns zero violations
- [ ] **HARD-02**: LCP < 2s on simulated 4G for the landing page; landing page is statically rendered (no blocking server calls on initial paint)
- [ ] **HARD-03**: Open Graph + Twitter Card meta on landing and About pages — URL shared in Slack/LinkedIn renders cleanly with title, description, and image
- [ ] **HARD-04**: `robots.txt` + `sitemap.xml` generated and accessible; site is indexable
- [ ] **HARD-05**: Playwright E2E suite runs in GitHub Actions CI on every push to `main`; suite covers landing, nav, About, and file-click-to-editor flows

## Out of Scope

Explicitly excluded. Logged so they don't sneak back in.

| Feature | Reason |
|---------|--------|
| AI-powered test generation (Test Automator) | Cut on 2026-05-18 pivot — requires API key setup, adds backend complexity, delays ship |
| Test Data Generator | Cut on 2026-05-18 pivot — same reasons |
| API Test Generator | Cut on 2026-05-18 pivot — same reasons |
| Self-healing test setup | Cut on 2026-05-18 pivot — overengineered for v1 goal |
| AI chatbot / "ask my resume" | Cut — tools demonstrate skill more concretely |
| Rate limiting via Upstash Redis | Cut — nothing to rate-limit without LLM endpoints |
| Live test execution in the browser | No server process available in static hosting; CI badge links to GitHub Actions instead |
| User accounts / login | Public stateless site; auth adds days of work for zero v1 visitor value |
| Server-side persistence of user inputs | No user inputs to persist in v1 |
| CMS / authoring UI | Single-author site; markdown edits via repo are sufficient |
| "Coming Soon" tool shelf | Cut — no AI tools to tease |
| Vercel spend alerts / LLM cost controls | No LLM in v1 |
| i18n / multi-language | Audience is English-speaking recruiters and SDETs |

## Traceability

Every v1 requirement maps to exactly one phase.

| Requirement | Phase | Status |
|-------------|-------|--------|
| FOUND-01 | Phase 1 | Complete |
| FOUND-02 | Phase 1 | Complete |
| FOUND-03 | Phase 1 | Complete |
| FOUND-04 | Phase 1 | Complete |
| SHELL-01 | Phase 1 | Complete |
| SHELL-02 | Phase 1 | Complete |
| SHELL-03 | Phase 1 | Complete |
| SHELL-04 | Phase 1 | Complete |
| SHELL-05 | Phase 1 | Complete |
| CONT-01 | Phase 2 | Pending |
| CONT-02 | Phase 2 | Pending |
| CONT-03 | Phase 2 | Pending |
| CONT-04 | Phase 2 | Pending |
| CONT-05 | Phase 2 | Pending |
| SHOW-01 | Phase 3 | Pending |
| SHOW-02 | Phase 3 | Pending |
| SHOW-03 | Phase 3 | Pending |
| HARD-01 | Phase 3 | Pending |
| HARD-02 | Phase 3 | Pending |
| HARD-03 | Phase 3 | Pending |
| HARD-04 | Phase 3 | Pending |
| HARD-05 | Phase 3 | Pending |

**Coverage:**
- v1 requirements: 22 total (FOUND × 4, SHELL × 5, CONT × 5, SHOW × 3, HARD × 5)
- Mapped to phases: 22/22 ✓
- Unmapped: 0

**Phase totals:**
- Phase 1 (Foundation + IDE Shell): 9 requirements (FOUND × 4, SHELL × 5)
- Phase 2 (Resume & About Layer): 5 requirements (CONT × 5)
- Phase 3 (Playwright Showcase + Hardening): 8 requirements (SHOW × 3, HARD × 5)

---
*Requirements defined: 2026-05-14*
*Last updated: 2026-05-19 — Phase 1 complete (FOUND × 4, SHELL × 5 all satisfied)*
