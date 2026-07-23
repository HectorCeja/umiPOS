import { expect, request, test, type APIRequestContext } from '@playwright/test';
import { spawnSync } from 'node:child_process';

const password = process.env.TEST_PERSONA_PASSWORD ?? 'Nexo Test Persona 2026!';
const tenant = '10000000-0000-4000-8000-000000000001';
const branch = '20000000-0000-4000-8000-000000000001';

async function login(email: string) {
  const context = await request.newContext({
    baseURL: 'http://127.0.0.1:3001',
    extraHTTPHeaders: { origin: 'http://localhost:3000' },
  });
  const response = await context.post('/v1/auth/login', {
    data: {
      email,
      password,
      deviceFingerprint: `inventory-foundation-${email}`,
      deviceName: 'Certification',
    },
  });
  expect(response.status()).toBe(200);
  const state = await context.storageState();
  return {
    context,
    headers: {
      origin: 'http://localhost:3000',
      'x-csrf-token': state.cookies.find(({ name }) => name === 'nexo_csrf')!.value,
    },
  };
}

async function createProduct(
  context: APIRequestContext,
  headers: Record<string, string>,
  type: 'PHYSICAL' | 'SERVICE',
) {
  const response = await context.post(`/v1/organizations/${tenant}/products`, {
    headers,
    data: { name: `Inventory ${type} ${Date.now()}-${Math.random()}`, type },
  });
  expect(response.status()).toBe(201);
  const product = (await response.json()) as { id: string; version: number };
  const detail = await context.get(`/v1/organizations/${tenant}/products/${product.id}`);
  const body = (await detail.json()) as { variants: { id: string }[]; version: number };
  return { id: product.id, variantId: body.variants[0]!.id, version: body.version };
}

