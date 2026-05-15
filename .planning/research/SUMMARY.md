# Project Research Summary

**Project:** SDET AI Toolkit — Portfolio Site (working title)
**Domain:** Public, stateless, LLM-backed AI tool suite for SDET/QA engineers, on Next.js App Router / Vercel, doubling as a senior-IC career portfolio
**Researched:** 2026-05-14
**Confidence:** MEDIUM-HIGH

## Executive Summary

This is a single-author Next.js + Vercel site hosting a small number of stateless, LLM-backed utilities aimed at SDET/QA engineers, with a resume/about layer sitting alongside. The pattern is mature and well-trodden in 2026: a Next.js App Router app with per-tool Route Handlers, Anthropic Claude Sonnet 4.5 behind the scenes, and a few foundational concerns (rate limiting, input validation, streaming UX, syntax-highlighted output) shared across every tool.

The recommended path is *foundations-first*: build the shared "tool framework" (a `ToolLayout` shell, a typed tool definition, a server-side LLM wrapper, rate limiting, and error/empty/loading states) **before** wiring any individual tool. Three v1 tools then drop into that framework cleanly (Test Automator with streaming; Test Data Generator and API Test Generator as structured-output tools using Anthropic tool-use + Zod validation). Resume/About is a separate, mostly-static MDX route — should not block tool work.

The single biggest risk is *output quality*. A site that demos AI testing tools but emits hallucinated Playwright selectors, invalid Pytest, or plausible-but-wrong synthetic data will actively *cost* interviews. The mitigations are deterministic: structured output via tool use, syntax/AST validation of LLM-generated code before render, golden-path quality tested against a small fixture suite, and bounded inputs (size caps, supported formats). Secondary risks: API key leakage into the client bundle, an un-rate-limited public LLM endpoint, and "looks like a ChatGPT wrapper" UX — all addressed in early phases.

## Key Findings

### Recommended Stack

**See:** `.planning/research/STACK.md` for full library list, versions, and "don't use" rationale.

**Core technologies:**

- **Next.js 15 (App Router) on Node runtime** — Route Handlers, *not* Server Actions, for tool endpoints (streaming + rate-limit headers need a real HTTP boundary). Node runtime (not Edge) to avoid the Edge 25s cap and OpenAPI-parser issues.
- **React 19 + TypeScript 5.6+ + Tailwind v4 + shadcn/ui** — strict TS non-negotiable on an SDET portfolio (signals craft). Verify shadcn registry v4-readiness at install day; fall back to Tailwind 3.4 if not.
- **Anthropic Claude Sonnet 4.5** (`claude-sonnet-4-5`) as primary model; **Haiku 4.5** (`claude-haiku-4-5-20251001`) as cheap fallback. Model ID read from `ANTHROPIC_MODEL` env so it can be swapped without redeploy.
- **Zod 3** for input schemas and for validating tool-use JSON output from Claude.
- **`@upstash/ratelimit` + Upstash Redis** via Vercel Marketplace integration — sliding-window per-IP-per-tool + global backstop, with `Retry-After` / `X-RateLimit-*` headers.
- **`@apidevtools/swagger-parser`** for OpenAPI deref + validation (validate before wasting a Claude call).
- **Shiki** for syntax highlighting — build-time for static pages, restricted-language runtime mode for LLM output (ts/python/json/yaml/sql/bash only — keeps the bundle slim).
- **Vercel Analytics + Speed Insights** — cookieless, no consent banner needed.
- **MDX via `@next/mdx`** for the static resume/About page.
- **Vitest + Playwright** for the site's own tests (Playwright is the meta-flex on an SDET portfolio).

**Unresolved-during-research decision (to settle in Phase 1 planning):**
STACK.md recommends **`@anthropic-ai/sdk` direct** ("single provider in v1, full Anthropic features — prompt caching, native tool use"). ARCHITECTURE.md uses **Vercel AI SDK (`streamText` + `@ai-sdk/anthropic`)** ("cleaner streaming via `toTextStreamResponse()`, idiomatic Vercel"). Both are valid 2026 patterns. **Recommendation:** Pick Vercel AI SDK as the default for v1 — better streaming ergonomics on the flagship tool, and `@ai-sdk/anthropic` exposes prompt caching via `providerOptions`. If a v1 feature requires Anthropic-specific tool-use semantics that the provider abstraction blocks, fall back to direct SDK for that one tool. **Decide on day one; do not mix mid-build.**

### Expected Features

**See:** `.planning/research/FEATURES.md` for full competitive-landscape evaluation and per-tool quality bars.

**Tool surface — v1 trio (locked in PROJECT.md):**

