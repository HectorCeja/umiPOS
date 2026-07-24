import { expect, test } from '@playwright/test';
import { loginIsolatedOnboarding, setOnboardingStep } from './owner-corrective.helpers';
test('logout está disponible y espera 204 en cualquier paso', async ({ page }) => {
  await loginIsolatedOnboarding(page);
  await setOnboardingStep(page, 7);
  const response = page.waitForResponse((r) => r.url().endsWith('/v1/auth/logout'));
  await page.getByRole('button', { name: 'Cerrar sesión' }).click();
  expect((await response).status()).toBe(204);
  await expect(page).toHaveURL(/\/login$/);
});
