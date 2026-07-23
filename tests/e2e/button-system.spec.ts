import { expect, test } from '@playwright/test';
import { readFile } from 'node:fs/promises';

test('button variants are explicit, semantic and share interaction states', async () => {
  const [tsx, css] = await Promise.all([
    readFile('packages/ui/src/primitives.tsx', 'utf8'),
    readFile('packages/ui/src/styles.css', 'utf8'),
  ]);
  for (const variant of ['primary', 'secondary', 'tertiary', 'ghost', 'danger', 'success']) {
    expect(tsx).toContain(`'${variant}'`);
    expect(css).toContain(`.nexo-button--${variant}`);
  }
  expect(css).toContain('.nexo-button:disabled');
  expect(css).toContain(':focus-visible');
  expect(css).toContain(':active');
});
