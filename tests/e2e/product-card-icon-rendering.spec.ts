import { expect, test } from '@playwright/test';
import { login, web } from './owner-corrective.helpers';
import { resolveProductIcon } from '../../apps/web/src/app/product-icon-registry';
test('cards nunca exponen identificadores internos de icono', async ({ page }) => {
  await login(page);
  await page.goto(`${web}/products`);
  const cards = page.locator('.product-catalog-card');
  for (const token of ['package', 'utensils', 'coffee', 'briefcase'])
    await expect(page.locator('body')).not.toContainText(new RegExp(`^${token}$`));
  const fallbacks = cards.locator('.quick-icon:not([hidden])');
  if (await fallbacks.count())
    await expect(fallbacks.first().locator('svg[data-product-icon]')).toBeVisible();
  expect(resolveProductIcon('legacy-unknown-icon')).toBe('package');
});
