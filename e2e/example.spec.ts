import { expect, test } from '@playwright/test';

test('has title', async ({ page }) => {
  await page.goto('/');

  await expect(page).toHaveTitle(/QuakeWatch/);
});

test('dashboard loads earthquake data', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByText('Earthquakes (24h)')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Recent Earthquakes' })).toBeVisible();
});