- **Test Automator** — URL or user story → Playwright (TS) + Pytest test code. Streaming output. Differentiator vs. Playwright codegen / Copilot: starts from a *user story* and grounds in the DOM (when URL provided) rather than recording or hallucinating.
- **Test Data Generator** — schema/constraints prose → JSON/CSV/SQL synthetic data. Structured output (tool use + Zod). Differentiator vs. Mockaroo/Faker: natural-language constraints ("emails should be plausible but not match real domains; ages 18-90 skewed young") rather than typed UI.
- **API Test Generator** — OpenAPI/Swagger spec (paste/URL/upload) → REST test suite covering positive/negative/edge cases. Differentiator vs. Schemathesis/RESTler: produces *readable test code* rather than just running probes, and emits Pytest + Playwright API test forms.

**Cross-tool table stakes (must-have or users leave):**

- Copy-to-clipboard on generated output, with visible confirmation
- Download as file (correct extension and language)
- Syntax highlighting on code output
- Streaming progress for any >2s operation (no blank-screen waits)
- Clear, non-generic error states (rate-limited / model-error / invalid-input distinguished)
- Mobile-responsive forms and outputs
- "No persistence" stated explicitly in tool UI (builds trust)

**Cross-tool differentiators (worth doing in v1 or v1.5):**

- Inline rationale: each generated test/data set ships with a short "why this approach" note. Cheap, big perceived-quality boost.
- Two-language output for Test Automator (TS + Python) on a tab — broader appeal, faster signal of breadth.
- "Try with example" button on each tool — recruiter can demo without typing anything.

**Portfolio-side table stakes:**

- Landing page that leads with the tools (not the resume); resume one click away from any page
- About page with work history, projects, skills, contact, downloadable PDF
- Professional default visual identity from day one (clean typography, generous whitespace, no AI-cliché purple gradients)

**Defer (v1.5 / v2):**

- Flaky Test Diagnoser, Jira Ticket Analyzer, Bug Report Polisher, Test Review Assistant (named v1.5 tools — listed on "coming soon" shelf on v1 day)
- Save-output-to-localStorage + JSON export (v1.5)
- Open Graph / social-share images (v1.5)
- Live browser sandboxes, usage counters, Locator/POM/Coverage tools (v2)

### Architecture Approach

**See:** `.planning/research/ARCHITECTURE.md` for full directory layout, ToolLayout pattern, and runtime/streaming decisions.

The site is structured around a single **Tool** abstraction. Each tool is a TypeScript module exporting:
- `metadata` (slug, name, description, icon, status: v1/v1.5/coming-soon)
- `inputSchema` (Zod schema for client + server validation)
- `systemPrompt` and `buildUserPrompt(input)` builders
- `outputMode`: `'stream'` (text/code) or `'structured'` (tool use → JSON → render)

Per-tool routes follow `/app/api/tools/[slug]/route.ts` (Node runtime, single shared `runTool` helper). UI lives at `/tools/[slug]/page.tsx` and uses a shared `<ToolLayout>` shell — adding a new tool is a ~one-file-per-side affair.

**Major components (build order):**

1. **Foundations** — repo, Vercel project, env vars (`ANTHROPIC_API_KEY` + `ANTHROPIC_MODEL`), Tailwind/shadcn install, base layout, deploy a Hello World
2. **Tool framework** — `<ToolLayout>` + `<ToolInput>` + `<ToolOutput>` shared components, server-side `runTool` wrapper with streaming, rate limiter (middleware + per-route), error boundaries, copy/download primitives, Shiki integration
3. **Per-tool implementations** — Test Automator (stream), then Test Data Generator (structured), then API Test Generator (structured + file upload). Each tool is one phase or one plan.
4. **Resume & content layer** — MDX-driven About/Resume page, downloadable PDF, primary navigation
5. **Hardening** — abuse defenses (rate limits live by now; add bot heuristics, input size caps, prompt-injection mitigations, output sanitization)
6. **Polish** — accessibility audit, performance audit (LCP < 2s on 4G), analytics, "coming soon" shelf, brand assets, SEO

### Critical Pitfalls

**See:** `.planning/research/PITFALLS.md` for the full 16-pitfall catalogue, severity ratings, and phase mapping.

The five that absolutely cannot ship without mitigation:

