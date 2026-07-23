import { expect, test } from '@playwright/test';
import { browserAudit, expectClean, login, web } from './owner-corrective.helpers';

test('crear Producto usa un único Premium Toast y actualiza catálogo real', async ({ page }) => {
  const audit = browserAudit(page);
  await login(page);
  await page.goto(`${web}/products`);
  const name = `Producto sin duplicados ${Date.now()}`;
  await page.getByLabel('Nombre del producto').fill(name);
  await page.getByLabel('SKU comercial (opcional)').fill(`DEDUP-${Date.now()}`);
  await page.getByRole('button', { name: 'Agregar al catálogo' }).click();
  const toast = page.locator('body > .nexo-toast-region .nexo-premium-toast');
  await expect(toast).toHaveCount(1);
  await expect(toast).toContainText('Cambios guardados');
  await expect(page.locator('.product-catalog-card').filter({ hasText: name })).toBeVisible();
  await expect(page.locator('.success-education, .next-step')).toHaveCount(0);
  expectClean(audit);
});
