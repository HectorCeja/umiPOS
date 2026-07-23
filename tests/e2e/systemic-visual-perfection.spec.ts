import { expect, test } from '@playwright/test';
import { browserAudit, expectClean, login, web } from './owner-corrective.helpers';

test('barrido visual transversal permanece limpio y sin controles legacy', async ({ page }) => {
  const audit = browserAudit(page);
  await login(page);
  for (const route of [
    '/products',
    '/inventory',
    '/control-plane/invitations',
    '/control-plane/branches',
    '/cash',
    '/sales',
    '/settings/profile',
    '/reports',
  ]) {
    await page.goto(`${web}${route}`);
    await page.waitForLoadState('networkidle');
    await expect(page.locator('select, datalist')).toHaveCount(0);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      ),
    ).toBeLessThanOrEqual(1);
  }
  expectClean(audit);
});
