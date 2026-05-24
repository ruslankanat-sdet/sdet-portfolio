# Phase 1: Discussion Log

**Date:** 2026-05-16
**Phase:** Foundations + Test Automator Live

---

## Area 1: Site Architecture

**Question:** The IDE design is a full-screen portfolio shell. The tools are real interactive UIs. How should they co-exist?

**Options presented:**
- IDE shell wraps the tools (tools open in editor area)
- Split site — IDE for portfolio, /tools for tool suite
- Tools-first, IDE is Phase 4

**Selected:** IDE shell wraps the tools

**Notes:** Single coherent shell. Clicking a tool entry in the file tree opens the real interactive tool UI inside the editor pane. Most ambitious but zero navigation confusion. Full design handoff available at `.planning/design/design_handoff_ide_portfolio/`.

---

## Area 2: Default View

**Question:** When the site loads, what does a visitor see first in the editor area?

**Options presented:**
- README.md — intro to the site
- bio.json — profile open by default
- Test Automator tool open by default

**Selected:** README.md — intro to the site

**Notes:** Orients the visitor with a short welcome before they explore tools or bio content.

---

## Area 3: Test Automator Input UX

**Question:** How does the URL vs user-story switch work?

**Options presented:**
- Single textarea + toggle above it
- Single adaptive textarea (auto-detect)
- Two separate input fields

**Selected:** Single textarea, toggle above it

**Notes:** Small `URL | User Story` pill toggle. Two distinct input types with separate validation. Clear affordance without being form-heavy.

---

## Area 4: Demo Fixture

**Question:** What should the "Try with example" button pre-fill?

**Options presented:**
- A real URL (e.g. github.com/login)
- A written user story about Resmed work
- A generic user story

**Selected (freeform):** User stories that test this portfolio website itself

**Notes:** Meta-demo — the portfolio tests itself. Intentionally on-brand for an SDET. Pre-fills in User Story mode. Example: "User visits the IDE portfolio, opens the Test Automator tool from the sidebar, enters a user story, and receives streaming Playwright and Pytest test code within 30 seconds."

---

## Area 5: Output Tabs

**Question:** Inside the IDE shell, how should Playwright and Pytest outputs appear?

**Options presented:**
- Language sub-tabs inside the editor area (playwright.ts / test_suite.py)
- Two separate IDE editor tabs auto-opened after generation

**Selected:** Language tabs inside the editor area

**Notes:** Sub-tabs within the tool pane. Stays within the editor without cluttering the IDE tab bar. Active sub-tab shows streaming code; inactive shows "generating..." placeholder.

---

## Claude's Discretion

- Rate limiting in Phase 1 vs deferred: Claude chose to wire Upstash Redis in Phase 1 (not defer) per the ROADMAP success criteria requiring rate limiting from day one.
- AI chat widget: noted as potentially stubbable in Phase 1 if time-constrained; captured as deferred idea.

## Deferred Ideas

- AI chat wired to real Claude API — Phase 4 or v1.5
- Mobile/responsive IDE layout — Phase 5
- Full light theme polish — Phase 5
