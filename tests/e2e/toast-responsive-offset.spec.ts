import { expect, test } from '@playwright/test';
import { login, web } from './owner-corrective.helpers';

for (const viewport of [
  { width: 1440, height: 900 },
  { width: 1024, height: 768 },
  { width: 768, height: 1024 },
  { width: 390, height: 844 },
  { width: 320, height: 568 },
]) {
  test(`offset dinámico no intersecta Header en ${viewport.width}x${viewport.height}`, async ({
    page,
  }) => {
    await page.setViewportSize(viewport);
    await login(page);
    await page.goto(`${web}/products`);
    await page.locator('.product-catalog-card').first().click();
    await page.getByRole('button', { name: 'Editar producto' }).click();
    const name = page.getByLabel('Nombre').last();
    await name.fill(`${await name.inputValue()} `);
    await page.getByRole('button', { name: 'Guardar cambios' }).click();
    const toastLocator = page.locator('#nexo-toast-provider .nexo-premium-toast');
    await expect(toastLocator).toBeVisible();
    const rect = (locator: typeof toastLocator) =>
      locator.evaluate((node) => {
        const box = node.getBoundingClientRect();
        return { x: box.x, y: box.y, width: box.width, height: box.height };
      });
    const header = await rect(page.locator('[data-nexo-toast-safe-area]'));
    await expect
      .poll(async () => (await rect(toastLocator)).y, {
        message: 'toast reaches its settled safe-area position',
      })
      .toBeGreaterThan(header.y + header.height);
    const toast = await rect(toastLocator);
    expect(toast.y).toBeGreaterThan(header.y + header.height);
    expect(toast.x + toast.width).toBeLessThanOrEqual(viewport.width);
    expect(toast.y + toast.height).toBeLessThanOrEqual(viewport.height);
  });
}
