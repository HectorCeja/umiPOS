import { expect, test } from '@playwright/test';
import { loginIsolatedOnboarding, setOnboardingStep } from './owner-corrective.helpers';
test('onboarding usa el registro SVG oficial sin Unicode legacy', async ({ page }) => {
  await loginIsolatedOnboarding(page);
  await setOnboardingStep(page, 7);
  const picker = page.locator('.icon-choice-grid');
  await expect(picker.locator('button')).toHaveCount(4);
  await expect(picker.locator('button svg[data-product-icon]')).toHaveCount(4);
  await expect(picker).not.toContainText(/[✦◆❖◉♨☕]/u);
});
