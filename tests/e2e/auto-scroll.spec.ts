import { expect, test } from '@playwright/test';
import { completeOnboarding, login, web } from './owner-corrective.helpers';

test('Cash feedback is visible without becoming an automatic scroll destination', async ({
  page,
}) => {
  await login(page);
  await completeOnboarding(page);
  await page.goto(`${web}/cash`);
  const target = page.locator('#cash-feedback');
  await expect(target).toBeAttached();
  await expect(target).not.toHaveAttribute('tabindex');
});
