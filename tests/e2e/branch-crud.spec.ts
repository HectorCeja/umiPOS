import { expect, test } from '@playwright/test';
import { browserAudit, expectClean, login, web } from './owner-corrective.helpers';

test('crear, renombrar, archivar y restaurar una sucursal real', async ({ page }) => {
  await login(page);
  const audit = browserAudit(page);
  await page.goto(`${web}/control-plane/branches`);
  const suffix = String(Date.now()).slice(-7);
  await page.getByLabel('Nombre de la sucursal').fill(`Sucursal Owner ${suffix}`);
  await page.getByLabel('Código').fill(`OWN${suffix}`);
  await page.getByRole('button', { name: 'Crear sucursal' }).click();
  const row = page.locator('.branch-list article').filter({ hasText: `Sucursal Owner ${suffix}` });
  await expect(row).toBeVisible();
  await row.getByRole('button', { name: 'Editar' }).click();
  await page.getByLabel('Nombre de la sucursal').fill(`Sucursal Renombrada ${suffix}`);
  await page.getByRole('button', { name: 'Guardar sucursal' }).click();
  const renamed = page
    .locator('.branch-list article')
    .filter({ hasText: `Sucursal Renombrada ${suffix}` });
  await renamed.getByRole('button', { name: 'Archivar' }).click();
  await expect(renamed).toContainText('Archivada');
  await renamed.getByRole('button', { name: 'Restaurar' }).click();
  await expect(renamed).toContainText('Activa');
  expectClean(audit);
});
