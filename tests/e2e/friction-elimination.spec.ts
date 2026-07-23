import { expect, test } from '@playwright/test';
import { readFile } from 'node:fs/promises';

test('final layer removes tactile, viewport and scroll friction', async () => {
  const styles = await readFile('apps/web/src/app/styles.css', 'utf8');
  for (const contract of [
    '-webkit-tap-highlight-color: transparent',
    'scroll-padding-top',
    'overscroll-behavior-inline: contain',
    'env(safe-area-inset-bottom)',
    'min-height: var(--nexo-touch-target)',
  ])
    expect(styles).toContain(contract);
});
