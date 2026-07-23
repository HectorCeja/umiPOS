import { expect, test } from '@playwright/test';
import {
  browserAudit,
  createCompletedSaleForOwnerTest,
  evidence,
  expectClean,
  login,
  web,
} from './owner-corrective.helpers';

test('receipt retrieval confirms the real reprint command and prevents double submit', async ({
  page,
}) => {
  await login(page);
  const saleId = await createCompletedSaleForOwnerTest(page);
  const audit = browserAudit(page);
  await page.goto(`${web}/sales`);
  await page.getByLabel('Folio, SKU, código de barras o producto').fill(saleId);
  await page.getByRole('button', { name: 'Actualizar' }).click();
  const completed = page.getByRole('row').filter({ hasText: 'Completada' });
  await expect(completed).toBeVisible();
  await completed.getByRole('button', { name: 'Revisar' }).click();
  const regenerate = page.getByRole('button', { name: 'Preparar reimpresión' });
  await expect(regenerate).toBeEnabled();
  let commandCount = 0;
  await page.route(/\/v1\/organizations\/[^/]+\/sales\/[^/]+\/receipt$/, async (route) => {
    if (route.request().method() === 'POST') {
      commandCount += 1;
      await new Promise((resolve) => setTimeout(resolve, 250));
    }
    await route.continue();
  });
  await regenerate.click();
  await expect(regenerate).toBeDisabled();
  await regenerate.click({ force: true });
  await expect(page.getByText('Recibo recuperado para reimpresión.')).toBeVisible();
  await expect(page.getByRole('link', { name: 'Ver recibo' })).toBeVisible();
  expect(commandCount).toBe(1);
  await evidence(page, 'sales-receipt-regenerated.png');
  expectClean(audit);
});
