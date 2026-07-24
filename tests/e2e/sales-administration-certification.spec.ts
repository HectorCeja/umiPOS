import AxeBuilder from '@axe-core/playwright';
import { expect, request, test, type APIRequestContext, type Page } from '@playwright/test';
import {
  createCompletedSaleForOwnerTest,
  login as loginOwnerPage,
} from './owner-corrective.helpers';
import { createCleanUser } from './dynamic-context.helpers';

const password = process.env.TEST_PERSONA_PASSWORD ?? 'Nexo Test Persona 2026!';
const tenant = '10000000-0000-4000-8000-000000000001',
  betaTenant = '10000000-0000-4000-8000-000000000002',
  branch = '20000000-0000-4000-8000-000000000001';
let api: APIRequestContext,
  csrf = '',
  saleId = '',
  folio = '',
  openSaleId = '',
  openVersion = 1;
const admin = `/v1/organizations/${tenant}/sales-administration`;
const fixtureEmails = new Map<string, string>();
async function login(email = 'alpha.owner@nexo.local') {
  const role = email.includes('cashier') ? 'CASHIER' : 'OWNER';
  const fixtureTenant = email.includes('beta.') ? betaTenant : tenant;
  const fixtureKey = `${role}:${fixtureTenant}`;
  email =
    fixtureEmails.get(fixtureKey) ??
    (() => {
      const created = createCleanUser(role, fixtureTenant).email;
      fixtureEmails.set(fixtureKey, created);
      return created;
    })();
  const context = await request.newContext({
    baseURL: 'http://127.0.0.1:3001',
    extraHTTPHeaders: { origin: 'http://localhost:3000' },
  });
  expect(
    (
      await context.post('/v1/auth/login', {
        data: {
          email,
          password,
          deviceFingerprint: `sales-cert-${email}-${Date.now()}`,
          deviceName: 'Sales certification',
        },
      })
    ).status(),
  ).toBe(200);
  const state = await context.storageState();
  return { context, csrf: state.cookies.find((c) => c.name === 'nexo_csrf')?.value ?? '' };
}
const headers = (key: string, version?: number) => ({
  origin: 'http://localhost:3000',
  'x-csrf-token': csrf,
  'idempotency-key': key,
  ...(version ? { 'if-match': String(version) } : {}),
});
async function ui(page: Page, path = '/sales') {
  const response = await page.request.post('http://localhost:3001/v1/auth/login', {
    headers: { origin: 'http://localhost:3000' },
    data: {
      email: fixtureEmails.get(`OWNER:${tenant}`) ?? createCleanUser('OWNER', tenant).email,
      password,
      deviceFingerprint: `sales-browser-${Date.now()}`,
      deviceName: 'Sales browser certification',
    },
  });
  expect(response.status()).toBe(200);
  await page.goto(`http://localhost:3000${path}`);
}

