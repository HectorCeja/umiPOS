import { expect, test } from '@playwright/test';
import { openInventorySelect } from './nexoselect.helpers';

test('portal permanece dentro del viewport y no altera layout', async ({ page }) => {
  await page.setViewportSize({ width: 1024, height: 768 });
  const before = await page.evaluate(() => document.documentElement.scrollWidth);
  const { listbox } = await openInventorySelect(page);
  const content = listbox.locator('..');
  const box = await content.boundingBox();
  expect(box!.x).toBeGreaterThanOrEqual(0);
  expect(box!.y).toBeGreaterThanOrEqual(0);
  expect(box!.x + box!.width).toBeLessThanOrEqual(1024);
  expect(box!.y + box!.height).toBeLessThanOrEqual(768);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(before);
});
