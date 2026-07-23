import { expect, test } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { browserAudit, completeOnboarding, login, web } from './owner-corrective.helpers.js';

const root = path.resolve('artifacts/premium-ux-part-4b');

test('record the final unedited launch walkthrough', async ({ browser }) => {
  test.setTimeout(180_000);
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
  await page.screenshot({ path: path.join(root, 'screenshots', '01-login.png'), fullPage: true });
  await login(page);
  if (
    await page
      .locator('.guided-onboarding')
      .isVisible()
      .catch(() => false)
  )
    await completeOnboarding(page);

  const routes = [
    ['02-onboarding.png', '/control-plane/onboarding'],
    ['03-dashboard.png', '/'],
    ['04-products.png', '/products'],
    ['05-inventory.png', '/inventory'],
    ['06-sales.png', '/sales'],
    ['07-cash.png', '/cash'],
    ['08-team.png', '/control-plane/invitations'],
    ['09-settings.png', '/control-plane/settings'],
    ['10-profile.png', '/settings/profile'],
    ['11-help.png', '/help'],
    ['12-reports.png', '/reports'],
  ] as const;
  for (const [name, route] of routes) {
    await page.goto(`${web}${route}`);
    await page.waitForLoadState('networkidle');
    await expect(page.getByRole('heading', { level: 1 }).first()).toBeVisible();
    await page.waitForTimeout(750);
    await page.screenshot({ path: path.join(root, 'screenshots', name), fullPage: true });
    await page.waitForTimeout(350);
  }

  await page.goto(`${web}/products`);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({
    path: path.join(root, 'screenshots', '13-products-mobile.png'),
    fullPage: true,
  });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'dark'));
  await page.screenshot({
    path: path.join(root, 'screenshots', '14-products-dark.png'),
    fullPage: true,
  });
  await page.getByRole('button', { name: /Ver guía/ }).click();
  await expect(page.locator('.contextual-help__panel')).toBeVisible();
  await page.screenshot({
    path: path.join(root, 'screenshots', '15-help-overlay.png'),
    fullPage: true,
  });

  expect(audit.consoleMessages).toEqual([]);
  expect(audit.failedRequests).toEqual([]);
  expect(audit.httpFailures).toEqual([]);
  const video = page.video();
  await page.close();
  if (video) await video.saveAs(path.join(root, 'videos', 'nexo-final-launch-walkthrough.webm'));
  await context.close();
});
