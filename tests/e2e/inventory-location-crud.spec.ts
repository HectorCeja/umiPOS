import { expect, test } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import { browserAudit, expectClean, login, web } from './owner-corrective.helpers';
test('ubicaciones tienen crear editar archivar restaurar', async () => {
  const source = await readFile(
    'apps/web/src/app/control-plane/inventory-locations/page.tsx',
    'utf8',
  );
  for (const text of ['Crear ubicación', 'Guardar cambios', 'Archivar', 'Restaurar'])
    expect(source).toContain(text);
});
test('CRUD real persiste y alimenta selector de Inventario', async ({ page }) => {
  test.setTimeout(60_000);
  await login(page);
  await page.goto(`${web}/control-plane/inventory-locations`);
  await page.waitForTimeout(500);
  const audit = browserAudit(page);
  const stamp = Date.now().toString(36);
  const name = `Bodega Owner ${stamp}`;
  await page.getByRole('textbox', { name: 'Nombre *' }).fill(name);
  await page.getByRole('textbox', { name: 'Código *' }).fill(`OWNER-${stamp}`.toUpperCase());
  const created = page.waitForResponse(
    (response) =>
      response.request().method() === 'POST' && response.url().includes('/inventory/locations'),
  );
  await page.getByRole('button', { name: 'Crear ubicación' }).click();
  expect((await created).status()).toBe(201);
  await expect(page.getByText('Ubicación creada y disponible en Inventario.')).toBeVisible();
  const row = page.locator('.location-list article').filter({ hasText: name });
  await expect(row).toBeVisible();
  const archived = page.waitForResponse(
    (response) =>
      response.request().method() === 'PUT' && response.url().includes('/inventory/locations/'),
  );
  await row.getByRole('button', { name: 'Archivar' }).click();
  expect((await archived).status()).toBe(200);
  await expect(row.getByText('Archivada')).toBeVisible();
  const restored = page.waitForResponse(
    (response) =>
      response.request().method() === 'PUT' && response.url().includes('/inventory/locations/'),
  );
  await row.getByRole('button', { name: 'Restaurar' }).click();
  expect((await restored).status()).toBe(200);
  await expect(row.getByText('Activa')).toBeVisible();
  expectClean(audit);
  await page.goto(`${web}/inventory`);
  const inventoryAudit = browserAudit(page);
  await page.getByRole('combobox', { name: 'Ubicación de inventario' }).click();
  await expect(page.getByRole('option', { name })).toHaveCount(1);
  expectClean(inventoryAudit);
});
