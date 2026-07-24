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

export function createCleanUser(
  role: 'OWNER' | 'ADMINISTRATOR' | 'SUPERVISOR' | 'CASHIER' | 'READ_ONLY' = 'OWNER',
  organizationId = '10000000-0000-4000-8000-000000000001',
) {
  const output = execFileSync(
    'node',
    ['scripts/owner-onboarding.mjs', 'new-user', role, organizationId],
    { encoding: 'utf8' },
  );
  const email = /Usuario: (.+)/.exec(output)?.[1];
  if (!email) throw new Error('No se creó el usuario limpio');
  return { email };
}

export async function loginClean(
  page: Page,
  email: string,
  activeContext?: { organizationId: string; branchId: string },
) {
  await page.context().clearCookies();
  const response = await page.request.post(`${api}/v1/auth/login`, {
    headers: { origin: web },
    data: {
      email,
      password,
      deviceFingerprint: `e2e-fixture-${Date.now()}`,
      deviceName: 'E2E fixture',
    },
  });
  expect(response.ok()).toBe(true);
  await page.goto(`${web}/login`);
  await page.evaluate(() => localStorage.clear());
  if (activeContext) {
    await page.evaluate(({ organizationId, branchId }) => {
      localStorage.setItem('nexo.active-organization', organizationId);
      localStorage.setItem('nexo.active-branch', branchId);
    }, activeContext);
  }
  await page.goto(web);
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
        answers: {
          businessType: 'COFFEE_SHOP',
          businessName: 'Negocio E2E aislado',
          country: 'MX',
          currency: 'MXN',
          locale: 'es-MX',
          timeZone: 'America/Mazatlan',
          branchName: 'Sucursal principal',
          catalogChoice: 'template',
          journeyStep: 10,
        },
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
