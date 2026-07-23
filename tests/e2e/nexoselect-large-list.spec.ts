import { expect, test } from '@playwright/test';
import { readFile } from 'node:fs/promises';

test('listas grandes limitan el DOM y mantienen scroll interno', async () => {
  const [source, css] = await Promise.all([
    readFile('packages/ui/src/nexo-select.tsx', 'utf8'),
    readFile('packages/ui/src/styles.css', 'utf8'),
  ]);
  expect(source).toContain('filtered.length > 120');
  expect(source).toContain('const windowSize = 80');
  expect(css).toContain('overscroll-behavior: contain');
});
