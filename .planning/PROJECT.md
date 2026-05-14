# SDET AI Toolkit — Portfolio Site

*Working title — final branding TBD.*

## What This Is

A web-based suite of free, AI-powered utilities for SDET / QA automation engineers — test code generation, test data synthesis, API test generation, and more on the roadmap. It is also the personal portfolio of a senior SDET / QA automation engineer: the resume and about-me content sit alongside the tools so that recruiters and hiring managers immediately see the builder behind them. "Tools showcase the resume" — the candidate's skill is proved by daily-useful software running in the recruiter's browser, not by claims on a PDF.

## Core Value

**A visitor leaves the page either (a) actually using a tool to do their SDET work, or (b) thinking "I need to interview this person." Ideally both.**

If everything else fails, the v1 tools must work well enough that an SDET would bookmark the site, and the resume must be one click away from any page.

## Requirements

### Validated

<!-- Shipped and confirmed valuable. -->

(None yet — ship to validate)

### Active

<!-- Current scope. Building toward these. v1 = ship-this-week; v1.5/v2 = follow-on layers. -->

**v1 — Ship now (lands the first interviews):**

Tools (the "breadth pick" — three specialties, all stateless, all shipable fast):

- [ ] **Test Automator** — input: URL or user story; output: working Playwright (TypeScript) and Pytest (Python) test code
- [ ] **Test Data Generator** — input: schema description / constraints; output: realistic synthetic data in JSON, CSV, and SQL formats
- [ ] **API Test Generator** — input: OpenAPI / Swagger spec (paste, URL, or upload); output: REST test suite covering positive, negative, and edge cases (Pytest + Playwright/RestAssured-style)

Site & content:

- [ ] Polished landing page that leads with the tools (cards, what each does, "try it" CTAs) — recruiters understand the value in 6 seconds
- [ ] Resume / About page accessible from primary nav: work history, projects, skills, contact, downloadable PDF
- [ ] "Coming soon" shelf visible on day one, naming the v1.5 tools by name — signals the bigger vision without pretending they exist
- [ ] Mobile-responsive, accessible (WCAG AA), fast (LCP < 2s on 4G); landing page statically rendered
- [ ] Deployed to a public Vercel URL with privacy-friendly analytics

Trust & safety:

- [ ] Rate limiting on tool endpoints (per IP) so a single user can't burn the API budget
- [ ] No persistence of user inputs — submitted prompts/specs are processed and discarded; site states this clearly
- [ ] Sensible error states for the tools (timeout, model error, malformed input) — must never look broken to a recruiter trying a demo

**v1.5 — Add within weeks of v1 ship:**

- [ ] **Flaky Test Diagnoser** — paste test + failure log → likely flake cause + fix suggestions
- [ ] **Jira Ticket Analyzer** — paste ticket text → "how to test" steps, edge cases, acceptance criteria gaps
- [ ] **Bug Report Polisher** — rough notes / screenshot → structured bug report (repro, expected/actual, severity hint)
- [ ] **Test Review Assistant** — paste a test → critique (naming, brittleness, smells) with concrete fixes
- [ ] Local-only "save my outputs" via browser localStorage + JSON export (no accounts, no backend)
- [ ] SEO + social preview cards (Open Graph) so the URL looks good in Slack / LinkedIn / X

**v2 — Later layers:**

- [ ] Locator Strategy Advisor, Page Object Generator, Coverage Gap Finder (additional tools)
- [ ] Embedded Playwright sandbox running real tests against a demo site
- [ ] Public usage metrics (tools-run counter) — social proof for both audiences

### Out of Scope

<!-- Explicit boundaries. Includes reasoning to prevent re-adding. -->

- **AI chatbot ("ask my resume anything")** — Explicitly cut by user. Tools demonstrate skill directly; a chatbot adds another surface without unique value.
- **Test Case Manager** — Implies accounts, database, multi-tenancy, persistence, search. Scope-explosion that would push ship date by weeks. Local-only "save outputs" in v1.5 covers the lightweight version.
- **User accounts / login** — These are public stateless tools. No auth, no DB, no user data stored server-side.
- **CMS / authoring UI** — Single-author content; editing markdown/code is fine. CMS adds days of scope for zero visitor-facing value.
- **Real browser automation sandboxes in v1** — Browser pool ops, cost spikes, abuse risk. Deferred to v2 where Test Automator only *generates* code; running it is the visitor's job.
- **Custom domain setup as a project phase** — Candidate will wire DNS when ready. Site must work on the Vercel default URL on day one.
- **i18n / multi-language** — Audience is English-speaking recruiters and SDETs.
- **Server-side queue / async jobs** — Every v1 tool must respond in a single request within ~30s. If a tool can't, scope it down.

## Context

**Candidate profile:** Senior SDET / QA automation engineer targeting senior IC roles. Differentiation strategy: demonstrate AI fluency (LLM-driven test generation, agentic test workflows) on top of solid traditional foundations (Playwright/Cypress, API testing, performance/k6). Specialties to surface: Web E2E, API/integration, performance, AI-powered testing.

