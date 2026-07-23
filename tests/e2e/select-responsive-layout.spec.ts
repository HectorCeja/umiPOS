import { expect, test } from '@playwright/test';
import { openInventoryWithLongValues, rect } from './select-sizing.helpers';

for (const viewport of [
  { width: 1280, height: 720 },
  { width: 900, height: 768 },
  { width: 390, height: 844 },
  { width: 320, height: 568 },
]) {
  test(`layout de selects permanece estable en ${viewport.width}px`, async ({ page }) => {
    await page.setViewportSize(viewport);
    const { product, location, button } = await openInventoryWithLongValues(page);
    const [a, b, action] = await Promise.all([rect(product), rect(location), rect(button)]);
    if (viewport.width <= 768) {
      expect(b.y).toBeGreaterThan(a.y + a.height);
      expect(action.y).toBeGreaterThan(b.y + b.height);
    } else if (viewport.width <= 1024) {
      expect(b.x - a.right).toBeGreaterThan(0);
      expect(action.y).toBeGreaterThan(b.y + b.height);
    } else {
      expect(b.x - a.right).toBeGreaterThan(0);
      expect(action.x - b.right).toBeGreaterThan(0);
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
      viewport.width,
    );
  });
}
