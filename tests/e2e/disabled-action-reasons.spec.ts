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
  await expect
    .poll(async () => {
      const response = await page.request.get(
        `http://localhost:3001/v1/organizations/10000000-0000-4000-8000-000000000001/sales-administration/history?branchId=20000000-0000-4000-8000-000000000001&search=${saleId}`,
      );
      return response.ok() ? ((await response.json()) as { total: number }).total : 0;
    })
    .toBeGreaterThan(0);
  await page.goto(`${web}/sales`);
  await page.getByLabel('Folio, SKU, código de barras o producto').fill(saleId);
  await page.getByRole('button', { name: 'Actualizar' }).click();
  await page.getByRole('button', { name: 'Revisar' }).click();
  await expect(page.locator('#sales-detail')).toBeVisible();
  const actions = ['Suspender', 'Reanudar', 'Cancelar abierta', 'Preparar reimpresión'];
  for (const name of actions) {
    const button = page.getByRole('button', { name });
    if (await button.isDisabled()) await expect(button).toHaveAttribute('title', /.+/);
  }
  await expect(page.getByRole('button', { name: 'Suspender' })).toBeDisabled();
  await expect(page.getByRole('button', { name: 'Reanudar' })).toBeDisabled();
  await expect(page.getByRole('button', { name: 'Cancelar abierta' })).toBeDisabled();
  expectClean(audit);
});
