import { expect, test } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import {
  browserAudit,
  completeOnboarding,
  expectClean,
  login,
  web,
} from './owner-corrective.helpers';

test.use({ video: 'on' });

test('walkthrough de negocio real conserva consistencia visual y red limpia', async ({ page }) => {
  test.setTimeout(120_000);
  await mkdir('artifacts/owner-final-polish-part-1b/screenshots/after', { recursive: true });
  await login(page);
  await completeOnboarding(page);
  const audit = browserAudit(page);
  for (const [route, name] of [
    ['/', 'dashboard'],
    ['/products', 'products'],
    ['/inventory', 'inventory'],
    ['/sales', 'sales'],
    ['/cash', 'cash'],
    ['/control-plane/invitations', 'team'],
    ['/reports', 'reports'],
    ['/control-plane/settings', 'settings'],
  ] as const) {
    await page.goto(`${web}${route}`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2_000);
    await page.waitForLoadState('networkidle');
    await expect(page.locator('main, .module-surface').first()).toBeVisible();
    await page.screenshot({
      path: `artifacts/owner-final-polish-part-1b/screenshots/after/${name}.png`,
      fullPage: true,
      animations: 'disabled',
    });
  }
  expectClean(audit);
});
