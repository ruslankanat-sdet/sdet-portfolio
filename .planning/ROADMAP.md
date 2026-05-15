# Roadmap: SDET AI Toolkit — Portfolio Site

## Overview

A vertical-MVP build of a public SDET AI toolkit + portfolio site. Each phase ships something a recruiter can click — never a "framework only" milestone. Phase 1 puts the flagship tool (Test Automator) live on a public Vercel URL the day foundations land; Phases 2-3 layer in the second and third tools and the tools-first landing page; Phase 4 attaches the resume/About layer so the candidate is one click away from any tool; Phase 5 is the pre-share hardening gate. Every phase boundary is a checkpoint where the URL could go on a resume in a pinch.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3, 4, 5): Planned milestone work
- Decimal phases (e.g., 2.1, 3.2): Urgent insertions added later (none initially)

- [ ] **Phase 1: Foundations + Test Automator Live** - Public Vercel URL with the flagship Test Automator tool working end-to-end
- [ ] **Phase 2: Test Data Generator Live** - Second tool ships; structured-output (tool-use + Zod) pattern proven
- [ ] **Phase 3: API Test Generator Live + Tools-First Landing** - Third tool ships; landing page leads with all three tool cards and the Coming-Soon shelf
- [ ] **Phase 4: Resume & About Layer** - Recruiter-facing portfolio: About/Resume page, PDF download, unified nav, footer; "who built this" is one click from anywhere
- [ ] **Phase 5: Hardening & Pre-Launch** - A11y, perf, prompt-injection mitigations, smoke tests, bundle-grep, OG cards, robots/sitemap, manual run-through — production-ready verdict

## Phase Details

### Phase 1: Foundations + Test Automator Live
**Goal**: A public Vercel URL hosts a credibly-working `/tools/test-automator` end-to-end — URL or user-story input streams Playwright + Pytest code with rate-limiting, error states, and no-persistence guarantees in place.
**Mode:** mvp
**Depends on**: Nothing (first phase)
**Requirements**: FOUND-01, FOUND-02, FOUND-03, FOUND-04, FOUND-05, FOUND-06, FOUND-07, FOUND-08, FRAME-01, FRAME-02, FRAME-03, FRAME-04, FRAME-05, FRAME-06, FRAME-07, FRAME-08, FRAME-09, FRAME-10, FRAME-11, AUTO-01, AUTO-02, AUTO-03, AUTO-04, AUTO-05, AUTO-06, AUTO-07
**Success Criteria** (what must be TRUE):
  1. A visitor opens the deployed Vercel URL and sees a placeholder landing page with a working "Test Automator" card linking to `/tools/test-automator`.
  2. A visitor at `/tools/test-automator` submits a URL or user story, watches Playwright (TypeScript) and Pytest code stream in within ~1s of first token, switches between language tabs, copies and downloads the generated code, and reads a short rationale block — without ever seeing a blank-screen wait, raw stack trace, or generic spinner.
  3. The 11th identical request from a single IP in 60 seconds is rate-limited with a clear `Retry-After` message (no API spend leaks), and oversized inputs (>cap) are rejected with 413 *before* any LLM call.
  4. The `ANTHROPIC_API_KEY` is not present in any production JS bundle (verified by CI grep for `sk-ant-` and `NEXT_PUBLIC_.*KEY`), and the Vercel-AI-SDK-vs-direct-Anthropic-SDK decision is recorded in PROJECT.md Key Decisions.
  5. Every tool UI surface displays a visible "no persistence" notice and an example-fixture button that one-clicks a recruiter into a working demo.
**Plans**: TBD
**UI hint**: yes

### Phase 2: Test Data Generator Live
**Goal**: A visitor at `/tools/test-data-generator` describes a schema in English, picks a volume, and gets internally-consistent realistic synthetic data rendered as JSON, CSV, and SQL INSERTs on switchable tabs — proving the structured-output (Anthropic tool-use + Zod-validated JSON) pattern on top of the Phase 1 framework.
**Mode:** mvp
**Depends on**: Phase 1
**Requirements**: DATA-01, DATA-02, DATA-03, DATA-04, DATA-05, DATA-06, DATA-07
**Success Criteria** (what must be TRUE):
  1. A visitor at `/tools/test-data-generator` submits a natural-language schema (e.g., "20 users with realistic emails, ages 18-90 skewed young, no real domains") and within ~15s sees the same rows rendered identically on JSON, CSV, and SQL `INSERT` tabs, with copy and download buttons working per the `<ToolOutput>` standard.
  2. The volume slider/input enforces a 1-500 record cap (no runaway LLM cost), and generated emails use non-routable domains while names and addresses look clearly synthetic (no real-PII patterns).
  3. The "Try with example" button populates a useful fixture and the tool is reachable as a card on the landing page alongside Test Automator.
  4. The route renders structured JSON validated by Zod on the server *before* any data reaches the client — malformed model output never crashes the UI.
**Plans**: TBD
**UI hint**: yes

