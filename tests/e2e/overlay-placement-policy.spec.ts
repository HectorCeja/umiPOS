import { expect, test } from '@playwright/test';
import { readFile } from 'node:fs/promises';

test('política central define una única zona superior derecha', async () => {
  const [ui, styles] = await Promise.all([
    readFile('packages/ui/src/primitives.tsx', 'utf8'),
    readFile('packages/ui/src/styles.css', 'utf8'),
  ]);
  expect(ui).toContain("root.id = 'nexo-toast-provider'");
  expect(ui).not.toContain('nexo-toast-region--onboarding');
  expect(styles).toContain('max(var(--nexo-toast-safe-top, 0px), env(safe-area-inset-top))');
  expect(styles).not.toContain('.nexo-toast-region--onboarding');
});
