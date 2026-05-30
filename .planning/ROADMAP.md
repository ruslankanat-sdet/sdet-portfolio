# Roadmap: SDET Portfolio Site

## Milestones

- ✅ **v1.0 MVP** — Phases 1-3 (shipped 2026-05-23)
- ✅ **v1.1 Content, Quality & Accessibility Pass** — Phases 4-6 (shipped 2026-05-26)
- **v1.2 Recruiter View & Dual-Audience Landing** — Phases 7-10 (in progress)

## Phases

<details>
<summary>✅ v1.0 MVP (Phases 1-3) — SHIPPED 2026-05-23</summary>

- [x] Phase 1: Foundation + IDE Shell (5/5 plans) — completed 2026-05-19
- [x] Phase 2: Resume & About Layer (3/3 plans) — completed 2026-05-21
- [x] Phase 3: Playwright Showcase + Hardening (6/6 plans) — completed 2026-05-22

Full archive: [milestones/v1.0-ROADMAP.md](milestones/v1.0-ROADMAP.md)

</details>

<details>
<summary>✅ v1.1 Content, Quality & Accessibility Pass (Phases 4-6) — SHIPPED 2026-05-26</summary>

- [x] **Phase 4: Tech Debt Sweep** - Fix hardcoded/stale content: full title, copyright year, live CI badge, sidebar file sync
- [x] **Phase 5: Mobile Responsiveness & UX Labels** - Full usability on small screens; IDE pane labels for non-technical visitors (completed 2026-05-25)
- [x] **Phase 6: Vitest Unit Tests** - Test coverage for tokenizer logic, file-data shape, and sidebar rendering behavior (completed 2026-05-26)

</details>

### v1.2 — Recruiter View & Dual-Audience Landing

- [x] **Phase 7: Foundation — Route Restructure & Font Setup** - IDE and About pages scoped under route group; root layout header-free; serif font available — completed 2026-05-27
- [x] **Phase 8: Landing Door** - Full-viewport split-screen door with hover animation, localStorage routing, and ?reset support (completed 2026-05-27)
- [ ] **Phase 9: Recruiter View** - Complete editorial resume: masthead, hero, all five content sections, contact footer, and mobile responsiveness
- [ ] **Phase 10: Content, Print & Polish** - Real Ruslan Kanatbek content replaces all prototype copy; print stylesheet produces clean PDF

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

- [x] 06-01-PLAN.md — Vitest infrastructure: install deps, vitest.config.ts, jsdom + React setup, `pnpm test` script, CI step (completed 2026-05-26)

Wave 2 *(completed 2026-05-26)*:

- [x] 06-02-PLAN.md — Tokenizer tests: keyword, comment, string, number, decorator, type, fn-call token assertions for TypeScript (TEST-01)
- [x] 06-03-PLAN.md — File-data shape tests (TEST-02) + Sidebar rendering + click-callback interaction tests (TEST-03)

### Phase 7: Foundation — Route Restructure & Font Setup

**Goal**: The IDE and About pages live in a scoped route group so the root layout owns no header, and the newsreader serif font is available for recruiter styles
**Depends on**: Phase 6 (stable codebase after v1.1 completion)
**Requirements**: ARCH-01, ARCH-02, ARCH-03
**Success Criteria** (what must be TRUE):

  1. Navigating to `/` loads a root page with no SiteHeader rendered — the IDE header only appears inside the `(ide)` route group
  2. Navigating to the IDE or `/about` from within the `(ide)` group still shows the SiteHeader as before
  3. A `ResumeGate` component at the root reads `localStorage["resume-mode"]` on mount and renders the correct view branch (Door, Recruiter, or IDE)
  4. Newsreader serif is loaded via `next/font/google` and available as a CSS variable for recruiter page styles

**Plans**: 2 plans

Wave 1:

- [x] 07-01-PLAN.md — Route group restructure: create `(ide)/layout.tsx` with SiteHeader, move `/about` into group, strip SiteHeader + main wrapper from root layout (ARCH-01) — completed 2026-05-27

Wave 2:

- [x] 07-02-PLAN.md — ResumeGate + Newsreader font: Newsreader via `next/font/google` as `--font-newsreader`, replace root `page.tsx` with `"use client"` ResumeGate with localStorage routing and `?reset` support (ARCH-02, ARCH-03) — completed 2026-05-27

**UI hint**: yes

### Phase 8: Landing Door

**Goal**: First-time visitors see a full-viewport split-screen choice, their selection is persisted, return visitors skip straight to their chosen view, and `?reset` restores the door
**Depends on**: Phase 7 (ResumeGate and root layout restructure must exist before Door can render)
**Requirements**: DOOR-01, DOOR-02, DOOR-03, DOOR-04
**Success Criteria** (what must be TRUE):

  1. A first-time visitor at `/` sees two halves — cream left (recruiter) and dark IDE right — each expanding on hover and clickable to choose a view
  2. Clicking a door half immediately renders the corresponding view without a full page navigation, and refreshing the page does not show the door again
  3. A return visitor whose localStorage holds a mode lands directly in that view — the door is never shown on subsequent visits
  4. Appending `?reset` to the URL clears the stored mode and displays the door again, regardless of previous selection

