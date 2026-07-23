import { expect, test } from '@playwright/test';
import { glob } from 'node:fs/promises';
import { readFile } from 'node:fs/promises';

test('todos los selects Web usan el componente visual autoritativo', async () => {
  const offenders: string[] = [];
  for await (const file of glob('apps/web/src/app/**/*.tsx')) {
    const source = await readFile(file, 'utf8');
    if (/<select\b|HTMLSelectElement/u.test(source)) offenders.push(file);
  }
  expect(offenders).toEqual([]);
});
