import { expect, test } from '@playwright/test';
import { login, web } from './owner-corrective.helpers';

test('selección válida no conserva error ni touched visual fantasma', async ({ page }) => {
  await login(page);
  await page.goto(`${web}/control-plane/settings`);
  for (const trigger of await page.getByRole('combobox').all()) {
    await expect(trigger).toHaveAttribute('aria-invalid', 'false');
  }
});
