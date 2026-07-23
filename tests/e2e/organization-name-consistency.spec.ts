import { expect, test } from '@playwright/test';
import { browserAudit, evidence, expectClean, login, web } from './owner-corrective.helpers';

test('organization name returned by PostgreSQL is used by header and settings', async ({
  page,
}) => {
  await login(page);
  const audit = browserAudit(page);
  await page.goto(`${web}/control-plane/settings`);
  const input = page.getByLabel('Nombre comercial');
  const previous = await input.inputValue();
  const expected = `Ramen QA Owner ${Date.now().toString().slice(-5)}`;
  await input.fill(expected);
  await page.getByRole('button', { name: 'Guardar cambios' }).click();
  await expect(page.getByText('Configuración guardada.')).toBeVisible();
  await page.reload();
  await expect(page.getByLabel(`Organización activa: ${expected}`)).toBeVisible();
  await evidence(page, 'organization-name-header.png');
  await input.fill(previous);
  await page.getByRole('button', { name: 'Guardar cambios' }).click();
  await expect(page.getByText('Configuración guardada.')).toBeVisible();
  expectClean(audit);
});
