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
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('resume-mode', 'ide');
    });
  });

  test('has correct page title', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Ruslan Kanatbek/);
  });

  test('shows IDE chrome on load', async ({ page }) => {
    await page.goto('/');
    // IDEShell renders a region (not main) containing the editor and terminal
    await expect(page.getByRole('region', { name: /Editor and terminal/i })).toBeVisible();
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
});

test.describe('Landing door', () => {
  test('DOOR-A11Y: DoorScreen has no WCAG AA violations', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('button', { name: /Enter the résumé/i })).toBeVisible();
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();
    expect(results.violations).toEqual([]);
  });

  test('DOOR-01: shows door at / with no stored mode', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('button', { name: /Enter the résumé/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /\\$ \\.\\//i })).toBeVisible();
  });

  test('DOOR-02: clicking IDE half stores mode and renders IDE shell', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /\\$ \\.\\//i }).click();
    await expect(page.getByRole('button', { name: /README\\.md/ }).first()).toBeVisible();
    const stored = await page.evaluate(() => localStorage.getItem('resume-mode'));
    expect(stored).toBe('ide');
  });

  test('DOOR-03 same-session: clicking recruiter half re-renders without navigation', async ({ page }) => {
    await page.goto('/');
    const url = page.url();
    await page.getByRole('button', { name: /Enter the résumé/i }).click();
    await expect(page.getByText('ruslan.kanatbek')).toBeVisible();
    await expect(page.getByRole('button', { name: /Enter the résumé/i })).not.toBeVisible();
    expect(page.url()).toBe(url);
  });

  test('DOOR-03 return-visit: pre-seeded ide mode skips the door', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('resume-mode', 'ide');
    });
    await page.goto('/');
    await expect(page.getByRole('button', { name: /Enter the résumé/i })).not.toBeVisible();
    await expect(page.getByRole('button', { name: /README\\.md/ }).first()).toBeVisible();
  });

  test('DOOR-04: ?reset clears stored mode and re-shows the door', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('resume-mode', 'ide');
    });
    await page.goto('/?reset');
    await expect(page.getByRole('button', { name: /Enter the résumé/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /\\$ \\.\\//i })).toBeVisible();
  });
});`,
  },

  'tests/navigation.spec.ts': {
    lang: 'typescript',
    path: '~/portfolio/e2e/navigation.spec.ts',
    icon: 'ts',
    content: `import { test, expect } from '@playwright/test';

