# Requirements: SDET Portfolio Site — v1.1

**Defined:** 2026-05-23
**Milestone:** v1.1 — Content, Quality & Accessibility Pass
**Core Value:** A recruiter opens the page and immediately sees working code — real Playwright tests, real TypeScript — and thinks "I need to interview this person."

## v1.1 Requirements

### Tech Debt (DEBT)

- [ ] **DEBT-01**: Visitor sees the full candidate title "Senior SDET / QA Automation Engineer" in the SiteHeader
- [ ] **DEBT-02**: Visitor sees the current copyright year (© 2026) in the Footer
- [ ] **DEBT-03**: Visitor sees real CI pass/fail status in the TopBar badge, reflecting actual GitHub Actions state
- [ ] **DEBT-04**: IDE sidebar file entries match the actual e2e/ spec files in the repository (files-data.ts kept in sync)

### Mobile Responsiveness (MOB)

- [ ] **MOB-01**: Mobile user can open and navigate the IDE sidebar with touch interactions
- [ ] **MOB-02**: Mobile user can read code in the editor pane without content cut off by horizontal overflow
- [ ] **MOB-03**: Mobile user can read terminal log entries without layout breakage or text overflow
- [ ] **MOB-04**: Mobile user can navigate between pages via the header/nav on small screens
- [ ] **MOB-05**: Mobile user can read and navigate the full About/resume page on a phone

### Non-Technical UX (UX)

- [ ] **UX-01**: Non-technical visitor understands the purpose of each IDE pane (sidebar, editor, terminal) from the UI alone — no prior knowledge of developer tooling required

### Unit Tests (TEST)

- [ ] **TEST-01**: Vitest tests cover the TypeScript tokenizer highlight logic (correct token types for TS syntax)
- [ ] **TEST-02**: Vitest tests validate the file-data.ts shape (all entries have required fields, tokens are well-formed)
- [ ] **TEST-03**: Vitest tests cover sidebar rendering behavior (files appear, click triggers editor update)

## Future Requirements

Acknowledged but deferred from this milestone.

### Deferred to v1.2+

- **DEBT-05**: TestAutomatorPane dead code removed from bundle
- **SHOW-04**: Portfolio GitHub repo linked/visible from About page or IDE sidebar
- **CONT-06**: About/bio copy updated with current candidate info (deferred until content is ready)
- **PERF-01**: LCP < 2s verified in Vercel Speed Insights and documented

### Deferred to v2

- **SHOW-05+**: Additional GitHub repos (SDET work samples) in showcase
- **BRAND-01**: Headshot photo placed in About page
- **BRAND-02**: Custom color palette applied
- **BRAND-03**: Logo / wordmark designed and placed

## Out of Scope (v1.1)

| Feature | Reason |
|---------|--------|
| Brand assets (headshot, logo, palette) | Candidate assets not yet available |
| Custom domain DNS | Candidate not yet ready to wire DNS |
| AI tools (Test Automator, Data Generator, API Test Gen) | v1.5 milestone — requires API keys, rate limiting |
| Live browser automation sandbox | v2 — browser pool ops, cost, abuse risk |
| Accounts / auth / persistence | Explicitly out of scope for the entire v1.x series |

## Traceability

To be populated by roadmapper.

| Requirement | Phase | Status |
|-------------|-------|--------|
| DEBT-01 | — | Pending |
| DEBT-02 | — | Pending |
| DEBT-03 | — | Pending |
| DEBT-04 | — | Pending |
| MOB-01 | — | Pending |
| MOB-02 | — | Pending |
| MOB-03 | — | Pending |
| MOB-04 | — | Pending |
| MOB-05 | — | Pending |
| UX-01 | — | Pending |
| TEST-01 | — | Pending |
| TEST-02 | — | Pending |
| TEST-03 | — | Pending |

**Coverage:**
- v1.1 requirements: 13 total
- Mapped to phases: 0 (roadmap not yet created)
- Unmapped: 13 ⚠️

---
*Requirements defined: 2026-05-23*
*Last updated: 2026-05-23 — initial definition for v1.1*
