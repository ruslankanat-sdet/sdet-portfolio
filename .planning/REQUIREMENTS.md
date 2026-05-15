# Requirements: SDET AI Toolkit — Portfolio Site

**Defined:** 2026-05-14
**Core Value:** A visitor leaves the page either (a) actually using a tool to do their SDET work, or (b) thinking "I need to interview this person." Ideally both.

## v1 Requirements

Requirements for initial public launch. Each maps to a roadmap phase.

### Foundations & Deploy

- [ ] **FOUND-01**: Next.js 15 App Router project initialized with TypeScript (strict), Tailwind v4 (or 3.4 fallback if shadcn v4-ready check fails), shadcn/ui components, ESLint, Prettier
- [ ] **FOUND-02**: Repository deploys cleanly to Vercel on every push to `main`; preview deploys on PRs
- [ ] **FOUND-03**: `ANTHROPIC_API_KEY` and `ANTHROPIC_MODEL` configured as Vercel environment variables; never exposed to client bundle (verified by CI grep for `sk-ant-` and `NEXT_PUBLIC_.*KEY`)
- [ ] **FOUND-04**: `import 'server-only'` enforced on every module that touches the Anthropic SDK
- [ ] **FOUND-05**: Base layout (header, footer, nav) rendered on a placeholder landing page, deployed to a public Vercel URL
- [ ] **FOUND-06**: Vercel Analytics + Speed Insights installed (cookieless, no consent banner)
- [ ] **FOUND-07**: Vercel spend alerts configured (notify before runaway LLM costs)
- [ ] **FOUND-08**: Vercel-AI-SDK-vs-direct-Anthropic-SDK decision resolved and documented in Key Decisions

### Tool Framework

- [ ] **FRAME-01**: `Tool` TypeScript interface defined (metadata, Zod input schema, system prompt, prompt builder, output mode `'stream' | 'structured'`)
- [ ] **FRAME-02**: Shared `<ToolLayout>` shell — page chrome consistent across all tools (title, description, input panel, output panel, back-to-tools)
- [ ] **FRAME-03**: Shared `<ToolInput>` patterns — Zod-validated form with inline error messages, "try with example" button, mobile-responsive
- [ ] **FRAME-04**: Shared `<ToolOutput>` patterns — syntax-highlighted code blocks (Shiki, restricted languages: ts/python/json/yaml/sql/bash), language tabs where applicable, copy-to-clipboard with visible confirmation, download-as-file with correct extension
- [ ] **FRAME-05**: Server-side `runTool` wrapper — handles validation, prompt building, LLM call, streaming vs structured output, error mapping
- [ ] **FRAME-06**: Per-IP per-tool rate limiting via `@upstash/ratelimit` + Upstash Redis (sliding window); responses include `Retry-After` and `X-RateLimit-*` headers
- [ ] **FRAME-07**: Global rate-limit backstop (across all tools and IPs) to cap total spend
- [ ] **FRAME-08**: Specific (non-generic) loading states — each tool emits its own progress messages (e.g., "Reading OpenAPI spec... Generating 8 endpoint test cases...")
- [ ] **FRAME-09**: Distinct error states — rate-limited, model-error, timeout, malformed-input, and oversized-input each render with clear, non-generic messages
- [ ] **FRAME-10**: "No persistence" notice rendered in every tool UI; user inputs are processed in-request and discarded server-side
- [ ] **FRAME-11**: Input size caps enforced per tool (prevent abuse via massive prompts); inputs exceeding cap return 413 with clear message before any LLM call

### Test Automator (v1 flagship tool)

- [ ] **AUTO-01**: User can submit a URL or a user-story description (natural language); input validated client-side and server-side
- [ ] **AUTO-02**: Output streams in real time (first token visible within ~1s, no blank-screen waits)
- [ ] **AUTO-03**: Output includes both Playwright (TypeScript) and Pytest test code on switchable tabs
- [ ] **AUTO-04**: Output includes a short rationale block explaining the approach (selectors chosen, edge cases covered)
- [ ] **AUTO-05**: Generated code is syntax-highlighted and passes basic syntax validation before render (no obviously-broken code shown)
- [ ] **AUTO-06**: "Try with example" button populates the input with a known-good fixture for one-click recruiter demo
- [ ] **AUTO-07**: Tool route accessible at `/tools/test-automator`; appears as a card on the landing page