### Phase 3: API Test Generator Live + Tools-First Landing
**Goal**: A visitor at `/tools/api-test-generator` supplies an OpenAPI spec (paste, URL, or ≤1 MB upload) and gets a runnable Pytest + Playwright-API test suite covering positive, negative, and edge cases; the landing page now leads with all three tool cards above the fold and a Coming-Soon shelf naming the v1.5 tools.
**Mode:** mvp
**Depends on**: Phase 2
**Requirements**: API-01, API-02, API-03, API-04, API-05, API-06, API-07, API-08, API-09, CONT-01, CONT-03
**Success Criteria** (what must be TRUE):
  1. A visitor at `/tools/api-test-generator` pastes/links/uploads a Petstore-style OpenAPI spec and receives a Pytest + Playwright API test suite covering positive, negative, and edge cases on switchable tabs, with the spec validated by `@apidevtools/swagger-parser` *before* any LLM call (invalid specs return clear errors with pointer detail, never silent failure).
  2. Specs with more than the configured threshold (default 10) of operations show a UI for the visitor to pick a subset rather than blowing the request budget — and uploads >1 MB are rejected with a clear 413, never persisted to disk.
  3. A visitor landing on `/` sees three tool cards (Test Automator, Test Data Generator, API Test Generator) above the fold, each with a name, one-line value prop, and "Try it" CTA — recruiter understands the site's value in 6 seconds.
  4. Directly below the v1 cards, a "Coming Soon" shelf names each v1.5 tool (Flaky Test Diagnoser, Jira Ticket Analyzer, Bug Report Polisher, Test Review Assistant) with a one-line description and a disabled CTA — signaling the broader vision without pretending unbuilt features exist.
**Plans**: TBD
**UI hint**: yes

### Phase 4: Resume & About Layer
**Goal**: The "who built this" path is one click from any tool page — `/about` renders the candidate's resume from MDX (work history, projects, skills, contact), a downloadable PDF is linked and current, the landing-page header strip identifies the candidate, and every page has unified primary nav plus a footer with contact links and a privacy/no-tracking note.
**Mode:** mvp
**Depends on**: Phase 3
**Requirements**: CONT-02, CONT-04, CONT-05, CONT-06, CONT-07
**Success Criteria** (what must be TRUE):
  1. A recruiter on any tool page can reach the resume in exactly one click via primary navigation that links tools ↔ about ↔ contact consistently across the site.
  2. The landing page's above-the-fold area includes a short header strip identifying the candidate (name, "Senior SDET / QA Automation Engineer", link to About) — clear to a 6-second-scan recruiter without scrolling.
  3. `/about` renders work history, projects, skills, and contact from MDX, and the downloadable PDF resume linked from About matches the on-page content (no broken links, no stale dates).
  4. The footer on every page lists contact email, GitHub link, LinkedIn link, and an explicit "no tracking" / privacy note.
**Plans**: TBD
**UI hint**: yes

### Phase 5: Hardening & Pre-Launch
**Goal**: The site passes the production-ready verdict — WCAG AA verified, LCP <2s on 4G for the statically-rendered landing page, prompt-injection mitigations on outputs, bot/abuse heuristics layered on rate limits, post-deploy smoke tests + bundle scan confirm nothing regressed, Open Graph cards and robots/sitemap are in place, and the candidate has personally run every tool from a clean browser to confirm nothing visibly broken.
**Mode:** mvp
**Depends on**: Phase 4
**Requirements**: HARD-01, HARD-02, HARD-03, HARD-04, HARD-05, HARD-06, HARD-07, HARD-08, HARD-09
**Success Criteria** (what must be TRUE):
  1. Every tool input and output is reachable by keyboard with visible focus, has screen-reader labels, and an automated axe-core pass on each page reports zero WCAG AA violations.
  2. The deployed landing page achieves LCP <2s on simulated 4G (Speed Insights or Lighthouse), is statically rendered (no LLM dependency on initial paint), and shares cleanly on Slack/LinkedIn with intentional Open Graph + Twitter Card previews.
  3. A post-deploy Playwright E2E suite runs against the production Vercel URL and successfully exercises each v1 tool's "Try with example" path; a post-deploy bundle grep confirms zero matches for `sk-ant-` or the literal API key.
  4. Prompt-injection probes against the user-supplied spec/code/HTML inputs do not alter tool behavior or render as HTML in the output, and basic UA/header sanity checks reject obvious abuse traffic before it reaches the rate limiter's quota.
  5. The candidate has manually walked through every tool from a clean browser, every nav link, the PDF download, and every footer link — nothing obviously broken, nothing visibly stale; `robots.txt` + `sitemap.xml` allow the site to be indexed.
**Plans**: TBD
**UI hint**: yes

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundations + Test Automator Live | 0/TBD | Not started | - |
| 2. Test Data Generator Live | 0/TBD | Not started | - |
| 3. API Test Generator Live + Tools-First Landing | 0/TBD | Not started | - |
| 4. Resume & About Layer | 0/TBD | Not started | - |
| 5. Hardening & Pre-Launch | 0/TBD | Not started | - |
