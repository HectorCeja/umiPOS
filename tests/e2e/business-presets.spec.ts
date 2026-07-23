import { expect, test } from '@playwright/test';
import {
  browserAudit,
  login,
  setOnboardingStep,
  web,
  expectClean,
} from './owner-corrective.helpers';

test('onboarding ofrece presets reales para catálogo, caja y ubicaciones', async ({ page }) => {
  await login(page);
  const audit = browserAudit(page);
  await setOnboardingStep(page, 6);
  await page.waitForLoadState('networkidle');
  await expect(
    page.locator('#onboarding-cash-point-presets option[value="Caja principal"]'),
  ).toHaveCount(1);
  await setOnboardingStep(page, 8);
  await page.waitForLoadState('networkidle');
  await expect(page.locator('#onboarding-location-presets option[value="Mostrador"]')).toHaveCount(
    1,
  );
  expectClean(audit);
});
