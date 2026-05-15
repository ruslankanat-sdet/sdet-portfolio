# Feature Research

**Domain:** AI-powered SDET / QA toolkit web app + senior-IC engineer portfolio
**Researched:** 2026-05-14
**Confidence:** MEDIUM-HIGH (external web search/fetch unavailable in this session; findings rely on training-data knowledge of well-documented, stable tools — Schemathesis, RESTler, Mockaroo, Faker, Postman, GitHub Copilot, Codium/Qodo, Diffblue, Playwright codegen. Tool capabilities described are stable v1.x behaviors of widely-adopted projects. Flag any usage-claim that should be re-verified before relying on it in marketing copy.)

---

## How to Read This Document

The site has **two distinct surfaces** with different feature economies:

1. **Tools surface** — six SDET utilities (3 in v1, 4 in v1.5). Each tool is evaluated as a *micro-product* with its own table-stakes, differentiators, and quality bar.
2. **Portfolio surface** — landing page, About/Resume, contact, OSS/blog. Standard senior-IC portfolio conventions apply.

Features are categorized:

- **Table stakes** — users leave (or worse, screenshot the bug) if missing
- **Differentiators** — what beats Mockaroo / Schemathesis / "I'll just ask ChatGPT directly"
- **Anti-features** — deliberately NOT building, with the reason logged so they don't sneak back in

Complexity: **S** (hours), **M** (1–2 days), **L** (3+ days, often requires a dedicated phase).

---

## Existing Tools in the Space — What They Do, What They Miss

This section is the competitive landscape. The site's differentiators are derived from these gaps.

### Test Generation from URL / User Story

| Tool | What It Does Well | What It Misses | Confidence |
|------|-------------------|----------------|------------|
| **Playwright Codegen** (`npx playwright codegen <url>`) | Records real browser interactions, emits idiomatic Playwright code; locator suggestions are excellent | Requires the user to record manually; cannot start from a user story; produces brittle absolute selectors if user isn't careful | HIGH |
| **Cypress Studio** | Similar record-and-replay inside Cypress | Cypress-only; deprecated/de-emphasized in newer Cypress versions; record-only, no story-to-test | HIGH |
| **GitHub Copilot / Copilot Chat** | Generates Playwright/Pytest code given a prompt inside IDE; strong on idioms | No web UI for non-IDE users; requires paid subscription; no URL-fetch grounding (can hallucinate selectors); not opinionated about test structure | HIGH |
| **Codium / Qodo (formerly CodiumAI)** | IDE plugin generates unit tests from existing functions; strong test analysis | Unit-test focus, not E2E; requires source code, not a URL; IDE-bound | MEDIUM |
| **Diffblue Cover** | Auto-generates Java unit tests via symbolic analysis | Java-only; unit tests only; enterprise pricing; not for E2E | MEDIUM |
| **ChatGPT/Claude directly** | Can generate plausible Playwright/Pytest given prompt | No grounding in the actual URL DOM; user has to construct the prompt; output quality varies wildly with prompt engineering | HIGH |
| **Octomind / QA.tech / similar AI-E2E startups** | Crawl a site and propose tests; paid SaaS | Sign-up required; closed; for teams not individuals; not transparent about what they generate | LOW (vendor landscape volatile) |

**Gap our Test Automator fills:** Free, no-login, web UI; accepts *either* a URL (we fetch + analyze DOM to ground selectors) *or* a user story (we generate scenarios + code); outputs idiomatic Playwright **and** Pytest in the same response; user copies and runs. The differentiator vs. raw ChatGPT is **DOM-grounded selectors** when a URL is supplied.

### OpenAPI/Swagger → Test Suite

| Tool | What It Does Well | What It Misses | Confidence |
|------|-------------------|----------------|------------|
| **Schemathesis** | Property-based fuzzing from OpenAPI; finds real spec violations; supports stateful sequences; Python-native | CLI/library only — no web UI; outputs failures, not human-readable test code; learning curve for hypothesis-style tests | HIGH |
| **RESTler (Microsoft Research)** | Stateful fuzzing from OpenAPI; discovers dependency sequences | CLI tool, requires Python + compilation step; output is fuzzing harnesses, not idiomatic Pytest/Playwright suites | HIGH |
| **Postman + spec import** | Imports OpenAPI, auto-generates a collection of requests; user can add tests in JS | Generates *requests* not *assertions*; assertions are hand-written; no negative/edge case generation; GUI-bound | HIGH |
| **`openapi-generator`** | Emits client SDKs and a small number of test stubs in many languages | Stubs are skeletons, not real tests; no assertion logic; no negative-case coverage | HIGH |
| **Dredd** | Validates that an API matches its OpenAPI spec | Validation only, not exploratory; goes stale on multi-spec OpenAPI 3.x edge cases | MEDIUM |
| **Karate DSL** | API + UI test framework with built-in OpenAPI consumption | Generates from spec but requires Karate-flavor DSL knowledge; not Python/TS-native | MEDIUM |

**Gap our API Test Generator fills:** Free web UI takes a pasted/uploaded OpenAPI doc and emits a complete, **runnable Pytest suite** (preferred) or fetch-based JS suite (secondary), with explicit **positive, negative, and edge-case** files per endpoint. The differentiator vs. Schemathesis is **human-readable, idiomatic test code that an SDET can drop into a repo unchanged** — no learning a property-based DSL. The differentiator vs. `openapi-generator` is that assertions are real, not stubs.

