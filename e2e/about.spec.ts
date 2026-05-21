import { test, expect } from '@playwright/test';
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
    await expect(link).toHaveAttribute('href', /resume\.pdf$/);
  });

  test('has no WCAG AA violations', async ({ page }) => {
    await page.goto('/about');
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();
    expect(results.violations).toEqual([]);
  });
});
