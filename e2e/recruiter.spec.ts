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
    await expect(page.getByText('ruslan.kanatbek')).toBeVisible();
    await expect(
      page.getByRole('button', { name: /Engineer view/ }).first(),
    ).toBeVisible();
  });

  test('REC-01: clicking Engineer view switches to IDE', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /Engineer view/ }).first().click();
    await expect(
      page.getByRole('button', { name: /README\.md/ }).first(),
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
    const mailtoLink = page.getByRole('link', { name: /ruslankanat\.b@gmail\.com/i }).first();
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
    await expect(page.getByRole('heading', { level: 3, name: /Senior SDET \(AWS/ })).toBeVisible();
    await expect(page.getByRole('heading', { level: 3, name: /SDET \/ Software Engineer/ })).toBeVisible();
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
    const githubLink = page.getByRole('link', { name: /github\.com\/ruslankanat-sdet/i });
    await expect(githubLink).toBeVisible();
    const githubRel = await githubLink.getAttribute('rel');
    expect(githubRel).toContain('noopener');
    expect(githubRel).toContain('noreferrer');

    // LinkedIn link has rel containing noopener
    const linkedinLink = page.getByRole('link', { name: /in\/ruslan-kanatbek/i });
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
});