### Synthetic / Test Data Generation

| Tool | What It Does Well | What It Misses | Confidence |
|------|-------------------|----------------|------------|
| **Mockaroo** | 150+ data types, free-tier 1000 rows, CSV/JSON/SQL/Excel export, formulas, relational tables | Free tier capped at 1000 rows/file; schema editor is GUI-driven (no "describe in English"); occasional ad-pressure for paid | HIGH |
| **Faker.js / Faker (Python)** | Library: rich locale-aware data generators, deterministic with seed | Library not a tool — user must write code to use it; no schema-to-data step; no constraints/relations | HIGH |
| **JSON Schema Faker** | Generates fake data from a JSON Schema | Requires user to *have* a JSON Schema; verbose schemas for simple needs | HIGH |
| **Gretel.ai / Mostly AI / Tonic.ai** | ML-trained synthetic data from real samples, privacy-preserving | Enterprise SaaS, requires training data, not for a "give me 500 fake users" use case | MEDIUM |
| **`generatedata.com`** | Free web UI similar to Mockaroo | Older UI; smaller type library; slower iteration | MEDIUM |
| **ChatGPT/Claude directly** | Will produce plausible JSON when asked | Output truncates at long volumes; no streaming; no CSV/SQL export; no schema enforcement; values often unrealistic without heavy prompting | HIGH |

**Gap our Test Data Generator fills:** Free web UI takes a **natural-language schema description** ("100 users with realistic names, emails matching the name, ages 18–80, with a `role` enum of admin/editor/viewer where 80% are viewer") and emits valid, internally-consistent data in **JSON, CSV, and SQL INSERTs** simultaneously. The differentiator vs. Mockaroo is **English-first schema definition** (no clicking through 150 type pickers); the differentiator vs. raw ChatGPT is **volume + format choice + value realism**.

### Adjacent / v1.5 Comparables (for context)

- **Flaky Test Diagnoser:** Closest existing comparables are Datadog CI Visibility, BuildPulse, Trunk Flaky Tests — all SaaS, all assume CI integration. **Gap:** no free paste-a-log-get-a-hypothesis tool exists.
- **Jira Ticket Analyzer:** ChatGPT does this casually; no dedicated SDET-aware tool exists. **Gap:** an SDET-framing system prompt ("how would you test this") differentiates from generic LLM output.
- **Bug Report Polisher:** Comparable to Linear/Jira AI summarizers (require account); no free paste-and-go tool.
- **Test Review Assistant:** Comparable to CodeRabbit/Greptile PR-review bots (require repo connection); no paste-a-test review tool.

---

## v1 Tool 1: Test Automator

**Promise:** Paste a URL or describe a user story; get runnable Playwright (TS) and Pytest test code.

### Input

| Mode | Format | Validation |
|------|--------|------------|
| URL mode | Single HTTPS URL, ≤256 chars | URL parsable; host resolves; response is HTML or JSON-rendered HTML; reject `file://`, internal IP ranges, localhost |
| Story mode | Free text, ≤2000 chars | Non-empty; not a URL; trimmed |
| Combined mode (differentiator) | URL + story together | Both validated; URL used for grounding, story used for scenario shaping |

### Output

| Artifact | Format | Notes |
|----------|--------|-------|
| Playwright TS test | `*.spec.ts` file content with `import { test, expect } from '@playwright/test'` | Single file; tagged describe block; `test.beforeEach` for setup if needed |
| Pytest test | `test_*.py` file content with `playwright.sync_api` *or* `requests`-based equivalent depending on scenario | Single file; pytest fixtures used where natural |
| Scenario list (markdown) | Bullets: "Happy path: …", "Validation: …", "Edge: …" | Shown above code; lets user see *what* is being tested before reading *how* |
| Locator strategy note | Short paragraph: "Used `getByRole` for the submit button because…" | Optional, behind an expand control; teaches the user |

### Quality Bar (what separates "real" from "toy demo")

1. **Selectors must work on the real page** — when given a URL, fetch the HTML, find actual element identifiers, prefer Playwright's recommended order: `getByRole` > `getByLabel` > `getByText` > `data-testid` > CSS. Never default to absolute XPath.
2. **Tests are runnable as-is** — no placeholder `// TODO: fill in selector` lines. If unknown, generate a TODO comment with what the SDET should verify, but the rest of the file must run.
3. **Both languages are idiomatic** — Pytest output uses fixtures, `@pytest.mark.parametrize` where applicable; not a literal translation of the TS file.
4. **Realistic assertions** — `expect(page).toHaveURL(/.+/)` is acceptable for vague stories; `expect(page).toHaveTitle('Login')` is required when title is known from the fetched DOM.
5. **No invented elements** — never reference selectors that don't exist on the fetched page. If grounding fails, fall back to story mode and explicitly say so in a "Note:" line in the output.
6. **Handles SPAs reasonably** — for JS-heavy sites where the initial HTML is empty, generate tests that `await page.waitForLoadState('networkidle')` or `getByRole(...).waitFor()` before assertions.

### Edge Cases to Handle

