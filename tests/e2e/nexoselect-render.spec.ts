import { expect, test } from '@playwright/test';
import { login, web } from './owner-corrective.helpers';

test('renderiza trigger NEXO sin select nativo visible', async ({ page }) => {
  await login(page);
  await page.goto(`${web}/inventory`);
  await expect(page.getByRole('combobox', { name: 'Producto o presentación' })).toBeVisible();
  await expect(page.locator('select')).toHaveCount(0);
});
