import { expect, test } from '@playwright/test';
import { readFile } from 'node:fs/promises';
test('Alpha2 es seed aislado y reset explícito', async () => {
  const [seed, pkg, script] = await Promise.all([
    readFile('packages/database/prisma/seed.ts', 'utf8'),
    readFile('package.json', 'utf8'),
    readFile('scripts/owner-onboarding.mjs', 'utf8'),
  ]);
  expect(seed).toContain('alpha2.owner@nexo.local');
  expect(seed).toContain("status: 'DRAFT', currentStep: 1");
  expect(pkg).toContain('owner:alpha2:reset');
  expect(script).toContain('43000000-0000-4000-8000-000000000001');
});
