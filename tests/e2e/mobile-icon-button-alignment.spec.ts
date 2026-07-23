import { expect, test } from '@playwright/test';
import { readFile } from 'node:fs/promises';
test('IconButton tiene hit area y centrado geométrico común', async () => {
  const css = await readFile('packages/ui/src/styles.css', 'utf8');
  for (const rule of [
    'inline-size: var(--nexo-touch-target)',
    'align-items: center',
    'justify-content: center',
    'line-height: 0',
  ])
    expect(css).toContain(rule);
});
