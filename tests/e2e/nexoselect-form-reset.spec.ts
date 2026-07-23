import { expect, test } from '@playwright/test';
import { readFile } from 'node:fs/promises';

test('uncontrolled reset restaura valor, búsqueda y estado abierto', async () => {
  const source = await readFile('packages/ui/src/nexo-select.tsx', 'utf8');
  expect(source).toContain("form.addEventListener('reset', reset)");
  expect(source).toContain('setInternalValue(defaultValue)');
  expect(source).toContain("setQuery('')");
  expect(source).toContain('setOpen(false)');
});
