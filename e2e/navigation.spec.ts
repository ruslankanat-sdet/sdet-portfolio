import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
  test('About link navigates to /about', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: /About/i }).first().click();
    await expect(page).toHaveURL(/\/about$/);
    await expect(page.getByRole('main')).toBeVisible();
  });

  test('back link returns to /', async ({ page }) => {
    await page.goto('/about');
    // On /about the nav link shows "← Back" linking back to /
    await page.getByRole('link', { name: /Back/i }).first().click();
    await expect(page).toHaveURL('http://localhost:3000/');
  });
});
