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
      deviceFingerprint: `inventory-recovery-${email}-${Date.now()}`,
      deviceName: 'Inventory Recovery Certification',
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

async function fixture(
  context: APIRequestContext,
  headers: Record<string, string>,
  type = 'PHYSICAL',
) {
  const stamp = `${Date.now()}-${Math.floor(Math.random() * 1_000_000)}`;
  const product = await context.post(`/v1/organizations/${tenant}/products`, {
    headers,
    data: { name: `Recovery ${stamp}`, sku: `REC-${stamp}`, type },
  });
  expect(product.status()).toBe(201);
  const productId = ((await product.json()) as { id: string }).id;
  const detail = (await (
    await context.get(`/v1/organizations/${tenant}/products/${productId}`)
  ).json()) as { variants: { id: string }[] };
  const location = await context.post(`/v1/organizations/${tenant}/inventory/locations`, {
    headers,
    data: {
      branchId: branch,
      type: 'WAREHOUSE',
      code: `REC-${stamp}`,
      name: `Recovery ${stamp}`,
    },
  });
  expect(location.status()).toBe(201);
  return {
    stamp,
    productId,
    variantId: detail.variants[0]!.id,
    locationId: ((await location.json()) as { id: string }).id,
  };
}

async function receive(
  context: APIRequestContext,
  headers: Record<string, string>,
  variantId: string,
  locationId: string,
  quantity: string,
  key: string,
) {
  return context.post(`/v1/organizations/${tenant}/inventory/movements`, {
    headers,
    data: {
      variantId,
      locationId,
      type: 'PURCHASE',
      state: 'ON_HAND',
      quantity,
      unitCost: '10',
      currency: 'MXN',
      reason: 'Recovery certification receipt',
      occurredAt: new Date().toISOString(),
      idempotencyKey: key,
    },
  });
}

function sql(statement: string, expectSuccess = true) {
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
  if (expectSuccess) expect(result.status, result.stderr).toBe(0);
  else expect(result.status).not.toBe(0);
  return result.stdout.trim();
}

