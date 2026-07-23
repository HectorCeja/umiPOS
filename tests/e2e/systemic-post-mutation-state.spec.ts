import { expect, test } from '@playwright/test';
import { readFile } from 'node:fs/promises';

test('mutaciones compartidas separan éxito global de validación inline', async () => {
  const [experience, products, control, profile] = await Promise.all([
    readFile('packages/ui/src/experience.tsx', 'utf8'),
    readFile('apps/web/src/app/products/page.tsx', 'utf8'),
    readFile('apps/web/src/app/control-plane-shell.tsx', 'utf8'),
    readFile('apps/web/src/app/settings/profile/page.tsx', 'utf8'),
  ]);
  expect(experience).toContain('<PremiumToastPortal');
  expect(products).toContain('createForm.current?.reset()');
  expect(control).toContain('<SaveStatus');
  expect(profile).toContain('<SaveStatus');
});
