import { expect, test } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { browserAudit, completeOnboarding, login, web } from './owner-corrective.helpers.js';

const root = path.resolve('artifacts/premium-ux-part-3a');

test('capture the motion, depth and overlay experience', async ({ browser }) => {
  test.setTimeout(90_000);
  await mkdir(path.join(root, 'after'), { recursive: true });
  await mkdir(path.join(root, 'videos'), { recursive: true });
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
  await page.goto(web);
  await page.waitForLoadState('networkidle');
  await page.screenshot({
    path: path.join(root, 'after', 'dashboard-motion.png'),
    fullPage: true,
    animations: 'disabled',
  });
  const quickAction = page.locator('.premium-card').first();
  await quickAction.hover();
  await page.waitForTimeout(500);
  await page.getByRole('button', { name: 'Abrir búsqueda global' }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.screenshot({ path: path.join(root, 'after', 'dialog-motion.png'), fullPage: true });
  await page.keyboard.press('Escape');
  await page.goto(`${web}/products`);
  await page.waitForLoadState('networkidle');
  await page.getByRole('button', { name: /Ver guía/ }).click();
  await expect(page.locator('.contextual-help__panel')).toBeVisible();
  await page.screenshot({
    path: path.join(root, 'after', 'products-help-motion.png'),
    fullPage: true,
  });
  expect(audit.consoleMessages).toEqual([]);
  expect(audit.failedRequests).toEqual([]);
  expect(audit.httpFailures).toEqual([]);
  const video = page.video();
  await page.close();
  if (video) await video.saveAs(path.join(root, 'videos', 'motion-walkthrough.webm'));
  await context.close();
});
