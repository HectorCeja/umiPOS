import { expect, test } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import { openInventorySelect } from './nexoselect.helpers';

test('empty state enseña y loading/error/retry pertenecen al componente', async ({ page }) => {
  const { listbox } = await openInventorySelect(page);
  await page.getByRole('searchbox').fill('resultado-imposible-nexo-999');
  await expect(listbox).toContainText('No encontramos productos con ese nombre.');
  await expect(listbox.getByRole('link', { name: 'Abrir Productos' })).toBeVisible();
  const source = await readFile('packages/ui/src/nexo-select.tsx', 'utf8');
  expect(source).toContain('<NexoSelectLoading />');
  expect(source).toContain('Intentar de nuevo');
  expect(source).toContain('aria-label="Cargando opciones"');
});
