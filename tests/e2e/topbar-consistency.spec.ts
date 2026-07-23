import { expect, test } from '@playwright/test';
import { enterAuthenticatedApp } from './premium-ux-part1b.helpers.js';

test('topbar exposes search, context and one canonical identity surface', async ({ page }) => {
  await enterAuthenticatedApp(page);
  await expect(page.getByRole('button', { name: 'Abrir búsqueda global' })).toBeVisible();
  await expect(page.getByRole('button', { name: /Organización activa/ })).toBeVisible();
  await expect(page.locator('.profile-trigger')).toHaveCount(1);
});
