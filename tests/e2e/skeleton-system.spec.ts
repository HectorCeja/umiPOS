import { expect, test } from '@playwright/test';
import { readFile } from 'node:fs/promises';

test('official skeleton presets cover every visible product family', async () => {
  const [source, css] = await Promise.all([
    readFile('packages/ui/src/primitives.tsx', 'utf8'),
    readFile('packages/ui/src/styles.css', 'utf8'),
  ]);
  for (const variant of [
    'dashboard',
    'card',
    'product',
    'inventory',
    'sale',
    'cash',
    'team',
    'settings',
    'profile',
    'table',
    'search',
  ]) {
    expect(source).toContain(`'${variant}'`);
    expect(css).toContain(`nexo-skeleton--${variant}`);
  }
  expect(css).toContain('var(--nexo-duration-pulse)');
});