### Test Data Generator (v1)

- [ ] **DATA-01**: User can submit a natural-language schema/constraints description (e.g., "list of 20 users with realistic emails, ages 18-90 skewed young, no real domains")
- [ ] **DATA-02**: Output uses Anthropic tool use with Zod-validated JSON; raw JSON is then converted to JSON, CSV, and SQL `INSERT` formats on switchable tabs
- [ ] **DATA-03**: Realism guardrails — emails use non-routable domains by default; names/addresses are clearly synthetic (no obvious real-PII patterns)
- [ ] **DATA-04**: Volume slider or numeric input (1–500 records) — capped to keep LLM cost bounded
- [ ] **DATA-05**: Copy/download primitives match `<ToolOutput>` standard
- [ ] **DATA-06**: "Try with example" button populates input with a useful fixture
- [ ] **DATA-07**: Tool route accessible at `/tools/test-data-generator`; appears as a card on the landing page

### API Test Generator (v1)

- [ ] **API-01**: User can supply an OpenAPI / Swagger spec via paste, public URL, or file upload (≤ 1 MB, multipart in Node-runtime route, in-memory only, never persisted)
- [ ] **API-02**: Spec is parsed and validated server-side via `@apidevtools/swagger-parser` (deref + validate) *before* any LLM call; invalid specs return clear errors with line/pointer detail
- [ ] **API-03**: Output is a REST test suite covering positive, negative, and edge cases (auth-failure, schema-violation, boundary values) for each operation in the spec
- [ ] **API-04**: Output supports Pytest + `requests`/`httpx` form and Playwright API-test form on switchable tabs
- [ ] **API-05**: For specs with >N operations (configurable, default 10), tool generates tests for a user-selected subset rather than the entire spec — keeps response time and cost bounded
- [ ] **API-06**: Output structured via Anthropic tool use + Zod validation; render layer formats per tab
- [ ] **API-07**: Copy/download primitives match `<ToolOutput>` standard
- [ ] **API-08**: "Try with example" button loads a small Petstore-style fixture spec
- [ ] **API-09**: Tool route accessible at `/tools/api-test-generator`; appears as a card on the landing page

### Landing & Resume Content

- [ ] **CONT-01**: Landing page leads with the tools — three tool cards (name, one-line value prop, "Try it" CTA) visible above the fold
- [ ] **CONT-02**: Above-the-fold also includes a short header strip identifying the candidate (name, title, "Senior SDET / QA Automation Engineer", link to About) — clear to a 6-second-scan recruiter
- [ ] **CONT-03**: "Coming Soon" shelf below the v1 tools, naming each v1.5 tool (Flaky Test Diagnoser, Jira Ticket Analyzer, Bug Report Polisher, Test Review Assistant) with a one-line description and a disabled CTA — signals the broader vision
- [ ] **CONT-04**: `/about` page (or equivalent) renders resume content from MDX — work history, projects, skills, contact
- [ ] **CONT-05**: Downloadable PDF resume linked from About; PDF content kept in sync with the on-page version
- [ ] **CONT-06**: Primary navigation links tools ↔ about ↔ contact on every page; resume reachable in one click from any tool page
- [ ] **CONT-07**: Footer includes contact email, GitHub link, LinkedIn link, and "no tracking" / privacy note

### Hardening & Pre-Launch

- [ ] **HARD-01**: WCAG AA compliance verified — keyboard navigation, focus management, screen-reader labels on every tool input and output
- [ ] **HARD-02**: LCP < 2s on simulated 4G for the landing page; landing page statically rendered (no LLM dependency on initial paint)
- [ ] **HARD-03**: Prompt-injection mitigations on outputs — LLM output rendered as text (never as HTML); generated code surfaces never `dangerouslySetInnerHTML`; user-provided spec/code/HTML in inputs is treated as data not instruction
- [ ] **HARD-04**: Bot/abuse heuristics in middleware (basic UA filtering, header sanity checks) layered on top of `@upstash/ratelimit`
- [ ] **HARD-05**: Production smoke tests — each v1 tool's "Try with example" path is exercised by a Playwright E2E test that runs against the deployed Vercel URL post-deploy
- [ ] **HARD-06**: Post-deploy bundle scan — fetch production JS, grep for `sk-ant-` and the literal API key value, fail if any matches
- [ ] **HARD-07**: Open Graph + Twitter Card meta on landing and About pages — URL shared in Slack/LinkedIn renders cleanly
- [ ] **HARD-08**: `robots.txt` + `sitemap.xml` generated; site is indexable
- [ ] **HARD-09**: Manual run-through of each tool by the candidate from a clean browser to verify nothing obviously broken at launch

