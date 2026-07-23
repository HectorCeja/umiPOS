import { expect, test } from '@playwright/test';
import { chooseNexoSelect, ensureInventoryLocation, login, web } from './owner-corrective.helpers';

test('Saldo por estado usa tarjetas premium responsivas con jerarquía y descripción', async ({
  page,
}) => {
  await login(page);
  await ensureInventoryLocation(page);
  await page.goto(`${web}/inventory`);
  await chooseNexoSelect(page, 'Producto o presentación', 0);
  await chooseNexoSelect(page, 'Ubicación de inventario', 0);
  await page.getByRole('button', { name: 'Consultar existencias' }).click();
  const facts = page.locator('.inventory-facts > div');
  await expect(facts.first()).toBeVisible();
  expect(await facts.count()).toBeGreaterThanOrEqual(3);
  await expect(facts.first().locator('dt')).not.toBeEmpty();
  await expect(facts.first().locator('dd')).not.toBeEmpty();
  await expect(facts.first().locator('small')).not.toBeEmpty();
  expect(await facts.first().getAttribute('data-state')).toMatch(/success|warning|danger|info/);
});