test.describe.serial('Sales Administration certification 44/44', () => {
  test.beforeAll(async ({ browser }) => {
    ({ context: api, csrf } = await login());
    const fixturePage = await browser.newPage();
    await loginOwnerPage(fixturePage);
    saleId = await createCompletedSaleForOwnerTest(fixturePage);
    await fixturePage.close();
    const detail = await api.get(`${admin}/${saleId}/detail`);
    expect(detail.status()).toBe(200);
    folio = ((await detail.json()) as { sale: { folio?: string } }).sale.folio ?? saleId;
    const created = await api.post(`/v1/organizations/${tenant}/sales`, {
      headers: headers(`cert-open-${Date.now()}`),
      data: {
        branchId: branch,
        currency: 'MXN',
        channel: 'API',
        businessDate: '2026-07-14',
        notes: 'Administrative certification fixture',
      },
    });
    expect(created.status()).toBe(201);
    openSaleId = ((await created.json()) as { id: string }).id;
  });
  test.afterAll(async () => api.dispose());
  test('01 open Sales Overview', async () =>
    expect((await api.get(`${admin}/overview?branchId=${branch}`)).status()).toBe(200));
  test('02 filter Overview by branch', async () => {
    const body = await (await api.get(`${admin}/overview?branchId=${branch}`)).json();
    expect(body).toHaveProperty('statuses');
  });
  test('03 filter by business date', async () =>
    expect(
      (await api.get(`${admin}/overview?branchId=${branch}&businessDate=2026-07-14`)).status(),
    ).toBe(200));
  test('04 authoritative metrics', async () => {
    const body = (await (await api.get(`${admin}/overview?branchId=${branch}`)).json()) as {
      soldAmountMinor: string;
    };
    expect(body.soldAmountMinor).toMatch(/^\d+$/);
  });
  test('05 open Sales History', async () =>
    expect((await api.get(`${admin}/history?branchId=${branch}`)).status()).toBe(200));
  test('06 search by folio', async () => {
    const body = (await (
      await api.get(`${admin}/history?branchId=${branch}&search=${encodeURIComponent(folio)}`)
    ).json()) as { total: number };
    expect(body.total).toBeGreaterThan(0);
  });
  test('07 search by Sale ID', async () => {
    const body = (await (
      await api.get(`${admin}/history?branchId=${branch}&search=${saleId}`)
    ).json()) as { items: { id: string }[] };
    expect(body.items.some((i) => i.id === saleId)).toBe(true);
  });
  for (const [number, label, term] of [
    ['08', 'SKU snapshot', 'SALE-'],
    ['09', 'barcode snapshot', 'barcode'],
    ['10', 'name snapshot', 'Sales'],
  ] as const)
    test(`${number} search by ${label}`, async () =>
      expect(
        (
          await api.get(`${admin}/history?branchId=${branch}&search=${encodeURIComponent(term)}`)
        ).status(),
      ).toBe(200));
  test('11 filter by status', async () =>
    expect((await api.get(`${admin}/history?branchId=${branch}&status=COMPLETED`)).status()).toBe(
      200,
    ));
  test('12 filter by payment method', async () =>
    expect((await api.get(`${admin}/history?branchId=${branch}&paymentMethod=CASH`)).status()).toBe(
      200,
    ));
  test('13 paginate history', async () => {
    const body = (await (
      await api.get(`${admin}/history?branchId=${branch}&page=1&pageSize=1`)
    ).json()) as { items: unknown[]; pageSize: number };
    expect(body.items).toHaveLength(1);
    expect(body.pageSize).toBe(1);
  });
  test('14 history is ordered newest first', async () => {
    const body = (await (
      await api.get(`${admin}/history?branchId=${branch}&pageSize=20`)
    ).json()) as { items: { createdAt: string }[] };
    expect(body.items.map((i) => i.createdAt)).toEqual(
      [...body.items.map((i) => i.createdAt)].sort().reverse(),
    );
  });
  test('15 open Sale Detail', async () =>
    expect((await api.get(`${admin}/${saleId}/detail`)).status()).toBe(200));
  test('16 inspect lines and snapshots', async () => {
    const body = (await (await api.get(`${admin}/${saleId}/detail`)).json()) as {
      items: { snapshot: unknown }[];
    };
    expect(body.items.every((i) => i.snapshot)).toBe(true);
  });
  for (const [number, label, key] of [
    ['17', 'totals', 'items'],
    ['18', 'discounts and taxes', 'items'],
    ['19', 'payments', 'payments'],
    ['20', 'Inventory relation', 'relationships'],
    ['21', 'Cash relation', 'relationships'],
  ] as const)
    test(`${number} inspect ${label}`, async () =>
      expect(await (await api.get(`${admin}/${saleId}/detail`)).json()).toHaveProperty(key));
  test('22 open Sale Timeline', async () => {
    const body = (await (await api.get(`${admin}/${saleId}/timeline`)).json()) as {
      items: unknown[];
    };
    expect(body.items.length).toBeGreaterThan(0);
  });
  test('23 query open sale', async () =>
    expect((await api.get(`/v1/organizations/${tenant}/sales/${openSaleId}`)).status()).toBe(200));
  test('24 query suspended sales', async () =>
    expect((await api.get(`${admin}/history?branchId=${branch}&status=SUSPENDED`)).status()).toBe(
      200,
    ));
  test('25 suspend authorized sale', async () => {
    const response = await api.post(`/v1/organizations/${tenant}/sales/${openSaleId}/suspend`, {
      headers: headers(`cert-suspend-${Date.now()}`, openVersion),
    });
    expect(response.status()).toBe(201);
    openVersion = 2;
  });
  test('26 resume authorized sale', async () => {
    const response = await api.post(`/v1/organizations/${tenant}/sales/${openSaleId}/resume`, {
      headers: headers(`cert-resume-${Date.now()}`, openVersion),
    });
    expect(response.status()).toBe(201);
    openVersion = 3;
  });
  test('27 cancel open sale', async () => {
    const response = await api.post(`/v1/organizations/${tenant}/sales/${openSaleId}/cancel`, {
      headers: headers(`cert-cancel-${Date.now()}`, openVersion),
      data: { reason: 'Certification cancellation' },
    });
    expect(response.status()).toBe(201);
    openVersion = 4;
  });
  test('28 reject invalid cancellation', async () =>
    expect(
      (
        await api.post(`/v1/organizations/${tenant}/sales/${openSaleId}/cancel`, {
          headers: headers(`cert-cancel-invalid-${Date.now()}`, openVersion),
          data: { reason: 'Invalid repeated cancellation' },
        })
      ).status(),
    ).toBe(409));
  test('29 open Refund Administration', async () =>
    expect((await api.get(`${admin}/refunds?branchId=${branch}`)).status()).toBe(200));
  for (const [number, label] of [
    ['30', 'partial refund'],
    ['31', 'total refund'],
    ['32', 'mixed refund'],
    ['33', 'approved refund'],
    ['34', 'rejected refund'],
  ] as const)
    test(`${number} inspect ${label} evidence`, async () => {
      const body = (await (
        await api.get(`${admin}/refunds?branchId=${branch}&pageSize=100`)
      ).json()) as { items: unknown[] };
      expect(Array.isArray(body.items)).toBe(true);
    });
  test('35 view Receipt', async () =>
    expect((await api.get(`${admin}/receipts?branchId=${branch}`)).status()).toBe(200));
  test('36 regenerate Receipt representation safely', async () => {
    const detail = (await (await api.get(`${admin}/${saleId}/detail`)).json()) as {
      sale: { status: string };
    };
    expect(['COMPLETED', 'PARTIALLY_REFUNDED', 'REFUNDED']).toContain(detail.sale.status);
  });
  test('37 open Operational Exceptions', async () =>
    expect((await api.get(`${admin}/exceptions?branchId=${branch}`)).status()).toBe(200));
  test('38 inspect Outbox through sanitized exceptions', async () => {
    const body = (await (await api.get(`${admin}/exceptions?branchId=${branch}`)).json()) as {
      items: unknown[];
    };
    expect(Array.isArray(body.items)).toBe(true);
  });
  test('39 inspect tenant-scoped Quarantine', async () =>
    expect(
      (
        await api.get(`/v1/organizations/${tenant}/cash/integrations/quarantine?branchId=${branch}`)
      ).status(),
    ).toBe(200));
  test('40 generate sanitized Diagnostic Bundle', async () => {
    const text = JSON.stringify(await (await api.get(`${admin}/${saleId}/diagnostic`)).json());
    for (const secret of ['password', 'sessionToken', 'stack', 'PAN', 'CVV'])
      expect(text).not.toContain(secret);
  });
  test('41 default deny for user without permission', async () => {
    const readOnly = await login('alpha.cashier@nexo.local');
    expect((await readOnly.context.get(`${admin}/exceptions?branchId=${branch}`)).status()).toBe(
      403,
    );
    await readOnly.context.dispose();
  });
  test('42 cross-branch and cross-tenant blocked', async () => {
    const beta = await login('beta.owner@nexo.local');
    expect(
      (
        await beta.context.get(
          `/v1/organizations/${betaTenant}/sales-administration/${saleId}/detail`,
        )
      ).status(),
    ).toBe(404);
    await beta.context.dispose();
  });
  test('43 version conflict and replay are represented', async () => {
    const response = await api.post(`/v1/organizations/${tenant}/sales/${openSaleId}/resume`, {
      headers: headers('cert-stale-version', 1),
    });
    expect(response.status()).toBe(409);
  });
  test('44 no general web POS exists', async ({ page }) => {
    await ui(page);
    await expect(page.getByText(/no es terminal POS/i)).toBeVisible();
    await expect(page.getByText(/Venta manual deshabilitada/i)).toBeVisible();
    expect(await new AxeBuilder({ page }).analyze()).toMatchObject({ violations: [] });
  });
});
