import { expect, test } from '@playwright/test';
import { login, web } from './owner-corrective.helpers';
test('cada NexoSelect usa un solo chevron SVG', async ({ page }) => {
  await login(page);
  await page.goto(`${web}/inventory`);
  for (const select of await page.getByRole('combobox').all()) {
    await expect(select.locator(':scope > svg')).toHaveCount(1);
  }
});
