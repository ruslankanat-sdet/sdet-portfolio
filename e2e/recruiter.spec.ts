import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Recruiter view', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('resume-mode', 'recruiter');
    });
  });

  test('REC-01: shows masthead wordmark and Engineer view pill', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText('ruslan.kanat')).toBeVisible();
    await expect(
      page.getByRole('button', { name: /Engineer view/i }),
    ).toBeVisible();
  });

  test('REC-01: clicking Engineer view switches to IDE', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /Engineer view/i }).click();
    await expect(
      page.getByRole('button', { name: /README\.md/ }).first(),
    ).toBeVisible();
    const stored = await page.evaluate(() => localStorage.getItem('resume-mode'));
    expect(stored).toBe('ide');
  });

  test('REC-02: hero renders availability, headline em, pitch, two CTAs', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText('Available · Q3 start')).toBeVisible();
    await expect(
      page.locator('h1 em').filter({ hasText: 'AI products' }),
    ).toBeVisible();
    await expect(page.getByText(/Nine years writing/i)).toBeVisible();
    await expect(
      page.getByRole('button', { name: /Download PDF/i }),
    ).toBeVisible();
    const mailtoLink = page.getByRole('link', { name: /alex@morgan\.dev/i });
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
    await expect(page.getByText('9')).toBeVisible();
    await expect(page.getByText('0.4')).toBeVisible();
    await expect(page.getByText('98.2')).toBeVisible();
    await expect(page.getByText('1,247')).toBeVisible();
  });

  test('REC-05: renders three job role headings', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 3, name: /Staff SDET/ })).toBeVisible();
    await expect(page.getByRole('heading', { level: 3, name: /Senior SDET/ })).toBeVisible();
    await expect(page.getByRole('heading', { level: 3, name: /Automation Engineer/ })).toBeVisible();
  });

  test('REC-07: renders availability spec with Status forest accent', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText('Open to offers · Q3 start')).toBeVisible();
    await expect(page.getByText('US citizen — no sponsorship needed')).toBeVisible();
  });

  test('REC-08: renders contact + footer with external link security', async ({ page }) => {
    await page.goto('/');
    // GitHub link has rel containing noopener
    const githubLink = page.getByRole('link', { name: /github\.com\/amorgan/i });
    await expect(githubLink).toBeVisible();
    const githubRel = await githubLink.getAttribute('rel');
    expect(githubRel).toContain('noopener');
    expect(githubRel).toContain('noreferrer');

    // LinkedIn link has rel containing noopener
    const linkedinLink = page.getByRole('link', { name: /in\/amorgan-sdet/i });
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
    await expect(page.getByText('ruslan.kanat')).toBeVisible();
    await expect(page.getByText('Lumen Systems').first()).toBeVisible();
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    expect(scrollWidth).toBeLessThanOrEqual(375);
  });
});
