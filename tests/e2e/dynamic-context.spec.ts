import { expect, test } from '@playwright/test';
import {
  completeCleanOnboarding,
  createCleanBusiness,
  loginClean,
  web,
} from './dynamic-context.helpers';

test('todas las rutas operativas consumen el tenant activo sin UUID seed', async ({ page }) => {
  test.setTimeout(120_000);
  const business = createCleanBusiness();
  const requests: string[] = [];
  page.on('request', (request) => {
    if (request.url().includes('/v1/organizations/')) requests.push(request.url());
  });
  await loginClean(page, business.email);
  await completeCleanOnboarding(page, business.organizationId);
  for (const route of [
    '/products',
    '/inventory',
    '/cash',
    '/sales',
    '/reports',
    '/control-plane/settings',
  ]) {
    await page.goto(`${web}${route}`);
    await page.waitForLoadState('networkidle');
    await expect(page.locator('main, .module-surface').first()).toBeVisible();
  }
  expect(requests.some((url) => url.includes(business.organizationId))).toBe(true);
  expect(requests.some((url) => url.includes('10000000-0000-4000-8000-000000000001'))).toBe(false);
});
