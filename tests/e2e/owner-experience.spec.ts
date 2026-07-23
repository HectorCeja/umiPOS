import { expect, test } from '@playwright/test';
import { browserAudit, web } from './owner-corrective.helpers.js';
import { enterAuthenticatedApp, visibleRoutes } from './premium-ux-part1b.helpers.js';

test('owner walkthrough remains understandable and error-free', async ({ page }) => {
  test.setTimeout(120_000);
  const audit = browserAudit(page);
  await enterAuthenticatedApp(page);
  for (const route of visibleRoutes) {
    await page.goto(`${web}${route}`);
    await page.waitForLoadState('networkidle');
    await expect(page.locator('h1').first()).toBeVisible();
    await expect(page.locator('body')).not.toHaveCSS('overflow-x', 'scroll');
  }
  expect(audit.consoleMessages).toEqual([]);
  expect(audit.failedRequests).toEqual([]);
  expect(audit.httpFailures).toEqual([]);
});