async function createLocation(context: APIRequestContext, headers: Record<string, string>) {
  const response = await context.post(`/v1/organizations/${tenant}/inventory/locations`, {
    headers,
    data: {
      branchId: branch,
      type: 'WAREHOUSE',
      code: `CERT-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
      name: 'Certification warehouse',
    },
  });
  expect(response.status()).toBe(201);
  return (await response.json()) as { id: string };
}

async function movement(
  context: APIRequestContext,
  headers: Record<string, string>,
  variantId: string,
  locationId: string,
  type: string,
  state: string,
  quantity: string,
  key: string,
) {
  return context.post(`/v1/organizations/${tenant}/inventory/movements`, {
    headers,
    data: {
      variantId,
      locationId,
      type,
      state,
      quantity,
      reason: 'Inventory foundation certification',
      occurredAt: new Date().toISOString(),
      idempotencyKey: key,
    },
  });
}

test.describe.serial('Inventory foundation integrity', () => {
  test('rejects client combinations that can create spontaneous stock', async () => {
    const owner = await login('alpha.owner@nexo.local');
    const product = await createProduct(owner.context, owner.headers, 'PHYSICAL');
    const location = await createLocation(owner.context, owner.headers);
    const cases = [
      ['PURCHASE', 'ON_HAND', '-2'],
      ['SALE', 'ON_HAND', '2'],
      ['RESERVATION', 'RESERVED', '2'],
      ['TRANSFER', 'IN_TRANSIT', '2'],
      ['ADJUSTMENT', 'DAMAGED', '2'],
    ];
    for (const [type, state, quantity] of cases) {
      const response = await movement(
        owner.context,
        owner.headers,
        product.variantId,
        location.id,
        type!,
        state!,
        quantity!,
        `illegal-${Date.now()}-${type}`,
      );
      expect(response.status()).toBe(400);
    }
    const balance = await owner.context.get(
      `/v1/organizations/${tenant}/inventory/availability?variantId=${product.variantId}&locationId=${location.id}`,
    );
    expect(await balance.json()).toMatchObject({
      onHand: '0',
      reserved: '0',
      inTransit: '0',
      damaged: '0',
    });
  });

  test('allows inventory only for non-archived PHYSICAL products', async () => {
    const owner = await login('alpha.owner@nexo.local');
    const service = await createProduct(owner.context, owner.headers, 'SERVICE');
    const physical = await createProduct(owner.context, owner.headers, 'PHYSICAL');
    const location = await createLocation(owner.context, owner.headers);
    expect(
      (
        await movement(
          owner.context,
          owner.headers,
          service.variantId,
          location.id,
          'PURCHASE',
          'ON_HAND',
          '1',
          `service-${Date.now()}`,
        )
      ).status(),
    ).toBe(400);
    const archived = await owner.context.post(
      `/v1/organizations/${tenant}/products/${physical.id}/archive`,
      {
        headers: owner.headers,
        data: { version: physical.version },
      },
    );
    expect(archived.status()).toBe(201);
    expect(
      (
        await movement(
          owner.context,
          owner.headers,
          physical.variantId,
          location.id,
          'PURCHASE',
          'ON_HAND',
          '1',
          `archived-${Date.now()}`,
        )
      ).status(),
    ).toBe(400);
  });

  test('serializes concurrent issues and never underflows on-hand', async () => {
    const owner = await login('alpha.owner@nexo.local');
    const product = await createProduct(owner.context, owner.headers, 'PHYSICAL');
    const location = await createLocation(owner.context, owner.headers);
    expect(
      (
        await movement(
          owner.context,
          owner.headers,
          product.variantId,
          location.id,
          'PURCHASE',
          'ON_HAND',
          '10',
          `receipt-${Date.now()}`,
        )
      ).status(),
    ).toBe(201);
    const issues = await Promise.all(
      Array.from({ length: 10 }, (_, index) =>
        movement(
          owner.context,
          owner.headers,
          product.variantId,
          location.id,
          'ADJUSTMENT',
          'ON_HAND',
          '-2',
          `issue-${Date.now()}-${index}`,
        ),
      ),
    );
    expect(issues.filter((response) => response.status() === 201)).toHaveLength(5);
    expect(issues.filter((response) => response.status() === 409)).toHaveLength(5);
    const balance = await owner.context.get(
      `/v1/organizations/${tenant}/inventory/availability?variantId=${product.variantId}&locationId=${location.id}`,
    );
    expect(await balance.json()).toMatchObject({ onHand: '0', available: '0' });
  });

  test('keeps movement and snapshot evidence immutable', async () => {
    const owner = await login('alpha.owner@nexo.local');
    const product = await createProduct(owner.context, owner.headers, 'PHYSICAL');
    const location = await createLocation(owner.context, owner.headers);
    const created = await movement(
      owner.context,
      owner.headers,
      product.variantId,
      location.id,
      'PURCHASE',
      'ON_HAND',
      '3',
      `immutable-${Date.now()}`,
    );
    expect(created.status()).toBe(201);
    const body = (await created.json()) as { id: string };
    for (const sql of [
      `UPDATE inventory_movements SET quantity=99 WHERE tenant_id='${tenant}' AND id='${body.id}'`,
      `DELETE FROM inventory_movements WHERE tenant_id='${tenant}' AND id='${body.id}'`,
      `UPDATE inventory_snapshots SET balances='{}'::jsonb WHERE tenant_id='${tenant}' AND through_movement_id='${body.id}'`,
    ]) {
      const result = spawnSync(
        'docker',
        [
          'compose',
          'exec',
          '-T',
          'postgres',
          'psql',
          '-U',
          'nexo_admin',
          '-d',
          'nexo',
          '-v',
          'ON_ERROR_STOP=1',
          '-c',
          sql,
        ],
        { encoding: 'utf8' },
      );
      expect(result.status).not.toBe(0);
    }
  });

  test('enforces tenant references, RLS context changes and idempotency', async () => {
    const owner = await login('alpha.owner@nexo.local');
    const product = await createProduct(owner.context, owner.headers, 'PHYSICAL');
    const location = await createLocation(owner.context, owner.headers);
    const key = `duplicate-${Date.now()}`;
    expect(
      (
        await movement(
          owner.context,
          owner.headers,
          product.variantId,
          location.id,
          'PURCHASE',
          'ON_HAND',
          '2',
          key,
        )
      ).status(),
    ).toBe(201);
    expect(
      (
        await movement(
          owner.context,
          owner.headers,
          product.variantId,
          location.id,
          'PURCHASE',
          'ON_HAND',
          '2',
          key,
        )
      ).status(),
    ).toBe(409);
    const sql = `BEGIN; SET LOCAL ROLE nexo_runtime;
SELECT count(*) FROM inventory_movements;
SELECT set_config('app.current_tenant_id','${tenant}',true);
SELECT count(*) FROM inventory_movements WHERE tenant_id='10000000-0000-4000-8000-000000000002';
ROLLBACK;`;
    const result = spawnSync(
      'docker',
      ['compose', 'exec', '-T', 'postgres', 'psql', '-U', 'nexo_admin', '-d', 'nexo', '-Atq'],
      { encoding: 'utf8', input: sql },
    );
    expect(result.status, result.stderr).toBe(0);
    expect(
      result.stdout
        .split('\n')
        .map((line) => line.trim())
        .filter((line) => /^\d+$/.test(line)),
    ).toEqual(['0', '0']);
  });

  test('keeps inventory mutation unavailable to Cashier and ReadOnly', async () => {
    const owner = await login('alpha.owner@nexo.local');
    const product = await createProduct(owner.context, owner.headers, 'PHYSICAL');
    const location = await createLocation(owner.context, owner.headers);
    for (const email of ['alpha.cashier@nexo.local', 'alpha.readonly@nexo.local']) {
      const actor = await login(email);
      const response = await movement(
        actor.context,
        actor.headers,
        product.variantId,
        location.id,
        'ADJUSTMENT',
        'ON_HAND',
        '1',
        `denied-${Date.now()}-${email}`,
      );
      expect(response.status()).toBe(403);
    }
  });
});
