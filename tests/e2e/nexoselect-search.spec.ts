import { expect, test } from '@playwright/test';
import { openInventorySelect } from './nexoselect.helpers';

test('búsqueda instantánea ignora acentos y conserva selección', async ({ page }) => {
  const { trigger, listbox } = await openInventorySelect(page);
  const search = page.getByRole('searchbox', { name: /Buscar en Producto/ });
  const first = listbox.getByRole('option').first();
  const label = (await first.innerText()).split('\n')[0]!;
  await search.fill(
    label
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/gu, '')
      .slice(0, 5),
  );
  await expect(listbox.getByRole('option').first()).toContainText(label.slice(0, 3));
  await listbox.getByRole('option').first().click();
  await expect(trigger).not.toHaveAttribute('data-value', '');
});
