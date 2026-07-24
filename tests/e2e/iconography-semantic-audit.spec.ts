import { expect, test } from '@playwright/test';
import {
  browserAudit,
  completeOnboarding,
  evidence,
  expectClean,
  loginIsolatedOnboarding,
  setOnboardingStep,
  web,
} from './owner-corrective.helpers';

test('navigation and business choices use recognizable semantic icons', async ({ page }) => {
  await loginIsolatedOnboarding(page);
  await setOnboardingStep(page, 2);
  const audit = browserAudit(page);
  for (const icon of ['☕', '🍽️', '🛍️', '🧰', '✂️', '✨', '📦']) {
    await expect(page.getByText(icon, { exact: true }).first()).toBeVisible();
  }
  await evidence(page, 'iconography-business-types.png');
  await completeOnboarding(page);
  await page.goto(web);
  const sidebar = page.locator('.product-sidebar');
  for (const label of ['Inicio', 'Ventas', 'Caja', 'Productos', 'Inventario', 'Equipo']) {
    const link = sidebar.getByRole('link', { name: new RegExp(label) });
    await expect(link).toBeVisible();
    await expect(link.locator('svg')).toHaveCount(1);
  }
  await evidence(page, 'iconography-sidebar.png');
  expectClean(audit);
});
