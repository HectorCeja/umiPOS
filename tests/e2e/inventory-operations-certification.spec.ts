import { expect, request, test, type APIRequestContext } from '@playwright/test';
import { spawnSync } from 'node:child_process';

const password = process.env.TEST_PERSONA_PASSWORD ?? 'Nexo Test Persona 2026!';
const tenant = '10000000-0000-4000-8000-000000000001';
const betaTenant = '10000000-0000-4000-8000-000000000002';
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
      deviceFingerprint: `inventory-operations-${email}-${Date.now()}`,
      deviceName: 'Inventory Operations Certification',
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

async function product(
  context: APIRequestContext,
  headers: Record<string, string>,
  type = 'PHYSICAL',
) {
  const stamp = `${Date.now()}-${Math.floor(Math.random() * 1_000_000)}`;
  const created = await context.post(`/v1/organizations/${tenant}/products`, {
    headers,
    data: { name: `Operations ${stamp}`, sku: `OPS-${stamp}`, type },
  });
  expect(created.status()).toBe(201);
  const id = ((await created.json()) as { id: string }).id;
  const detail = (await (
    await context.get(`/v1/organizations/${tenant}/products/${id}`)
  ).json()) as { version: number; variants: { id: string }[] };
  return { id, variantId: detail.variants[0]!.id, version: detail.version, stamp };
}

async function location(
  context: APIRequestContext,
  headers: Record<string, string>,
  stamp: string,
  suffix: string,
  type: 'WAREHOUSE' | 'ZONE' | 'SHELF' | 'BIN' = 'WAREHOUSE',
  parentId?: string,
  branchId = branch,
) {
  const response = await context.post(`/v1/organizations/${tenant}/inventory/locations`, {
    headers,
    data: {
      branchId,
      ...(parentId ? { parentId } : {}),
      type,
      code: `OPS-${suffix}-${stamp}`,
      name: `${type} ${suffix}`,
    },
  });
  return { response, id: response.ok() ? ((await response.json()) as { id: string }).id : '' };
}

async function receive(
  context: APIRequestContext,
  headers: Record<string, string>,
  variantId: string,
  locationId: string,
  quantity: string,
  key: string,
  unitCost = '25',
) {
  return context.post(`/v1/organizations/${tenant}/inventory/movements`, {
    headers,
    data: {
      variantId,
      locationId,
      type: 'PURCHASE',
      state: 'ON_HAND',
      quantity,
      unitCost,
      currency: 'MXN',
      reason: 'Operational receiving certification',
      occurredAt: new Date().toISOString(),
      idempotencyKey: key,
    },
  });
}

function sql(statement: string) {
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
      '-Atq',
      '-v',
      'ON_ERROR_STOP=1',
      '-c',
      statement,
    ],
    { encoding: 'utf8' },
  );
  expect(result.status, result.stderr).toBe(0);
  return result.stdout.trim();
}

