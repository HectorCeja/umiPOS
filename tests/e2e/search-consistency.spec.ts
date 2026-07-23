import { expect, test } from '@playwright/test';
import { enterAuthenticatedApp } from './premium-ux-part1b.helpers.js';

test('global search is keyboard-ready, clear and educational when empty', async ({ page }) => {
  await enterAuthenticatedApp(page);
  await page.getByRole('button', { name: 'Abrir búsqueda global' }).click();
  const search = page.getByRole('searchbox', { name: 'Buscar acciones' });
  await expect(search).toBeFocused();
  await search.fill('zzzz-sin-resultado');
  await expect(page.getByText('No encontramos coincidencias')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(search).not.toBeVisible();
});
