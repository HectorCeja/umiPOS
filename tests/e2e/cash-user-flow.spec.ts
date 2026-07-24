import { expect, test } from '@playwright/test';
import {
  activeOrganizationId,
  browserAudit,
  evidence,
  expectClean,
  login,
  web,
} from './owner-corrective.helpers';

test('cash has an explicit selected register, drawer and contextual next action', async ({
  page,
}) => {
  await login(page);
  const activeSession = page.waitForResponse(
    (response) =>
      response.url().includes('/cash/sessions/active?') && response.request().method() === 'GET',
  );
  await page.goto(`${web}/cash`);
  expect((await activeSession).status()).toBe(200);
  await expect(page.getByText('Cómo funciona Caja')).toBeVisible();
  let registers = page.getByRole('radio', { name: /Punto de cobro/ });
  if ((await registers.count()) === 0) {
    const organizationId = await activeOrganizationId(page);
    const csrf =
      (await page.context().cookies()).find(({ name }) => name === 'nexo_csrf')?.value ?? '';
    const created = await page.request.post(
      `http://localhost:3001/v1/organizations/${organizationId}/cash/registers`,
      {
        headers: { 'x-csrf-token': csrf },
        data: {
          branchId: '20000000-0000-4000-8000-000000000001',
          name: 'Punto de cobro de flujo E2E',
          code: `FLOW-${Date.now()}`,
          currency: 'MXN',
        },
      },
    );
    expect(created.status(), await created.text()).toBe(201);
    await page.reload();
    registers = page.getByRole('radio', { name: /Punto de cobro/ });
  }
  await expect(registers.first()).toBeVisible();
  const audit = browserAudit(page);
  await registers.first().click();
  await expect(registers.first()).toHaveAttribute('aria-checked', 'true');
  await page.getByText('Configurar puntos de cobro').click();
  await expect(page.getByRole('button', { name: 'Crear cajón de efectivo' })).toBeEnabled();
  await evidence(page, 'cash-selected-register.png');
  expectClean(audit);
});
