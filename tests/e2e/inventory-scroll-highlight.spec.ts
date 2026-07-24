import { expect, test } from '@playwright/test';
import {
  browserAudit,
  chooseNexoSelect,
  createProductForOwnerTest,
  ensureInventoryLocation,
  expectClean,
  web,
} from './owner-corrective.helpers';

test('Consultar existencias revela, enfoca y resalta Saldo por estado', async ({ page }) => {
  const audit = browserAudit(page);
  await createProductForOwnerTest(page, 'Inventario resaltado');
  await ensureInventoryLocation(page);
  await page.goto(`${web}/inventory`);
  await chooseNexoSelect(page, 'Producto o presentación', 0);
  await chooseNexoSelect(page, 'Ubicación de inventario', 0);
  await page.getByRole('button', { name: 'Consultar existencias' }).click();
  const balance = page.locator('.inventory-availability');
  await expect(balance).toHaveClass(/is-highlighted/);
  await expect(balance).toBeFocused();
  await expect
    .poll(async () => (await balance.boundingBox())?.y ?? Number.POSITIVE_INFINITY)
    .toBeLessThan(page.viewportSize()!.height);
  const box = await balance.boundingBox();
  expect(box).not.toBeNull();
  expect(box!.y).toBeGreaterThanOrEqual(0);
  expect(box!.y).toBeLessThan(page.viewportSize()!.height);
  expectClean(audit);
});