**Plans**: 2 plans

Wave 1:

- [x] 08-01-PLAN.md — Cream/forest tokens + .door-* classes in globals.css, LogoMark + DoorScreen components (+ unit tests), Newsreader weight expansion, and wire DoorScreen into ResumeGateInner (DOOR-01, DOOR-02)

Wave 2:

- [x] 08-02-PLAN.md — E2E: pre-seed IDE mode in 3 existing spec files (12 tests) + new Landing door describe block with 4 tests (DOOR-01 E2E, DOOR-03, DOOR-04)

**UI hint**: yes

### Phase 9: Recruiter View

**Goal**: A recruiter arriving via the door sees a complete, polished editorial resume — sticky masthead, availability hero, five content sections, contact footer — fully usable on mobile
**Depends on**: Phase 7 (fonts and root layout), Phase 8 (door routes to recruiter view)
**Requirements**: REC-01, REC-02, REC-03, REC-04, REC-05, REC-06, REC-07, REC-08, REC-10
**Success Criteria** (what must be TRUE):

  1. The sticky masthead shows the wordmark and an "Engineer view ↗" pill that switches the visitor back to the IDE view when clicked
  2. The hero section shows a pulsing availability pill, editorial headline, pitch paragraph, and two actionable CTAs (Download PDF and email link)
  3. All five content sections are present and readable: By the Numbers (4 stat tiles), What I'm Doing Now (drop-cap lede), Experience (3-job timeline), Stack (4 skill groups), and What I'm Looking For (6-row spec card)
  4. The contact section includes the large email link and a three-column social grid; the footer contains an "Open the IDE" switch back to engineer view
  5. On a 375px screen, metrics wrap to 2 columns, the experience timeline stacks to a single column, the availability card stacks vertically, and all text remains legible without horizontal scrolling

**Plans**: 2 plans

Wave 1:

- [ ] 09-01-PLAN.md — Foundation: recruiter.module.css (scroll container + sticky + avail-pulse + print scaffold), RecruiterView shell + Masthead + Hero, wire into ResumeGateInner, unit tests + E2E spec scaffold (REC-01, REC-02)

Wave 2 (depends on 09-01):

- [ ] 09-02-PLAN.md — Content sections (Metrics §01, Now lede §02, Timeline §03, Skills §04, AvailabilityCard §05, ContactSection, RecruiterFooter), full mobile breakpoints (600px + 540px), expanded unit + E2E tests, DOOR-03 landing assertion fix (REC-03, REC-04, REC-05, REC-06, REC-07, REC-08, REC-10)

**UI hint**: yes

### Phase 10: Content, Print & Polish

**Goal**: The live site shows only Ruslan Kanatbek's real information with no prototype placeholder copy, and the Download PDF action produces a clean, print-ready document
**Depends on**: Phase 9 (recruiter view structure must exist before content can be swapped in and print styles applied)
**Requirements**: REC-09, CONT-RK-01
**Success Criteria** (what must be TRUE):

  1. No instance of "Alex Morgan" or any other placeholder name, job, or company appears anywhere on the live site
  2. The experience timeline, stack groups, availability card, metrics, and contact section all reflect Ruslan Kanatbek's actual data
  3. Triggering `window.print()` (via the Download PDF CTA) produces a layout where the masthead switch pill, CTAs, and footer are hidden, and the remaining content fits on one A4/Letter page without overflow or orphaned sections

**Plans**: 2 plans

Wave 1:

- [ ] 10-01-PLAN.md — Content consolidation: create src/lib/resume-content.ts, update six recruiter components to import from it, update unit tests and E2E spec (CONT-RK-01)

Wave 2 *(blocked on Wave 1 completion)*:

- [ ] 10-02-PLAN.md — Print polish: extend @media print block with @page Letter margins, page-break-before on §03 Experience, font tuning, and print-preview human checkpoint (REC-09)

**UI hint**: yes

## Progress

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 1. Foundation + IDE Shell | v1.0 | 5/5 | Complete | 2026-05-19 |
| 2. Resume & About Layer | v1.0 | 3/3 | Complete | 2026-05-21 |
| 3. Playwright Showcase + Hardening | v1.0 | 6/6 | Complete | 2026-05-22 |
| 4. Tech Debt Sweep | v1.1 | 2/2 | Complete | 2026-05-24 |
| 5. Mobile Responsiveness & UX Labels | v1.1 | 4/4 | Complete | 2026-05-25 |
| 6. Vitest Unit Tests | v1.1 | 3/3 | Complete | 2026-05-26 |
| 7. Foundation — Route Restructure & Font Setup | v1.2 | 2/2 | Complete | 2026-05-27 |
| 8. Landing Door | v1.2 | 2/2 | Complete    | 2026-05-28 |
| 9. Recruiter View | v1.2 | 0/TBD | Not started | - |
| 10. Content, Print & Polish | v1.2 | 0/2 | Planned | - |
