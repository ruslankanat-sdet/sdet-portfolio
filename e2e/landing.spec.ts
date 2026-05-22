import { test, expect } from '@playwright/test';
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
    await expect(page.getByRole('button', { name: /README\.md/ }).first()).toBeVisible();
  });

  test('sidebar README.md row loads README content into editor', async ({ page }) => {
    await page.goto('/');
    // Click the sidebar file row specifically (first button with this name, inside the sidebar)
    await page.locator('aside').getByRole('button', { name: /README\.md/ }).click();
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
