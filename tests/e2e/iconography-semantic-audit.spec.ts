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

test('navigation and business choices use recognizable semantic icons', async ({ page }) => {
  await login(page);
  await setOnboardingStep(page, 2);
  const audit = browserAudit(page);
  for (const icon of ['☕', '🍽️', '🛍️', '🧰', '✂️', '✨', '📦']) {
    await expect(page.getByText(icon, { exact: true }).first()).toBeVisible();
  }
  await evidence(page, 'iconography-business-types.png');
  await completeOnboarding(page);
  await page.goto(web);
  const sidebar = page.locator('.product-sidebar');
  for (const [label, icon] of [
    ['Inicio', '🏠'],
    ['Ventas', '🧾'],
    ['Caja', '💵'],
    ['Productos', '📦'],
    ['Inventario', '🗃'],
    ['Equipo', '👤'],
  ] as const) {
    await expect(sidebar.getByRole('link', { name: new RegExp(label) })).toContainText(icon);
  }
  await evidence(page, 'iconography-sidebar.png');
  expectClean(audit);
});