// The /about page was removed in the IDE restructuring (commit b1b3900).
// Navigation between IDE and recruiter views is now handled by in-page buttons.
test.describe('Navigation', () => {
  test('IDE → Recruiter view switch via TopBar button', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('resume-mode', 'ide');
    });
    await page.goto('/');
    // Verify we start in IDE mode
    await expect(page.getByRole('button', { name: /README\\.md/ }).first()).toBeVisible();
    // Click the Recruiter view switch button in TopBar
    await page.getByRole('button', { name: /Recruiter view/i }).first().click();
    // Should transition to recruiter view
    await expect(page.getByText('ruslan.kanatbek')).toBeVisible();
    const stored = await page.evaluate(() => localStorage.getItem('resume-mode'));
    expect(stored).toBe('recruiter');
  });

  test('Recruiter → IDE view switch via Masthead Engineer view button', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('resume-mode', 'recruiter');
    });
    await page.goto('/');
    // Verify we start in recruiter mode
    await expect(page.getByText('ruslan.kanatbek')).toBeVisible();
    // Click the Engineer view button in Masthead
    await page.getByRole('button', { name: /Engineer view/i }).first().click();
    // Should transition to IDE view
    await expect(page.getByRole('button', { name: /README\\.md/ }).first()).toBeVisible();
    const stored = await page.evaluate(() => localStorage.getItem('resume-mode'));
    expect(stored).toBe('ide');
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

  'tests/recruiter.spec.ts': {
    lang: 'typescript',
    path: '~/portfolio/e2e/recruiter.spec.ts',
    icon: 'ts',
    content: `import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Recruiter view', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('resume-mode', 'recruiter');
    });
  });

  test('REC-01: shows masthead wordmark and Engineer view pill', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText('ruslan.kanatbek')).toBeVisible();
    await expect(
      page.getByRole('button', { name: /Engineer view/ }).first(),
    ).toBeVisible();
  });

  test('REC-06: clicking Engineer view switches to IDE', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /Engineer view/ }).first().click();
    await expect(
      page.getByRole('button', { name: /README\\.md/ }).first(),
    ).toBeVisible();
    const stored = await page.evaluate(() => localStorage.getItem('resume-mode'));
    expect(stored).toBe('ide');
  });

  test('REC-02: hero renders availability, headline, pitch, two CTAs', async ({ page }) => {
    await page.goto('/');
    // Use .first() — availability text appears in both the hero eyebrow and AvailabilityCard
    await expect(page.getByText('Open to opportunities · Q3 start').first()).toBeVisible();
    await expect(
      page.locator('h1').filter({ hasText: 'Senior SDET & Quality Architect' }),
    ).toBeVisible();
    await expect(page.getByText(/For the past decade/i)).toBeVisible();
    const downloadPdfLink = page.getByRole('link', { name: /Download PDF/i });
    await expect(downloadPdfLink).toBeVisible();
    await expect(downloadPdfLink).toHaveAttribute('href', '/resume.pdf');
    await expect(page.getByRole('button', { name: /Print/i })).toBeVisible();
    // Use first() since multiple mailto links exist (hero + contact section)
    const mailtoLink = page.getByRole('link', { name: /ruslankanat\\.b@gmail\\.com/i }).first();
    await expect(mailtoLink).toBeVisible();
    const href = await mailtoLink.getAttribute('href');
    expect(href).toMatch(/^mailto:/);
  });

  test('REC-A11Y: RecruiterView has no WCAG AA violations', async ({ page }) => {
    await page.goto('/');
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();
    expect(results.violations).toEqual([]);
  });

  test('REC-03: renders four metric numbers', async ({ page }) => {
    await page.goto('/');
    // CSS Modules with camelCase class names: class attribute contains "metricNum"
    await expect(page.locator('[class*="metricNum"]').filter({ hasText: /^10/ }).first()).toBeVisible();
    await expect(page.locator('[class*="metricNum"]').filter({ hasText: /^80/ }).first()).toBeVisible();
    await expect(page.locator('[class*="metricNum"]').filter({ hasText: /^30/ }).first()).toBeVisible();
    await expect(page.locator('[class*="metricNum"]').filter({ hasText: /^16/ }).first()).toBeVisible();
  });

  test('REC-05: renders three job role headings', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 3, name: /Senior SDET \\(AWS/ })).toBeVisible();
    await expect(page.getByRole('heading', { level: 3, name: /SDET \\/ Software Engineer/ })).toBeVisible();
    await expect(page.getByRole('heading', { level: 3, name: /QA Tester/ })).toBeVisible();
  });

  test('REC-07: renders availability spec with Status forest accent', async ({ page }) => {
    await page.goto('/');
    // Use .first() — availability text appears in both the hero eyebrow and AvailabilityCard
    await expect(page.getByText('Open to opportunities · Q3 start').first()).toBeVisible();
    await expect(page.getByText('Authorized to work in the US (details on request)')).toBeVisible();
  });

  test('REC-08: renders contact + footer with external link security', async ({ page }) => {
    await page.goto('/');
    // GitHub link has rel containing noopener
    const githubLink = page.getByRole('link', { name: /github\\.com\\/ruslankanat-sdet/i });
    await expect(githubLink).toBeVisible();
    const githubRel = await githubLink.getAttribute('rel');
    expect(githubRel).toContain('noopener');
    expect(githubRel).toContain('noreferrer');

    // LinkedIn link has rel containing noopener
    const linkedinLink = page.getByRole('link', { name: /in\\/ruslan-kanatbek/i });
    await expect(linkedinLink).toBeVisible();
    const linkedinRel = await linkedinLink.getAttribute('rel');
    expect(linkedinRel).toContain('noopener');
    expect(linkedinRel).toContain('noreferrer');

    // Footer Open the IDE button visible
    await expect(page.getByRole('button', { name: /Open the IDE/i })).toBeVisible();
  });

  test('REC-10: renders without horizontal overflow at 375px', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/');
    await expect(page.getByText('ruslan.kanatbek')).toBeVisible();
    await expect(page.getByText('ResMed').first()).toBeVisible();
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    expect(scrollWidth).toBeLessThanOrEqual(375);
  });

  test('REC-11: recruiter masthead is not rendered in IDE mode', async ({ page }) => {
    // Explicitly clear and re-set to avoid relying on addInitScript ordering
    await page.addInitScript(() => {
      localStorage.removeItem('resume-mode');
      localStorage.setItem('resume-mode', 'ide');
    });
    await page.goto('/');
    // Verify IDE mode is active
    await expect(page.getByRole('button', { name: /README\\.md/ }).first()).toBeVisible();
    // The recruiter Masthead header renders an "Engineer view" button — absent in IDE mode
    // (IDE mode has a "Recruiter view" button in TopBar instead)
    await expect(page.getByRole('button', { name: /Engineer view/i })).not.toBeVisible();
  });

  test('IDE-01: Run Smoke Test button is visible and not disabled when idle', async ({ page }) => {
    // Explicitly clear and re-set to avoid relying on addInitScript ordering
    await page.addInitScript(() => {
      localStorage.removeItem('resume-mode');
      localStorage.setItem('resume-mode', 'ide');
    });
    await page.goto('/');
    const runBtn = page.getByRole('button', { name: /Run Smoke Test/i });
    await expect(runBtn).toBeVisible();
    await expect(runBtn).not.toBeDisabled();
    await expect(runBtn).toHaveText(/Run Smoke Test/);
  });
});

test.describe('Navigation flows', () => {
  test('NAV-01: door → recruiter → IDE round-trip navigation', async ({ page }) => {
    // Start fresh — no stored mode, door shows
    await page.goto('/');
    await expect(page.getByRole('button', { name: /Enter the résumé/i })).toBeVisible();

    // Step 1: Enter recruiter view via the door
    await page.getByRole('button', { name: /Enter the résumé/i }).click();
    await expect(page.getByText('ruslan.kanatbek')).toBeVisible();
    await expect(page.getByRole('button', { name: /Enter the résumé/i })).not.toBeVisible();

    // Step 2: Switch to IDE via the Engineer view button in the masthead
    await page.getByRole('button', { name: /Engineer view/i }).first().click();
    await expect(page.getByRole('button', { name: /README\\.md/ }).first()).toBeVisible();
    const stored = await page.evaluate(() => localStorage.getItem('resume-mode'));
    expect(stored).toBe('ide');
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
  reporter: process.env.CI ? [['html'], ['github']] : [['html'], ['line']],
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
