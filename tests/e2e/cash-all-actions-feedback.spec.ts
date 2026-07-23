import { expect, test } from '@playwright/test';
import { readFile } from 'node:fs/promises';
test('todas las mutaciones de Caja pasan por command y PremiumToast', async () => {
  const source = await readFile('apps/web/src/app/cash/cash-console.tsx', 'utf8');
  expect(source).toContain('<PremiumToast');
  expect(source).not.toContain('id="cash-feedback"');
  expect(source).toContain('setLoading(true)');
  expect(source).toContain('await refresh()');
  expect(source).toContain('setNotice(');
  expect(source).toContain('setError(');
});
