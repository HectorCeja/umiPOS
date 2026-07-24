import { execFileSync } from 'node:child_process';

import { expect, request, test, type APIRequestContext, type Page } from '@playwright/test';
import { createCleanUser } from './dynamic-context.helpers';

const password = process.env.TEST_PERSONA_PASSWORD ?? 'Nexo Test Persona 2026!';
const tenant = '10000000-0000-4000-8000-000000000001';
const betaTenant = '10000000-0000-4000-8000-000000000002';
const branch = '20000000-0000-4000-8000-000000000001';
const otherBranch = '20000000-0000-4000-8000-000000000002';
const endpoint = `/v1/organizations/${tenant}/analytics/overview`;
const fixtureEmails = new Map<string, string>();

type Analytics = {
  revenue: { grossMinor: string; refundedMinor: string; netMinor: string; collectedMinor: string };
  sales: { count: number; averageTicketMinor: string; medianTicketMinor: string };
  inventory: { current: string; available: string; reserved: string; negativeBalances: number };
  cash: { netMinor: string; varianceMinor: string; openSessions: number };
  payments: { method: string; count: number; totalMinor: string }[];
  products: { productName: string; netMinor: string }[];
  timeSeries: { bucket: string; salesCount: number; grossMinor: string }[];
};

async function login(email: string) {
  if (!email.includes('supervisor')) {
    const role = email.includes('cashier')
      ? 'CASHIER'
      : email.includes('readonly')
        ? 'READ_ONLY'
        : 'OWNER';
    email =
      fixtureEmails.get(role) ??
      (() => {
        const created = createCleanUser(role).email;
        fixtureEmails.set(role, created);
        return created;
      })();
  }
  const context = await request.newContext({
    baseURL: 'http://127.0.0.1:3001',
    extraHTTPHeaders: { origin: 'http://localhost:3000' },
  });
  const response = await context.post('/v1/auth/login', {
    data: {
      email,
      password,
      deviceFingerprint: `analytics-${email}-${Date.now()}`,
      deviceName: 'Analytics certification',
    },
  });
  expect(response.status()).toBe(200);
  return context;
}

function authoritativeBranchTotals() {
  const sql = `WITH e AS (
    SELECT s.id,COALESCE(SUM(i.total_minor),0)::bigint total
    FROM sales s JOIN sale_items i ON i.tenant_id=s.tenant_id AND i.sale_id=s.id
    WHERE s.tenant_id='${tenant}' AND s.branch_id='${branch}'
      AND s.status IN ('COMPLETED','PARTIALLY_REFUNDED','REFUNDED')
    GROUP BY s.id
  ),r AS (
    SELECT COALESCE(SUM(amount_minor),0)::bigint total FROM refund_intents
    WHERE tenant_id='${tenant}' AND status IN ('APPROVED','COMPLETED') AND sale_id IN (SELECT id FROM e)
  ) SELECT json_build_object('gross',COALESCE(SUM(e.total),0)::text,
    'refunded',(SELECT total::text FROM r),'count',COUNT(*)::text)::text FROM e`;
  return JSON.parse(
    execFileSync(
      'docker',
      ['compose', 'exec', '-T', 'postgres', 'psql', '-U', 'nexo_admin', '-d', 'nexo', '-Atc', sql],
      { cwd: process.cwd(), encoding: 'utf8' },
    ).trim(),
  ) as { gross: string; refunded: string; count: string };
}

function authoritativeCashTotals() {
  const sql = `SELECT json_build_object(
    'net',(SELECT COALESCE(SUM(CASE WHEN direction='IN' THEN amount_minor ELSE -amount_minor END),0)::text
      FROM cash_ledger_entries WHERE tenant_id='${tenant}' AND branch_id='${branch}'),
    'variance',(SELECT COALESCE(SUM(variance_minor) FILTER (WHERE closed_at IS NOT NULL),0)::text
      FROM cash_sessions WHERE tenant_id='${tenant}' AND branch_id='${branch}'),
    'openSessions',(SELECT COUNT(*) FILTER (WHERE status IN ('PENDING_OPEN','OPEN','SUSPENDED','COUNTING','RECONCILIATION_REQUIRED','PENDING_APPROVAL','REOPENED'))
      FROM cash_sessions WHERE tenant_id='${tenant}' AND branch_id='${branch}')
  )::text`;
  return JSON.parse(
    execFileSync(
      'docker',
      ['compose', 'exec', '-T', 'postgres', 'psql', '-U', 'nexo_admin', '-d', 'nexo', '-Atc', sql],
      { cwd: process.cwd(), encoding: 'utf8' },
    ).trim(),
  ) as { net: string };
}

function authoritativePaymentTotal() {
  const sql = `SELECT COALESCE(SUM(p.amount_minor),0)::text
    FROM sale_payments p JOIN sales s ON s.tenant_id=p.tenant_id AND s.id=p.sale_id
    WHERE p.tenant_id='${tenant}' AND s.branch_id='${branch}'
      AND p.status IN ('CAPTURED','REFUNDED')`;
  return execFileSync(
    'docker',
    ['compose', 'exec', '-T', 'postgres', 'psql', '-U', 'nexo_admin', '-d', 'nexo', '-Atc', sql],
    { cwd: process.cwd(), encoding: 'utf8' },
  ).trim();
}

