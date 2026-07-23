import { expect, test } from '@playwright/test';
import { completeOnboarding, login, web } from './owner-corrective.helpers';

test('product type selector uses the official semantic SVG family', async ({ page }) => {
  await login(page);
  await completeOnboarding(page);
  await page.goto(`${web}/products`);
  await page.getByRole('link', { name: 'Crear producto' }).click();
  const picker = page.locator('.product-icon-picker');
  await expect(picker.locator('svg')).toHaveCount(4);
  await expect(picker).not.toContainText(/[☕🍽️📦🧰]/u);
});
