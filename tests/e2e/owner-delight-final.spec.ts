import { expect, test } from '@playwright/test';
import { readFile } from 'node:fs/promises';

test('owner delight answers remain subject to explicit owner approval', async () => {
  const report = await readFile('artifacts/premium-ux-part-4b/OWNER_DELIGHT_FINAL.md', 'utf8');
  expect(report).toContain('¿Héctor disfrutaría');
  expect(report).toContain('¿Lo enseñaría con orgullo');
  expect(report).toContain('¿Lo presentaría en una conferencia');
  expect(report).toContain('no sustituye owner validation');
});
