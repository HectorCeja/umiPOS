import { expect, test } from '@playwright/test';
import { openInventorySelect } from './nexoselect.helpers';

test('abre por portal y cierra con Escape', async ({ page }) => {
  const { trigger, listbox } = await openInventorySelect(page);
  await expect(trigger).toHaveAttribute('aria-expanded', 'true');
  await page.keyboard.press('Escape');
  await expect(listbox).toBeHidden();
  await expect(trigger).toBeFocused();
});
