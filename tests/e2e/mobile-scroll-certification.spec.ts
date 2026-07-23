import { expect, test } from '@playwright/test';
import { login, web } from './owner-corrective.helpers';
for (const viewport of [
  { width: 320, height: 568 },
  { width: 360, height: 640 },
  { width: 375, height: 667 },
  { width: 390, height: 844 },
  { width: 412, height: 915 },
])
  test(`scroll llega al final ${viewport.width}x${viewport.height}`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await login(page);
    await page.goto(`${web}/products`);
    const scroller = page.locator('.unified-content');
    await scroller.evaluate((node) => node.scrollTo(0, node.scrollHeight));
    const reached = await scroller.evaluate(
      (node) => Math.ceil(node.scrollTop + node.clientHeight) >= node.scrollHeight - 2,
    );
    expect(reached).toBe(true);
  });
