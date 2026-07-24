import { expect, test } from '@playwright/test';
import {
  browserAudit,
  loginIsolatedOnboarding,
  setOnboardingStep,
  web,
  expectClean,
} from './owner-corrective.helpers';

test('onboarding ofrece presets reales para catálogo, caja y ubicaciones', async ({ page }) => {
  await loginIsolatedOnboarding(page);
  const audit = browserAudit(page);
  await setOnboardingStep(page, 6);
  await page.waitForLoadState('networkidle');
  const cashPoint = page.getByRole('combobox', { name: 'Nombre del punto de cobro' });
  await expect(cashPoint).toContainText('Caja principal');
  await cashPoint.click();
  await expect(page.getByRole('option', { name: 'Caja principal' })).toBeVisible();
  await page.keyboard.press('Escape');
  await setOnboardingStep(page, 8);
  await page.waitForLoadState('networkidle');
  const location = page.getByRole('combobox', { name: 'Ubicación inicial' });
  await location.click();
  await expect(page.getByRole('option', { name: 'Mostrador' })).toBeVisible();
  await page.keyboard.press('Escape');
  expectClean(audit);
});
