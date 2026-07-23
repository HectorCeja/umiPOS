import { expect, test } from '@playwright/test';
import { readFile } from 'node:fs/promises';

test('shared controls cover hover, press, disabled, loading, success and error', async () => {
  const [css, source] = await Promise.all([
    readFile('packages/ui/src/styles.css', 'utf8'),
    readFile('packages/ui/src/primitives.tsx', 'utf8'),
  ]);
  for (const state of [':hover', ':active', ':disabled', ':focus-visible'])
    expect(css).toContain(state);
  expect(source).toContain('aria-busy');
  expect(css).toContain('.nexo-save-status--success');
  expect(css).toContain('.nexo-save-status--error');
});
