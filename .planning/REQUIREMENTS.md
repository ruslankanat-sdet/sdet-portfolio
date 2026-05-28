# Requirements: SDET Portfolio Site — v1.2

**Defined:** 2026-05-26
**Milestone:** v1.2 — Recruiter View & Dual-Audience Landing
**Core Value:** A recruiter opens the page and immediately sees working code — real Playwright tests, real TypeScript — and thinks "I need to interview this person."

## v1.2 Requirements

### Architecture (ARCH)

- [x] **ARCH-01**: IDE and `/about` pages live under an `(ide)` route group so the root layout carries no `SiteHeader` — door and recruiter views own their full viewport *(Validated in Phase 7)*
- [x] **ARCH-02**: Root `page.tsx` is a `"use client"` `ResumeGate` component that reads `localStorage["resume-mode"]` on mount and renders Door, Recruiter, or IDE view accordingly *(Validated in Phase 7)*
- [x] **ARCH-03**: Newsreader serif font (display + body) and JetBrains Mono (already loaded) are available for recruiter styles via `next/font/google` *(Validated in Phase 7)*

### Landing Door (DOOR)

- [x] **DOOR-01**: First-time visitor sees a full-viewport split-screen door — left cream half (recruiter) and right dark IDE half — both clickable with hover expansion animation
- [x] **DOOR-02**: Clicking a door half sets `localStorage["resume-mode"]` to `"recruiter"` or `"ide"` and renders the appropriate view without a page navigation
- [x] **DOOR-03**: Return visitor is routed directly to their previously chosen view — the door is not shown again on re-visit
- [x] **DOOR-04**: Visitor who appends `?reset` to any URL sees the door again — stored mode is cleared

### Recruiter View (REC)

- [ ] **REC-01**: Recruiter view has a sticky masthead — wordmark ("ruslan.kanat / résumé"), logo glyph, and an "Engineer view ↗" pill that switches to the IDE view
- [ ] **REC-02**: Hero shows an availability status pill (pulsing green dot, "Available · Q3 start"), a large editorial headline, a pitch paragraph, and two CTAs: "Download PDF ↓" (triggers `window.print()`) and email link
- [ ] **REC-03**: §01 "By the numbers" section — four stat tiles (years, flake rate, coverage, bugs caught YTD) with large serif numbers and mono labels
- [ ] **REC-04**: §02 "What I'm doing now" — current-role lede paragraph with drop-cap first letter
- [ ] **REC-05**: §03 "Experience" — three jobs rendered as a timeline with date-span column, role/company header, scope paragraph, and stack pills per job
- [ ] **REC-06**: §04 "Stack" — four skill groups (Automation, AI/ML, Infra, Languages), each with a mono category label and serif pill items
- [ ] **REC-07**: §05 "What I'm looking for" — a two-column spec-sheet card with six rows: Status, Location, Level, Best fit, Comp, Visa
- [ ] **REC-08**: Contact section (large email link + three-column grid: Email / GitHub / LinkedIn) and footer with "Prefer the engineer view? Open the IDE →" switch
- [ ] **REC-09**: "Download PDF" triggers `window.print()`; a print stylesheet hides masthead switch, CTAs, and footer, and reflows the layout to print cleanly on one A4/Letter page
- [ ] **REC-10**: Recruiter view is fully readable and navigable on mobile (≤600px): metrics wrap to 2-col, experience timeline stacks to 1-col, availability card stacks to 1-col, fonts remain legible

### Real Content (CONT)

- [ ] **CONT-RK-01**: All prototype "Alex Morgan" copy replaced with Ruslan Kanatbek's actual name, job history, stack, availability, and contact details — no placeholder data visible on the live site

## Future Requirements

Acknowledged but deferred from this milestone.

### Deferred to v1.3+

- **DEBT-05**: TestAutomatorPane dead code removed from bundle
- **BRAND-01**: Headshot photo in recruiter view hero
- **BRAND-02**: Custom color palette / logo / wordmark
- **SHOW-04**: Portfolio GitHub repo linked from recruiter view or IDE sidebar
- **CONT-06**: About/bio MDX page updated with current copy (linked from recruiter view)

### Deferred to v1.5

- **AI-01**: Test Automator — input URL or user story; output Playwright TypeScript test
- **AI-02**: Test Data Generator — input schema description; output synthetic data (JSON/CSV/SQL)
- **AI-03**: API Test Generator — input OpenAPI spec; output REST test suite

### Deferred to v2

- **SHOW-05+**: Additional GitHub repos in IDE sidebar
- **PERF-01**: LCP < 2s verified in Vercel Speed Insights and documented

## Out of Scope (v1.2)

| Feature | Reason |
|---------|--------|
| Headshot / logo in recruiter view | Candidate assets not yet available |
| Custom domain DNS | Candidate not ready |
| AI tools | v1.5 — requires API keys, rate limiting, separate milestone |
| Live browser automation sandbox | v2 — browser pool ops, cost, abuse risk |
| Accounts / auth / persistence | Explicitly out of scope for entire v1.x series |
| CMS / authoring UI | Single-author site; code edits are acceptable |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| ARCH-01 | Phase 7 | Pending |
| ARCH-02 | Phase 7 | Pending |
| ARCH-03 | Phase 7 | Pending |
| DOOR-01 | Phase 8 | Complete |
| DOOR-02 | Phase 8 | Complete |
| DOOR-03 | Phase 8 | Complete |
| DOOR-04 | Phase 8 | Complete |
| REC-01 | Phase 9 | Pending |
| REC-02 | Phase 9 | Pending |
| REC-03 | Phase 9 | Pending |
| REC-04 | Phase 9 | Pending |
| REC-05 | Phase 9 | Pending |
| REC-06 | Phase 9 | Pending |
| REC-07 | Phase 9 | Pending |
| REC-08 | Phase 9 | Pending |
| REC-09 | Phase 10 | Pending |
| REC-10 | Phase 10 | Pending |
| CONT-RK-01 | Phase 10 | Pending |

**Coverage:**

- v1.2 requirements: 18 total
- Mapped to phases: 18 (100%)
- Unmapped: 0

---
*Requirements defined: 2026-05-26*
*Last updated: 2026-05-26 — v1.2 milestone start*
