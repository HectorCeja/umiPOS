import { expect, test } from '@playwright/test';
import { enterAuthenticatedApp } from './premium-ux-part1b.helpers.js';

test('sidebar has canonical brand, semantic icons and one selected route', async ({ page }) => {
  await enterAuthenticatedApp(page);
  await expect(page.locator('.product-sidebar [data-nexo-brand="authoritative"]')).toBeVisible();
  await expect(page.locator('.product-nav .nexo-icon')).toHaveCount(10);
  await expect(page.locator('.product-nav a.active')).toHaveCount(1);
});
