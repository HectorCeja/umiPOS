import { expect, test } from '@playwright/test';
import {
  browserAudit,
  completeOnboarding,
  expectClean,
  login,
  web,
} from './owner-corrective.helpers';

test('owner feedback surfaces are present without regressions', async ({ page }) => {
  test.setTimeout(90_000);
  await login(page);
  await completeOnboarding(page);
  const audit = browserAudit(page);
  for (const route of [
    '/',
    '/settings/profile',
    '/control-plane/invitations',
    '/cash',
    '/products',
    '/inventory',
    '/control-plane/settings',
  ]) {
    await page.goto(`${web}${route}`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);
    await expect(page.locator('body')).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(
      true,
    );
  }
  expectClean(audit);
});