test.describe.serial('Inventory operational readiness', () => {
  test('accepts exactly one of ten concurrent receiving retries', async () => {
    const owner = await login('alpha.owner@nexo.local');
    const p = await product(owner.context, owner.headers);
    const warehouse = await location(owner.context, owner.headers, p.stamp, 'RACE');
    expect(warehouse.response.status()).toBe(201);
    const key = `receive-race-${p.stamp}`;
    const attempts = await Promise.all(
      Array.from({ length: 10 }, () =>
        receive(owner.context, owner.headers, p.variantId, warehouse.id, '5', key, '11'),
      ),
    );
    const statuses = attempts.map((response) => response.status());
    expect(statuses.filter((status) => status === 201)).toHaveLength(1);
    expect(statuses.filter((status) => status === 409)).toHaveLength(9);
    expect(
      sql(
        `select (select count(*) from inventory_movements where idempotency_key='${key}')||':'||(select count(*) from inventory_cost_layers where variant_id='${p.variantId}')||':'||(select count(*) from inventory_snapshots where variant_id='${p.variantId}')||':'||(select count(*) from inventory_events where event_type='StockReceived' and payload->>'variantId'='${p.variantId}')`,
      ),
    ).toBe('1:1:1:1');
    expect(
      await (
        await owner.context.get(
          `/v1/organizations/${tenant}/inventory/availability?variantId=${p.variantId}&locationId=${warehouse.id}`,
        )
      ).json(),
    ).toMatchObject({ onHand: '5', available: '5' });
  });

  test('serializes ten independent receipts without losing quantities or cost layers', async () => {
    const owner = await login('alpha.owner@nexo.local');
    const p = await product(owner.context, owner.headers);
    const warehouse = await location(owner.context, owner.headers, p.stamp, 'TEN');
    const attempts = await Promise.all(
      Array.from({ length: 10 }, (_, index) =>
        receive(
          owner.context,
          owner.headers,
          p.variantId,
          warehouse.id,
          '1.25',
          `receive-${p.stamp}-${index}`,
          String(10 + index),
        ),
      ),
    );
    expect(attempts.every((response) => response.status() === 201)).toBe(true);
    expect(
      await (
        await owner.context.get(
          `/v1/organizations/${tenant}/inventory/availability?variantId=${p.variantId}&locationId=${warehouse.id}`,
        )
      ).json(),
    ).toMatchObject({ onHand: '12.5', available: '12.5' });
    expect(
      sql(
        `select count(*)||':'||sum(original_quantity)::text||':'||sum(remaining_quantity)::text from inventory_cost_layers where variant_id='${p.variantId}'`,
      ),
    ).toBe('10:12.500000:12.500000');
  });

  test('rejects invalid, service, cross-tenant and unauthorized receipts', async () => {
    const owner = await login('alpha.owner@nexo.local');
    const readonly = await login('alpha.readonly@nexo.local');
    const physical = await product(owner.context, owner.headers);
    const service = await product(owner.context, owner.headers, 'SERVICE');
    const warehouse = await location(owner.context, owner.headers, physical.stamp, 'DENY');
    for (const [variantId, quantity] of [
      [physical.variantId, '0'],
      [physical.variantId, '-1'],
      [physical.variantId, '1.0000001'],
      [service.variantId, '1'],
    ])
      expect(
        (
          await receive(
            owner.context,
            owner.headers,
            variantId!,
            warehouse.id,
            quantity!,
            `invalid-${physical.stamp}-${quantity}-${variantId}`,
          )
        ).status(),
      ).toBe(400);
    expect(
      (
        await receive(
          readonly.context,
          readonly.headers,
          physical.variantId,
          warehouse.id,
          '1',
          `readonly-${physical.stamp}`,
        )
      ).status(),
    ).toBe(403);
    expect(
      (
        await owner.context.post(`/v1/organizations/${betaTenant}/inventory/movements`, {
          headers: owner.headers,
          data: {
            variantId: physical.variantId,
            locationId: warehouse.id,
            type: 'PURCHASE',
            state: 'ON_HAND',
            quantity: '1',
            unitCost: '1',
            currency: 'MXN',
            reason: 'Cross tenant receiving probe',
            occurredAt: new Date().toISOString(),
            idempotencyKey: `cross-${physical.stamp}`,
          },
        })
      ).status(),
    ).toBe(403);
  });

  test('keeps receiving cost separate from catalog sale price', async () => {
    const owner = await login('alpha.owner@nexo.local');
    const p = await product(owner.context, owner.headers);
    const warehouse = await location(owner.context, owner.headers, p.stamp, 'VALUE');
    expect(
      (
        await owner.context.post(`/v1/organizations/${tenant}/products/${p.id}/prices`, {
          headers: owner.headers,
          data: {
            variantId: p.variantId,
            amount: '99.00',
            currency: 'MXN',
            taxProfileKey: 'MX_STANDARD',
          },
        })
      ).status(),
    ).toBe(201);
    expect(
      (
        await receive(
          owner.context,
          owner.headers,
          p.variantId,
          warehouse.id,
          '3',
          `valuation-${p.stamp}`,
          '37',
        )
      ).status(),
    ).toBe(201);
    expect(
      sql(
        `select (select amount::text from product_prices where variant_id='${p.variantId}' and active=true)||':'||(select unit_cost::text from inventory_cost_layers where variant_id='${p.variantId}')`,
      ),
    ).toBe('99.000000:37.000000');
  });

  test('supports an authoritative warehouse-zone-shelf-bin hierarchy and isolated balances', async () => {
    const owner = await login('alpha.owner@nexo.local');
    const p = await product(owner.context, owner.headers);
    const warehouse = await location(owner.context, owner.headers, p.stamp, 'W');
    const zone = await location(owner.context, owner.headers, p.stamp, 'Z', 'ZONE', warehouse.id);
    const shelf = await location(owner.context, owner.headers, p.stamp, 'S', 'SHELF', zone.id);
    const bin = await location(owner.context, owner.headers, p.stamp, 'B', 'BIN', shelf.id);
    for (const created of [warehouse, zone, shelf, bin])
      expect(created.response.status()).toBe(201);
    await receive(
      owner.context,
      owner.headers,
      p.variantId,
      warehouse.id,
      '2',
      `multi-w-${p.stamp}`,
    );
    await receive(owner.context, owner.headers, p.variantId, bin.id, '3', `multi-b-${p.stamp}`);
    const balances = await Promise.all(
      [warehouse.id, zone.id, shelf.id, bin.id].map(async (locationId) =>
        (
          await owner.context.get(
            `/v1/organizations/${tenant}/inventory/availability?variantId=${p.variantId}&locationId=${locationId}`,
          )
        ).json(),
      ),
    );
    expect(balances.map((value) => (value as { onHand: string }).onHand)).toEqual([
      '2',
      '0',
      '0',
      '3',
    ]);
  });

  test('keeps suppliers, purchase orders, receiving aggregates and reorder APIs closed', async () => {
    const owner = await login('alpha.owner@nexo.local');
    for (const path of [
      'suppliers',
      'supplier-products',
      'purchase-orders',
      'receipts',
      'receiving',
      'reorder-suggestions',
    ])
      expect(
        (
          await owner.context.post(`/v1/organizations/${tenant}/${path}`, {
            headers: owner.headers,
            data: {},
          })
        ).status(),
      ).toBe(404);
  });
});
