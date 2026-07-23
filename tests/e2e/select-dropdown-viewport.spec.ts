import { expect, test } from '@playwright/test';
import { openInventoryWithLongValues, rect } from './select-sizing.helpers';

test('trigger y opciones permanecen dentro del viewport móvil', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 568 });
  const { product, location } = await openInventoryWithLongValues(page);
  for (const control of [product, location]) {
    await control.scrollIntoViewIfNeeded();
    const box = await rect(control);
    expect(box.x).toBeGreaterThanOrEqual(0);
    expect(box.right).toBeLessThanOrEqual(320);
  }
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(320);
});

test('zoom 150% conserva el trigger dentro de su columna', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 720 });
  const { product, location } = await openInventoryWithLongValues(page);
  await page.evaluate(() => {
    document.documentElement.style.zoom = '1.5';
  });
  for (const control of [product, location]) {
    const [box, parent] = await Promise.all([rect(control), rect(control.locator('..'))]);
    expect(box.width).toBeLessThanOrEqual(parent.width);
    expect(box.right).toBeLessThanOrEqual(1280);
  }
});