## v1.5 Requirements

Deferred to the first post-launch iteration. Named on the landing-page "Coming Soon" shelf at v1 launch.

### Flaky Test Diagnoser

- **DIAG-01**: User can paste a test (Playwright/Pytest) plus a failure log → AI identifies likely flake cause (timing, isolation, ordering, env, selector instability)
- **DIAG-02**: Output includes concrete fix suggestions with code snippets
- **DIAG-03**: Reuses the structured-output pattern from API Test Generator

### Jira Ticket Analyzer

- **JIRA-01**: User can paste ticket text → AI produces "how to test" steps, edge cases to consider, acceptance-criteria gaps
- **JIRA-02**: Output structured as: test scenarios, edge cases, AC gaps, risk assessment

### Bug Report Polisher

- **BUG-01**: User can paste rough notes (optionally with an image description / screenshot) → AI returns structured bug report (title, repro steps, expected, actual, severity hint, environment template)
- **BUG-02**: Output adheres to a standard bug-report shape that copies cleanly into Jira/GitHub

### Test Review Assistant

- **REVIEW-01**: User can paste a test → AI critiques (naming, brittleness, smells, assertion quality) with concrete fixes
- **REVIEW-02**: Output ranks findings by severity (blocker / smell / nitpick)

### Cross-Tool v1.5

- **CROSS-01**: Local-only "Save my outputs" via browser localStorage; export saved outputs as JSON
- **CROSS-02**: Open Graph dynamic preview images per tool
- **CROSS-03**: Light/dark theme toggle (system-aware default)
- **CROSS-04**: SEO content for each tool page (meta description, FAQ schema)

## v2 Requirements

Acknowledged, not in current roadmap.

### Additional Tools

- **LOC-01**: Locator Strategy Advisor — HTML → ranked stable selectors with rationale and brittleness scores
- **POM-01**: Page Object Generator — URL or HTML → POM class scaffold for Playwright/Selenium
- **COV-01**: Coverage Gap Finder — test inventory + feature spec → tests you're missing
- **SAND-01**: Live Playwright sandbox running real generated tests against a demo site

### Platform

- **PLAT-01**: Public usage metrics surface ("tools-run" counter) — social proof for both audiences
- **PLAT-02**: User accounts (only if v2 demand justifies — accounts unlock saved outputs, sharing, history)
- **PLAT-03**: Custom domain wired (candidate handles DNS; site DNS-readiness verified)

## Out of Scope

Explicitly excluded. Logged so they don't sneak back in.

| Feature | Reason |
|---------|--------|
| AI chatbot ("ask my resume") | Cut by user on pivot — tools demonstrate skill more concretely than a chatbot summary |
| Test Case Manager | Implies accounts + DB + multi-tenancy; scope-explosion that would push ship date by weeks. Local "save outputs" in v1.5 covers the lightweight version |
| User accounts / login in v1 or v1.5 | These are public stateless tools; auth adds days of work for zero v1 visitor value |
| Server-side persistence of user inputs | Privacy commitment ("no persistence" is stated in every tool UI); also eliminates DB scope |
| CMS / authoring UI | Single-author site; markdown/code edits via repo are sufficient |
| Live browser sandboxes in v1 | Browser pool ops, cost spikes, abuse risk; deferred to v2 |
| Multi-tenant "build your own portfolio" | This is the candidate's site, not a product for others |
| i18n / multi-language | Audience is English-speaking recruiters and SDETs |
| Server-side queues / async jobs | Every v1 tool must respond in a single request within ~30s; if a tool can't, scope it down |
| Custom domain setup as a project phase | Candidate wires DNS themselves; v1 must work on the default Vercel URL |
| Cypress / Selenium / RestAssured output as primary | Pytest + Playwright (TS + Python) covers the dominant 2026 stack; secondary frameworks belong in v2 if asked for |
| Vercel AI SDK *and* direct `@anthropic-ai/sdk` mixed in v1 | Pick one in Phase 1; do not mix mid-build |