test.describe.serial('Reports and Analytics certification', () => {
  let owner: APIRequestContext;

  test.beforeAll(async () => {
    owner = await login('alpha.owner@nexo.local');
  });

  test.afterAll(async () => owner.dispose());

  test('revenue reconciles exactly with authoritative Commerce rows', async () => {
    const expected = authoritativeBranchTotals();
    const response = await owner.get(`${endpoint}?branchId=${branch}&timezone=UTC&interval=day`);
    expect(response.status()).toBe(200);
    const body = (await response.json()) as Analytics;
    expect(body.revenue.grossMinor).toBe(expected.gross);
    expect(body.revenue.refundedMinor).toBe(expected.refunded);
    expect(body.revenue.netMinor).toBe(
      (BigInt(expected.gross) - BigInt(expected.refunded)).toString(),
    );
    expect(body.sales.count).toBe(Number(expected.count));
  });

  test('payments and inventory use exact serialized arithmetic', async () => {
    const body = (await (
      await owner.get(`${endpoint}?branchId=${branch}&timezone=UTC`)
    ).json()) as Analytics;
    expect(body.payments.every((item) => /^-?\d+$/.test(item.totalMinor))).toBe(true);
    expect(body.revenue.collectedMinor).toBe(authoritativePaymentTotal());
    expect(body.payments.reduce((sum, item) => sum + BigInt(item.totalMinor), 0n).toString()).toBe(
      authoritativePaymentTotal(),
    );
    expect(body.inventory.current).toMatch(/^-?\d+(?:\.\d+)?$/);
    expect(body.inventory.available).toMatch(/^-?\d+(?:\.\d+)?$/);
    expect(body.inventory.negativeBalances).toBeGreaterThanOrEqual(0);
    const cash = authoritativeCashTotals();
    expect(body.cash.netMinor).toBe(cash.net);
    expect(body.cash.varianceMinor).toBe(cash.variance);
    expect(body.cash.openSessions).toBe(Number(cash.openSessions));
  });

  test('same query is deterministic', async () => {
    const url = `${endpoint}?branchId=${branch}&from=2026-01-01&to=2027-01-01&timezone=America%2FMazatlan&interval=month`;
    const first = await (await owner.get(url)).json();
    const second = await (await owner.get(url)).json();
    expect(second).toEqual(first);
  });

  test('exclusive date ranges and interval buckets are explicit', async () => {
    const response = await owner.get(
      `${endpoint}?branchId=${branch}&from=2026-07-22&to=2026-07-23&timezone=UTC&interval=hour`,
    );
    expect(response.status()).toBe(200);
    const body = (await response.json()) as Analytics;
    expect(body.timeSeries.every((point) => point.bucket.startsWith('2026-07-22'))).toBe(true);
  });

  test('invalid range and timezone fail explicitly', async () => {
    expect(
      (await owner.get(`${endpoint}?from=2026-07-23&to=2026-07-22&timezone=UTC`)).status(),
    ).toBe(400);
    expect((await owner.get(`${endpoint}?timezone=Not%2FAZone`)).status()).toBe(400);
  });

  test('cross-tenant access is hidden by authorization', async () => {
    expect(
      (
        await owner.get(`/v1/organizations/${betaTenant}/analytics/overview?branchId=${branch}`)
      ).status(),
    ).toBe(403);
  });

  test('branch-scoped supervisor cannot read another branch', async () => {
    const supervisor = await login('alpha.supervisor@nexo.local');
    try {
      expect((await supervisor.get(`${endpoint}?branchId=${otherBranch}`)).status()).toBe(403);
    } finally {
      await supervisor.dispose();
    }
  });

  test('cashier remains default-deny while read-only can report', async () => {
    const cashier = await login('alpha.cashier@nexo.local');
    const readOnly = await login('alpha.readonly@nexo.local');
    try {
      expect((await cashier.get(`${endpoint}?branchId=${branch}`)).status()).toBe(403);
      expect((await readOnly.get(`${endpoint}?branchId=${branch}`)).status()).toBe(200);
    } finally {
      await cashier.dispose();
      await readOnly.dispose();
    }
  });

  test('twenty concurrent reports are stable and bounded', async () => {
    const started = performance.now();
    const responses = await Promise.all(
      Array.from({ length: 20 }, () => owner.get(`${endpoint}?branchId=${branch}&limit=20`)),
    );
    expect(responses.every((response) => response.status() === 200)).toBe(true);
    expect(performance.now() - started).toBeLessThan(10_000);
    const bodies = await Promise.all(responses.map((response) => response.json()));
    expect(bodies.every((body) => JSON.stringify(body) === JSON.stringify(bodies[0]))).toBe(true);
  });

  test('Web reports renders authoritative analytics without client errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', (message) => {
      if (message.type() === 'error') errors.push(message.text());
    });
    page.on('pageerror', (error) => errors.push(error.message));
    await loginPage(page);
    await page.goto('http://localhost:3000/reports');
    await expect(page.getByRole('heading', { name: 'Reportes' })).toBeVisible();
    await expect(page.getByText('Ingresos confirmados')).toBeVisible();
    await expect(page.getByText('Ventas menos devoluciones aprobadas')).toBeVisible();
    expect(errors).toEqual([]);
  });
});

async function loginPage(page: Page) {
  await page.addInitScript(
    ({ organizationId, branchId }) => {
      localStorage.setItem('nexo.active-organization', organizationId);
      localStorage.setItem('nexo.active-branch', branchId);
    },
    { organizationId: tenant, branchId: branch },
  );
  const response = await page.request.post('http://localhost:3001/v1/auth/login', {
    headers: { origin: 'http://localhost:3000' },
    data: {
      email: fixtureEmails.get('OWNER') ?? createCleanUser('OWNER').email,
      password,
      deviceFingerprint: `analytics-web-${Date.now()}`,
      deviceName: 'Analytics web certification',
    },
  });
  expect(response.status()).toBe(200);
}
