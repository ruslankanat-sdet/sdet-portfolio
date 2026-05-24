# SDET Portfolio Site

## What This Is

A dark IDE-style portfolio site for a senior SDET / QA automation engineer. The site itself is the proof of craft — real TypeScript Playwright E2E tests are displayed in the IDE chrome's file explorer, a CI integration button dispatches real GitHub Actions runs, and the MDX resume is one click from every page. No AI APIs, no backend services: stateless, Vercel Hobby, ships in days.

The original plan was an AI-powered SDET tool suite. On 2026-05-18 this was pivoted to the IDE-style portfolio — same candidate, same audience, faster ship, stronger demonstration of craft.

## Core Value

**A recruiter opens the page and immediately sees working code — real Playwright tests, real TypeScript — and thinks "I need to interview this person."**

The site itself is the demo. The tools showcase the candidate.

## Requirements

### Validated

<!-- Shipped in v1.0 and confirmed working. -->

- ✓ **FOUND-01**: Next.js 15 + TypeScript strict + Tailwind v4 + ESLint flat config — v1.0
- ✓ **FOUND-02**: Vercel deploys on every push to `main`; preview deploys on PRs — v1.0
- ✓ **FOUND-03**: Vercel Analytics + Speed Insights (cookieless, no consent banner) — v1.0
- ✓ **FOUND-04**: Landing page statically rendered, no API keys or external services — v1.0
- ✓ **SHELL-01**: Dark IDE chrome (sidebar, editor pane, terminal) with design tokens — v1.0
- ✓ **SHELL-02**: Sidebar renders FileEntry items as clickable rows — v1.0
- ✓ **SHELL-03**: Click file → editor pane with syntax highlighting (hand-rolled tokenizer) — v1.0
- ✓ **SHELL-04**: Terminal renders LogEntry items (info/warn/ok/pass/fail) — v1.0
- ✓ **SHELL-05**: Responsive sidebar toggle (hamburger on mobile, overlay slide-in) — v1.0
- ✓ **CONT-01**: Header identifies candidate (name + title + link to About) — v1.0 _(title abbreviated — see tech debt)_
- ✓ **CONT-02**: `/about` renders MDX resume (work history, projects, skills, contact) — v1.0
- ✓ **CONT-03**: Downloadable PDF resume linked from About — v1.0
- ✓ **CONT-04**: Primary nav links landing ↔ about on every page — v1.0
- ✓ **CONT-05**: Footer on every page (email, GitHub, LinkedIn, "no tracking") — v1.0 _(double-footer bug fixed in q02)_
- ✓ **SHOW-01**: Real TypeScript Playwright E2E tests (4 spec files, 15 tests) — v1.0
- ✓ **SHOW-02**: Playwright test files in IDE sidebar; click shows TypeScript source — v1.0
- ✓ **SHOW-03**: Run Smoke Test dispatches `workflow_dispatch` → GitHub Actions → terminal polls status — v1.0 _(fixed in q01)_
- ✓ **HARD-01**: WCAG AA — axe-core zero violations, keyboard nav, visible focus indicators — v1.0
- ✓ **HARD-02**: LCP < 2s on 4G — static rendering confirmed; Vercel Speed Insights human-verify pending — v1.0
- ✓ **HARD-03**: OG + Twitter Card meta on landing and About pages — v1.0
- ✓ **HARD-04**: `robots.txt` + `sitemap.xml` live — v1.0
- ✓ **HARD-05**: Playwright suite runs in GitHub Actions CI on every push to `main` — v1.0

### Active

<!-- Next milestone scope — not yet built. -->

**Tech debt to clear early in v1.1:**
- [ ] SiteHeader title: "Senior SDET" → "Senior SDET / QA Automation Engineer" (CONT-01 spec)
- [ ] Copyright year in Footer: © 2024 → © 2026
- [ ] TopBar "CI · Passing" badge: hardcoded → read from real CI state
- [ ] IDE sidebar content (files-data.ts) drift from actual e2e/ test files — update embed on next content pass
- [ ] LCP < 2s on 4G: verify in Vercel Speed Insights post-deploy

**v1.1 — Content & polish layer:**
- [ ] Real headshot + updated bio content from candidate
- [ ] Brand polish — logo, custom color palette, typography refinement
- [ ] GitHub showcase repos linked from IDE sidebar or About page
- [ ] Custom domain DNS wired
- [ ] Vitest unit tests for tokenizer, file-data shape, sidebar rendering

**v1.5 — AI tools (original plan, deferred):**
- [ ] **Test Automator** — input: URL or user story; output: working Playwright (TypeScript) test code
- [ ] **Test Data Generator** — input: schema description; output: realistic synthetic data (JSON, CSV, SQL)
- [ ] **API Test Generator** — input: OpenAPI spec; output: REST test suite (Pytest + Playwright style)
- [ ] Rate limiting on tool endpoints (per IP, Upstash Redis)
- [ ] No persistence of user inputs — processed in-request, discarded; site states this clearly

