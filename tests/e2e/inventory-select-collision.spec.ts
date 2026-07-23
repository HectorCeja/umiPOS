import { expect, test } from '@playwright/test';
import { openInventoryWithLongValues, rect } from './select-sizing.helpers';

test('Producto, Ubicación y Consultar existencias conservan separación positiva', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 720 });
  const { product, location, button } = await openInventoryWithLongValues(page);
  const [a, b, action] = await Promise.all([rect(product), rect(location), rect(button)]);
  expect(b.x - a.right).toBeGreaterThan(0);
  expect(action.x - b.right).toBeGreaterThan(0);
  expect(action.right).toBeLessThanOrEqual(1280);
});
