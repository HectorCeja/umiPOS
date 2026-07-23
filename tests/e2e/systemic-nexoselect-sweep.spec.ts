import { expect, test } from '@playwright/test';
import { login, web } from './owner-corrective.helpers';

test('superficies Web activas no renderizan select nativo', async ({ page }) => {
  await login(page);
  for (const route of [
    '/inventory',
    '/products',
    '/cash',
    '/sales',
    '/reports',
    '/control-plane/settings',
    '/control-plane/inventory-locations',
    '/control-plane/invitations',
    '/settings/profile',
    '/help',
  ]) {
    await page.goto(`${web}${route}`);
    await expect(page.locator('select')).toHaveCount(0);
    for (const combobox of await page.getByRole('combobox').all()) {
      await expect(combobox).toHaveClass(/nexo-select-trigger/);
    }
  }
});
