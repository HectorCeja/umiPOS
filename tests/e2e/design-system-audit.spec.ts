import { expect, test } from '@playwright/test';
import { readFile } from 'node:fs/promises';

test('the executable foundation exposes every premium UX contract', async () => {
  const css = await readFile('packages/ui/src/styles.css', 'utf8');
  for (const token of [
    '--nexo-bg-canvas',
    '--nexo-text-primary',
    '--nexo-border-default',
    '--nexo-type-display-size',
    '--nexo-space-6',
    '--nexo-radius-lg',
    '--nexo-shadow-sm',
    '--nexo-duration-normal',
  ]) {
    expect(css, `${token} must remain part of the public system`).toContain(token);
  }
});
