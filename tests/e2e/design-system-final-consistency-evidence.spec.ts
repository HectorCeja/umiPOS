import { expect, test, type Page } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { login, web } from './owner-corrective.helpers';

const root = path.resolve('artifacts/design-system-final-consistency/screenshots');
test.use({ video: 'on' });

async function shot(page: Page, name: string) {
  await mkdir(root, { recursive: true });
  await page.screenshot({ path: path.join(root, name), animations: 'disabled' });
}

test('evidencia Product Card compartida con y sin fotografía', async ({ page }) => {
  await login(page);
  await page.goto(`${web}/products`);
  const name = `Producto editorial ${Date.now()}`;
  await page.getByLabel('Nombre del producto').fill(name);
  await page.locator('#new-product input[type=file]').setInputFiles('products.jpeg');
  await page.getByRole('button', { name: 'Agregar al catálogo' }).click();
  const imageCard = page.locator('.product-catalog-card').filter({ hasText: name });
  await expect(imageCard.locator('img')).toBeVisible();
  await imageCard.scrollIntoViewIfNeeded();
  await shot(page, '01-product-card-photo-dominant.png');
  const fallback = page.locator('.product-catalog-card[data-has-image=false]').first();
  await fallback.scrollIntoViewIfNeeded();
  await expect(fallback.locator('.nexo-product-card__fallback')).toBeVisible();
  await shot(page, '02-product-card-editorial-fallback.png');
});

test('evidencia toast oficial top-right en scroll profundo y móvil', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 720 });
  await login(page);
  await page.goto(`${web}/products`);
  await page.locator('.product-catalog-card').first().click();
  await page.getByRole('button', { name: 'Editar producto' }).click();
  const input = page.getByLabel('Nombre').last();
  await input.fill(`${await input.inputValue()} `);
  await page.getByRole('button', { name: 'Guardar cambios' }).click();
  await expect(page.locator('#nexo-toast-provider .nexo-premium-toast')).toBeVisible();
  await shot(page, '03-toast-official-desktop-top-right.png');
  await page.setViewportSize({ width: 390, height: 844 });
  await shot(page, '04-toast-official-mobile-safe-area.png');
});
