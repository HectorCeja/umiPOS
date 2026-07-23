import { expect, test } from '@playwright/test';
import { readFile } from 'node:fs/promises';

test('official type roles have one family and one tokenized scale', async () => {
  const [css, docs] = await Promise.all([
    readFile('packages/ui/src/styles.css', 'utf8'),
    readFile('docs/design/04_TYPOGRAPHY.md', 'utf8'),
  ]);
  for (const role of [
    'display',
    'h1',
    'h2',
    'h3',
    'h4',
    'body',
    'caption',
    'label',
    'button',
    'helper',
    'code',
  ]) {
    expect(css).toContain(`--nexo-type-${role}`);
  }
  expect(docs).toContain('## Escala oficial');
  expect(css).toContain('--nexo-font-display:');
  expect(css).toContain('--nexo-font-sans:');
});
