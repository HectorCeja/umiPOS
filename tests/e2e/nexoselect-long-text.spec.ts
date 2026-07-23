import { expect, test } from '@playwright/test';
import { longProduct, openInventoryWithLongValues } from './select-sizing.helpers';

test('texto largo conserva una línea, ellipsis y title completo', async ({ page }) => {
  const { product } = await openInventoryWithLongValues(page);
  const value = product.locator('.nexo-select-trigger__value > span:last-child');
  expect(await value.evaluate((node) => getComputedStyle(node).textOverflow)).toBe('ellipsis');
  await expect(product).toHaveAttribute('title', longProduct);
});