**v2 — Advanced showcase:**
- [ ] Embedded Playwright sandbox running real tests against a demo site
- [ ] Public usage metrics (tools-run counter) — social proof
- [ ] Additional tools: Flaky Test Diagnoser, Bug Report Polisher, Jira Ticket Analyzer

### Out of Scope

<!-- Explicit boundaries — logged so they don't sneak back in. -->

- **AI chatbot ("ask my resume anything")** — Explicitly cut. Tools demonstrate skill more concretely than a chatbot.
- **Test Case Manager** — Implies accounts, database, multi-tenancy, persistence. Scope-explosion.
- **User accounts / login** — Public stateless site. No auth, no DB, no user data server-side.
- **CMS / authoring UI** — Single-author site. Markdown edits via repo are sufficient.
- **Real browser automation sandboxes in v1** — Browser pool ops, cost spikes, abuse risk. Deferred to v2.
- **Custom domain as a project phase** — Candidate will wire DNS when ready. Site works on Vercel default URL on day one.
- **i18n / multi-language** — Audience is English-speaking recruiters and SDETs.
- **Server-side queue / async jobs** — Every v1 tool responds in a single request within ~30s.
- **Live test execution in the browser (v1)** — No server process; CI badge links to GitHub Actions instead.

## Context

**What shipped in v1.0 (2026-05-23):**
- Dark IDE chrome: sidebar file explorer, editor pane with TypeScript highlighting, terminal log pane
- MDX resume at `/about` with downloadable PDF; consistent nav + footer on all pages
- Real Playwright E2E test files (4 spec files, 15 tests) displayed in IDE sidebar
- GitHub Actions CI: Playwright suite runs on every push to `main`
- Run Smoke Test: dispatches real `workflow_dispatch` + polls CI status into terminal
- OG cards, `robots.txt`, `sitemap.xml`, WCAG AA axe-core pass
- Stack: Next.js 15.5.18, React 19, TypeScript 5.9.3, Tailwind v4.3, Playwright 1.60, axe-core 4.11.3
- Size: 132 files, ~29,329 lines added over 9 days
- Stateless, Vercel Hobby, no API keys, no database

**Candidate profile:** Senior SDET / QA automation engineer targeting senior IC roles. Differentiation: prove AI fluency + traditional craft (Playwright/Cypress, API testing, performance).

**Audience model:**
- *Recruiter* — 6-second scan: IDE looks real + obvious "who built this" path → About click
- *Hiring manager / EM* — 2-5 minute exploration: tries Run Smoke Test, looks at code, reads About, clicks GitHub
- *SDET / QA engineer* — comes for the tools (v1.5); browses the test code as craft signal

**Known tech debt from v1.0:**
- SiteHeader title abbreviated (see CONT-01 above)
- Copyright year stale (2024 → 2026)
- TopBar CI badge hardcoded green
- IDE sidebar content slightly diverges from actual e2e/ files
- 0/3 phases have VERIFICATION.md (gsd-verify-work skipped)
- Phase 1 and 3 VALIDATION.md: nyquist_compliant=false
- TestAutomatorPane is dead code in bundle

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Pivot from "AI toolkit" to "IDE-style portfolio + Playwright showcase" (2026-05-18) | Tools requiring API keys delay ship; IDE portfolio proves craft immediately with zero backend | ✓ Good — shipped in 9 days |
| No AI chatbot | Explicit user cut. Tools demonstrate skill more concretely | ✓ Good — kept scope tight |
| Stateless tools only in v1 (no DB, no accounts) | Eliminates entire categories of scope and ops complexity | ✓ Good — Vercel Hobby, zero ops |
| Hand-rolled TypeScript tokenizer (not Shiki runtime) | files-data.ts is client-bundled; Shiki runtime not needed for static IDE content | ✓ Good — XSS-safe ReactNode[] |
| Embed spec file content as inline string literals | files-data.ts is client-bundled; can't use fs.readFileSync | ✓ Works — minor content drift accepted as tech debt |
| Two-variant Footer (compact for landing, full for /about) | Different contexts need different information density | ⚠️ Revisit — introduced double-footer bug; both pages now render their own Footer (layout removed) |
| GitHub Actions workflow_dispatch for Run Smoke Test | Real CI trigger proves the feature is wired to production | ✓ Good — learned 204 No Content requires follow-up GET /runs for run ID |
| Next.js App Router on Vercel | One-provider simplicity, fastest path to ship | ✓ Good |
| Defer AI tools to v1.5 | Eliminates API key ops, rate limiting, cost ceiling concerns for v1 | ✓ Good — correct sequencing |
| Test Case Manager dropped | Implies persistence + accounts + multi-tenancy; scope-explosion | ✓ Good |
| No CMS / authoring UI | Single-author site; markdown/code edits acceptable | ✓ Good |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-05-23 after v1.0 milestone*
