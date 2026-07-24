import { expect, test } from '@playwright/test';
import { browserAudit, evidence, expectClean, web } from './owner-corrective.helpers';
import {
  completeCleanOnboarding,
  createCleanBusiness,
  loginClean,
} from './dynamic-context.helpers';

test('organization name returned by PostgreSQL is used by header and settings', async ({
  page,
}) => {
  const fixture = createCleanBusiness();
  await loginClean(page, fixture.email);
  await completeCleanOnboarding(page, fixture.organizationId);
  const audit = browserAudit(page);
  await page.goto(`${web}/control-plane/settings`);
  const input = page.getByLabel('Nombre comercial');
  const previous = await input.inputValue();
  const expected = `Ramen QA Owner ${Date.now().toString().slice(-5)}`;
  await input.fill(expected);
  await page.getByRole('button', { name: 'Guardar cambios' }).click();
  await expect(page.getByText(/Configuración actualizada\./)).toBeVisible();
  await page.reload();
  await expect(page.getByLabel(`Organización activa: ${expected}`)).toBeVisible();
  await evidence(
    page,
    'organization-name-header.png',
    'artifacts/organization-name-consistency/screenshots',
  );
  await input.fill(previous);
  await page.getByRole('button', { name: 'Guardar cambios' }).click();
  await expect(page.getByText(/Configuración actualizada\./)).toBeVisible();
  expectClean(audit);
});
