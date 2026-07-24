import { expect, test } from '@playwright/test';
import { login, web } from './owner-corrective.helpers';

test('toast no intersecta Header, sucursal ni menú de usuario', async ({ page }) => {
  await login(page);
  await page.goto(`${web}/products`);
  await page.locator('.product-catalog-card').first().click();
  await page.getByRole('button', { name: 'Editar producto' }).click();
  const name = page.getByLabel('Nombre').last();
  await name.fill(`${await name.inputValue()} `);
  await page.getByRole('button', { name: 'Guardar cambios' }).click();
  const toast = page.locator('#nexo-toast-provider .nexo-premium-toast');
  await expect(toast).toBeVisible();
  for (const surface of [
    page.locator('.product-topbar'),
    page.locator('.home-context-controls'),
    page.locator('.topbar-actions'),
  ]) {
    const box = await surface.boundingBox();
    await expect
      .poll(async () => toast.evaluate((node) => node.getBoundingClientRect().y))
      .toBeGreaterThanOrEqual(box!.y + box!.height);
  }
});

test('ResizeObserver reposiciona el toast si el Header cambia de altura', async ({ page }) => {
  await login(page);
  await page.goto(`${web}/products`);
  await page.locator('.product-catalog-card').first().click();
  await page.getByRole('button', { name: 'Editar producto' }).click();
  const name = page.getByLabel('Nombre').last();
  await name.fill(`${await name.inputValue()} `);
  await page.getByRole('button', { name: 'Guardar cambios' }).click();
  const provider = page.locator('#nexo-toast-provider');
  const before = await provider.evaluate((node) => node.getBoundingClientRect().y);
  await page.locator('.product-topbar').evaluate((header: HTMLElement) => {
    header.style.minHeight = `${String(header.getBoundingClientRect().height + 24)}px`;
  });
  await expect
    .poll(async () => provider.evaluate((node) => node.getBoundingClientRect().y))
    .toBeGreaterThanOrEqual(before + 23);
});
