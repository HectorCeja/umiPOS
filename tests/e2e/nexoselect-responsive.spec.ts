import { expect, test } from '@playwright/test';
import { openInventorySelect } from './nexoselect.helpers';

for (const viewport of [
  { width: 1440, height: 900 },
  { width: 900, height: 768 },
  { width: 390, height: 844 },
  { width: 320, height: 568 },
]) {
  test(`dropdown accesible en ${viewport.width}x${viewport.height}`, async ({ page }) => {
    await page.setViewportSize(viewport);
    const { listbox } = await openInventorySelect(page);
    const box = await listbox.locator('..').boundingBox();
    expect(box!.x).toBeGreaterThanOrEqual(0);
    expect(box!.x + box!.width).toBeLessThanOrEqual(viewport.width);
    expect(box!.y + box!.height).toBeLessThanOrEqual(viewport.height);
  });
}
