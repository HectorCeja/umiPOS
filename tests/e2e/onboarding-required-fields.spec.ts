import { expect, test } from '@playwright/test';
import { execFileSync } from 'node:child_process';
import { activeOrganizationId, api, setOnboardingStep, web } from './owner-corrective.helpers';
test('nombre comercial vacío bloquea avance y recibe focus', async ({ page }) => {
  execFileSync('pnpm', ['owner:alpha2:reset'], { stdio: 'pipe' });
  await page.goto(`${web}/login`);
  await page.getByLabel('Correo electrónico').fill('alpha2.owner@nexo.local');
  await page.getByRole('button', { name: 'Entrar a NEXO' }).click();
  await page.locator('.guided-onboarding').waitFor();
  await setOnboardingStep(page, 1);
  const field = page.getByLabel('Nombre comercial *');
  await field.fill('');
  await page.getByRole('button', { name: 'Continuar' }).click();
  await expect(page.locator('.guided-onboarding')).toHaveAttribute('data-step', '1');
  await expect(field).toBeFocused();
  await expect(
    page
      .getByRole('alert')
      .filter({ hasText: 'Escribe el nombre de tu negocio para continuar.' })
      .first(),
  ).toBeVisible();
});

test('API rechaza progreso esencial vacío aunque se omita la UI', async ({ page }) => {
  execFileSync('pnpm', ['owner:alpha2:reset'], { stdio: 'pipe' });
  await page.goto(`${web}/login`);
  await page.getByLabel('Correo electrónico').fill('alpha2.owner@nexo.local');
  await page.getByRole('button', { name: 'Entrar a NEXO' }).click();
  await page.locator('.guided-onboarding').waitFor();
  const organizationId = await activeOrganizationId(page);
  const current = (await (
    await page.request.get(`${api}/v1/organizations/${organizationId}/onboarding`)
  ).json()) as { version: number };
  const csrf =
    (await page.context().cookies()).find(({ name }) => name === 'nexo_csrf')?.value ?? '';
  const response = await page.request.put(`${api}/v1/organizations/${organizationId}/onboarding`, {
    headers: { 'x-csrf-token': csrf },
    data: {
      version: current.version,
      currentStep: 1,
      businessType: 'COFFEE_SHOP',
      templateKey: 'coffee-shop',
      answers: { journeyStep: 2, businessName: '' },
    },
  });
  expect(response.status()).toBe(400);
  expect(JSON.stringify(await response.json())).toContain('Escribe el nombre de tu negocio');
});
