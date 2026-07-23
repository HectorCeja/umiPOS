import { expect, type Page } from '@playwright/test';
import { execFileSync } from 'node:child_process';

export const web = 'http://localhost:3000';
export const api = 'http://localhost:3001';
export const password = process.env.TEST_PERSONA_PASSWORD ?? 'Nexo Test Persona 2026!';

export function createCleanBusiness() {
  const output = execFileSync('node', ['scripts/owner-onboarding.mjs', 'new-business'], {
    encoding: 'utf8',
  });
  const email = /Usuario: (.+)/.exec(output)?.[1];
  const organization = /Organización: (.+)/.exec(output)?.[1];
  const organizationId = /ID: ([0-9a-f-]+)/.exec(output)?.[1];
  if (!email || !organization || !organizationId) throw new Error('No se creó el negocio limpio');
  return { email, organization, organizationId };
}

export async function loginClean(page: Page, email: string) {
  await page.goto(web);
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.getByLabel('Correo').fill(email);
  await page.getByRole('textbox', { name: 'Contraseña *' }).fill(password);
  await page.getByRole('button', { name: 'Entrar a NEXO' }).click();
  await page.locator('.guided-onboarding, .product-main').first().waitFor();
}

export async function completeCleanOnboarding(
  page: Page,
  organizationId: string,
  apiOrigin = api,
  webOrigin = web,
) {
  const csrf =
    (await page.context().cookies()).find(({ name }) => name === 'nexo_csrf')?.value ?? '';
  const currentResponse = await page.request.get(
    `${apiOrigin}/v1/organizations/${organizationId}/onboarding`,
  );
  expect(currentResponse.ok()).toBe(true);
  const current = (await currentResponse.json()) as { version: number };
  const preparedResponse = await page.request.put(
    `${apiOrigin}/v1/organizations/${organizationId}/onboarding`,
    {
      headers: { origin: webOrigin, 'x-csrf-token': csrf },
      data: {
        version: current.version,
        currentStep: 4,
        businessType: 'COFFEE_SHOP',
        templateKey: 'coffee-shop',
        answers: { businessType: 'COFFEE_SHOP' },
      },
    },
  );
  expect(preparedResponse.ok()).toBe(true);
  const prepared = (await preparedResponse.json()) as { version: number };
  const response = await page.request.post(
    `${apiOrigin}/v1/organizations/${organizationId}/onboarding/complete`,
    {
      headers: { origin: webOrigin, 'x-csrf-token': csrf },
      data: { version: prepared.version },
    },
  );
  expect(response.ok()).toBe(true);
}
