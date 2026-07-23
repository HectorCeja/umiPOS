import { expect, test } from '@playwright/test';
import { browserAudit, evidence, expectClean, login, web } from './owner-corrective.helpers';

test('sales presents Spanish business UI without raw JSON', async ({ page }) => {
  await login(page);
  const audit = browserAudit(page);
  await page.goto(`${web}/sales`);
  await expect(page.getByRole('heading', { name: 'Ventas' })).toBeVisible();
  await expect(page.locator('pre')).toHaveCount(0);
  await expect(page.getByText('SaleCompleted')).toHaveCount(0);
  await evidence(page, 'sales-owner-experience.png');
  expectClean(audit);
});
