import { expect, test } from '@playwright/test';
import { longProduct, openInventoryWithLongValues } from './select-sizing.helpers';

test('trigger largo usa ellipsis y conserva el valor completo accesible', async ({ page }) => {
  const { product } = await openInventoryWithLongValues(page);
  const value = product.locator('.nexo-select-trigger__value > span:last-child');
  const style = await value.evaluate((node) => {
    const computed = getComputedStyle(node);
    return {
      textOverflow: computed.textOverflow,
      whiteSpace: computed.whiteSpace,
      fitsParent:
        node.getBoundingClientRect().width <= node.parentElement!.getBoundingClientRect().width,
    };
  });
  expect(style).toEqual({ textOverflow: 'ellipsis', whiteSpace: 'nowrap', fitsParent: true });
  await expect(product).toHaveAttribute('title', longProduct);
  await expect(value).toHaveText(longProduct);
});
