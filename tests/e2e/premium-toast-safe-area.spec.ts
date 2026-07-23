import { expect, test } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import { login, web } from './owner-corrective.helpers';

async function saveProduct(page: import('@playwright/test').Page) {
  await page.locator('.product-catalog-card').first().click();
  await page.getByRole('button', { name: 'Editar producto' }).click();
  const name = page.getByLabel('Nombre').last();
  await name.fill(`${await name.inputValue()} `);
  await page.getByRole('button', { name: 'Guardar cambios' }).click();
  await expect(page.locator('#nexo-toast-provider .nexo-premium-toast')).toBeVisible();
}

test('safe area procede de la geometría real del Header', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 720 });
  await login(page);
  await page.goto(`${web}/products`);
  await saveProduct(page);
  const header = page.locator('[data-nexo-toast-safe-area]');
  const provider = page.locator('#nexo-toast-provider');
  const [headerBox, providerBox] = await Promise.all([
    header.boundingBox(),
    provider.boundingBox(),
  ]);
  const clearance = providerBox!.y - (headerBox!.y + headerBox!.height);
  expect(clearance).toBeGreaterThanOrEqual(8);
  expect(clearance).toBeLessThanOrEqual(32);
  expect(await provider.evaluate((node) => getComputedStyle(node).position)).toBe('fixed');
});

test('provider no contiene offsets verticales específicos por pantalla', async () => {
  const [source, styles] = await Promise.all([
    readFile('packages/ui/src/primitives.tsx', 'utf8'),
    readFile('packages/ui/src/styles.css', 'utf8'),
  ]);
  expect(source).toContain("querySelector<HTMLElement>('[data-nexo-toast-safe-area]')");
  expect(source).toContain('new ResizeObserver(update)');
  expect(styles).toContain('var(--nexo-toast-safe-top, 0px)');
  expect(styles).not.toContain('nexo-toast-region--onboarding');
});
