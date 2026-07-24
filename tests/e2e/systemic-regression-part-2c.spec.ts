import { expect, test } from '@playwright/test';
import { readFile } from 'node:fs/promises';
test('correcciones Part 2C viven en fuentes compartidas', async () => {
  const ui = await readFile('packages/ui/src/primitives.tsx', 'utf8');
  const css = await readFile('apps/web/src/app/owner-master-pass-2b.css', 'utf8');
  const seed = await readFile('packages/database/prisma/seed.ts', 'utf8');
  expect(ui).toContain('createPortal');
  expect(ui).toContain('PremiumToastPortal');
  expect(css).toContain('.nexo-field-wrap');
  expect(css).toContain('min-inline-size: 0');
  expect(css).toContain('.icon-choice-grid button svg');
  expect(seed).toContain('Seed is additive for established tenants');
});
