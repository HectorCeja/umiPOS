import { expect, test } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import {
  browserAudit,
  completeOnboarding,
  expectClean,
  login,
  setOnboardingStep,
  web,
} from './owner-corrective.helpers';

const after = path.resolve('artifacts/premium-ux-part-1a/after');

test('captures the premium owner walkthrough with clean browser telemetry', async ({ page }) => {
  test.setTimeout(180_000);
  await mkdir(after, { recursive: true });
  const audit = browserAudit(page);
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(`${web}/login?scene=static`);
  await page.screenshot({ path: path.join(after, 'login.png'), fullPage: true });

  await login(page);
  await completeOnboarding(page);
  for (const [name, route] of [
    ['dashboard', '/'],
    ['sidebar', '/'],
    ['products', '/products'],
    ['inventory', '/inventory'],
    ['sales', '/sales'],
    ['cash', '/cash'],
    ['team', '/control-plane/invitations'],
    ['settings', '/control-plane/settings'],
    ['profile', '/settings/profile'],
    ['reports', '/reports'],
  ] as const) {
    await page.goto(`${web}${route}?scene=static`);
    await page.waitForLoadState('networkidle');
    await expect(page.locator('[data-nexo-app-shell="canonical"]')).toBeVisible();
    await page.screenshot({ path: path.join(after, `${name}.png`), fullPage: true });
  }

  await setOnboardingStep(page, 1);
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: path.join(after, 'onboarding.png'), fullPage: true });
  expectClean(audit);
});
