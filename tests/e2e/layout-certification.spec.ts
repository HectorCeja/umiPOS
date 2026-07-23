import { expect, test } from '@playwright/test';
import { enterAuthenticatedApp, visibleRoutes, certifyRoute } from './premium-ux-part1b.helpers.js';

test('all principal layouts keep rhythm and no horizontal overflow', async ({ page }) => {
  await enterAuthenticatedApp(page);
  for (const route of visibleRoutes) {
    await certifyRoute(page, route);
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow, route).toBeLessThanOrEqual(1);
  }
});
