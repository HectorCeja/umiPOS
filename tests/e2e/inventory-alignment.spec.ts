import { expect, test } from '@playwright/test';
import { browserAudit, expectClean, login, web } from './owner-corrective.helpers';

test('selector de sucursal funciona y Consultar existencias queda alineado', async ({ page }) => {
  await login(page);
  const audit = browserAudit(page);
  await page.goto(`${web}/inventory`);
  const branch = page.getByRole('button', { name: /Sucursal activa:/ });
  await branch.click();
  const choices = page.getByRole('menuitemradio');
  await expect(choices.first()).toBeVisible();
  await choices.first().click();
  await expect(branch).toHaveAttribute('aria-expanded', 'false');
  const selectBox = await page.getByLabel('Ubicación de inventario').boundingBox();
  const buttonBox = await page.getByRole('button', { name: 'Consultar existencias' }).boundingBox();
  expect(selectBox).not.toBeNull();
  expect(buttonBox).not.toBeNull();
  expect(Math.abs((selectBox?.y ?? 0) - (buttonBox?.y ?? 0))).toBeLessThanOrEqual(3);
  expectClean(audit);
});
