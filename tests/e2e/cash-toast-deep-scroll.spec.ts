import { expect, test } from '@playwright/test';
import { readFile } from 'node:fs/promises';
test('Caja consume exclusivamente el portal global', async () => {
  const source = await readFile('apps/web/src/app/cash/cash-console.tsx', 'utf8');
  expect(source).toContain('<PremiumToastPortal');
  expect(source).not.toContain('<div className="nexo-toast-region"');
});
