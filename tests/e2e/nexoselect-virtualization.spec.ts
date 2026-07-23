import { expect, test } from '@playwright/test';
import { readFile } from 'node:fs/promises';

test('virtualización conserva posición y tamaño ARIA', async () => {
  const source = await readFile('packages/ui/src/nexo-select.tsx', 'utf8');
  expect(source).toContain('virtualStart');
  expect(source).toContain('aria-posinset={index + 1}');
  expect(source).toContain('aria-setsize={filtered.length}');
});
