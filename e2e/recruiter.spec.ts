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
});
