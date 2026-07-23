import { expect, test } from '@playwright/test';
import { openInventorySelect } from './nexoselect.helpers';

test('Producto usa opción rich con visual, metadata, estado y check', async ({ page }) => {
  const { listbox } = await openInventorySelect(page);
  const option = listbox.getByRole('option').first();
  await expect(option.locator('.nexo-select-option__visual')).toBeVisible();
  await expect(option.locator('.nexo-select-option__copy strong')).not.toBeEmpty();
  await expect(option.locator('.nexo-select-option__copy small')).not.toBeEmpty();
  await expect(option.locator('.nexo-select-option__badge')).toBeVisible();
});
