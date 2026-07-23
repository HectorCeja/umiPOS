import { expect, test } from '@playwright/test';
import { cp, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { browserAudit, completeOnboarding, login, web } from './owner-corrective.helpers.js';

const root = path.resolve('artifacts/premium-ux-part-4a');

test('capture benchmark polish across the complete owner surface', async ({ browser }) => {
  test.setTimeout(120_000);
  await mkdir(path.join(root, 'before'), { recursive: true });
  await mkdir(path.join(root, 'after'), { recursive: true });
  await mkdir(path.join(root, 'videos'), { recursive: true });
  await cp(
    'artifacts/premium-ux-part-3b/screenshots/03-dashboard-control.png',
    path.join(root, 'before', 'dashboard.png'),
  );
  await cp(
    'artifacts/premium-ux-part-3b/screenshots/04-products-creativity.png',
    path.join(root, 'before', 'products.png'),
  );
  await cp(
    'artifacts/premium-ux-part-3b/screenshots/06-sales-clarity.png',
    path.join(root, 'before', 'sales.png'),
  );

  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    recordVideo: { dir: path.join(root, 'videos'), size: { width: 1280, height: 720 } },
  });
  const page = await context.newPage();
  const audit = browserAudit(page);
  await login(page);
  if (
    await page
      .locator('.guided-onboarding')
      .isVisible()
      .catch(() => false)
  )
    await completeOnboarding(page);

  const routes = [
    ['dashboard.png', '/'],
    ['onboarding.png', '/control-plane/onboarding'],
    ['products.png', '/products'],
    ['inventory.png', '/inventory'],
    ['sales.png', '/sales'],
    ['cash.png', '/cash'],
    ['team.png', '/control-plane/invitations'],
    ['settings.png', '/control-plane/settings'],
    ['profile.png', '/settings/profile'],
    ['reports.png', '/reports'],
    ['help.png', '/help'],
  ] as const;
  for (const [name, route] of routes) {
    await page.goto(`${web}${route}`);
    await page.waitForLoadState('networkidle');
    await expect(page.getByRole('heading', { level: 1 }).first()).toBeVisible();
    await page.screenshot({ path: path.join(root, 'after', name), fullPage: true });
  }

  expect(audit.consoleMessages).toEqual([]);
  expect(audit.failedRequests).toEqual([]);
  expect(audit.httpFailures).toEqual([]);
  const video = page.video();
  await page.close();
  if (video) await video.saveAs(path.join(root, 'videos', 'best-in-class-walkthrough.webm'));
  await context.close();
});
