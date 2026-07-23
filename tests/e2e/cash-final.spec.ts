import { expect, test } from '@playwright/test';
import { browserAudit, expectClean, login, web } from './owner-corrective.helpers';

test('Caja expone únicamente acciones compatibles y feedback enfocable', async ({ page }) => {
  await login(page);
  const audit = browserAudit(page);
  await page.goto(`${web}/cash`);
  await expect(page.getByRole('heading', { name: 'Administración de Caja' })).toBeVisible();
  await expect(page.getByText('Configurar puntos de cobro')).toBeVisible();
  await expect(page.getByRole('button', { name: /cobrar|checkout|venta/i })).toHaveCount(0);
  expectClean(audit);
});
