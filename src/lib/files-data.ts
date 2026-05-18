// Ported from .planning/design/design_handoff_ide_portfolio/files.js
// Changes:
//  - TypeScript types (FileEntry, LogEntry from @/types/ide)
//  - Named exports (no window globals)
//  - All Alex Morgan content replaced with Ruslan Kanatbek content per CONTEXT.md D-03 + UI-SPEC Content Substitutions
//  - Added contact.json (new — not in original files.js)
//  - File tree restructured for tools/ + about/ folders per D-05
//  - No TOOLS record in v1 — no AI tools in this phase

import type { FileEntry, LogEntry } from '@/types/ide';

export const FILES: Record<string, FileEntry> = {
  'README.md': {
    lang: 'markdown',
    path: '~/portfolio/README.md',
    icon: 'md',
    content: `# 👋 Hi, I'm Ruslan.

I build the test infrastructure that keeps AI products honest —
self-healing Playwright suites, LLM eval pipelines, and the
automation that catches regressions before they ship.

**Currently:** Senior SDET / QA Automation Engineer (9+ years).
**Recently:** Resmed, Gemini, Google, Citi.

## What this site is

- **About** → my bio, experience, skills (see files in the sidebar).
- **Run Smoke Test** in the topbar → watch this site test itself.

Open to senior / staff SDET roles. Reach me at \`ruslankanat.b@gmail.com\`.
`,
  },

  'bio.json': {
    lang: 'json',
    path: '~/portfolio/bio.json',
    icon: 'json',
    content: `{
  "engineer": {
    "name": "Ruslan Kanatbek",
    "role": "Senior SDET / QA Automation Engineer",
    "location": "Remote",
    "available": true,
    "yearsOfExperience": 9
  },
  "summary": [
    "Builds self-healing test frameworks that catch regressions",
    "before they ship. Deep work in LLM-driven test generation,",
    "Playwright + Pytest pipelines, and AI eval orchestration."
  ],
  "expertise": {
    "automation": ["Playwright", "Pytest", "Cypress", "Selenium"],
    "ai_ml":      ["LangChain", "LangGraph", "RAG", "LLM Evals"],
    "infra":      ["GitHub Actions", "Docker", "Kubernetes"],
    "languages":  ["Python", "TypeScript", "Java"]
  },
  "contact": {
    "email":    "ruslankanat.b@gmail.com",
    "github":   "github.com/ruslankanat-sdet",
    "linkedin": "in/ruslankanat"
  }
}`,
  },

  'experience.yaml': {
    lang: 'yaml',
    path: '~/portfolio/experience.yaml',
    icon: 'yaml',
    content: `# Career timeline — most recent first

- company: Resmed
  role:    Senior SDET
  scope:   |
    Owned automation for connected sleep devices —
    cloud APIs + mobile companion apps. Built self-healing
    Playwright + Pytest framework adopted across 4 product lines.
  stack: [Python, TypeScript, Playwright, Pytest, GitHub Actions]

- company: Gemini
  role:    SDET / QA Automation Engineer
  scope:   |
    Cryptocurrency exchange — API + UI test coverage,
    OWASP-aligned security regression suites, audit trail
    integrity tests against immutable ledger.
  stack: [Python, Pytest, Cypress, k6]

- company: Google
  role:    Test Engineer (contract)
  scope:   |
    Ads measurement platform — large-scale data integrity
    tests, BigQuery validation pipelines, dashboard accuracy
    checks across 100s of millions of events / day.
  stack: [Java, Python, BigQuery, Apache Beam]

- company: Citi
  role:    QA Automation Engineer
  scope:   |
    Treasury & trade solutions — payments processing,
    SWIFT message validation, regulatory reporting
    automation across multiple regions.
  stack: [Java, Selenium, JUnit, Jenkins]
`,
  },

  'skills.yaml': {
    lang: 'yaml',
    path: '~/portfolio/skills.yaml',
    icon: 'yaml',
    content: `# Tools I reach for every day.

languages:
  primary:   [Python, TypeScript]
  secondary: [Java]

testing:
  e2e_web:    Playwright
  e2e_mobile: Appium
  api:        Pytest + httpx
  load:       k6
  bdd:        pytest-bdd

ai_automation:
  orchestration: LangGraph
  evals:         Custom + Braintrust
  inference:     [Anthropic Claude, OpenAI]

infra:
  ci:    GitHub Actions
  cloud: [AWS, GCP]
`,
  },

  'contact.json': {
    lang: 'json',
    path: '~/portfolio/contact.json',
    icon: 'json',
    content: `{
  "email":    "ruslankanat.b@gmail.com",
  "github":   "https://github.com/ruslankanat-sdet",
  "linkedin": "https://www.linkedin.com/in/ruslankanat",
  "preferred_role": "Senior / Staff SDET, QA Automation Engineer",
  "remote": true,
  "open_to": ["full-time", "contract-to-hire"]
}`,
  },
};

export const SAMPLE_LOGS: LogEntry[] = [
  { kind: 'info', text: '$ npx playwright test --grep smoke --reporter=line' },
  { kind: 'info', text: 'Running 12 tests using 6 workers' },
  { kind: 'pass', test: 'test_resmed_sdet.py::test_device_monitoring_flow', detail: '142ms' },
  { kind: 'pass', test: 'test_resmed_sdet.py::test_data_integrity_pipeline', detail: '318ms' },
  { kind: 'pass', test: 'test_playwright_expertise.py::test_cross_browser_e2e', detail: '412ms' },
  { kind: 'pass', test: 'test_playwright_expertise.py::test_visual_regression', detail: '624ms' },
  { kind: 'pass', test: 'test_api_coverage.py::test_health_endpoints_200', detail: '41ms' },
  { kind: 'pass', test: 'test_ai_toolkit.py::test_automator_streaming', detail: '891ms' },
  { kind: 'warn', text: '⚠ Self-healing selector rewrote `#submit` → `[data-testid=submit]` (auto-PR #4821)' },
  { kind: 'pass', test: 'test_ai_toolkit.py::test_rate_limiting_429_returned', detail: '156ms' },
  { kind: 'pass', test: 'test_perf.py::test_lcp_under_2s', detail: '742ms  budget 800ms' },
  { kind: 'pass', test: 'test_a11y.py::test_wcag_aa_contrast', detail: '0 violations' },
  { kind: 'info', text: '─────────────────────────────────────────────────────────────' },
  { kind: 'ok',   text: '✓ 10 passed (6.2s)  ·  0 failed  ·  0 flaky' },
];
