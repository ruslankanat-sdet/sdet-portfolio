# Walking Skeleton — SDET AI Toolkit (Portfolio + Tools)

**Phase:** 1 (Foundations + Test Automator Live)
**Generated:** 2026-05-16

## Capability Proven End-to-End

A visitor opens the deployed Vercel URL, sees the IDE-themed portfolio shell with `README.md` open by default, clicks `test-automator` in the sidebar, types a user story in the editor pane, and watches Playwright (TypeScript) and Pytest code stream into the editor sub-tabs within ~1s of first token — all backed by `@anthropic-ai/sdk` running on a Node-runtime Route Handler with Upstash sliding-window rate limiting.

## Architectural Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Framework | Next.js 15.5.18 (App Router) on Node 20 LTS, **pinned to 15** | CLAUDE.md locks Next 15; `npx create-next-app@latest` would scaffold v16. Pin explicitly to `@15` (D-implicit, RESEARCH.md). |
| React | 19.2.6 | Required by Next 15. |
| LLM SDK | `@anthropic-ai/sdk` **direct** (not Vercel AI SDK) | CLAUDE.md + D-implicit; single provider in v1, no abstraction tax. FOUND-08 decision recorded here. |
| Tool API transport | Route Handlers (`app/api/.../route.ts`), Node runtime, `maxDuration = 60` | Streaming + per-IP rate-limit headers need real HTTP control; Edge's 25 s cap is too tight for LLM calls. |
| Data layer | **None** (stateless) | "No persistence" promise (FRAME-10); no DB, no accounts, no Vercel KV. |
| Auth | **None** | Public stateless tools — no auth library, no NextAuth, no Clerk. |
| Styling — IDE chrome | CSS Modules + `globals.css` with CSS custom properties **ported verbatim** from `.planning/design/design_handoff_ide_portfolio/styles.css` | UI-SPEC Tailwind decision: IDE chrome is pixel-perfect port from design handoff. Tokens locked. |
| Styling — Test Automator pane | Tailwind v4 utility classes (`@import "tailwindcss"` in globals.css) | UI-SPEC: tool pane interior is fresh-built; Tailwind for rapid iteration. |
| Component library | **None** (raw Radix/shadcn only if absolutely required for a11y primitive); Lucide React for icons | Pixel-perfect port — shadcn defaults would fight design tokens. Lucide replaces inline SVGs from design handoff. |
| Validation | Zod 4 + `@hookform/resolvers` | Tool input schemas — server validates before any LLM call; same schema feeds react-hook-form. |
| Rate limiting | `@upstash/ratelimit` + `@upstash/redis` (Vercel Marketplace integration), sliding-window | Per-IP per-tool (10/60s) + global backstop (30/60s). D-16. |
| Syntax highlighter — IDE files | Hand-rolled tokenizer (port of `syntax.jsx`) | 5 languages (json/python/markdown/yaml/toml), synchronous, zero runtime cost. |
| Syntax highlighter — generated code | Shiki 4 with JavaScript regex engine, `langs: ['typescript', 'python']` | TextMate-grammar fidelity for LLM output; JS engine avoids WASM cold-start. |
| Deployment | Vercel (Hobby), GitHub → Vercel integration, auto-deploy on push to `main` + preview on PRs | FOUND-02; no Vercel CLI required in repo. |
| Directory layout | `src/{app,components,lib,types}` + `tests/{unit,e2e}` | RESEARCH.md Pattern: `components/ide/*` for chrome, `components/tools/*` for tool panes, `lib/` for server-only utilities. |
| Package manager | pnpm 9+ (committed `pnpm-lock.yaml`) | Vercel auto-detects; deterministic installs. |
| Test runners | Vitest 4 (unit) + Playwright 1.60 (E2E) | Meta touch: the site that generates Playwright code is itself tested with Playwright. |

## Stack Touched in Phase 1

- [x] **Project scaffold** — Next.js 15 + TypeScript strict + Tailwind v4 + ESLint flat + Prettier + Vitest + Playwright via `create-next-app@15`
- [x] **Routing** — root route `/` renders IDE shell; tool URL state via `history.pushState('/tools/test-automator')` when tool sidebar entry is opened
- [x] **Database** — N/A (stateless by design; no read/write to persistent store anywhere in Phase 1)
- [x] **UI** — IDE chrome (TopBar, Sidebar, EditorArea, Terminal, StatusBar, AIChat stub) + interactive Test Automator pane wired to the API
- [x] **API** — `POST /api/tools/test-automator` Node-runtime Route Handler with Zod validation, Upstash rate limit, and `messages.stream()` SSE response
- [x] **Deployment** — Public Vercel URL deployed automatically on every push to `main`; preview deploys on PRs

## Out of Scope (Deferred to Later Slices)

- Test Data Generator tool (Phase 2)
- API Test Generator tool + landing page (Phase 3)
- About/Resume page, PDF download, nav/footer (Phase 4)
- Mobile layout (< 720px) — design handoff explicitly skipped mobile (Phase 5)
- Light theme polish — toggle exists, full quality deferred (Phase 5)
- AI chat widget wired to a real Claude endpoint — Phase 1 ships canned-response stub (Phase 4 / v1.5 candidate)
- WCAG AA full verification, prompt-injection probes, OG cards, robots/sitemap, post-deploy smoke tests (Phase 5)
- Multi-provider LLM, prompt caching, OpenAI/Gemini fallback (post v1)
- Server-side persistence of any kind (explicit non-goal, "no persistence" notice in every tool UI)

## Subsequent Slice Plan

Each later phase adds one vertical slice on top of this skeleton without altering its architectural decisions:

- **Phase 2 (Test Data Generator Live):** New `/tools/test-data-generator` sidebar entry + tool pane + `app/api/tools/test-data-generator/route.ts` using Anthropic tool-use + Zod-validated structured output (JSON → CSV/SQL render tabs).
- **Phase 3 (API Test Generator Live + Tools-First Landing):** New `/tools/api-test-generator` tool with `@apidevtools/swagger-parser`, multipart upload (≤ 1 MB), operation-subset picker. Landing page restructured: three tool cards above the fold + Coming-Soon shelf.
- **Phase 4 (Resume & About Layer):** `about/` folder in the IDE file tree gets real `bio.json`/`experience.yaml`/`skills.toml` content; new `contact.json`. PDF resume linked. AIChat widget wired to a real Claude endpoint with resume-context system prompt.
- **Phase 5 (Hardening & Pre-Launch):** axe-core + Playwright E2E suite against deployed URL, WCAG AA pass, LCP < 2 s, prompt-injection probes, OG cards, `robots.txt` + `sitemap.xml`, bundle-grep in CI for `sk-ant-`.
