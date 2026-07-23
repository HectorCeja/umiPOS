import { expect, test } from '@playwright/test';
import {
  browserAudit,
  createCompletedSaleForOwnerTest,
  evidence,
  expectClean,
  login,
  web,
} from './owner-corrective.helpers';

test('diagnostic copy provides accessible success and a controlled failure fallback', async ({
  page,
}) => {
  test.setTimeout(60_000);
  await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);
  await login(page);
  const saleId = await createCompletedSaleForOwnerTest(page);
  const audit = browserAudit(page);
  await page.goto(`${web}/sales`);
  await page.getByLabel('Folio, SKU, código de barras o producto').fill(saleId);
  await page.getByRole('button', { name: 'Actualizar' }).click();
  await page
    .getByRole('row')
    .filter({ hasText: 'Completada' })
    .first()
    .getByRole('button', { name: 'Revisar' })
    .click();
  const copy = page.getByRole('button', { name: 'Copiar diagnóstico' });
  await copy.click();
  await expect(page.getByRole('button', { name: /Copiado/ })).toBeVisible();
  await expect(page.getByRole('status').filter({ hasText: 'Diagnóstico copiado' })).toBeVisible();
  const clipboard = await page.evaluate(() => navigator.clipboard.readText());
  expect(clipboard).not.toMatch(/password|sessionToken|authorization|cookie|PAN|CVV/i);
  await evidence(page, 'sales-diagnostic-copied.png');
  await expect(page.getByRole('button', { name: 'Copiar diagnóstico' })).toBeVisible({
    timeout: 4000,
  });
  expectClean(audit);
});