- URL is unreachable / 404 / 5xx → return a clear error with the status code; do NOT silently fall back to a generic test
- URL requires auth → detect 401/403; emit a test scaffold with `// TODO: add auth fixture` and explain
- URL is a SPA with empty initial HTML → annotate generated tests with `waitForLoadState`
- Story is too vague ("test the homepage") → ask in output: emit a test for the obvious cases + a markdown note "to test X more thoroughly, provide: …"
- Story contradicts URL ("login flow" but URL is a marketing page) → trust the story, note the conflict
- URL is huge (e.g., docs page with 1000 forms) → cap analysis at first N forms / first K interactive elements; note the truncation

### Anti-Features for Test Automator

- ~~Recording mode in-browser~~ — Playwright codegen already exists and is better. Don't compete on UX we'd lose.
- ~~Running the generated tests against the URL~~ — out of scope per PROJECT.md (v2 at earliest). Generation only.
- ~~Auth credential entry~~ — no PII handling. User adds auth themselves.

---

## v1 Tool 2: Test Data Generator

**Promise:** Describe a schema in English; get valid, realistic synthetic data in JSON, CSV, and SQL.

### Input

| Mode | Format | Validation |
|------|--------|------------|
| Natural language | Free text, ≤1500 chars | Non-empty; trimmed |
| Row count | Integer, 1–1000 | Default 50; capped at 1000 to bound LLM output size + render time |
| Format toggle | Checkboxes: JSON / CSV / SQL (at least one) | At least one required; SQL also asks for table name |

**Differentiator:** Accept *either* free-form English ("100 e-commerce customers with addresses in US ZIPs") *or* a JSON-snippet sample ("generate 50 more like this: `{...}`") in the same input box; auto-detect which.

### Output

| Artifact | Format | Notes |
|----------|--------|-------|
| JSON | Pretty-printed array of objects | Default view; copy button |
| CSV | RFC 4180, header row, quoted strings when needed | Tab to switch; download button |
| SQL | `INSERT INTO <table_name> (cols) VALUES (...), (...);` batched per ~50 rows | Tab to switch; user supplies table name |
| Schema summary (markdown) | Detected/inferred field list with types and example value | Shown above output; confirms what the LLM understood |

### Quality Bar

1. **Internally consistent** — `email` matches `first_name`/`last_name`; `country` matches `phone` format; `created_at < updated_at`; ages match birth dates.
2. **Realistic distributions** — not all rows have the same city; emails aren't all `@example.com`; numeric fields aren't all `123`.
3. **Schema constraints honored** — if user says "ages 18-80, 80% under 35," the output approximates that distribution.
4. **Enum values respected** — if user says `role in [admin, editor, viewer]`, those are the *only* values used.
5. **PII-safe by construction** — generated emails use `@example.com`, `@test.invalid`, or RFC 2606 reserved domains by default; phone numbers use the 555 prefix or country-specific reserved ranges; never produce data that could collide with real people.
6. **Valid for all three formats simultaneously** — same row count, same row order across JSON/CSV/SQL; CSV doesn't break on embedded commas; SQL strings are properly escaped.

### Edge Cases to Handle

- User requests 10,000 rows → cap at 1000, explain in output why
- User requests sensitive data ("social security numbers", "credit cards") → generate clearly-fake placeholders (`123-45-6789`, `4111 1111 1111 1111`), include a "Note: these are well-known test values, not real" line
- User describes circular relations ("order references customer, customer has orders") → flatten to one table with a foreign-key column; explain
- Conflicting constraints ("ages 18-25" but "100 retirees") → pick story-consistent interpretation, note the conflict
- Format-incompatible request (deeply nested JSON in CSV) → CSV tab shows a note "schema is nested; flat CSV uses dot-notation column names"
- SQL table name missing → use sensible default (`test_data`); show input field

### Anti-Features for Test Data Generator

- ~~Train-on-your-data synthetic generation (Gretel-style)~~ — That's a different product entirely; ML training of generators is out of scope.
- ~~Persistent schema library ("save my schemas")~~ — Per PROJECT.md, no accounts. localStorage save in v1.5 only.
- ~~Streaming generation for >1000 rows~~ — Adds infra complexity; users who need 100k rows aren't this tool's user.
- ~~CSV with custom delimiters / Excel-flavored CSV~~ — Default RFC 4180 covers 95%; rest is feature creep.

---

## v1 Tool 3: API Test Generator

**Promise:** Upload/paste/link an OpenAPI spec; get a runnable Pytest test suite covering positive, negative, and edge cases per endpoint.

### Input

| Mode | Format | Validation |
|------|--------|------------|
| Paste | OpenAPI 3.0/3.1 or Swagger 2.0 JSON or YAML, ≤500 KB | Parse with a real OpenAPI parser; reject if not a valid spec |
| URL | HTTPS URL to a spec file | Fetch + parse; size cap; same-domain or public CDN only |
| Upload | `.json` / `.yaml` / `.yml` file, ≤500 KB | Sniff content; parse |
| Endpoint filter (differentiator) | Multi-select of endpoints from parsed spec | Default: all; UI lets user pick a subset to keep output focused |
| Base URL override | Optional text field | Used in generated tests; defaults to spec's `servers[0].url` |

### Output

