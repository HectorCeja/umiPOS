import { expect, test } from '@playwright/test';
import {
  browserAudit,
  evidence,
  expectClean,
  login,
  onePixelPng,
  web,
} from './owner-corrective.helpers';

test('created product renders its private media and accessible detail dialog', async ({ page }) => {
  await login(page);
  const audit = browserAudit(page);
  await page.goto(`${web}/products`);
  const suffix = Date.now().toString();
  await page.getByLabel('Nombre del producto').fill(`Producto media ${suffix}`);
  await page.getByLabel('SKU comercial (opcional)').fill(`MEDIA-${suffix}`);
  await page
    .locator('#new-product input[type=file]')
    .setInputFiles({ name: 'product.png', mimeType: 'image/png', buffer: onePixelPng });
  await page.getByRole('button', { name: 'Agregar al catálogo' }).click();
  await expect(page.getByText('Cambios guardados.')).toBeVisible();
  const card = page
    .locator('.product-catalog-card')
    .filter({ hasText: `Producto media ${suffix}` });
  await expect(card.locator('img')).toBeVisible();
  await card.click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await evidence(page, 'product-media-detail-dialog.png');
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).not.toBeVisible();
  await page.waitForTimeout(350);
  expectClean(audit);
});
