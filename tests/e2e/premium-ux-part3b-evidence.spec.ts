import { expect, test } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { browserAudit, completeOnboarding, login, web } from './owner-corrective.helpers.js';

const root = path.resolve('artifacts/premium-ux-part-3b');

test('capture the owner delight walkthrough with clean browser telemetry', async ({ browser }) => {
  test.setTimeout(120_000);
  await mkdir(path.join(root, 'screenshots'), { recursive: true });
  await mkdir(path.join(root, 'videos'), { recursive: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    recordVideo: { dir: path.join(root, 'videos'), size: { width: 1280, height: 720 } },
  });
  const page = await context.newPage();
  const audit = browserAudit(page);

  await page.goto(`${web}/login`);
  await page.waitForLoadState('networkidle');
  await page.screenshot({
    path: path.join(root, 'screenshots', '01-login-welcome.png'),
    fullPage: true,
  });
  await login(page);
  if (
    await page
      .locator('.guided-onboarding')
      .isVisible()
      .catch(() => false)
  )
    await completeOnboarding(page);

  const routes = [
    ['02-onboarding-illusion.png', '/control-plane/onboarding'],
    ['03-dashboard-control.png', '/'],
    ['04-products-creativity.png', '/products'],
    ['05-inventory-order.png', '/inventory'],
    ['06-sales-clarity.png', '/sales'],
    ['07-cash-confidence.png', '/cash'],
    ['08-team-collaboration.png', '/control-plane/invitations'],
    ['09-settings-trust.png', '/control-plane/settings'],
    ['10-profile-identity.png', '/settings/profile'],
    ['11-reports-decision.png', '/reports'],
  ] as const;
  for (const [filename, route] of routes) {
    await page.goto(`${web}${route}`);
    await page.waitForLoadState('networkidle');
    await expect(page.locator('h1').first()).toBeVisible();
    await page.waitForTimeout(350);
    await page.screenshot({ path: path.join(root, 'screenshots', filename), fullPage: true });
  }

  const [logoutResponse] = await Promise.all([
    page.waitForResponse((response) => response.url().endsWith('/v1/auth/logout')),
    page.getByRole('button', { name: 'Cerrar sesión' }).click(),
  ]);
  expect(logoutResponse.status()).toBe(204);
  await expect(page.locator('[data-nexo-app-shell="canonical"]')).toBeHidden({ timeout: 15_000 });
  await expect(page.getByText('Bienvenido de nuevo', { exact: true })).toBeVisible();
  await page.screenshot({
    path: path.join(root, 'screenshots', '12-logout-complete.png'),
    fullPage: true,
  });

  expect(audit.consoleMessages).toEqual([]);
  expect(audit.failedRequests).toEqual([]);
  expect(audit.httpFailures).toEqual([]);
  const video = page.video();
  await page.close();
  if (video) await video.saveAs(path.join(root, 'videos', 'owner-delight-walkthrough.webm'));
  await context.close();
});
