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

  'tests/landing.spec.ts': {
    lang: 'typescript',
    path: '~/portfolio/e2e/landing.spec.ts',
    icon: 'ts',
    content: `import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Landing page', () => {
  test('has correct page title', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Ruslan Kanatbek/);
  });

  test('shows IDE chrome on load', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('main')).toBeVisible();
    await expect(page.getByRole('button', { name: /README\\.md/ })).toBeVisible();
  });

  test('sidebar README.md row loads README content into editor', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /README\\.md/ }).click();
    await expect(page.locator('pre code')).toContainText("Hi, I'm Ruslan");
  });

  test('robots.txt is accessible', async ({ page }) => {
    const r = await page.request.get('/robots.txt');
    expect(r.status()).toBe(200);
    expect(await r.text()).toContain('User-agent');
  });

  test('sitemap.xml is accessible', async ({ page }) => {
    const r = await page.request.get('/sitemap.xml');
    expect(r.status()).toBe(200);
    expect(await r.text()).toContain('<urlset');
  });

  test('OG meta tag is present', async ({ page }) => {
    await page.goto('/');
    const og = await page.locator('meta[property="og:image"]').getAttribute('content');
    expect(og).toBeTruthy();
    expect(og).toContain('/og');
  });

  test('has no WCAG AA violations', async ({ page }) => {
    await page.goto('/');
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();
    expect(results.violations).toEqual([]);
  });
});`,
  },

  'tests/navigation.spec.ts': {
    lang: 'typescript',
    path: '~/portfolio/e2e/navigation.spec.ts',
    icon: 'ts',
    content: `import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
  test('About link navigates to /about', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: /About/i }).first().click();
    await expect(page).toHaveURL(/\\/about$/);
    await expect(page.getByRole('main')).toBeVisible();
  });

  test('back link returns to /', async ({ page }) => {
    await page.goto('/about');
    // On /about the nav link shows "← Back" linking back to /
    await page.getByRole('link', { name: /Back/i }).first().click();
    await expect(page).toHaveURL('http://localhost:3000/');
  });
});`,
  },

  'tests/about.spec.ts': {
    lang: 'typescript',
    path: '~/portfolio/e2e/about.spec.ts',
    icon: 'ts',
    content: `import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('About page', () => {
  test('renders work history section', async ({ page }) => {
    await page.goto('/about');
    await expect(page.getByRole('main')).toBeVisible();
    await expect(page.getByRole('heading').first()).toBeVisible();
  });

  test('PDF download link is present', async ({ page }) => {
    await page.goto('/about');
    const link = page.getByRole('link', { name: /Download PDF Resume/i });
    await expect(link).toBeVisible();
    await expect(link).toHaveAttribute('download');
    await expect(link).toHaveAttribute('href', /resume\\.pdf$/);
  });

  test('has no WCAG AA violations', async ({ page }) => {
    await page.goto('/about');
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();
    expect(results.violations).toEqual([]);
  });
});`,
  },

  'tests/ide-interactions.spec.ts': {
    lang: 'typescript',
    path: '~/portfolio/e2e/ide-interactions.spec.ts',
    icon: 'ts',
    content: `import { test, expect } from '@playwright/test';

test.describe('IDE interactions', () => {
  test('clicking bio.json loads editor with bio content', async ({ page }) => {
    await page.goto('/');
    // The about/ folder header is a div (no role=button), use getByText to expand it
    await page.getByText('about', { exact: true }).first().click();
    await page.getByRole('button', { name: /bio\\.json/ }).click();
    await expect(page.locator('pre code')).toContainText('Ruslan Kanatbek');
  });

  test('test files appear in sidebar under tests/ folder', async ({ page }) => {
    // Covers SHOW-02: sidebar displays Playwright spec files under tests/ folder
    await page.goto('/');
    await expect(page.getByText('tests', { exact: true }).first()).toBeVisible();
    await page.getByText('tests', { exact: true }).first().click();
    await expect(page.getByRole('button', { name: /landing\\.spec\\.ts/ })).toBeVisible();
  });

  test('clicking landing.spec.ts loads its TypeScript source in editor', async ({ page }) => {
    // Covers SHOW-02: editor renders the spec file content with TypeScript source.
    await page.goto('/');
    await page.getByText('tests', { exact: true }).first().click();
    await page.getByRole('button', { name: /landing\\.spec\\.ts/ }).click();
    await expect(page.locator('pre code')).toContainText("'@playwright/test'");
  });
});`,
  },

  'tests/playwright.config.ts': {
    lang: 'typescript',
    path: '~/portfolio/playwright.config.ts',
    icon: 'ts',
    content: `import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? 'github' : [['html'], ['line']],
  use: {
    baseURL: process.env.PLAYWRIGHT_TEST_BASE_URL ?? 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'pnpm build && pnpm start',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});`,
  },
};

export const SAMPLE_LOGS: LogEntry[] = [
  { kind: 'info', text: '$ pnpm exec playwright test --project=chromium --reporter=line' },
  { kind: 'info', text: 'Running 12 tests using 4 workers' },
  { kind: 'pass', test: 'landing.spec.ts > has correct page title', detail: '312ms' },
  { kind: 'pass', test: 'landing.spec.ts > shows IDE chrome on load', detail: '188ms' },
  { kind: 'pass', test: 'landing.spec.ts > sidebar README.md row loads README content into editor', detail: '412ms' },
  { kind: 'pass', test: 'navigation.spec.ts > About link navigates to /about', detail: '241ms' },
  { kind: 'pass', test: 'navigation.spec.ts > logo/home link returns to /', detail: '198ms' },
  { kind: 'pass', test: 'about.spec.ts > renders work history section', detail: '156ms' },
  { kind: 'pass', test: 'about.spec.ts > PDF download link is present', detail: '124ms' },
  { kind: 'pass', test: 'ide-interactions.spec.ts > clicking bio.json loads editor', detail: '298ms' },
  { kind: 'pass', test: 'landing.spec.ts > has no WCAG AA violations', detail: '892ms' },
  { kind: 'pass', test: 'about.spec.ts > has no WCAG AA violations', detail: '743ms' },
  { kind: 'info', text: '───────────────────────────────────────────────────────' },
  { kind: 'ok',   text: '✓ 12 passed (4.2s)  ·  0 failed  ·  0 flaky' },
];
