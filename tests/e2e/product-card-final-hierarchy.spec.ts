import { expect, test } from '@playwright/test';
import { login, onePixelPng, web } from './owner-corrective.helpers';

test('fotografía domina y tipo queda como metadato glass', async ({ page }) => {
  await login(page);
  await page.goto(`${web}/products`);
  const suffix = Date.now();
  const name = `Jerarquía premium ${suffix}`;
  await page.getByLabel('Nombre del producto').fill(name);
  await page
    .locator('#new-product input[type=file]')
    .setInputFiles({ name: 'editorial.png', mimeType: 'image/png', buffer: onePixelPng });
  await page.getByRole('button', { name: 'Agregar al catálogo' }).click();
  const card = page.locator('.product-catalog-card').filter({ hasText: name });
  await expect(card).toBeVisible();
  const media = card.locator('.nexo-product-card__media');
  const image = media.locator('img');
  const type = media.locator('.nexo-product-card__type');
  await expect(image).toBeVisible();
  await expect(type).toBeVisible();
  await expect(media.locator('.nexo-product-card__fallback')).toBeHidden();
  const [mediaBox, imageBox, typeBox] = await Promise.all([
    media.boundingBox(),
    image.boundingBox(),
    type.boundingBox(),
  ]);
  expect(Math.abs(imageBox!.width - mediaBox!.width)).toBeLessThanOrEqual(1);
  expect(Math.abs(imageBox!.height - mediaBox!.height)).toBeLessThanOrEqual(1);
  expect(typeBox!.width).toBeLessThanOrEqual(32);
  expect(typeBox!.x + typeBox!.width).toBeLessThanOrEqual(mediaBox!.x + mediaBox!.width - 10);
  await expect(card.locator(':scope > .nexo-product-card__type')).toHaveCount(0);
});

test('sin fotografía conserva placeholder editorial con icono protagonista', async ({ page }) => {
  await login(page);
  await page.goto(`${web}/products`);
  const card = page.locator('.product-catalog-card[data-has-image=false]').first();
  await expect(card).toBeVisible();
  await expect(card.locator('.nexo-product-card__fallback')).toBeVisible();
  await expect(card.locator('.nexo-product-card__type')).toHaveCount(0);
  const fallback = await card.locator('.nexo-product-card__fallback').boundingBox();
  const media = await card.locator('.nexo-product-card__media').boundingBox();
  expect(Math.abs(fallback!.x + fallback!.width / 2 - (media!.x + media!.width / 2))).toBeLessThan(
    2,
  );
  expect(
    Math.abs(fallback!.y + fallback!.height / 2 - (media!.y + media!.height / 2)),
  ).toBeLessThan(2);
});
