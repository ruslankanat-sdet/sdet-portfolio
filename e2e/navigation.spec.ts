import { test, expect } from '@playwright/test';

// The /about page was removed in the IDE restructuring (commit b1b3900).
// Navigation between IDE and recruiter views is now handled by in-page buttons.
test.describe('Navigation', () => {
  test('IDE → Recruiter view switch via TopBar button', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('resume-mode', 'ide');
    });
    await page.goto('/');
    // Verify we start in IDE mode
    await expect(page.getByRole('button', { name: /README\.md/ }).first()).toBeVisible();
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
    await expect(page.getByRole('button', { name: /README\.md/ }).first()).toBeVisible();
    const stored = await page.evaluate(() => localStorage.getItem('resume-mode'));
    expect(stored).toBe('ide');
  });
});
