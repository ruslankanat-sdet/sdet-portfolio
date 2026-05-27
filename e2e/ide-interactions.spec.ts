import { test, expect } from '@playwright/test';

test.describe('IDE interactions', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('resume-mode', 'ide');
    });
  });

  test('clicking bio.json loads editor with bio content', async ({ page }) => {
    await page.goto('/');
    // The about/ folder header is a div (no role=button), use getByText to expand it
    await page.getByText('about', { exact: true }).first().click();
    await page.getByRole('button', { name: /bio\.json/ }).click();
    await expect(page.locator('pre code')).toContainText('Ruslan Kanatbek');
  });

  test('test files appear in sidebar under tests/ folder', async ({ page }) => {
    // Covers SHOW-02: sidebar displays Playwright spec files under tests/ folder
    // This test will FAIL until plan 03 ships the tests/ folder entries in files-data.ts —
    // that failure is the correct gating signal proving plan 03 has not yet landed.
    await page.goto('/');
    await expect(page.getByText('tests', { exact: true }).first()).toBeVisible();
    await page.getByText('tests', { exact: true }).first().click();
    await expect(page.getByRole('button', { name: /landing\.spec\.ts/ })).toBeVisible();
  });

  test('clicking landing.spec.ts loads its TypeScript source in editor', async ({ page }) => {
    // Covers SHOW-02: editor renders the spec file content with TypeScript source.
    // This test will FAIL until plan 03 ships the tests/ folder entries in files-data.ts —
    // that failure is the correct gating signal proving plan 03 has not yet landed.
    await page.goto('/');
    await page.getByText('tests', { exact: true }).first().click();
    await page.getByRole('button', { name: /landing\.spec\.ts/ }).click();
    await expect(page.locator('pre code')).toContainText("'@playwright/test'");
  });
});
