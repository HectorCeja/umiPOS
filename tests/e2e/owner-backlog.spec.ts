import { expect, test } from '@playwright/test';
import { readFile } from 'node:fs/promises';
test('backlog conserva todos los P0 sin OWNER_CONFIRMED', async () => {
  const source = await readFile('docs/OWNER_BACKLOG.md', 'utf8');
  for (let i = 1; i <= 12; i++) expect(source).toContain(`OFA-2A-${String(i).padStart(3, '0')}`);
  expect(source).not.toContain('| OWNER_CONFIRMED |');
});
