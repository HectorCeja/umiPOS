import { expect, test } from '@playwright/test';
import {
  api,
  browserAudit,
  completeOnboarding,
  evidence,
  expectClean,
  login,
  web,
} from './owner-corrective.helpers';

const organization = '10000000-0000-4000-8000-000000000001';
const branch = '20000000-0000-4000-8000-000000000001';

test('open, suspended, resumed and cancelled sales expose only valid actions', async ({ page }) => {
  await login(page);
  await completeOnboarding(page);
  const csrf =
    (await page.context().cookies()).find(({ name }) => name === 'nexo_csrf')?.value ?? '';
  const created = await page.request.post(`${api}/v1/organizations/${organization}/sales`, {
    headers: {
      origin: web,
      'x-csrf-token': csrf,
      'idempotency-key': `owner-sales-state-${Date.now()}`,
    },
    data: {
      branchId: branch,
      currency: 'MXN',
      channel: 'API',
      businessDate: '2026-07-17',
      notes: 'Corrective Pass 2 state machine',
    },
  });
  expect(created.status()).toBe(201);
  const sale = (await created.json()) as { id: string };
  const audit = browserAudit(page);
  await page.goto(`${web}/sales`);
  const search = page.getByLabel('Folio, SKU, código de barras o producto');
  await search.fill(sale.id);
  await page.getByRole('button', { name: 'Actualizar' }).click();
  await page
    .getByRole('row')
    .filter({ hasText: 'Abierta' })
    .getByRole('button', { name: 'Revisar' })
    .click();
  const detail = page.locator('#sales-detail');
  await expect(detail).toBeFocused();
  const suspend = detail.getByRole('button', { name: 'Suspender' });
  const resume = detail.getByRole('button', { name: 'Reanudar' });
  const cancel = detail.getByRole('button', { name: 'Cancelar abierta' });
  await expect(suspend).toBeEnabled();
  await expect(resume).toBeDisabled();
  await expect(resume).toHaveAttribute('title', /venta suspendida/i);
  await evidence(page, 'sales-state-open.png');

  await suspend.click();
  await expect(page.getByText('La operación fue confirmada.')).toBeVisible();
  await expect(detail.getByLabel('Estado Suspendida')).toBeVisible();
  await expect(detail.getByText('Venta suspendida')).toBeVisible();
  await expect(suspend).toBeDisabled();
  await expect(resume).toBeEnabled();
  await evidence(page, 'sales-state-suspended.png');

  await resume.click();
  await expect(detail.getByLabel('Estado Abierta')).toBeVisible();
  await expect(detail.getByText('Venta reanudada')).toBeVisible();
  await expect(suspend).toBeEnabled();
  await expect(resume).toBeDisabled();
  await evidence(page, 'sales-state-resumed.png');

  await cancel.click();
  await expect(detail.getByLabel('Estado Cancelada')).toBeVisible();
  await expect(detail.getByText('Venta cancelada')).toBeVisible();
  await expect(suspend).toBeDisabled();
  await expect(resume).toBeDisabled();
  await expect(cancel).toBeDisabled();
  await evidence(page, 'sales-state-cancelled.png');

  await page.reload();
  await search.fill(sale.id);
  await page.getByRole('button', { name: 'Actualizar' }).click();
  await expect(page.getByRole('row').filter({ hasText: 'Cancelada' })).toBeVisible();
  expectClean(audit);
});
