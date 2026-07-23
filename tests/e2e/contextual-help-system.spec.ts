import { expect, test } from '@playwright/test';
import { browserAudit, expectClean, login, web } from './owner-corrective.helpers';

test('contextual help can close and reopen without blocking the screen', async ({ page }) => {
  await login(page);
  const audit = browserAudit(page);
  await page.goto(`${web}/products`);
  const help = page.getByRole('complementary', { name: 'Ayuda de Cómo administrar Productos' });
  await page.getByRole('button', { name: /Ver guía/ }).click();
  await expect(help).toContainText('Producto es lo que vendes');
  await help.getByRole('button', { name: /Cerrar ayuda/ }).click();
  await expect(help.locator('.contextual-help__panel')).toHaveCount(0);
  await page.getByRole('button', { name: /Ver guía/ }).click();
  await expect(help.locator('.contextual-help__panel')).toBeVisible();
  expectClean(audit);
});
