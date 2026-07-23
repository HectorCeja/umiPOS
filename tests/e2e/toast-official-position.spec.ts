import { expect, test } from '@playwright/test';
import { login, web } from './owner-corrective.helpers';

test('toast oficial permanece arriba a la derecha tras scroll profundo', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 720 });
  await login(page);
  await page.goto(`${web}/products`);
  await page.locator('.product-catalog-card').first().click();
  await page.getByRole('button', { name: 'Editar producto' }).click();
  const name = page.getByLabel('Nombre').last();
  await name.fill(`${await name.inputValue()} `);
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  const before = await page.evaluate(() => window.scrollY);
  await page.getByRole('button', { name: 'Guardar cambios' }).click();
  const provider = page.locator('#nexo-toast-provider');
  const toast = provider.locator('.nexo-premium-toast').last();
  await expect(toast).toBeVisible();
  await expect(page.locator('#nexo-toast-provider')).toHaveCount(1);
  const box = await provider.boundingBox();
  expect(box).not.toBeNull();
  expect(box!.x + box!.width).toBeGreaterThan(1260);
  const header = await page.locator('[data-nexo-toast-safe-area]').boundingBox();
  expect(box!.y).toBeGreaterThan(header!.y + header!.height);
  expect(await page.evaluate(() => window.scrollY)).toBe(before);
});

for (const width of [390, 320]) {
  test(`toast oficial respeta safe area a ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 720 });
    await login(page);
    await page.goto(`${web}/products`);
    await page.locator('.product-catalog-card').first().click();
    await page.getByRole('button', { name: 'Editar producto' }).click();
    const name = page.getByLabel('Nombre').last();
    await name.fill(`${await name.inputValue()} `);
    await page.getByRole('button', { name: 'Guardar cambios' }).click();
    const box = await page.locator('#nexo-toast-provider').boundingBox();
    expect(box).not.toBeNull();
    expect(box!.x).toBeGreaterThanOrEqual(10);
    expect(box!.x + box!.width).toBeLessThanOrEqual(width - 10);
    const header = await page.locator('[data-nexo-toast-safe-area]').boundingBox();
    expect(box!.y).toBeGreaterThan(header!.y + header!.height);
  });
}
