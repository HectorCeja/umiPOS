import { expect, test } from '@playwright/test';
import {
  browserAudit,
  createCompletedSaleForOwnerTest,
  expectClean,
  login,
  web,
} from './owner-corrective.helpers';

test('sales actions expose state-dependent disabled reasons', async ({ page }) => {
  await login(page);
  const audit = browserAudit(page);
  const saleId = await createCompletedSaleForOwnerTest(page);
  await page.goto(`${web}/sales`);
  await page.getByLabel('Folio, SKU, código de barras o producto').fill(saleId);
  await page.getByRole('button', { name: 'Actualizar' }).click();
  await page
    .getByRole('row')
    .filter({ hasText: 'Completada' })
    .getByRole('button', { name: 'Revisar' })
    .click();
  await expect(page.locator('#sales-detail')).toBeVisible();
  const actions = ['Suspender', 'Reanudar', 'Cancelar abierta', 'Regenerar recibo'];
  for (const name of actions) {
    const button = page.getByRole('button', { name });
    if (await button.isDisabled()) await expect(button).toHaveAttribute('title', /.+/);
  }
  await expect(page.getByRole('button', { name: 'Suspender' })).toBeDisabled();
  await expect(page.getByRole('button', { name: 'Reanudar' })).toBeDisabled();
  await expect(page.getByRole('button', { name: 'Cancelar abierta' })).toBeDisabled();
  expectClean(audit);
});
