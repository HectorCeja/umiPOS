import { expect, test } from '@playwright/test';
import { readFile } from 'node:fs/promises';

test('shared page, card and section rhythm is tokenized', async () => {
  const css = await readFile('apps/web/src/app/styles.css', 'utf8');
  expect(css).toContain('--nexo-page-gutter: clamp(var(--nexo-space-4)');
  expect(css).toContain('--nexo-card-padding: clamp(var(--nexo-space-4)');
  expect(css).toContain('--nexo-section-gap: clamp(var(--nexo-space-5)');
  expect(css).toContain('padding: var(--nexo-card-padding)');
});
