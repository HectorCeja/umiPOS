import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { openInventorySelect } from './nexoselect.helpers';

test('cumple patrón ARIA combobox/listbox sin violaciones', async ({ page }) => {
  const { trigger, listbox } = await openInventorySelect(page);
  await expect(trigger).toHaveAttribute('aria-controls', await listbox.getAttribute('id'));
  await expect(trigger).toHaveAttribute('aria-expanded', 'true');
  await expect(listbox.getByRole('option').first()).toHaveAttribute('aria-selected');
  expect(
    (await new AxeBuilder({ page }).include('.nexo-select-content').analyze()).violations,
  ).toEqual([]);
});
