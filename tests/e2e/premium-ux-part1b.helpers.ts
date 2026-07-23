import { expect, type Page } from '@playwright/test';
import { completeOnboarding, login, browserAudit, web } from './owner-corrective.helpers.js';

export async function enterAuthenticatedApp(page: Page) {
  await login(page);
  if (
    await page
      .locator('.guided-onboarding')
      .isVisible()
      .catch(() => false)
  ) {
    await completeOnboarding(page);
  }
  await expect(page.locator('[data-nexo-app-shell="canonical"]')).toBeVisible();
}

export async function certifyRoute(page: Page, route: string) {
  const audit = browserAudit(page);
  await page.goto(`${web}${route}`);
  await page.waitForLoadState('networkidle');
  await expect(page.locator('body')).not.toHaveCSS('overflow-x', 'scroll');
  expect({ route, ...audit }).toEqual({
    route,
    consoleMessages: [],
    failedRequests: [],
    httpFailures: [],
  });
}

export const visibleRoutes = [
  '/',
  '/sales',
  '/cash',
  '/products',
  '/inventory',
  '/reports',
  '/control-plane/invitations',
  '/control-plane/settings',
  '/help',
] as const;
