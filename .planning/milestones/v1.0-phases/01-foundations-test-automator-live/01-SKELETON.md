# Walking Skeleton — SDET AI Toolkit Portfolio

**Phase:** 1
**Generated:** 2026-05-16

## Capability Proven End-to-End

A visitor opens the deployed Vercel URL, sees the IDE portfolio shell with Ruslan Kanatbek's content, clicks "test-automator" in the sidebar, types a user story, clicks "Generate Tests", and watches real Playwright TypeScript and Pytest code stream from Claude into the editor pane — all within ~30 seconds, with no persistence server-side.

## Architectural Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Framework | Next.js 15 App Router (pin `next@15`, not @latest which is v16) | Vercel-native; App Router for server components + route handlers; v15 required for React 19 |
| AI SDK | `@anthropic-ai/sdk` direct — NOT Vercel AI SDK | Single provider, richer tool-use semantics, prompt caching access; Vercel AI SDK abstraction not needed |
| Rate limiting | `@upstash/ratelimit` + Upstash Redis | Per-IP sliding window; REST-based (works on serverless); free tier covers portfolio traffic |
| CSS | CSS Modules + globals.css (IDE chrome) + Tailwind v4 (tool pane interior only) | IDE chrome must match design handoff pixel-exactly via CSS custom properties; Tailwind for utility-class tool forms |
| Streaming | Route Handler (`app/api/tools/test-automator/route.ts`) → `messages.stream()` → `ReadableStream` → `text/event-stream` → client `fetch()` SSE reader | Node runtime (not Edge) for 60s maxDuration; streaming requires real HTTP boundary |
| Deployment | Vercel Hobby (free tier) | Auto-deploy from `main`; preview deploys on PRs; env vars for API keys |
| Directory layout | `src/app/` (routes), `src/components/ide/` (shell), `src/components/tools/` (tool UIs), `src/lib/` (utilities + SDK) | Matches Next.js App Router conventions; clean boundary between IDE chrome and tool panes |
| Auth | None (stateless public tools) | No accounts in v1; per-IP rate limiting is the abuse barrier |

## Stack Touched in Phase 1

- [x] Project scaffold — Next.js 15, pnpm, TypeScript strict, Tailwind v4, ESLint, Prettier, globals.css with design tokens
- [x] Routing — `/` (IDE shell), `/api/tools/test-automator` (Route Handler)
- [x] No DB — stateless by design; inputs discarded after request
- [x] UI — IDE shell (TopBar, Sidebar, EditorArea, Terminal, StatusBar, AIChat stub) + Test Automator form wired to streaming API
- [x] Deployment — Vercel public URL with `ANTHROPIC_API_KEY` and `ANTHROPIC_MODEL` as env vars

## Out of Scope (Deferred to Later Phases)

- Test Data Generator (`/tools/test-data-generator`) — Phase 2
- API Test Generator (`/tools/api-test-generator`) — Phase 3
- Resume/About MDX page — Phase 4
- Mobile layout — Phase 5 (Hardening)
- Light theme polish — Phase 5
- AI chat widget real API wiring — Phase 4 or v1.5
- Sentry / paid APM — explicitly out of scope for v1

## Subsequent Slice Plan

Each later phase adds one vertical slice on top of this skeleton without altering its architectural decisions:

- Phase 2: Test Data Generator — structured-output (tool-use + Zod) pattern on top of Phase 1 tool framework
- Phase 3: API Test Generator + tools-first landing page
- Phase 4: Resume/About MDX layer + full nav + PDF download
- Phase 5: WCAG AA audit, perf, prompt-injection mitigations, smoke test suite
