import { expect, test } from '@playwright/test';
import { readFile } from 'node:fs/promises';

test('toast is glass, semantic, animated and accessible', async () => {
  const [source, css] = await Promise.all([
    readFile('packages/ui/src/primitives.tsx', 'utf8'),
    readFile('packages/ui/src/styles.css', 'utf8'),
  ]);
  expect(source).toContain('nexo-toast__icon');
  expect(source).toContain("tone === 'danger' ? 'alert' : 'status'");
  for (const feature of ['backdrop-filter', 'nexo-toast-enter', 'var(--nexo-shadow-lg)'])
    expect(css).toContain(feature);
});
