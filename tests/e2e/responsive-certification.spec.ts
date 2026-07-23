import { expect, test } from '@playwright/test';
import { enterAuthenticatedApp } from './premium-ux-part1b.helpers.js';

for (const size of [
  { name: 'small-mobile', width: 360, height: 740 },
  { name: 'large-mobile', width: 430, height: 860 },
  { name: 'tablet-portrait', width: 768, height: 1024 },
  { name: 'tablet-landscape', width: 1024, height: 768 },
  { name: 'laptop-devtools', width: 980, height: 720 },
  { name: 'desktop', width: 1440, height: 900 },
]) {
  test(`${size.name} has no clipping or horizontal overflow`, async ({ page }) => {
    await page.setViewportSize(size);
    await enterAuthenticatedApp(page);
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow).toBeLessThanOrEqual(1);
    await expect(page.locator('#main-content')).toBeVisible();
  });
}