| Artifact | Format | Notes |
|----------|--------|-------|
| Pytest suite | One `test_<endpoint>.py` file per selected endpoint, plus a `conftest.py` with fixtures | Primary output |
| JS/fetch alternative (v1 stretch) | Single `*.spec.ts` Playwright API testing file | Secondary; toggle |
| `requirements.txt` snippet | `pytest`, `requests`, `pytest-mock`, `jsonschema` versions | Copy-paste into existing project |
| README excerpt | Markdown: how to run, expected env vars, example output | Onboarding the generated suite |

### Quality Bar

1. **Per endpoint, three test classes minimum:**
   - **Positive:** valid request → expected status + response shape validates against the spec's response schema (using `jsonschema`)
   - **Negative:** missing required field, wrong type, unauthorized (if auth defined), bad path param → expected error status
   - **Edge:** boundary values (min/max for numerics, empty string for required strings, max-length, Unicode/emoji), pagination edges if defined
2. **Schema-validated assertions** — generated tests use `jsonschema.validate(response.json(), spec_response_schema)`, not just `assert response.status_code == 200`.
3. **Auth handling** — if spec declares `securitySchemes`, generated suite uses environment variables (`API_TOKEN`, `API_KEY`) via a `conftest.py` fixture; never hardcodes.
4. **Realistic request bodies** — for `POST`/`PUT`, generate valid example bodies *using the schema's `example`/`examples` field when present*, otherwise synthesize from field types (and constraints — `format: email` → an email value).
5. **Test independence** — each test sets up its own state (no test ordering dependencies); creates are followed by deletes where the spec supports it.
6. **No invented endpoints** — only test endpoints that exist in the spec, exactly as defined.

### Edge Cases to Handle

- Swagger 2.0 input → upconvert internally or generate from 2.0 directly; don't reject
- Spec references external `$ref`s → resolve common cases (same-file refs); for external refs, generate a TODO with the ref URL
- Spec has 100+ endpoints → require selection (default = first 10), explain why
- Spec has no `servers[]` → require Base URL field; don't generate broken tests
- Spec uses OAuth2 with flows → generate stub fixture, comment "configure the token URL", don't try to implement OAuth in the test
- Spec is malformed YAML → return parse error with the line number; do not LLM-hallucinate
- Endpoint returns binary (octet-stream) → assert content-type + content-length; skip JSON parse
- Polymorphic responses (`oneOf`/`anyOf`/`discriminator`) → generate a parametrized test branching on the discriminator value

### Anti-Features for API Test Generator

- ~~Running the tests in our infrastructure~~ — Same reason as Test Automator. Generation only.
- ~~Postman collection import~~ — Postman is a different DSL; OpenAPI is the canonical source. v2 maybe.
- ~~GraphQL support~~ — Different paradigm entirely; deferred indefinitely.
- ~~Full stateful sequencing (à la RESTler)~~ — Hard problem; even RESTler is imperfect. Per-endpoint tests in v1.

---

## Cross-Tool Table Stakes (the AI-tool web UI)

These apply to *every* tool and must be consistent.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Copy-to-clipboard on generated code/data | Users come for the output; clicking-and-dragging is hostile | S | Per-block button, ARIA-labeled, toast confirmation |
| Download as file | For multi-file outputs, copy-paste isn't enough | S | `.zip` for multi-file (API Test Generator); single file for the rest |
| Syntax highlighting on code output | Without it, output looks like a wall of text | S | Use Shiki (Next.js-friendly, build-time themes) or Prism; TS/Python/JSON/SQL/YAML at minimum |
| Tabs for multi-format output | Test Automator (TS/Python), Test Data Gen (JSON/CSV/SQL), API Test Gen (Pytest/JS) | S | Keyboard-accessible tabs |
| Visible loading state with progress feel | LLM calls take 5–30s; without feedback users assume it's broken | S | Skeleton or streaming text; *if* streaming, show partial output |
| Error states that don't look broken | Per PROJECT.md "must never look broken to a recruiter" | S | Distinct UI for: timeout, model error, bad input, rate-limited; each with a recovery action |
| Input character count + cap indicator | Users hate hitting an opaque limit | S | Live counter; soft warning at 80%, hard stop at 100% |
| Clear "what is this" empty state | First-time visitor needs to know what to type | S | Example button(s) populating the input with a sample |
| At least one "Try an example" button per tool | Recruiters won't write their own input | S | 2–3 curated examples per tool |
| Keyboard accessible | WCAG AA per constraints | S | Skip-to-tool nav, focus rings, no keyboard traps |
| Mobile-usable input + output | Recruiters open links on phones | S | Output blocks scroll horizontally; tabs collapse; copy button stays reachable |
| "How does this work" disclosure | Trust signal: explains the LLM call, privacy, no-storage | S | Collapsible block under each tool |
| Rate-limit message that doesn't accuse the user | Per PROJECT.md, per-IP rate limit | S | "Free service rate limit reached — try again in 60s" not "Forbidden" |
| Privacy statement near input | "We don't store this." per PROJECT.md | S | Visible, not hidden in a footer |

