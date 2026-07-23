import { expect, test } from '@playwright/test';
import { readFile } from 'node:fs/promises';

test('visible primitives share official states and tokens', async () => {
  const [source, css] = await Promise.all([
    readFile('packages/ui/src/primitives.tsx', 'utf8'),
    readFile('packages/ui/src/styles.css', 'utf8'),
  ]);
  for (const primitive of [
    'Button',
    'TextField',
    'Select',
    'Card',
    'Avatar',
    'EmptyState',
    'Tooltip',
    'Popover',
  ])
    expect(source).toContain(primitive);
  for (const state of [':hover', ':focus-visible', ':disabled']) expect(css).toContain(state);
  expect(css).toContain('var(--nexo-radius');
  expect(css).toContain('var(--nexo-space');
});
