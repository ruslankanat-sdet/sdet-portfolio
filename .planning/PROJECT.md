# Resume Website — SDET/QA AI Portfolio

## What This Is

A personal resume website for a senior SDET / QA automation engineer that doubles as a live demonstration of AI-powered testing skill. Recruiters get a fast, polished resume scan above the fold; hiring managers get interactive AI tools (starting with an AI test generator) that prove the candidate can actually build the things they list. Built to stand out in a crowded senior-QA market where most applicants send a PDF.

## Core Value

**A recruiter or hiring manager leaves the page believing this candidate is the strongest senior SDET they've seen this week — because the site itself is the proof, not just a claim.**

If everything else fails, that judgment must still land in the first 30 seconds.

## Requirements

### Validated

<!-- Shipped and confirmed valuable. -->

(None yet — ship to validate)

### Active

<!-- Current scope. Building toward these. v1 = ship-this-week; v1.5/v2 = follow-on layers. -->

**v1 — Ship now (lands the first interviews):**

- [ ] Resume-forward landing page (name, title, years, top companies, key skills — recruiter-scan optimized)
- [ ] Full resume content (work history, projects, skills, contact) rendered cleanly on the page
- [ ] One flagship interactive AI demo: **AI Test Generator** (input: URL or user story → output: working Playwright/Pytest code)
- [ ] Project showcase pages for the four testing specialties (Web E2E, API/integration, Performance, AI-powered)
- [ ] Mobile-responsive, accessible, fast (LCP < 2s on 4G)
- [ ] Deployed to a public URL (Vercel)
- [ ] Basic analytics so candidate can see which sections recruiters engage with

**v1.5 — Add within weeks:**

- [ ] AI resume chatbot ("ask me anything about my experience" — grounded in resume + projects, with citations)
- [ ] Downloadable PDF resume (kept in sync with site content)
- [ ] SEO + social preview cards (recruiter shares the link → it looks good in Slack/LinkedIn)

**v2 — Later layers:**

- [ ] Additional live testing demos (self-healing test repair, visual diff AI, flaky-test detector)
- [ ] Embedded Playwright sandbox running real tests against a demo site
- [ ] Blog / writing section for thought leadership

### Out of Scope

<!-- Explicit boundaries. Includes reasoning to prevent re-adding. -->

- **User accounts / login** — This is a public resume, not a SaaS. No auth.
- **Multi-tenant / "build your own resume site"** — This is *the candidate's* site, not a product for others.
- **CMS / admin UI** — Content edits via code/markdown is fine; building an editor is overscope for the timeline.
- **Real browser automation sandboxes in v1** — Live Playwright running in a recruiter's browser is high ops cost (browser pool, abuse, $$). Deferred to v2; v1 uses code generation + recorded demo videos instead.
- **Custom domain & email setup as a phase** — User will wire DNS/domain themselves when ready. Site must work on the Vercel default URL on day one.
- **i18n / multi-language** — Audience is English-speaking recruiters.

## Context

**Candidate profile:** Senior SDET / QA automation engineer targeting senior IC roles. Wants to differentiate via AI fluency (test generation, AI agents, LLM-assisted QA) on top of solid traditional automation foundations (Playwright/Cypress, API testing, performance/k6).

**Job-search urgency:** Applying *now*. Every week without a live site is opportunity cost. The site must ship a credible v1 in days, then layer up.

**Content state:** Candidate has a resume/CV. No pre-built tools, project descriptions, GitHub showcase repos, or written bios ready for drop-in yet. The site will need a content scaffolding step (resume → structured site content) early in execution.

**Audience model:** Two viewers with different attention budgets.
- *Recruiter* — 6-second scan: name, title, years, top companies, headline skills. If hooked, may click one thing.
- *Hiring manager / EM* — 2-5 minute exploration: project depth, code samples, the AI test generator demo, GitHub links. Wants proof of skill.
The site must serve both without making either feel like a second-class visitor.

**Strategic positioning:** "The site is the demo." Most QA candidates list AI skills; few demonstrate them in their own portfolio. A working AI test generator on day one is the single highest-impact differentiator.

**Risks to watch:**
- Building too many interactive features before launch → site doesn't ship → no interview lift.
- AI demo embarrassingly broken (wrong code, hallucinated APIs) → worse than no demo. Demo must be reliable on the URLs/stories it's pitched against; bound the input space.
- Heavy live-execution features (real browsers in the cloud) → cost spikes, abuse vectors. Stick to code generation in v1.

## Constraints

- **Timeline**: Ship v1 within days, not weeks — candidate is applying actively. Anything that doesn't directly contribute to v1 ships time is deferred.
- **Tech stack**: Next.js (App Router) on Vercel. Reason: best-in-class for AI-powered sites — server actions, API routes for the LLM call, edge runtime, zero-config deploy, generous free tier. No alternative platforms considered for v1.
- **AI model**: Anthropic Claude (latest Sonnet) for the test generator — strong code generation, structured output via tool use, fast enough for an interactive UX. API key lives in Vercel env vars; never exposed client-side.
- **Cost**: Keep monthly run cost near $0 — Vercel hobby tier + pay-per-token LLM. Rate-limit the AI demo to prevent abuse spikes.
- **Performance**: Recruiter-scan path (landing page above the fold) must be statically rendered, no LLM dependency. AI demo is a separate interactive component, not blocking initial render.
- **Accessibility**: WCAG AA minimum — recruiters use screen readers and varied devices; an inaccessible site reads as careless.
- **Privacy**: No user accounts means no PII storage. Analytics must be privacy-friendly (Vercel Analytics or Plausible — no cookies/consent banner needed).
- **Brand assets**: None confirmed yet. v1 ships with a clean, professional default look; brand polish is a v1.5 task once candidate provides a headshot / preferred typography.

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Site doubles as live demo, not just static resume | Differentiator vs. typical PDF resume + LinkedIn — proves AI/automation skill, doesn't just claim it | — Pending |
| AI Test Generator as v1 flagship demo (not chatbot, not live Playwright) | Highest impact-to-build-time ratio: shows AI + testing in one widget, ships fast with only a resume as content, low ops risk vs. browser sandboxes | — Pending |
| Resume-forward landing (not demo-forward) | Recruiters scan in 6 seconds; a demo-first landing risks bounces when recruiter doesn't understand what they're looking at | — Pending |
| Next.js on Vercel (no alternatives evaluated) | Optimal fit for AI-powered site with server-side LLM calls; fastest path to ship | — Pending |
| Defer live browser sandboxes to v2 | Browser-pool ops, abuse risk, cost — disproportionate to v1 timeline benefit | — Pending |
| No CMS / authoring UI | Content edits via code is acceptable for a single-author site; CMS adds days of scope for zero recruiter-facing value | — Pending |

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
*Last updated: 2026-05-14 after initialization*
