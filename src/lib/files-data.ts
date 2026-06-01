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
AI-augmented test frameworks, mobile/web automation, and the
quality systems that catch regressions before they ship.

**Currently:** Senior SDET & Quality Architect (10+ years).
**Recently:** ResMed, Gemini, TCS (Google).

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
    "role": "Senior SDET & Quality Architect",
    "location": "Fremont, CA (Hybrid or Remote)",
    "available": true,
    "yearsOfExperience": 10
  },
  "summary": [
    "10+ years building quality infrastructure for mobile, web,",
    "and cloud platforms. AI-augmented test engineering via",
    "GitHub Copilot rulesets and MCP servers — 30% faster cycles."
  ],
  "expertise": {
    "automation": ["Playwright", "Pytest", "Cypress", "Selenium", "Appium", "Espresso", "XCUITest", "Behave"],
    "ai_tools":   ["GitHub Copilot (Custom Rule Sets)", "Claude Code", "MCP Server Engineering"],
    "infra":      ["AWS (Lambda, DynamoDB, AppSync)", "GitHub Actions", "Docker", "Jenkins", "Terraform", "Bazel"],
    "languages":  ["Python", "TypeScript", "Java", "Kotlin", "Swift", "SQL", "Scala", "Ruby"]
  },
  "contact": {
    "email":    "ruslankanat.b@gmail.com",
    "github":   "github.com/ruslankanat-sdet",
    "linkedin": "in/ruslan-kanatbek"
  }
}`,
  },

  'experience.yaml': {
    lang: 'yaml',
    path: '~/portfolio/experience.yaml',
    icon: 'yaml',
    content: `# Career timeline — most recent first

- company: ResMed
  role:    Senior SDET (AWS/Mobile/Web)
  span:    2022 — Now
  scope:   |
    Led end-to-end quality for myAir ecosystem (16M+ users).
    80% reduction in production defects. Mobile automation with
    Kotlin/Espresso (Android) and Swift/XCUITest (iOS). Migrated
    web stack to TypeScript/Cypress. Python/Behave framework for
    AWS GraphQL microservices. Pioneered AI-augmented engineering
    via GitHub Copilot rulesets and MCP servers — 30% faster cycles.
  stack: [Python, TypeScript, Kotlin, Swift, Cypress, Espresso, XCUITest, Behave, AWS Lambda, AppSync, GraphQL, GitHub Copilot, MCP, Datadog]

- company: Gemini
  role:    SDET / Software Engineer
  span:    2021 — 2022
  scope:   |
    Python/Pytest framework for trading modules — 0% to 80%
    automated coverage. Revamped Selenium suites, enhanced
    PostgreSQL validation. Engineered Scala backend components
    for institutional trading platform.
  stack: [Python, Scala, Pytest, Selenium, PostgreSQL]

- company: TCS (Client — Google)
  role:    QA Tester (Mobile)
  span:    2021
  scope:   |
    Mobile quality for Google Shopping on Android and iOS.
    Automated smoke and regression suites for release stability.
    GWS Test Lead during product launches — 24/7 blocker response.
    Java/Appium/Bazel functional and visual automation.
  stack: [Java, Appium, Bazel, Android, iOS]

- company: Veridian IT Staffing
  role:    QA Automation Engineer
  span:    2015 — 2020
  scope:   |
    Clients: Citibank · Cisco · Health First.
    Java/Selenium frameworks, BDD with Cucumber/JUnit, Jenkins CI.
    API testing, SQL data integrity, HIPAA-compliant test design.
  stack: [Java, Selenium, JUnit, Pytest, REST-assured, Cucumber, Jenkins, SQL]
`,
  },

  'skills.yaml': {
    lang: 'yaml',
    path: '~/portfolio/skills.yaml',
    icon: 'yaml',
    content: `# Tools I reach for every day.

languages:
  primary:   [Python, TypeScript]
  secondary: [Java, Kotlin, Swift, SQL, Scala, Ruby]

testing:
  e2e_web:    [Playwright, Cypress, Selenium]
  e2e_mobile: [Appium, Espresso, XCUITest]
  api:        [Pytest, Behave, REST-assured]
  bdd:        [Cucumber, Behave]
  unit:       [TestNG, JUnit]

ai_tools:
  copilot:   GitHub Copilot (Custom Rule Sets)
  cli:       Claude Code
  protocol:  MCP (Model Context Protocol) Server Engineering

infra:
  ci:    [GitHub Actions, Jenkins]
  cloud: [AWS (Lambda, DynamoDB, AppSync), Firebase]
  other: [Docker, Terraform, Bazel]

observability:
  monitoring: Datadog
`,
  },

  'contact.json': {
    lang: 'json',
    path: '~/portfolio/contact.json',
    icon: 'json',
    content: `{
  "email":    "ruslankanat.b@gmail.com",
  "github":   "https://github.com/ruslankanat-sdet",
  "linkedin": "https://linkedin.com/in/ruslan-kanatbek",
  "preferred_role": "Senior / Lead / Principal SDET",
  "location": "Fremont, CA (Hybrid or Remote)",
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
    // The sidebar file row uses role="button"; target the first match (sidebar row)
    await expect(page.getByRole('button', { name: /README\\.md/ }).first()).toBeVisible();
  });

  test('sidebar README.md row loads README content into editor', async ({ page }) => {
    await page.goto('/');
    // Click the sidebar file row specifically (first button with this name, inside the sidebar)
    await page.locator('aside').getByRole('button', { name: /README\\.md/ }).click();
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
    // This test will FAIL until plan 03 ships the tests/ folder entries in files-data.ts —
    // that failure is the correct gating signal proving plan 03 has not yet landed.
    await page.goto('/');
    await expect(page.getByText('tests', { exact: true }).first()).toBeVisible();
    await page.getByText('tests', { exact: true }).first().click();
    await expect(page.getByRole('button', { name: /landing\\.spec\\.ts/ })).toBeVisible();
  });

  test('clicking landing.spec.ts loads its TypeScript source in editor', async ({ page }) => {
    // Covers SHOW-02: editor renders the spec file content with TypeScript source.
    // This test will FAIL until plan 03 ships the tests/ folder entries in files-data.ts —
    // that failure is the correct gating signal proving plan 03 has not yet landed.
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
  { kind: 'pass', test: 'navigation.spec.ts > back link returns to /', detail: '198ms' },
  { kind: 'pass', test: 'about.spec.ts > renders work history section', detail: '156ms' },
  { kind: 'pass', test: 'about.spec.ts > PDF download link is present', detail: '124ms' },
  { kind: 'pass', test: 'ide-interactions.spec.ts > clicking bio.json loads editor with bio content', detail: '298ms' },
  { kind: 'pass', test: 'landing.spec.ts > has no WCAG AA violations', detail: '892ms' },
  { kind: 'pass', test: 'about.spec.ts > has no WCAG AA violations', detail: '743ms' },
  { kind: 'info', text: '─────────────────────────────────────────────────────────────' },
  { kind: 'ok',   text: '✓ 12 passed (4.2s)  ·  0 failed  ·  0 flaky' },
];
