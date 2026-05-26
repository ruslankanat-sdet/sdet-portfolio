# Roadmap: SDET Portfolio Site

## Milestones

- ✅ **v1.0 MVP** — Phases 1-3 (shipped 2026-05-23)
- **v1.1 Content, Quality & Accessibility Pass** — Phases 4-6 (in progress)

## Phases

<details>
<summary>✅ v1.0 MVP (Phases 1-3) — SHIPPED 2026-05-23</summary>

- [x] Phase 1: Foundation + IDE Shell (5/5 plans) — completed 2026-05-19
- [x] Phase 2: Resume & About Layer (3/3 plans) — completed 2026-05-21
- [x] Phase 3: Playwright Showcase + Hardening (6/6 plans) — completed 2026-05-22

Full archive: [milestones/v1.0-ROADMAP.md](milestones/v1.0-ROADMAP.md)

</details>

### v1.1 — Content, Quality & Accessibility Pass

- [x] **Phase 4: Tech Debt Sweep** - Fix hardcoded/stale content: full title, copyright year, live CI badge, sidebar file sync
- [x] **Phase 5: Mobile Responsiveness & UX Labels** - Full usability on small screens; IDE pane labels for non-technical visitors (completed 2026-05-25)
- [ ] **Phase 6: Vitest Unit Tests** - Test coverage for tokenizer logic, file-data shape, and sidebar rendering behavior

## Phase Details

### Phase 4: Tech Debt Sweep

**Goal**: Visitors see accurate, up-to-date content everywhere — correct title, year, real CI status, and sidebar files that match the actual repo
**Depends on**: Nothing (first phase of v1.1; all items are self-contained corrections)
**Requirements**: DEBT-01, DEBT-02, DEBT-03, DEBT-04
**Success Criteria** (what must be TRUE):

  1. SiteHeader displays the full title "Senior SDET / QA Automation Engineer" on every page
  2. Footer shows © 2026 on every page (not © 2024)
  3. TopBar CI badge reflects real GitHub Actions pass/fail state rather than a hardcoded green
  4. IDE sidebar file entries match the actual files present in the e2e/ directory in the repository

**Plans**: 2 plans
Plans:

- [x] 04-01-PLAN.md — Content corrections: SiteHeader full title (DEBT-01), Footer copyright verify (DEBT-02), sidebar files-data.ts resync against e2e/ (DEBT-04)
- [x] 04-02-PLAN.md — Live CI badge: new /api/ci-status route with ISR caching + TopBar wire-up with green fallback and red tone (DEBT-03)

**UI hint**: yes

### Phase 5: Mobile Responsiveness & UX Labels

**Goal**: Any visitor on any device can use the site — mobile users experience a fully functional IDE layout, and non-technical visitors understand each pane's purpose without prior developer knowledge
**Depends on**: Phase 4 (content must be correct before polishing the presentation layer)
**Requirements**: MOB-01, MOB-02, MOB-03, MOB-04, MOB-05, UX-01
**Success Criteria** (what must be TRUE):

  1. On a 375px-wide screen, a visitor can open the IDE sidebar and tap file entries to load them in the editor pane
  2. Code in the editor pane does not overflow horizontally on mobile — all content is readable without requiring horizontal scrolling
  3. Terminal log entries display without text truncation or layout breakage on small screens
  4. Header nav links (landing and about) are reachable and tappable on mobile without overlap or clipping
  5. The About/resume page is fully readable and scrollable on a phone; all sections, contact info, and the PDF download link are accessible
  6. Each IDE pane (sidebar, editor, terminal) has a visible label or indicator that explains its purpose in plain language, so a non-technical visitor understands the layout without guessing

**Plans**: 4 plans
Plans:

- [x] 05-01-PLAN.md — Pure CSS mobile fixes: minimap hide, terminal log wrap + resizer hide + max-height, sidebar touch targets, TopBar button touch targets + ≤480px hides, SiteHeader title ellipsis + nav touch target, About page table scroll + narrow padding (MOB-02, MOB-03, MOB-04, MOB-05)
- [x] 05-02-PLAN.md — UX-01 pane labels (EXPLORER · File browser, Editor · Code viewer, TERMINAL · Test output) + Sidebar onSelect prop infrastructure (UX-01, MOB-01 partial)
- [x] 05-03-PLAN.md — IDEShell mobile state: isMobile snapshot, mobile-aware termHeight (120px), conditional onSelect={toggleSidebar}, backdrop overlay with rgba(0,0,0,0.5) + z-index 49 (MOB-01)
- [x] 05-04-PLAN.md — Gap closure: .site-main flex context for terminal visibility; .crumbRight breadcrumb grouping for label alignment (MOB-01, MOB-04)

**UI hint**: yes

### Phase 6: Vitest Unit Tests

**Goal**: The tokenizer, file-data module, and sidebar component are covered by Vitest tests that run in CI and serve as living documentation of correct behavior
**Depends on**: Phase 4, Phase 5 (tests target the final post-debt-sweep, post-mobile-pass code)
**Requirements**: TEST-01, TEST-02, TEST-03
**Success Criteria** (what must be TRUE):

  1. Running `pnpm test` executes Vitest and all tests pass with zero failures
  2. Tokenizer tests assert correct token types (keyword, string, comment, identifier, etc.) for representative TypeScript syntax snippets
  3. File-data tests assert every entry has required fields (id, name, language, tokens) and that tokens are well-formed arrays
  4. Sidebar rendering tests assert that all file entries appear in the rendered output and that clicking an entry triggers the correct editor update

**Plans**: 3 plans

Wave 1:
- [ ] 06-01-PLAN.md — Vitest infrastructure: install deps, vitest.config.ts, jsdom + React setup, `pnpm test` script, CI step

Wave 2 *(blocked on Wave 1 completion)*:
- [ ] 06-02-PLAN.md — Tokenizer tests: keyword, comment, string, number, decorator, type, fn-call token assertions for TypeScript (TEST-01)
- [ ] 06-03-PLAN.md — File-data shape tests (TEST-02) + Sidebar rendering + click-callback interaction tests (TEST-03)

## Progress

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 1. Foundation + IDE Shell | v1.0 | 5/5 | Complete | 2026-05-19 |
| 2. Resume & About Layer | v1.0 | 3/3 | Complete | 2026-05-21 |
| 3. Playwright Showcase + Hardening | v1.0 | 6/6 | Complete | 2026-05-22 |
| 4. Tech Debt Sweep | v1.1 | 2/2 | Complete | 2026-05-24 |
| 5. Mobile Responsiveness & UX Labels | v1.1 | 3/3 | Complete   | 2026-05-25 |
| 6. Vitest Unit Tests | v1.1 | 0/? | Not started | - |
