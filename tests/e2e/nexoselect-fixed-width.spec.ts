import { expect, test } from '@playwright/test';
import { openInventoryWithLongValues, rect } from './select-sizing.helpers';

test('opciones largas no cambian ancho ni invaden controles', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 720 });
  const { product, location, button } = await openInventoryWithLongValues(page);
  const [a, b, c] = await Promise.all([rect(product), rect(location), rect(button)]);
  expect(b.x - a.right).toBeGreaterThan(0);
  expect(c.x - b.right).toBeGreaterThan(0);
});
