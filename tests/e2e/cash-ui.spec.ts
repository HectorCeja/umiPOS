import { expect, request, test } from '@playwright/test';

const password = process.env.TEST_PERSONA_PASSWORD ?? 'Nexo Test Persona 2026!';
let connectedSessionId = '';

test.describe('Connected Cash administration', () => {
  test.afterEach(async () => {
    const context = await request.newContext({
      baseURL: 'http://127.0.0.1:3001',
      extraHTTPHeaders: { origin: 'http://localhost:3000' },
    });
    const login = await context.post('/v1/auth/login', {
      data: {
        email: 'alpha.owner@nexo.local',
        password,
        deviceFingerprint: `cash-ui-cleanup-${Date.now()}`,
        deviceName: 'Connected Cash cleanup',
      },
    });
    if (login.status() === 200) {
      const csrf = (await context.storageState()).cookies.find(
        (cookie) => cookie.name === 'nexo_csrf',
      )?.value;
      const current = connectedSessionId
        ? await context.get(
            `/v1/organizations/10000000-0000-4000-8000-000000000001/cash/sessions/${connectedSessionId}`,
          )
        : await context.get(
            '/v1/organizations/10000000-0000-4000-8000-000000000001/cash/sessions/active?branchId=20000000-0000-4000-8000-000000000001',
          );
      if (current.status() === 200 && csrf) {
        const session = (await current.json()) as {
          id: string;
          status: string;
          version: number;
        } | null;
        if (session && !['CLOSED', 'FORCE_CLOSED'].includes(session.status)) {
          await context.post(
            `/v1/organizations/10000000-0000-4000-8000-000000000001/cash/sessions/${session.id}/close`,
            {
              headers: { origin: 'http://localhost:3000', 'x-csrf-token': csrf },
              data: {
                version: session.version,
                force: true,
                reason: 'Connected UI afterEach cleanup',
                idempotencyKey: crypto.randomUUID(),
              },
            },
          );
        }
      }
      connectedSessionId = '';
    }
    await context.dispose();
  });

  test('operates an administrative Cash session through the real API', async ({ page }) => {
    const login = await page.request.post('http://localhost:3001/v1/auth/login', {
      headers: { origin: 'http://localhost:3000' },
      data: {
        email: 'alpha.owner@nexo.local',
        password,
        deviceFingerprint: `cash-ui-${Date.now()}`,
        deviceName: 'Connected Cash administration E2E',
      },
    });
    expect(login.status()).toBe(200);
    const csrf = (await page.context().cookies()).find(
      (cookie) => cookie.name === 'nexo_csrf',
    )?.value;
    expect(csrf).toBeTruthy();
    const policy = await page.request.post(
      'http://localhost:3001/v1/organizations/10000000-0000-4000-8000-000000000001/cash/policies',
      {
        headers: { origin: 'http://localhost:3000', 'x-csrf-token': csrf! },
        data: {
          branchId: '20000000-0000-4000-8000-000000000001',
          configuration: { depositApprovalRequired: false },
          idempotencyKey: crypto.randomUUID(),
        },
      },
    );
    expect(policy.status()).toBe(201);
    await expect
      .poll(async () => {
        const status = (await (
          await page.request.get(
            'http://localhost:3001/v1/organizations/10000000-0000-4000-8000-000000000001/cash/integrations/status?branchId=20000000-0000-4000-8000-000000000001',
          )
        ).json()) as { cashPending: number; salesPending: number };
        return status.cashPending + status.salesPending;
      })
      .toBe(0);
    await page.goto('http://localhost:3000/cash');
    await page.getByRole('button', { name: 'Actualizar' }).click();
    await expect(page.getByRole('heading', { name: 'Administración de Caja' })).toBeVisible();
    await page.getByText('Configurar puntos de cobro').click();

    const stamp = Date.now().toString().slice(-8);
    await page.getByRole('combobox', { name: 'Nombre' }).click();
    await page.getByRole('searchbox', { name: 'Buscar en Nombre' }).fill(`Caja UI ${stamp}`);
    await page.getByRole('searchbox', { name: 'Buscar en Nombre' }).press('Enter');
    await page.getByLabel('Código').fill(`UI-${stamp}`);
    await Promise.all([
      page.waitForResponse(
        (response) =>
          response.url().endsWith('/cash/registers') &&
          response.request().method() === 'POST' &&
          response.status() === 201,
      ),
      page.getByRole('button', { name: 'Crear punto de cobro' }).click(),
    ]);
    await expect(page.getByRole('radio', { name: new RegExp(`Caja UI ${stamp}`) })).toHaveAttribute(
      'aria-checked',
      'true',
    );
    await Promise.all([
      page.waitForResponse(
        (response) =>
          response.url().endsWith('/cash/drawers') &&
          response.request().method() === 'POST' &&
          response.status() === 201,
      ),
      page.getByRole('button', { name: 'Crear cajón de efectivo' }).click(),
    ]);
    await page.getByLabel('Monto').fill('100.00');
    const openResponsePromise = page.waitForResponse(
      (response) => response.url().endsWith('/cash/sessions/open') && response.status() === 201,
    );
    await page.getByRole('button', { name: 'Abrir sesión' }).click();
    const opened = (await (await openResponsePromise).json()) as { id: string };
    connectedSessionId = opened.id;
    await expect(page.getByText('Abierta', { exact: true })).toBeVisible();

    await page.getByLabel('Monto').fill('5.00');
    await Promise.all([
      page.waitForResponse(
        (response) =>
          response.url().includes('/movements') && response.request().method() === 'POST',
      ),
      page.getByRole('button', { name: 'Entrada de efectivo' }).click(),
    ]);
    const afterMovement = (await (
      await page.request.get(
        `http://localhost:3001/v1/organizations/10000000-0000-4000-8000-000000000001/cash/sessions/${opened.id}`,
      )
    ).json()) as { expectedAmountMinor: string };
    await expect(
      page.getByText(`Esperado: ${afterMovement.expectedAmountMinor}`, { exact: true }),
    ).toBeVisible();
    await Promise.all([
      page.waitForResponse(
        (response) => response.url().endsWith('/suspend') && response.request().method() === 'POST',
      ),
      page.getByRole('button', { name: 'Suspender' }).click(),
    ]);
    await expect(page.getByRole('button', { name: 'Reanudar' })).toBeVisible();
    await page.getByRole('button', { name: 'Reanudar' }).click();

    await Promise.all([
      page.waitForResponse(
        (response) =>
          response.url().endsWith('/deposits') && response.request().method() === 'POST',
      ),
      page.getByRole('button', { name: 'Preparar depósito' }).click(),
    ]);
    await expect(page.getByRole('button', { name: 'Cancelar depósito' })).toBeEnabled();
    await Promise.all([
      page.waitForResponse(
        (response) =>
          response.url().endsWith('/transition') && response.request().method() === 'POST',
      ),
      page.getByRole('button', { name: 'Cancelar depósito' }).click(),
    ]);
    await page.getByLabel('Monto').fill('105.00');
    await Promise.all([
      page.waitForResponse(
        (response) => response.url().endsWith('/counts') && response.request().method() === 'POST',
      ),
      page.getByRole('button', { name: 'Contar denominación' }).click(),
    ]);
    await Promise.all([
      page.waitForResponse(
        (response) =>
          response.url().endsWith('/reconcile') && response.request().method() === 'POST',
      ),
      page.getByRole('button', { name: 'Reconciliar' }).click(),
    ]);
    await Promise.all([
      page.waitForResponse((response) => response.url().endsWith('/timeline')),
      page.getByRole('button', { name: 'Consultar actividad y resumen' }).click(),
    ]);
    await expect(page.getByText('Entrada de efectivo', { exact: true }).first()).toBeVisible();

    const current = (await (
      await page.request.get(
        `http://localhost:3001/v1/organizations/10000000-0000-4000-8000-000000000001/cash/sessions/${opened.id}`,
      )
    ).json()) as { version: number };
    const closed = await page.request.post(
      `http://localhost:3001/v1/organizations/10000000-0000-4000-8000-000000000001/cash/sessions/${opened.id}/close`,
      {
        headers: { origin: 'http://localhost:3000', 'x-csrf-token': csrf! },
        data: {
          version: current.version,
          force: true,
          reason: 'Connected UI certification cleanup',
          idempotencyKey: crypto.randomUUID(),
        },
      },
    );
    expect(closed.status()).toBe(201);
  });

  test('exposes no POS sale or checkout action', async ({ page }) => {
    await page.goto('http://localhost:3000/cash');
    await expect(
      page.getByRole('button', { name: /cobrar|checkout|completar venta/i }),
    ).toHaveCount(0);
  });
});
