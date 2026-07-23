import { expect, test } from '@playwright/test';
import { glob, readFile } from 'node:fs/promises';

test('Web y UI no contienen select HTML ni HTMLSelectElement', async () => {
  const offenders: string[] = [];
  for (const pattern of ['apps/web/src/**/*.{ts,tsx}', 'packages/ui/src/**/*.{ts,tsx}']) {
    for await (const file of glob(pattern)) {
      const source = await readFile(file, 'utf8');
      if (/<select\b|HTMLSelectElement|<datalist\b|\slist=["'{]/u.test(source))
        offenders.push(file);
    }
  }
  expect(offenders).toEqual([]);
});
