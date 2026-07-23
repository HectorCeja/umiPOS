import { expect, test } from '@playwright/test';
import {
  browserAudit,
  completeOnboarding,
  evidence,
  expectClean,
  login,
  setOnboardingStep,
  web,
} from './owner-corrective.helpers';

test('one authoritative wordmark is used by login, onboarding and dashboard', async ({ page }) => {
  await page.goto(web);
  await expect(page.getByRole('img', { name: 'NEXO' }).first()).toBeVisible();
  await evidence(page, 'logo-login.png');
  await login(page);
  await completeOnboarding(page);
  await page.waitForLoadState('networkidle');
  const audit = browserAudit(page);
  const sidebar = page.locator('.product-sidebar');
  const logo = sidebar.getByRole('img', { name: 'NEXO' });
  await expect(logo).toBeVisible();
  const sidebarBox = await sidebar.boundingBox();
  const logoBox = await logo.boundingBox();
  const sidebarCenter = (sidebarBox?.x ?? 0) + (sidebarBox?.width ?? 0) / 2;
  const logoCenter = (logoBox?.x ?? 0) + (logoBox?.width ?? 0) / 2;
  expect(Math.abs(sidebarCenter - logoCenter)).toBeLessThan(12);
  await evidence(page, 'logo-dashboard-sidebar.png');
  // Capture onboarding last so its autosave lifecycle cannot race a second
  // restart performed by completeOnboarding.
  await setOnboardingStep(page, 1);
  await expect(page.getByRole('img', { name: 'NEXO' }).first()).toBeVisible();
  await evidence(page, 'logo-onboarding.png');
  expectClean(audit);
});