**Job-search urgency:** Applying *now*. Every week without a live site is opportunity cost. The site must ship a credible v1 in days, then layer up. Quality bar in v1: nothing visibly broken to a recruiter trying a tool.

**Content state:** Candidate has a resume/CV. No pre-built tool code, no project descriptions, no GitHub showcase repos, no written bios ready for drop-in. The site needs a content scaffolding step (resume → structured site content) early in execution.

**Audience model:** Two viewers with different attention budgets.
- *SDET / QA engineer* — comes for the tools, may use them daily. Conversion = bookmark + return. Site looking like a real product (not a portfolio toy) is what earns the return visit.
- *Recruiter* — 6-second scan: tools that look real + obvious "who built this" path. If hooked, may click resume.
- *Hiring manager / EM* — 2-5 minute exploration: tries a tool, looks at how it's built, reads About, clicks GitHub. Wants proof of skill, not claims.

**Strategic positioning:** "The candidate's portfolio is a product real SDETs use." Most senior-QA candidates send a PDF + LinkedIn. A handful host a demo. Very few build something the community would adopt. This site aims for the third tier.

**Risks to watch:**
- *Quality vs. speed.* A tool that hallucinates broken Playwright code or generates obviously-wrong test data is worse than no tool at all. v1 tools must be reliable on the realistic inputs they'll be tried with; bound the input space (size limits, supported formats) and ship golden-path quality before exotic-input handling.
- *Scope creep.* "Just one more tool" is the path to never shipping. v1 is locked at 3 tools; new ideas land in v1.5 or v2.
- *Cost spikes.* Public LLM-backed tools = abuse risk (botnets, prompt injection harvesting). Rate limiting, input size caps, and Vercel budget alerts from day one.
- *Looking like a toy.* A site that says "AI-powered" but produces obvious GPT-soup will damage the candidate's brand more than help. Quality of output is the entire game.

## Constraints

- **Timeline**: Ship v1 within days, not weeks — candidate is applying actively. Anything that doesn't directly contribute to v1 ship is deferred.
- **Tech stack**: Next.js (App Router) on Vercel. Server actions / API routes host each tool's LLM call. Tailwind for styling. Reason: best-in-class for AI-powered sites, free hobby tier, zero-config deploy. No alternative platforms evaluated for v1.
- **AI model**: Anthropic Claude (latest Sonnet) for the tools — strong code generation, structured tool-use output, fast enough for an interactive UX. Single provider in v1 to minimize integration surface. API key in Vercel env vars; never exposed client-side.
- **Cost ceiling**: Target near-$0/month at low traffic. Vercel hobby + pay-per-token Claude. Per-IP rate limit + per-request input size caps. Vercel spend alerts configured.
- **Performance**: Recruiter-scan path (landing page) statically rendered, no LLM dependency, LCP < 2s on 4G. Each tool responds within ~30s; longer requests are rejected with a clear message.
- **Accessibility**: WCAG AA minimum across all pages and tool UIs. Keyboard-navigable forms, focus management, screen-reader-friendly tool output.
- **Privacy**: No accounts, no PII storage server-side, no third-party trackers. Privacy-friendly analytics only (Vercel Analytics or Plausible). User input is processed in-request and discarded; site explicitly says so.
- **Security**: Inputs are LLM-bound user content — prompt-injection is a *response quality* concern, not a security one (no privileged tools/data behind the LLM in v1). Standard web hardening (CSP, no eval, sanitize rendered LLM output as text, no `dangerouslyInnerHTML`).
- **Brand assets**: None confirmed yet. v1 ships with a clean, professional default visual identity; brand polish (logo, headshot, custom palette) is a v1.5 task once candidate provides assets.

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Pivot from "resume + AI demo" to "SDET tool suite + resume" | Tools that real SDETs would *use* are more credible proof than a single demo; differentiates from the long tail of portfolio sites | — Pending |
| No AI chatbot | Explicit user cut. Tools demonstrate skill more concretely than a chatbot summary of the resume | — Pending |
| v1 trio = Test Automator + Test Data Generator + API Test Generator (breadth pick) | Spans three specialties (E2E, data, API), all stateless, all single-request, fastest credible v1 | — Pending |
| Stateless tools only in v1 (no DB, no accounts) | Eliminates entire categories of scope and ops complexity; keeps ship date in days | — Pending |
| Test Case Manager dropped | Implies persistence + accounts + multi-tenancy; explodes scope. Local-only "save output" in v1.5 covers most of the value | — Pending |
| "Coming soon" shelf shown on day one | Signals the broader vision (4+ more tools listed) without pretending unbuilt features exist | — Pending |
| Next.js App Router on Vercel; Anthropic Claude Sonnet as the only model in v1 | One-provider simplicity, fastest path to ship, ideal fit for AI-backed tools | — Pending |
| Defer live browser sandboxes to v2 | Browser-pool ops, abuse risk, cost. v1 tools generate code; visitors run it | — Pending |
| No CMS / authoring UI | Single-author site; markdown/code edits acceptable | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-05-14 after initialization (revised after pivot from "resume + chatbot" to "SDET tool suite")*
