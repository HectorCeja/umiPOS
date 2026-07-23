import { expect, test } from '@playwright/test';
import { browserAudit, expectClean, login, web } from './owner-corrective.helpers';
test('Caja carga sin 500 inesperado', async ({ page }) => {
  const audit = browserAudit(page);
  await login(page);
  await page.goto(`${web}/cash`);
  await expect(page.getByRole('heading', { name: 'Administración de Caja' })).toBeVisible({
    timeout: 20_000,
  });
  expect(audit.httpFailures.filter((item) => item.endsWith(' 500'))).toEqual([]);
  expectClean({
    ...audit,
    httpFailures: audit.httpFailures.filter((item) => item.endsWith(' 500')),
  });
});
