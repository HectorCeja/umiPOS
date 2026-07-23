import { expect, test } from '@playwright/test';
import { createProductForOwnerTest, browserAudit, expectClean } from './owner-corrective.helpers';

test('un producto existente permite editar información comercial e imagen', async ({ page }) => {
  await createProductForOwnerTest(page, 'Producto editable');
  const audit = browserAudit(page);
  const card = page
    .locator('.product-catalog-card')
    .filter({ hasText: 'Producto editable' })
    .first();
  await card.click();
  await page.getByRole('button', { name: 'Editar producto' }).click();
  const dialog = page.getByRole('dialog');
  const renamed = `Producto actualizado ${String(Date.now()).slice(-6)}`;
  await dialog.getByLabel(/^Nombre/).fill(renamed);
  await dialog.getByLabel('Precio').fill('129.90');
  await dialog.getByLabel('Descripción').fill('Descripción comercial actualizada por el owner.');
  await dialog.getByRole('button', { name: 'Guardar cambios' }).click();
  await expect(page.getByRole('heading', { name: renamed })).toBeVisible();
  await expect(dialog.getByRole('button', { name: 'Editar producto' })).toBeVisible();
  await page.waitForTimeout(350);
  await page.reload();
  await expect(page.locator('.product-catalog-card').filter({ hasText: renamed })).toBeVisible();
  expectClean(audit);
});
