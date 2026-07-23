import { expect, request, test } from '@playwright/test';

const alpha = '10000000-0000-4000-8000-000000000001';
const beta = '10000000-0000-4000-8000-000000000002';
const branch = '20000000-0000-4000-8000-000000000001';
const password = process.env.TEST_PERSONA_PASSWORD ?? 'Nexo Test Persona 2026!';

async function login(email: string) {
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
          deviceFingerprint: `cash-operations-${email}`,
          deviceName: 'Cash operations evidence',
        },
      })
    ).status(),
  ).toBe(200);
  return context;
}

test.describe('Cash operational diagnostics', () => {
  test('reports authoritative outbox and local UMI sink status', async () => {
    const owner = await login('alpha.owner@nexo.local');
    const response = await owner.get(
      `/v1/organizations/${alpha}/cash/integrations/status?branchId=${branch}`,
    );
    expect(response.status()).toBe(200);
    const status = (await response.json()) as Record<string, unknown>;
    expect(status.worker).toBe('HEALTHY');
    for (const key of [
      'cashPending',
      'cashQuarantined',
      'salesPending',
      'salesQuarantined',
      'localUmiSinkDeliveries',
    ]) {
      expect(typeof status[key]).toBe('number');
      expect(status[key] as number).toBeGreaterThanOrEqual(0);
    }
    await owner.dispose();
  });

  test('returns only the sanitized tenant-scoped quarantine projection', async () => {
    const owner = await login('alpha.owner@nexo.local');
    const response = await owner.get(
      `/v1/organizations/${alpha}/cash/integrations/quarantine?branchId=${branch}&limit=100`,
    );
    expect(response.status()).toBe(200);
    const page = (await response.json()) as {
      items: Record<string, unknown>[];
      total: number;
    };
    expect(page.total).toBeGreaterThanOrEqual(0);
    const allowed = new Set([
      'eventId',
      'eventType',
      'eventVersion',
      'aggregateId',
      'organizationId',
      'branchId',
      'correlationId',
      'attempts',
      'firstAttemptAt',
      'lastAttemptAt',
      'quarantinedAt',
      'errorCode',
      'message',
      'status',
      'replayEligibility',
      'sourceModule',
      'occurredAt',
    ]);
    for (const item of page.items) {
      expect(Object.keys(item).every((key) => allowed.has(key))).toBe(true);
      expect(item).not.toHaveProperty('payload');
      expect(item).not.toHaveProperty('lastError');
      expect(item).not.toHaveProperty('stack');
      expect(item.organizationId).toBe(alpha);
    }
    await owner.dispose();
  });

  test('denies a tenant not present in the database authority context', async () => {
    const owner = await login('alpha.owner@nexo.local');
    const response = await owner.get(
      `/v1/organizations/${beta}/cash/integrations/quarantine?limit=10`,
    );
    expect([403, 404]).toContain(response.status());
    await owner.dispose();
  });

  test('denies a persona without quarantine permission', async () => {
    const readOnly = await login('alpha.readonly@nexo.local');
    const response = await readOnly.get(
      `/v1/organizations/${alpha}/cash/integrations/quarantine?branchId=${branch}&limit=10`,
    );
    expect(response.status()).toBe(403);
    await readOnly.dispose();
  });

  test('paginates quarantine without leaking raw error material', async () => {
    const owner = await login('alpha.owner@nexo.local');
    const first = await owner.get(
      `/v1/organizations/${alpha}/cash/integrations/quarantine?branchId=${branch}&offset=0&limit=1`,
    );
    const second = await owner.get(
      `/v1/organizations/${alpha}/cash/integrations/quarantine?branchId=${branch}&offset=1&limit=1`,
    );
    expect(first.status()).toBe(200);
    expect(second.status()).toBe(200);
    const firstPage = (await first.json()) as { items: { eventId: string }[]; total: number };
    const secondPage = (await second.json()) as { items: { eventId: string }[]; total: number };
    expect(firstPage.total).toBe(secondPage.total);
    if (secondPage.items.length > 0) {
      expect(firstPage.items[0]?.eventId).not.toBe(secondPage.items[0]?.eventId);
    }
    await owner.dispose();
  });
});
