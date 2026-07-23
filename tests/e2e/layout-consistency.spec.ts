import { expect, test } from '@playwright/test';
import {
  browserAudit,
  completeOnboarding,
  expectClean,
  login,
  web,
} from './owner-corrective.helpers';

test('premium routes retain one shell and never overflow at owner viewports', async ({ page }) => {
  test.setTimeout(180_000);
  await login(page);
  await completeOnboarding(page);
  const audit = browserAudit(page);
  for (const viewport of [
    { width: 1440, height: 900 },
    { width: 1024, height: 768 },
    { width: 390, height: 844 },
  ]) {
    await page.setViewportSize(viewport);
    for (const route of ['/', '/products', '/inventory', '/sales', '/cash', '/reports']) {
      await page.goto(`${web}${route}?scene=static`);
      await page.waitForLoadState('networkidle');
      await expect(page.locator('[data-nexo-app-shell="canonical"]')).toBeVisible();
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1),
      ).toBe(true);
    }
  }
  expectClean(audit);
});