test.describe.serial('Inventory count, reconciliation and recovery integrity', () => {
  test('reconciles a physical count once and makes ten retries deterministic', async () => {
    const owner = await login('alpha.owner@nexo.local');
    const f = await fixture(owner.context, owner.headers);
    expect(
      (
        await receive(owner.context, owner.headers, f.variantId, f.locationId, '5', `r-${f.stamp}`)
      ).status(),
    ).toBe(201);
    const data = {
      variantId: f.variantId,
      locationId: f.locationId,
      countedQuantity: '3',
      reason: 'Blind physical observation',
      idempotencyKey: `count-${f.stamp}`,
    };
    const attempts = await Promise.all(
      Array.from({ length: 10 }, () =>
        owner.context.post(`/v1/organizations/${tenant}/inventory/counts`, {
          headers: owner.headers,
          data,
        }),
      ),
    );
    expect(attempts.every((response) => response.status() === 201)).toBe(true);
    const bodies = await Promise.all(attempts.map((response) => response.json()));
    for (const body of bodies) expect(body).toEqual(bodies[0]);
    expect(bodies[0]).toMatchObject({ onHand: '5', counted: '3', difference: '-2' });
    expect(
      sql(
        `select (select count(*) from inventory_counts where idempotency_key='${data.idempotencyKey}')||':'||(select count(*) from inventory_movements where idempotency_key='${data.idempotencyKey}')||':'||(select count(*) from inventory_events where event_type='InventoryCounted' and payload->>'variantId'='${f.variantId}')`,
      ),
    ).toBe('1:1:1');
    const availability = await owner.context.get(
      `/v1/organizations/${tenant}/inventory/availability?variantId=${f.variantId}&locationId=${f.locationId}`,
    );
    expect(await availability.json()).toMatchObject({ onHand: '3' });
    expect(
      (
        await owner.context.post(`/v1/organizations/${tenant}/inventory/counts`, {
          headers: owner.headers,
          data: { ...data, countedQuantity: '4' },
        })
      ).status(),
    ).toBe(409);
  });

  test('persists zero-difference count evidence without creating stock', async () => {
    const owner = await login('alpha.owner@nexo.local');
    const f = await fixture(owner.context, owner.headers);
    await receive(
      owner.context,
      owner.headers,
      f.variantId,
      f.locationId,
      '2',
      `zero-r-${f.stamp}`,
    );
    const key = `zero-count-${f.stamp}`;
    const response = await owner.context.post(`/v1/organizations/${tenant}/inventory/counts`, {
      headers: owner.headers,
      data: {
        variantId: f.variantId,
        locationId: f.locationId,
        countedQuantity: '2',
        reason: 'No variance observed',
        idempotencyKey: key,
      },
    });
    expect(response.status()).toBe(201);
    expect(await response.json()).toMatchObject({ counted: '2', difference: '0' });
    expect(
      sql(
        `select (select count(*) from inventory_counts where idempotency_key='${key}')||':'||(select count(*) from inventory_movements where idempotency_key='${key}')`,
      ),
    ).toBe('1:0');
  });

  test('serializes ten independent observations to one final physical balance', async () => {
    const owner = await login('alpha.owner@nexo.local');
    const f = await fixture(owner.context, owner.headers);
    await receive(
      owner.context,
      owner.headers,
      f.variantId,
      f.locationId,
      '4',
      `race-r-${f.stamp}`,
    );
    const attempts = await Promise.all(
      Array.from({ length: 10 }, (_, index) =>
        owner.context.post(`/v1/organizations/${tenant}/inventory/counts`, {
          headers: owner.headers,
          data: {
            variantId: f.variantId,
            locationId: f.locationId,
            countedQuantity: '7',
            reason: `Independent observation ${index}`,
            idempotencyKey: `race-count-${f.stamp}-${index}`,
          },
        }),
      ),
    );
    expect(attempts.every((response) => response.status() === 201)).toBe(true);
    expect(
      await (
        await owner.context.get(
          `/v1/organizations/${tenant}/inventory/availability?variantId=${f.variantId}&locationId=${f.locationId}`,
        )
      ).json(),
    ).toMatchObject({ onHand: '7' });
    expect(sql(`select count(*) from inventory_counts where variant_id='${f.variantId}'`)).toBe(
      '10',
    );
    expect(
      sql(
        `select count(*) from inventory_movements where variant_id='${f.variantId}' and type='COUNT'`,
      ),
    ).toBe('1');
  });

  test('rejects invalid, non-inventory, cross-tenant and unauthorized counts', async () => {
    const owner = await login('alpha.owner@nexo.local');
    const readonly = await login('alpha.readonly@nexo.local');
    const f = await fixture(owner.context, owner.headers);
    const service = await fixture(owner.context, owner.headers, 'SERVICE');
    const base = {
      variantId: f.variantId,
      locationId: f.locationId,
      countedQuantity: '1',
      reason: 'Authorization probe',
      idempotencyKey: `probe-${f.stamp}`,
    };
    for (const data of [
      { ...base, countedQuantity: '-1' },
      { ...base, countedQuantity: '1.0000001' },
      { ...base, variantId: service.variantId },
    ])
      expect(
        (
          await owner.context.post(`/v1/organizations/${tenant}/inventory/counts`, {
            headers: owner.headers,
            data,
          })
        ).status(),
      ).toBe(400);
    expect(
      (
        await readonly.context.post(`/v1/organizations/${tenant}/inventory/counts`, {
          headers: readonly.headers,
          data: base,
        })
      ).status(),
    ).toBe(403);
    expect(
      (
        await owner.context.post(`/v1/organizations/${betaTenant}/inventory/counts`, {
          headers: owner.headers,
          data: base,
        })
      ).status(),
    ).toBe(403);
  });

  test('reconstructs the latest balance from ledger and immutable snapshot evidence', async () => {
    const owner = await login('alpha.owner@nexo.local');
    const f = await fixture(owner.context, owner.headers);
    await receive(
      owner.context,
      owner.headers,
      f.variantId,
      f.locationId,
      '9',
      `rebuild-r-${f.stamp}`,
    );
    await owner.context.post(`/v1/organizations/${tenant}/inventory/counts`, {
      headers: owner.headers,
      data: {
        variantId: f.variantId,
        locationId: f.locationId,
        countedQuantity: '6',
        reason: 'Reconstruction fixture',
        idempotencyKey: `rebuild-c-${f.stamp}`,
      },
    });
    const reconstructed = sql(
      `select coalesce(sum(quantity) filter(where state='ON_HAND'),0)::text from inventory_movements where variant_id='${f.variantId}' and location_id='${f.locationId}'`,
    );
    const snapshot = sql(
      `select balances->>'onHand' from inventory_snapshots where variant_id='${f.variantId}' and location_id='${f.locationId}' order by created_at desc,id desc limit 1`,
    );
    expect(reconstructed).toBe('6.000000');
    expect(snapshot).toBe('6');
    const countId = sql(
      `select id from inventory_counts where idempotency_key='rebuild-c-${f.stamp}'`,
    );
    const snapshotId = sql(
      `select id from inventory_snapshots where variant_id='${f.variantId}' and location_id='${f.locationId}' order by created_at desc,id desc limit 1`,
    );
    sql(`delete from inventory_counts where id='${countId}'`, false);
    sql(`delete from inventory_snapshots where id='${snapshotId}'`, false);
    sql(`update inventory_movements set quantity=999 where variant_id='${f.variantId}'`, false);
  });

  test('keeps unimplemented session, blind-count and recovery surfaces closed', async () => {
    const owner = await login('alpha.owner@nexo.local');
    for (const path of ['count-sessions', 'blind-counts', 'recovery', 'snapshots/rebuild'])
      expect(
        (
          await owner.context.post(`/v1/organizations/${tenant}/inventory/${path}`, {
            headers: owner.headers,
            data: {},
          })
        ).status(),
      ).toBe(404);
  });
});