## Cross-Tool Differentiators

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Streaming output | Feels 2x faster even though total latency is the same; SOTA for AI tools in 2026 | M | Anthropic supports streaming; Next.js Route Handlers can pipe |
| "Why this output" rationale block | Teaches the SDET *and* signals model quality; differentiator vs. raw ChatGPT which doesn't explain selector/test choices | S | Each tool's prompt asks for a brief rationale; UI shows it expandable |
| Curated examples that are themselves interesting | The "try an example" button doubles as marketing — examples should be sites/specs an SDET would actually want to test | S | E.g., Test Automator example fetches the GitHub login page; API Test Gen example uses the Petstore spec |
| Share-via-URL of *input* (no backend storage) | Lets users send "look what I tried" to a colleague; URL contains gzip+base64 of input, output regenerates on visit | M | Avoids accounts; resilient to deletion; URLs get long — fine for our scale |
| One-click "regenerate with variations" | LLM nondeterminism is a feature here; useful for SDETs comparing approaches | S | Same input, fresh call |
| Side-by-side diff between two runs | After a regenerate, show what changed | M | Helps SDET evaluate model quality, demonstrates engineering polish |
| Per-tool prompt transparency ("see the system prompt") | Trust signal for technical audience; signals AI fluency | S | Read-only modal showing the system prompt (with secrets redacted) |
| Output linting before display | Generated Pytest is run through a syntax check; if it fails, retry once with a "fix the syntax error" follow-up | M | Cheap quality bar; prevents the worst "AI slop" failure mode |
| Browser-only history (localStorage) | "Save my outputs" without accounts; per PROJECT.md v1.5 | S–M | v1.5 scope; mentioned here so v1 UI leaves room for it |

## Cross-Tool Anti-Features

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| User accounts / login | "Save my history server-side" | Per PROJECT.md explicitly cut; adds DB, auth, GDPR surface | localStorage history in v1.5 |
| Server-side run/execute generated code | "Just run my tests for me" | Browser pool, cost, abuse, sandbox security; full v2 scope | Out of scope until v2; generate-only is the v1 promise |
| Chatbot wrapper around all tools | "Make it an agent" | Per PROJECT.md explicitly cut; conflates UX, hides what the tool does | Distinct tool pages with predictable I/O |
| Real-time collaboration / shareable workspaces | "Like Google Docs for tests" | Requires backend state, WebSockets, multi-tenancy | Share-via-URL of input only |
| Custom model selection / "bring your own key" | Power-user request | Doubles auth + secrets complexity; not in the v1 audience model | Single provider in v1 per PROJECT.md |
| Per-tool settings/configuration panel | "Let me tune temperature" | Surface area for confusion, no clear win for the recruiter audience | Curated defaults; rationale block explains choices |
| Inline editing of generated output | "Let me tweak before copy" | Easy to add a bug, breaks the "real tool" promise; users have their own editors | Copy to clipboard, paste in their IDE |
| Generated-tests CI integration ("export GitHub Action") | Tempting cross-sell | Branches scope into CI templates per provider; many existing tools | Out of scope; document how to run, user wires CI |
| Login-gated higher rate limits | "Power users get more" | Defeats the no-accounts decision | Generous per-IP limit; if abused, tighten globally |

---

## Portfolio-Side Features

The portfolio half of the site. Standard senior-IC engineer conventions, evaluated against this candidate's positioning.

### Portfolio Table Stakes

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Landing page hero with one-sentence positioning | 6-second recruiter scan per PROJECT.md | S | "Senior SDET building AI-powered testing tools." Tools are the proof. |
| Tools-first card grid on landing | Tools *are* the resume per PROJECT.md core value | S | 3 v1 cards + "Coming soon" shelf for v1.5 |
| About / Resume page | Recruiters click this within 30s if hooked | S | Single page; work history, skills, contact, downloadable PDF |
| Downloadable PDF resume | ATS systems and old-school recruiters demand it | S | Generated from the same markdown source as the page when possible; one static file at minimum |
| Work history with company, title, dates, 2-4 bullets each | LinkedIn-equivalent depth, expected by every recruiter | S | Most recent first |
| Skills section (categorized) | Recruiters scan for keywords | S | Categories: Languages, Test Frameworks, AI/LLM, CI/CD, Cloud, Observability |
| Contact: email + LinkedIn + GitHub | Friction-free outreach | S | Mailto link, public profiles; obfuscate email mildly to reduce scraping |
| Open Graph / social preview cards | Per PROJECT.md v1.5 — when the link is shared in Slack/LinkedIn it must look intentional | S | v1.5 explicitly; can be polished in v1 if cheap |
| Page-level metadata for SEO (title, description, canonical) | Recruiter searches name + "SDET"; site should rank | S | Per-page `<head>` config in Next.js |
| Footer with last-updated date | Signal the site is maintained, not abandoned | S | Auto-set from build timestamp |
| 404 page that links back to tools | Common deep-link breakage | S | Branded, not Next.js default |

