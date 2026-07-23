import { expect, test } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import {
  browserAudit,
  completeOnboarding,
  expectClean,
  login,
  web,
} from './owner-corrective.helpers';

test('owner exact walkthrough stays visually and operationally clean', async ({ page }) => {
  await mkdir('artifacts/owner-final-polish-part-1a/screenshots/after', { recursive: true });
  test.setTimeout(90_000);
  await page.goto(`${web}/?mode=login`);
  await expect(page.locator('.login-screen')).toBeVisible();
  await page.screenshot({
    path: 'artifacts/owner-final-polish-part-1a/screenshots/after/login.png',
    fullPage: true,
  });
  await login(page);
  await completeOnboarding(page);
  const audit = browserAudit(page);
  for (const [route, name] of [
    ['/', 'dashboard'],
    ['/settings/profile', 'profile'],
    ['/control-plane/invitations', 'team'],
    ['/cash', 'cash'],
    ['/products', 'products'],
    ['/inventory', 'inventory'],
    ['/control-plane/settings', 'settings'],
  ] as const) {
    await page.goto(`${web}${route}`);
    await page.waitForLoadState('networkidle');
    await expect(page.locator('main, .module-surface').first()).toBeVisible();
    await page.screenshot({
      path: `artifacts/owner-final-polish-part-1a/screenshots/after/${name}.png`,
      fullPage: true,
    });
  }
  await page.goto(`${web}/products`);
  await page.waitForLoadState('networkidle');
  await expect(page.getByRole('heading', { name: 'Productos', exact: true })).toBeVisible();
  const help = page.getByRole('button', { name: /Ver guía/ });
  if ((await help.getAttribute('aria-expanded')) !== 'true') await help.click();
  await expect(page.locator('.contextual-help__panel')).toBeVisible();
  await page.screenshot({
    path: 'artifacts/owner-final-polish-part-1a/screenshots/after/contextual-help.png',
    fullPage: true,
  });
  expectClean(audit);
});