## Traceability

Every v1 requirement maps to exactly one phase. Mapped by `gsd-roadmapper` on 2026-05-14.

| Requirement | Phase | Status |
|-------------|-------|--------|
| FOUND-01 | Phase 1 | Pending |
| FOUND-02 | Phase 1 | Pending |
| FOUND-03 | Phase 1 | Pending |
| FOUND-04 | Phase 1 | Pending |
| FOUND-05 | Phase 1 | Pending |
| FOUND-06 | Phase 1 | Pending |
| FOUND-07 | Phase 1 | Pending |
| FOUND-08 | Phase 1 | Pending |
| FRAME-01 | Phase 1 | Pending |
| FRAME-02 | Phase 1 | Pending |
| FRAME-03 | Phase 1 | Pending |
| FRAME-04 | Phase 1 | Pending |
| FRAME-05 | Phase 1 | Pending |
| FRAME-06 | Phase 1 | Pending |
| FRAME-07 | Phase 1 | Pending |
| FRAME-08 | Phase 1 | Pending |
| FRAME-09 | Phase 1 | Pending |
| FRAME-10 | Phase 1 | Pending |
| FRAME-11 | Phase 1 | Pending |
| AUTO-01 | Phase 1 | Pending |
| AUTO-02 | Phase 1 | Pending |
| AUTO-03 | Phase 1 | Pending |
| AUTO-04 | Phase 1 | Pending |
| AUTO-05 | Phase 1 | Pending |
| AUTO-06 | Phase 1 | Pending |
| AUTO-07 | Phase 1 | Pending |
| DATA-01 | Phase 2 | Pending |
| DATA-02 | Phase 2 | Pending |
| DATA-03 | Phase 2 | Pending |
| DATA-04 | Phase 2 | Pending |
| DATA-05 | Phase 2 | Pending |
| DATA-06 | Phase 2 | Pending |
| DATA-07 | Phase 2 | Pending |
| API-01 | Phase 3 | Pending |
| API-02 | Phase 3 | Pending |
| API-03 | Phase 3 | Pending |
| API-04 | Phase 3 | Pending |
| API-05 | Phase 3 | Pending |
| API-06 | Phase 3 | Pending |
| API-07 | Phase 3 | Pending |
| API-08 | Phase 3 | Pending |
| API-09 | Phase 3 | Pending |
| CONT-01 | Phase 3 | Pending |
| CONT-03 | Phase 3 | Pending |
| CONT-02 | Phase 4 | Pending |
| CONT-04 | Phase 4 | Pending |
| CONT-05 | Phase 4 | Pending |
| CONT-06 | Phase 4 | Pending |
| CONT-07 | Phase 4 | Pending |
| HARD-01 | Phase 5 | Pending |
| HARD-02 | Phase 5 | Pending |
| HARD-03 | Phase 5 | Pending |
| HARD-04 | Phase 5 | Pending |
| HARD-05 | Phase 5 | Pending |
| HARD-06 | Phase 5 | Pending |
| HARD-07 | Phase 5 | Pending |
| HARD-08 | Phase 5 | Pending |
| HARD-09 | Phase 5 | Pending |

**Coverage:**
- v1 requirements: 58 total (FOUND × 8, FRAME × 11, AUTO × 7, DATA × 7, API × 9, CONT × 7, HARD × 9 = 58)
- Mapped to phases: 58/58 ✓
- Unmapped: 0

**Phase totals:**
- Phase 1 (Foundations + Test Automator Live): 26 requirements (FOUND × 8, FRAME × 11, AUTO × 7)
- Phase 2 (Test Data Generator Live): 7 requirements (DATA × 7)
- Phase 3 (API Test Generator Live + Tools-First Landing): 11 requirements (API × 9, CONT-01, CONT-03)
- Phase 4 (Resume & About Layer): 5 requirements (CONT-02, CONT-04, CONT-05, CONT-06, CONT-07)
- Phase 5 (Hardening & Pre-Launch): 9 requirements (HARD × 9)

---
*Requirements defined: 2026-05-14*
*Last updated: 2026-05-14 after roadmap traceability mapping*
