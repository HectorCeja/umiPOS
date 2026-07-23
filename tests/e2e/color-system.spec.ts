import { expect, test } from '@playwright/test';
import { readFile } from 'node:fs/promises';

test('semantic colors cover action, status, neutral, overlay and glass roles', async () => {
  const css = await readFile('packages/ui/src/styles.css', 'utf8');
  for (const token of [
    '--nexo-action',
    '--nexo-success',
    '--nexo-warning',
    '--nexo-danger',
    '--nexo-info',
    '--nexo-bg-subtle',
    '--nexo-bg-overlay',
    '--nexo-bg-scrim',
    '--nexo-blur-surface',
  ])
    expect(css).toContain(token);
  expect(css).not.toMatch(/\.nexo-button--(?:help|info)[^{]*\{[^}]*var\(--nexo-success\)/s);
});
