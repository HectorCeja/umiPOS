import { expect, test } from '@playwright/test';
import {
  browserAudit,
  evidence,
  expectClean,
  loginIsolatedOnboarding,
  onePixelPng,
  setOnboardingStep,
} from './owner-corrective.helpers';

test('real onboarding keeps all catalog content mounted after upload', async ({ page }) => {
  await loginIsolatedOnboarding(page);
  const audit = browserAudit(page);
  await setOnboardingStep(page, 7);
  const before = page.locator('.onboarding-product-builder');
  await expect(before.getByRole('heading')).toBeVisible();
  await evidence(page, 'onboarding-product-before-upload.png');
  await expect(page.getByRole('button', { name: 'Atrás' })).toBeVisible();
  await before
    .locator('input[type=file]')
    .setInputFiles({ name: 'real.png', mimeType: 'image/png', buffer: onePixelPng });
  await expect(before.getByAltText('Vista previa')).toBeVisible();
  await expect(before.getByLabel('Nombre')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Atrás' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Continuar' })).toBeVisible();
  await evidence(page, 'onboarding-product-after-upload.png');
  expectClean(audit);
});
