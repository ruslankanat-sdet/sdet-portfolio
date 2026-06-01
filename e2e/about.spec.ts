import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

// The /about page was removed in the IDE restructuring (commit b1b3900).
// Recruiter view is the current canonical "about" surface.
// These tests verify the recruiter view's about-equivalent content.
test.describe('About page', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('resume-mode', 'recruiter');
    });
  });

  test('renders work history section', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 3, name: /Senior SDET \(AWS/ })).toBeVisible();
    await expect(page.getByRole('heading').first()).toBeVisible();
  });

  test('PDF download link is present', async ({ page }) => {
    await page.goto('/');
    const link = page.getByRole('link', { name: /Download PDF/i });
    await expect(link).toBeVisible();
    await expect(link).toHaveAttribute('href', /resume\.pdf$/);
  });

  test('has no WCAG AA violations', async ({ page }) => {
    await page.goto('/');
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();
    expect(results.violations).toEqual([]);
  });
});
