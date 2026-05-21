# Roadmap: SDET Portfolio Site

## Overview

A dark IDE-style portfolio site for a senior SDET / QA automation engineer. The site itself is the demo — built with care, tested with real TypeScript Playwright E2E tests displayed in the IDE chrome's file explorer. No AI APIs, no backend services: just craft on a static/SSR foundation. Every phase boundary is a URL you could drop on a resume.

## Phases

**Phase Numbering:**

- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (e.g., 1.1, 2.1): Urgent insertions added later (none initially)

- [x] **Phase 1: Foundation + IDE Shell** - Scaffold + dark IDE chrome live on a public Vercel URL
- [ ] **Phase 2: Resume & About Layer** - MDX resume, nav, footer, PDF — recruiter path complete in one click
- [ ] **Phase 3: Playwright Showcase + Hardening** - Real E2E tests displayed in IDE shell; CI; a11y; OG cards; launch-ready

## Phase Details

### Phase 1: Foundation + IDE Shell

**Goal**: A public Vercel URL serves the dark IDE-style chrome — left sidebar file explorer, main editor pane, bottom terminal/log pane — with design tokens loaded and TypeScript strict passing.
**Mode:** mvp
**Depends on**: Nothing (first phase)
**Requirements**: FOUND-01, FOUND-02, FOUND-03, FOUND-04, SHELL-01, SHELL-02, SHELL-03, SHELL-04, SHELL-05
**Success Criteria** (what must be TRUE):

  1. A visitor opens the deployed Vercel URL and sees the dark IDE chrome: left sidebar with file entries, a main editor pane, and a bottom terminal/log pane, all rendering the design tokens from the handoff.
  2. Clicking a file entry in the sidebar loads the file content into the editor pane with TypeScript syntax highlighting.
  3. `pnpm typecheck && pnpm lint` both exit 0; the Vercel deploy is green on push to main.
  4. No API keys or external services required beyond Vercel hosting.

**Plans**: TBD
**UI hint**: yes

### Phase 2: Resume & About Layer

**Goal**: The "who built this" path is one click from the IDE shell — `/about` renders the full resume from MDX, a PDF is linked and current, and nav + footer are consistent across every page.
**Mode:** mvp
**Depends on**: Phase 1
**Requirements**: CONT-01, CONT-02, CONT-03, CONT-04, CONT-05
**Success Criteria** (what must be TRUE):

  1. A recruiter on the landing page reaches the full resume in exactly one click via primary navigation.
  2. `/about` renders work history, projects, skills, and contact from MDX with correct heading hierarchy and styling.
  3. A downloadable PDF resume is linked from About and matches the on-page content (no broken link, no stale dates).
  4. Every page has consistent primary nav and a footer with contact email, GitHub, LinkedIn, and a "no tracking" note.

**Plans**: TBD
**UI hint**: yes

### Phase 3: Playwright Showcase + Hardening

**Goal**: Real TypeScript Playwright E2E tests of the site are displayed in the IDE shell's file explorer; CI runs them on every push; the site passes WCAG AA, achieves LCP < 2s on 4G, and has OG cards + robots/sitemap before any sharing.
**Mode:** mvp
**Depends on**: Phase 2
**Requirements**: SHOW-01, SHOW-02, SHOW-03, HARD-01, HARD-02, HARD-03, HARD-04, HARD-05
**Success Criteria** (what must be TRUE):

  1. The IDE shell file explorer lists the real Playwright test files; clicking each shows TypeScript code with full syntax highlighting in the editor pane.
  2. GitHub Actions runs the Playwright suite on every push to main; the CI status is green.
  3. An automated axe-core pass on every page reports zero WCAG AA violations; all interactive elements are keyboard-navigable with visible focus.
  4. The deployed landing page achieves LCP < 2s on simulated 4G; the URL renders cleanly as an OG card when shared on Slack or LinkedIn.
  5. `robots.txt` + `sitemap.xml` are live; the candidate has walked every page and link from a clean browser.

**Plans**: TBD
**UI hint**: yes

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation + IDE Shell | 5/5 | Complete | 2026-05-19 |
| 2. Resume & About Layer | 1/3 | In Progress|  |
| 3. Playwright Showcase + Hardening | 0/TBD | Not started | - |
