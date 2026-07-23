import { expect, test } from '@playwright/test';
import {
  browserAudit,
  createProductForOwnerTest,
  evidence,
  expectClean,
  login,
} from './owner-corrective.helpers';

test('product detail has one accessible close control', async ({ page }) => {
  await login(page);
  const card = await createProductForOwnerTest(page, 'Detalle de producto');
  await page.waitForLoadState('networkidle');
  const audit = browserAudit(page);
  await card.click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole('button', { name: 'Cerrar detalle del producto' })).toHaveCount(1);
  await expect(dialog.getByRole('button', { name: /^Cerrar$/ })).toHaveCount(0);
  await evidence(page, 'product-detail-one-close.png');
  await page.keyboard.press('Escape');
  await expect(dialog).not.toBeVisible();
  expectClean(audit);
});