### Portfolio Differentiators

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Each tool card links to a "How it was built" page | Demonstrates engineering process — system prompt design, evals, cost tradeoffs | M | One short post per tool; doubles as content marketing |
| Public GitHub repo for the site itself | Recruiters and EMs click "see the code"; tools' transparency starts with the site | S | Repo URL in footer; not in v1 critical path |
| "Stack" page or footer block | Lists technologies used to build the site (Next.js, Claude, Vercel, Shiki, etc.) | S | Tech-credibility signal |
| Case studies / project deep-dives (1-3) | Senior-IC portfolios that stand out have one or two narrative case studies; "the time I…" | M | Each: problem, approach, outcome with metric. v1.5 task. |
| Blog (markdown-rendered, no CMS) | Showcases writing/thinking; one post is enough to start | M | Next.js MDX pipeline; can be empty in v1 with placeholder |
| Talks / conference presence section (if applicable) | Conference talks signal IC seniority more than years-of-experience | S | List only if candidate has them; otherwise omit (don't fake) |
| Open source contributions section | Real proof of engineering, not just claims | S | Curated 3-5 PRs/repos with one-line context |
| "What I'm focused on now" / `now` page | Personal touch; widely-used convention (nownownow.com); takes minutes | S | Optional |
| Public usage counter ("tools run: 12,847") | Per PROJECT.md v2; social proof of adoption | M | v2; needs counter infra |
| Visible build/version info | Engineering polish, signals operational thinking | S | Footer: commit SHA + build date |

### Portfolio Anti-Features

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| Generic "Hire Me" big button / sales-y CTA | Looks like a template portfolio | Reads desperate; recruiters prefer subtle | Tools are the CTA. Contact info in nav + footer is enough. |
| Personality quizzes / "fun facts" sections | Soften the page | Wastes recruiter scan budget; doesn't demonstrate skill | Skip entirely or relegate to a `colophon` page |
| Skill bars / percentage proficiency graphics | Common portfolio template feature | Self-rated percentages are meaningless and slightly unprofessional | Categorized skill list; let the tools demonstrate proficiency |
| Carousel of testimonials | "Social proof" | Hard to populate authentically; reads like an agency site | One quote (if real) inline on About page |
| Animated parallax hero / heavy WebGL | "Wow factor" | Hurts LCP per PROJECT.md (< 2s), accessibility issues | Clean typographic hero with the tool grid below the fold |
| Detailed work-history dates with month granularity for everything | Implies CV completeness | Increases noise; recruiters care about the last 5–7 years | Year granularity beyond 5 years ago is fine |
| Embedded LinkedIn iframe | "Show LinkedIn directly" | Slow, ugly, third-party tracking, breaks CSP | Link out |
| Visitor counter / hit counter | Old-school internet | Looks dated; per PROJECT.md privacy stance also forbids granular trackers | Usage counter (tool runs) in v2 is the modern equivalent |
| Newsletter signup | Build an audience | No publishing cadence yet; an empty newsletter signup is worse than none | Add only after blog has 3+ posts (v2+) |
| Dark/light theme toggle as a launch feature | Power-user expectation | Doable, but every theme toggle is more design + a11y testing | Respect `prefers-color-scheme` (free); explicit toggle in v1.5 |
| Live chat widget | "Make contact easy" | Latency, privacy, looks like SaaS | Email link |

---

## Feature Dependencies

```
[OpenAPI spec parser library]           [HTML fetch+sanitize]
        |                                       |
        v                                       v
[API Test Generator] <--rationale via LLM--> [Test Automator]
                                                |
                                                +--shares--> [Anthropic Claude client]
                                                |
[Test Data Generator] <----shares--------------+

[All tools]
   |
   +--require--> [Code/data output renderer (syntax highlight + copy + tabs + download)]
   +--require--> [Per-IP rate limiter]
   +--require--> [Input size/format validator]
   +--require--> [LLM error → user-friendly error mapper]

[Share-via-URL]
   |
   +--requires--> [Compressed-input URL encoder]
   +--enhances--> [All three tools]

[Streaming output UI]
   +--enhances--> [All three tools]
   +--requires--> [Server-Sent Events or Next.js streaming Route Handler]

[localStorage history (v1.5)]
   +--requires--> [Stable input schema per tool]
   +--enhances--> [All tools]

[Portfolio landing page]
   +--depends-on--> [Tool cards (one per shipped tool)]
   +--depends-on--> [Coming-soon shelf entries (v1.5 tool names)]

[Resume PDF download]
   +--depends-on--> [Resume content source-of-truth (markdown or structured JSON)]

[Open Graph cards (v1.5)]
   +--depends-on--> [Per-page metadata system in Next.js]
   +--enhances--> [Shareability of any tool URL]
```

### Dependency Notes

- **API Test Generator requires an OpenAPI parser library** — Don't write our own. Use `swagger-parser` / `@apidevtools/swagger-parser` (Node) or rely on the LLM to parse with cross-checking. Library route is safer; LLM-only route hallucinates on edge specs.
- **Test Automator requires URL fetch with safety guardrails** — Must reject local/private IPs (SSRF), enforce HTTPS, size cap, content-type sniff. This is a shared utility, not Test-Automator-internal.
- **All three tools share an Anthropic client wrapper** — One module handles auth, timeout (~25s to stay under the 30s constraint), retry-once-on-malformed, streaming. Build this before any tool's UI.
- **Code/data output renderer is shared infrastructure** — Build it once, all three tools consume it. If we build per-tool renderers we'll triple the bug surface.
- **Per-IP rate limiter is required for every tool** — Vercel-friendly options: Upstash Redis-based limiter, or in-memory limiter on Edge (less robust). Choose before launching publicly.
- **Share-via-URL is independent of any tool's logic** — Can be added incrementally; nice differentiator for v1.5 with minimal risk.

---

## MVP Definition

### Launch With (v1) — Maps to PROJECT.md "v1 — Ship now"

- [ ] **Test Automator tool** (URL + story modes, TS + Python output) — core value pillar 1
- [ ] **Test Data Generator tool** (NL schema, JSON/CSV/SQL output) — core value pillar 2
- [ ] **API Test Generator tool** (paste/URL/upload, Pytest output) — core value pillar 3
- [ ] **Tools-first landing page** with the three cards + Coming-Soon shelf — recruiter 6-second scan
- [ ] **Resume / About page** with PDF download — the "hire this person" path
- [ ] **All cross-tool table stakes** (copy, tabs, syntax highlight, error states, loading state, examples, character count, privacy note) — minimum quality bar
- [ ] **Per-IP rate limiting + input size caps + no-persistence** — trust & safety per PROJECT.md
- [ ] **Mobile-responsive + WCAG AA + LCP < 2s on landing** — per PROJECT.md constraints
- [ ] **Vercel deploy + privacy-friendly analytics** — public URL on day one

### Add After Validation (v1.5)

- [ ] **Flaky Test Diagnoser** — paste a test + failure log, get root-cause hypotheses + fix
- [ ] **Jira Ticket Analyzer** — paste ticket, get test plan + edge cases + AC gaps
- [ ] **Bug Report Polisher** — rough notes → structured bug report
- [ ] **Test Review Assistant** — paste a test, get critique + concrete fixes
- [ ] **localStorage history + JSON export** — per-tool, no backend
- [ ] **Share-via-URL of input** — gzip+base64 in URL; output regenerates
- [ ] **OG / Twitter / LinkedIn social preview cards** — every page
- [ ] **"How it was built" page per tool** — engineering content
- [ ] **Explicit dark/light theme toggle** — power-user polish
- [ ] **Streaming output UI** — feels 2x faster

### Future Consideration (v2+)

- [ ] **Locator Strategy Advisor / Page Object Generator / Coverage Gap Finder** (more tools)
- [ ] **Embedded Playwright sandbox** — run generated tests against a demo site
- [ ] **Public usage metrics** — tool-runs counter for social proof
- [ ] **Browser-recorded test capture** (only if it doesn't compete with Playwright codegen)
- [ ] **GraphQL spec support** in API Test Generator
- [ ] **Postman collection import** in API Test Generator
- [ ] **OpenAPI 2.0 spec output** of generated tests (export as Postman-importable)

---

## Feature Prioritization Matrix

### v1-Scope Features

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| Test Automator (URL + story modes) | HIGH | HIGH | P1 |
| Test Data Generator (NL + 3 formats) | HIGH | MEDIUM | P1 |
| API Test Generator (Pytest output) | HIGH | HIGH | P1 |
| Tools-first landing page | HIGH | LOW | P1 |
| Resume / About page + PDF | HIGH | LOW | P1 |
| Copy-to-clipboard everywhere | HIGH | LOW | P1 |
| Syntax highlighting on outputs | HIGH | LOW | P1 |
| Error states (timeout/model/bad-input/rate-limit) | HIGH | LOW | P1 |
| Per-IP rate limiting | HIGH | MEDIUM | P1 |
| Input size caps | HIGH | LOW | P1 |
| "Try an example" button per tool | HIGH | LOW | P1 |
| Loading state UI | HIGH | LOW | P1 |
| Mobile-responsive | HIGH | MEDIUM | P1 |
| WCAG AA | HIGH | MEDIUM | P1 |
| Privacy statement near input | MEDIUM | LOW | P1 |
| Coming-soon shelf for v1.5 tools | MEDIUM | LOW | P1 |
| Streaming output | MEDIUM | MEDIUM | P2 (v1 stretch) |
| Rationale block per output | MEDIUM | LOW | P2 (v1 stretch) |
| Output syntax-lint retry | MEDIUM | MEDIUM | P2 (v1 stretch) |

### v1.5-Scope Features

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| Flaky Test Diagnoser | HIGH | MEDIUM | P2 |
| Jira Ticket Analyzer | MEDIUM | LOW | P2 |
| Bug Report Polisher | MEDIUM | LOW | P2 |
| Test Review Assistant | HIGH | MEDIUM | P2 |
| localStorage history | MEDIUM | MEDIUM | P2 |
| Share-via-URL | MEDIUM | MEDIUM | P2 |
| OG / social preview cards | MEDIUM | LOW | P2 |
| Per-tool "how it was built" page | MEDIUM | MEDIUM | P3 |

### Anti-Features (priority = NEVER)

| Feature | Why Tempting | Why Cut |
|---------|--------------|---------|
| User accounts | "Save my history" | localStorage covers it; PROJECT.md cut |
| Server-side test execution | "Just run it for me" | v2 at earliest; cost + abuse risk |
| AI chatbot wrapper | "Make it an agent" | PROJECT.md cut |
| Postman collection import | API Test Gen feature creep | OpenAPI is the canonical input |
| GraphQL support | Modern API | Different paradigm; deferred |
| Newsletter signup | Build an audience | No publishing cadence; reads as desperate |
| Skill-bar graphics | Common portfolio trope | Looks junior |
| Carousel testimonials | "Social proof" | Reads as agency site |

---

## Competitor Feature Analysis

### Test Generation Space

| Feature | Playwright Codegen | GitHub Copilot | ChatGPT (raw) | Our Test Automator |
|---------|-------------------|----------------|---------------|---------------------|
| URL grounding | YES (records) | NO | NO | YES (DOM fetch) |
| Story → test | NO | YES (in IDE) | YES (prompted) | YES |
| Free + web UI | NO (CLI) | NO (paid + IDE) | YES | YES |
| TS + Python both | NO (TS only) | YES (with prompting) | YES (with prompting) | YES (single click) |
| Idiomatic output | YES | YES | VARIES | YES (curated prompts) |
| No-login | YES (local) | NO | NO (now) | YES |

### OpenAPI Test Space

| Feature | Schemathesis | RESTler | Postman import | `openapi-generator` | Our API Test Generator |
|---------|--------------|---------|----------------|---------------------|------------------------|
| Web UI | NO | NO | YES (paid) | NO | YES |
| Generates idiomatic Pytest | NO (hypothesis) | NO | NO (JS) | NO (stubs) | YES |
| Positive + negative + edge | YES (fuzzing) | YES (fuzzing) | NO | NO | YES |
| Schema-validated assertions | YES | YES | NO | NO | YES |
| Runnable as-is in user repo | PARTIAL | NO | YES (in Postman) | NO | YES |
| No install required | NO | NO | YES | NO | YES |

### Test Data Space

| Feature | Mockaroo | Faker | JSON Schema Faker | ChatGPT (raw) | Our Test Data Generator |
|---------|----------|-------|-------------------|---------------|--------------------------|
| Web UI | YES | NO (library) | NO (library) | YES (chat) | YES |
| English-first schema | NO (GUI) | NO | NO | YES | YES |
| JSON + CSV + SQL output | YES | NO | NO | PARTIAL | YES |
| Internally consistent rows | PARTIAL | NO | NO | VARIES | YES |
| 1000 free rows | YES (free tier) | UNLIMITED (library) | UNLIMITED (library) | TRUNCATES | YES |
| No signup | YES | YES | YES | NO (now) | YES |

### Portfolio Space (qualitative)

| Feature | Typical "developer portfolio" template | Senior IC engineer site (e.g., Dan Abramov, Julia Evans, Simon Willison personal sites) | Our site |
|---------|----------------------------------------|------------------------------------------------------------------------------------------|----------|
| Hero | Big photo + name | One sentence + work | One sentence + tools grid (uniquely ours) |
| Skill bars | YES (cringe) | NO | NO |
| Project list | YES (static) | YES (links to live or repo) | YES (live tools) |
| Blog | OFTEN | YES (often the centerpiece) | v1.5 placeholder, build over time |
| Resume PDF | YES | OFTEN | YES |
| Social handles | YES | YES | YES (GitHub, LinkedIn) |
| "Hire me" CTA | YES (loud) | NO | NO (tools are the CTA) |
| Live working software | NO | OFTEN | YES (the differentiator) |

---

## Sources

- `/Users/ruslankanat/Documents/resume-website/.planning/PROJECT.md` — confirmed v1/v1.5/v2 scope, audience model, constraints, anti-features, key decisions (PRIMARY SOURCE)
- Training-data knowledge of: Schemathesis (docs at schemathesis.readthedocs.io), Microsoft RESTler (github.com/microsoft/restler-fuzzer), Mockaroo (mockaroo.com), Faker.js (fakerjs.dev), JSON Schema Faker, Playwright codegen, OpenAPI Generator, Dredd, Karate DSL, Postman, GitHub Copilot, Codium/Qodo, Diffblue Cover
- Convention knowledge of senior-IC engineer portfolio patterns (Dan Abramov, Julia Evans, Simon Willison, nownownow.com convention)
- WCAG 2.1 AA criteria for the accessibility constraints

### Confidence Notes

- **HIGH confidence:** PROJECT.md-derived scope; well-known stable OSS tool capabilities (Schemathesis, Playwright codegen, OpenAPI Generator, Faker, Postman behaviors).
- **MEDIUM confidence:** Specific feature lists of paid SaaS competitors (Mockaroo free-tier exact limits, Diffblue current pricing/scope, AI-startup feature sets) — they shift quarterly. Re-verify before quoting in marketing copy.
- **LOW confidence:** Current state of AI-E2E startup landscape (Octomind, QA.tech) — fast-moving, names and feature sets churn.

### Verification Gaps to Address Later

1. Re-verify Mockaroo free-tier row limits before claiming "we beat Mockaroo's 1000-row cap" anywhere user-facing.
2. Confirm Schemathesis can be re-categorized as "fuzzer with reports" vs. "test code generator" — phrasing matters for honest competitive copy.
3. Survey current AI-E2E startup landscape (Octomind, QA.tech, etc.) at marketing-page writing time — landscape may have shifted.
4. Confirm `@apidevtools/swagger-parser` library currency and license fit before depending on it for API Test Generator.

---

*Feature research for: AI-powered SDET toolkit + senior-IC portfolio*
*Researched: 2026-05-14*
