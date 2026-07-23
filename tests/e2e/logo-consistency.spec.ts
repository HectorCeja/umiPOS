import { expect, test } from '@playwright/test';
import { completeOnboarding, login, web } from './owner-corrective.helpers';

test('login and authenticated shell render the same authoritative brand signature', async ({
  page,
}) => {
  await page.goto(`${web}/login?scene=static`);
  const loginBrand = page.locator('[data-nexo-brand="authoritative"]:visible').first();
  await expect(loginBrand).toBeVisible();
  await login(page);
  await completeOnboarding(page);
  await page.goto(`${web}/?scene=static`);
  const shellBrand = page.locator('[data-nexo-brand="authoritative"]:visible').first();
  await expect(shellBrand).toBeVisible();
  await expect(shellBrand).toHaveAttribute('aria-label', 'NEXO');
});
