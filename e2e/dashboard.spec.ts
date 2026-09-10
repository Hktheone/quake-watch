import { expect, test } from '@playwright/test';

test.describe('QuakeWatch dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Filters only render once the live USGS feed has actually loaded, so
    // waiting on this doubles as "wait for real data" for every test below.
    await expect(page.getByLabel('Minimum magnitude')).toBeVisible();
  });

  test('has the correct page title', async ({ page }) => {
    await expect(page).toHaveTitle(/QuakeWatch/);
  });

  test('shows live earthquake stats and a recent-activity list', async ({ page }) => {
    await expect(page.getByText('Earthquakes (24h)')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Recent Earthquakes' })).toBeVisible();
    await expect(page.locator('.ticker-item').first()).toBeVisible();
  });

  test('filtering by magnitude narrows the result count and can be cleared', async ({ page }) => {
    const resultCount = page.locator('.result-count');
    const totalText = await resultCount.textContent();

    await page.getByLabel('Minimum magnitude').selectOption({ label: 'M 6.0+' });

    await expect(page.getByRole('button', { name: '✕ Clear' })).toBeVisible();
    await expect(resultCount).not.toHaveText(totalText ?? '');

    await page.getByRole('button', { name: '✕ Clear' }).click();
    await expect(page.getByRole('button', { name: '✕ Clear' })).toHaveCount(0);
  });

  test('filtering by region only shows earthquakes from that region', async ({ page }) => {
    const regionSelect = page.getByLabel('Region');
    const firstRegion = (await regionSelect.locator('option').nth(1).textContent())?.trim();

    await regionSelect.selectOption({ label: firstRegion! });

    await expect(page.getByRole('button', { name: '✕ Clear' })).toBeVisible();
    await expect(page.locator('.ticker-item').first()).toBeVisible();

    for (const meta of await page.locator('.quake-meta').allTextContents()) {
      expect(meta).toContain(firstRegion);
    }
  });

  test('dark/light toggle switches the theme and persists on reload', async ({ page }) => {
    const html = page.locator('html');
    const toggle = page.getByLabel('Toggle dark mode');

    await expect(html).toHaveAttribute('data-theme', 'light');

    await toggle.click();
    await expect(html).toHaveAttribute('data-theme', 'dark');

    await page.reload();
    await expect(html).toHaveAttribute('data-theme', 'dark');
  });
});