1. **`ANTHROPIC_API_KEY` leaks to the client bundle** *(Foundations, BLOCKER)* — keep all SDK calls in Route Handlers, add `import 'server-only'` to any module touching the key, never use `NEXT_PUBLIC_` prefix, grep production bundles for `sk-ant-` after first deploy.
2. **Public LLM endpoint with no rate limit gets scraped within hours** *(Tool framework, BLOCKER)* — `@upstash/ratelimit` sliding-window per IP per tool + global backstop, input size caps, Vercel spend alerts. Must be live *before* the URL is shared anywhere.
3. **Tools generate plausible-but-wrong code that breaks when the visitor runs it** *(Per-tool, BLOCKER)* — structured output via Anthropic tool use + Zod validation for the structured tools; AST/syntax-check generated code before render for the streaming Test Automator; golden-path tests against a small fixture suite; bounded inputs.
4. **30-second LLM response with no streaming feels broken** *(Tool framework, BLOCKER)* — streaming UX from day one for Test Automator; visible progress indicators on the structured tools; never let a recruiter see a blank screen for more than ~1s.
5. **Tool looks like a thin ChatGPT-wrapper and damages candidate credibility** *(Polish + Per-tool, IMPORTANT)* — no AI-cliché gradients, no "powered by AI" badges, no generic spinner-and-text "Generating with AI..." loading states. Each tool needs a *specific* loading state ("Reading the OpenAPI spec... Generating 8 endpoint test cases..."), domain-specific UI affordances, and rationale shipped alongside output.

Also important but lower-severity: Vercel function timeouts, Edge-runtime SDK gotchas, prompt injection (lower because no privileged tools/data behind the LLM), TypeScript silently blocking deploys, MDX pipeline breakages, "career portfolio mistakes that cost interviews" (stale dates, broken links, vague claims, photos that look like LinkedIn defaults).

## Implications for Roadmap

The roadmap follows the architecture build order. With `granularity=standard` (target 5-8 phases) and `parallelization=true`, a sensible cut:

### Phase 1: Foundations & Deploy
**Rationale:** Nothing else can be tested without a deployable shell. Resolve the Vercel-AI-SDK-vs-direct decision here so it doesn't ripple through later phases.
**Delivers:** Next.js + Tailwind + shadcn scaffolded, deployed to Vercel, env vars configured, `ANTHROPIC_API_KEY` in place, base layout, Hello-World tool-shape proof, server-only enforcement, bundle-grep CI check for key leakage.
**Addresses:** Foundation table stakes.
**Avoids:** Pitfall #1 (key leakage), Pitfall #10 (TS silently blocking deploys).

### Phase 2: Tool Framework
**Rationale:** Shared abstraction must exist before per-tool work — otherwise each tool reinvents streaming/rate-limit/error-handling and we pay an N× cost. This is the highest-leverage phase.
**Delivers:** `Tool` interface, `<ToolLayout>`/`<ToolInput>`/`<ToolOutput>` shared components, server-side `runTool` wrapper (streaming + structured modes), rate limiter (per-IP-per-tool), Shiki output, copy/download primitives, shared error/loading/empty states.
**Uses:** Vercel AI SDK (or `@anthropic-ai/sdk` per Phase 1 decision), `@upstash/ratelimit`, Zod, Shiki.
**Avoids:** Pitfall #2 (no rate limit), Pitfall #4 (no streaming), Pitfall #8 (generic ChatGPT-wrapper UX).

### Phase 3: Test Automator (v1 flagship)
**Rationale:** The streaming-output tool exercises the framework end-to-end and is the highest-visibility demo for a recruiter. Goes first so any framework gaps surface early.
**Delivers:** `/tools/test-automator` end-to-end — URL/story input, streaming Playwright (TS) + Pytest output on a language tab, copy/download, rationale block, example fixtures.
**Uses:** Tool framework + Anthropic streaming.
**Avoids:** Pitfall #3 (hallucinated code — AST-validate before render where feasible; pin the prompts against fixtures).

### Phase 4: Test Data Generator + API Test Generator
**Rationale:** Both are structured-output tools using the same Anthropic tool-use + Zod pattern. Can be planned and executed in parallel (`parallelization=true`).
**Delivers:** `/tools/test-data-generator` and `/tools/api-test-generator` end-to-end. API Test Generator includes file upload (paste/URL/file paths) with `@apidevtools/swagger-parser` validation.
**Uses:** Tool framework + Anthropic tool use + Swagger Parser.
**Avoids:** Pitfall #3 (structured output is the strongest defense against hallucinated wrong types), Pitfall #15 (OpenAPI ingestion footguns — parse-and-validate before LLM call).

### Phase 5: Resume / About / Content
**Rationale:** Independent of tools; can be planned in parallel with Phase 4 but execution gated on user providing resume content. Tools alone aren't a portfolio — resume layer closes the loop.
**Delivers:** `/about` (or `/`) MDX-driven resume/About page, downloadable PDF, navigation linking tools ↔ about, footer, contact link, "coming soon" shelf with the v1.5 tools named.
**Uses:** MDX, Shiki (build-time), Tailwind typography.
**Avoids:** Pitfall #9 (career-portfolio mistakes — date hygiene, no broken links, no vague claims).

