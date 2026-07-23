import { expect, test } from '@playwright/test';
import { openInventoryWithLongValues, rect } from './select-sizing.helpers';

test('opciones extensas no modifican ancho ni altura de los triggers', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 720 });
  const controls = await openInventoryWithLongValues(page);
  const boxes = await Promise.all([rect(controls.product), rect(controls.location)]);
  for (const [control, box] of [
    [controls.product, boxes[0]],
    [controls.location, boxes[1]],
  ] as const) {
    const parent = await rect(control.locator('..'));
    expect(box.width).toBeLessThanOrEqual(parent.width);
    expect(box.height).toBe(boxes[0].height);
  }
});
