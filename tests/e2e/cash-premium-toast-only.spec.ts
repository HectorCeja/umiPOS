import { expect, test } from '@playwright/test';
import { browserAudit, expectClean, login, web } from './owner-corrective.helpers';

test('Caja usa feedback flotante sin región fija superior', async ({ page }) => {
  await login(page);
  await page.goto(`${web}/cash`);
  await page.waitForLoadState('networkidle');
  const audit = browserAudit(page);
  await expect(page.locator('#cash-feedback')).toHaveCount(0);
  await page.getByText('Configurar puntos de cobro', { exact: true }).click();
  const suffix = Date.now().toString();
  await page.getByLabel('Nombre', { exact: true }).fill(`Caja E2E ${suffix}`);
  await page.getByLabel('Código', { exact: true }).fill(`E2E-${suffix}`);
  const before = await page.evaluate(() => window.scrollY);
  await page.getByRole('button', { name: 'Crear punto de cobro' }).click();
  await expect(page.locator('.nexo-toast-region .nexo-premium-toast')).toBeVisible();
  await expect(page.locator('.nexo-toast-region')).toHaveAttribute(
    'aria-label',
    'Notificaciones de Caja',
  );
  expect(await page.evaluate(() => window.scrollY)).toBe(before);
  expectClean(audit);
});