### Phase 6: Hardening & Pre-Launch
**Rationale:** Last gate before the URL goes on a resume. All defenses turned on, all "looks like a toy" tells eliminated.
**Delivers:** Accessibility audit (WCAG AA), perf audit (LCP < 2s on 4G), analytics verified, Vercel spend alerts, abuse heuristics, prompt-injection mitigations on outputs, social preview (OG) images, robots/sitemap, production smoke tests, post-deploy bundle-grep for secrets.
**Avoids:** Pitfalls #2 (rate-limit verified under load), #7 (prompt injection on user-provided HTML/spec/code), #8 (ChatGPT-wrapper tells), #13 (analytics misuse), #16 (production-only failures).

### Phase Ordering Rationale

- **Foundations → Framework → Tools** is non-negotiable: framework reuse only pays off if it exists before tool #2.
- **Tools before Resume**: tools are the differentiator and have the most unknowns. Resume is mostly content work and depends on the user supplying material.
- **Phase 4 parallelization**: Data Generator and API Test Generator are independent and use the same pattern — perfect for `parallelization=true`.
- **Hardening last, not interleaved**: cross-cutting concerns are easier to verify against a complete surface than to thread through each phase.

### Research Flags

Phases likely needing deeper research during planning (`/gsd-plan-phase` research enabled):

- **Phase 1 (Foundations):** Confirm Tailwind v4 vs 3.4 against current shadcn registry on install day; verify Vercel AI SDK vs direct Anthropic SDK with current Anthropic feature parity (prompt caching, native tool use).
- **Phase 2 (Tool Framework):** Confirm current `@upstash/ratelimit` + Vercel Marketplace integration patterns; pick streaming protocol (text stream vs data stream) once SDK choice is locked.
- **Phase 4 (API Test Generator):** Confirm `@apidevtools/swagger-parser` handles modern OpenAPI 3.1 features and validate file-upload limits on Vercel Hobby.

Phases with standard patterns (research-phase can skip):

- **Phase 3 (Test Automator):** Pattern is locked by Phase 2; mostly prompt engineering + fixtures.
- **Phase 5 (Resume content):** Standard MDX content pipeline; no novel research needed.
- **Phase 6 (Hardening):** Checklist work; no research, just execution.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | MEDIUM-HIGH | Choices are unambiguous; exact patch versions need install-day verification (the agent could not hit live registries). |
| Features | MEDIUM-HIGH | Competitive landscape and quality bars are well-grounded in stable, widely-known tools. Quality-bar claims should be re-verified before marketing copy is written. |
| Architecture | HIGH | Patterns verified against current Next.js docs; the Tool abstraction is a standard 2026 pattern. **One open decision** (Vercel AI SDK vs direct Anthropic SDK) flagged above. |
| Pitfalls | HIGH | Vercel/Next.js/security pitfalls are codified and current; career-portfolio pitfalls are codified hiring-manager experience. |

**Overall confidence:** MEDIUM-HIGH — high enough to start planning Phase 1 immediately; flagged unknowns are scoped to install-day verifications, not architectural unknowns.

### Gaps to Address

- **Vercel AI SDK vs direct Anthropic SDK** — resolve in Phase 1 planning before any tool route is written.
- **Tailwind v4 vs 3.4** — verify shadcn registry v4-readiness on install day; trivial fallback if not.
- **OpenAPI 3.1 edge cases** — Phase 4 should include a test against ≥3 real-world OpenAPI specs (Stripe, GitHub, a Petstore variant) before declaring the API Test Generator shippable.
- **Live registry version pinning** — all version numbers in STACK.md are training-data-anchored; pin to `latest` of the named major during initial `npm install` and accept resolution.

## Sources

### Primary (HIGH confidence)
- `.planning/PROJECT.md` — project intent, locked v1 scope, key decisions
- Next.js 15 / App Router official docs (cited in ARCHITECTURE.md)
- Anthropic Claude SDK / model card knowledge (training-data cutoff Jan 2026)

### Secondary (MEDIUM confidence)
- Vercel AI SDK streaming patterns (training-data + cited Next.js streaming example)
- shadcn/ui + Tailwind v4 ecosystem (training-data; install-day verification flagged)
- `@upstash/ratelimit` + Vercel Marketplace integration patterns
- Competitive landscape: Playwright codegen, Schemathesis, RESTler, Mockaroo, Faker, Copilot, Qodo

### Tertiary (LOW confidence — verify at implementation)
- Exact patch versions for all libraries (research agents could not reach live registries; pin to `latest` of the named major at install)
- shadcn/ui registry v4-readiness on the day of install

---
*Research completed: 2026-05-14*
*Ready for roadmap: yes*
