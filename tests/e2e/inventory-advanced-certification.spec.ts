import { expect, request, test, type APIRequestContext } from '@playwright/test';
import { spawnSync } from 'node:child_process';

const password = process.env.TEST_PERSONA_PASSWORD ?? 'Nexo Test Persona 2026!';
const tenant = '10000000-0000-4000-8000-000000000001';
const betaTenant = '10000000-0000-4000-8000-000000000002';
const branch = '20000000-0000-4000-8000-000000000001';

async function login(email = 'alpha.owner@nexo.local') {
  const context = await request.newContext({
    baseURL: 'http://127.0.0.1:3001',
    extraHTTPHeaders: { origin: 'http://localhost:3000' },
  });
  const response = await context.post('/v1/auth/login', {
    data: {
      email,
      password,
      deviceFingerprint: `inventory-advanced-${email}-${Date.now()}`,
      deviceName: 'Inventory Advanced Certification',
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

async function fixture(context: APIRequestContext, headers: Record<string, string>, label: string) {
  const stamp = `${Date.now()}-${Math.floor(Math.random() * 1_000_000)}`;
  const productResponse = await context.post(`/v1/organizations/${tenant}/products`, {
    headers,
    data: { name: `${label} ${stamp}`, sku: `ADV-${stamp}`, type: 'PHYSICAL' },
  });
  expect(productResponse.status()).toBe(201);
  const product = (await productResponse.json()) as { id: string };
  const detail = (await (
    await context.get(`/v1/organizations/${tenant}/products/${product.id}`)
  ).json()) as { version: number; variants: { id: string }[] };
  const location = async (suffix: string) => {
    const response = await context.post(`/v1/organizations/${tenant}/inventory/locations`, {
      headers,
      data: {
        branchId: branch,
        type: 'WAREHOUSE',
        code: `ADV-${suffix}-${stamp}`,
        name: `${label} ${suffix}`,
      },
    });
    expect(response.status()).toBe(201);
    return ((await response.json()) as { id: string }).id;
  };
  return {
    productId: product.id,
    productVersion: detail.version,
    variantId: detail.variants[0]!.id,
    from: await location('FROM'),
    to: await location('TO'),
    stamp,
  };
}

async function movement(
  context: APIRequestContext,
  headers: Record<string, string>,
  variantId: string,
  locationId: string,
  quantity: string,
  key: string,
  unitCost?: string,
  currency = 'MXN',
  type = 'PURCHASE',
) {
  return context.post(`/v1/organizations/${tenant}/inventory/movements`, {
    headers,
    data: {
      variantId,
      locationId,
      type,
      state: 'ON_HAND',
      quantity,
      ...(unitCost ? { unitCost, currency } : {}),
      reason: 'Advanced Inventory certification',
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

test.describe.serial('Advanced Inventory consistency', () => {
  test('serializes ten reservations and rejects invalid lifecycle inputs', async () => {
    const owner = await login();
    const f = await fixture(owner.context, owner.headers, 'Reservation race');
    expect(
      (
        await owner.context.put(`/v1/organizations/${tenant}/inventory/policies`, {
          headers: owner.headers,
          data: { variantId: f.variantId, allowNegative: false, costMethod: 'FIFO' },
        })
      ).status(),
    ).toBe(200);
    expect(
      (
        await movement(owner.context, owner.headers, f.variantId, f.from, '10', `r-${f.stamp}`, '2')
      ).status(),
    ).toBe(201);
    const attempts = await Promise.all(
      Array.from({ length: 10 }, (_, index) =>
        owner.context.post(`/v1/organizations/${tenant}/inventory/reservations`, {
          headers: owner.headers,
          data: {
            variantId: f.variantId,
            locationId: f.from,
            quantity: '2',
            sourceType: 'CERTIFICATION',
            sourceId: `race-${f.stamp}-${index}`,
            expiresAt: new Date(Date.now() + 600_000).toISOString(),
            idempotencyKey: `reserve-${f.stamp}-${index}`,
          },
        }),
      ),
    );
    expect(attempts.filter((response) => response.status() === 201)).toHaveLength(5);
    expect(attempts.filter((response) => response.status() === 409)).toHaveLength(5);
    const balance = await owner.context.get(
      `/v1/organizations/${tenant}/inventory/availability?variantId=${f.variantId}&locationId=${f.from}`,
    );
    expect(await balance.json()).toMatchObject({ onHand: '10', reserved: '10', available: '0' });
    const expired = await owner.context.post(`/v1/organizations/${tenant}/inventory/reservations`, {
      headers: owner.headers,
      data: {
        variantId: f.variantId,
        locationId: f.from,
        quantity: '1',
        sourceType: 'CERTIFICATION',
        sourceId: `past-${f.stamp}`,
        expiresAt: new Date(Date.now() - 1_000).toISOString(),
        idempotencyKey: `past-reservation-${f.stamp}`,
      },
    });
    expect(expired.status()).toBe(400);
    const unsupported = await owner.context.put(`/v1/organizations/${tenant}/inventory/policies`, {
      headers: owner.headers,
      data: { variantId: f.variantId, allowNegative: false, costMethod: 'WEIGHTED_AVERAGE' },
    });
    expect(unsupported.status()).toBe(400);
  });

  test('makes concurrent release single-winner and replay-safe', async () => {
    const owner = await login();
    const f = await fixture(owner.context, owner.headers, 'Release race');
    expect(
      (
        await movement(owner.context, owner.headers, f.variantId, f.from, '5', `rr-${f.stamp}`)
      ).status(),
    ).toBe(201);
    const created = await owner.context.post(`/v1/organizations/${tenant}/inventory/reservations`, {
      headers: owner.headers,
      data: {
        variantId: f.variantId,
        locationId: f.from,
        quantity: '5',
        sourceType: 'CERTIFICATION',
        sourceId: `release-${f.stamp}`,
        expiresAt: new Date(Date.now() + 600_000).toISOString(),
        idempotencyKey: `release-create-${f.stamp}`,
      },
    });
    const reservation = (await created.json()) as { id: string };
    const releases = await Promise.all(
      Array.from({ length: 10 }, (_, index) =>
        owner.context.post(
          `/v1/organizations/${tenant}/inventory/reservations/${reservation.id}/release`,
          {
            headers: owner.headers,
            data: { reason: 'Concurrent release', idempotencyKey: `release-${f.stamp}-${index}` },
          },
        ),
      ),
    );
    expect(releases.filter((response) => response.status() === 201)).toHaveLength(1);
    expect(releases.filter((response) => [404, 409].includes(response.status()))).toHaveLength(9);
    const balance = await owner.context.get(
      `/v1/organizations/${tenant}/inventory/availability?variantId=${f.variantId}&locationId=${f.from}`,
    );
    expect(await balance.json()).toMatchObject({ onHand: '5', reserved: '0', available: '5' });
    expect(
      sql(
        `SELECT count(*) FROM inventory_movements WHERE tenant_id='${tenant}' AND reference_type='RESERVATION' AND reference_id='${reservation.id}' AND type='RESERVATION_RELEASE'`,
      ),
    ).toBe('1');
  });

  test('expires a reservation once and writes matching snapshot/event/outbox', async () => {
    test.setTimeout(30_000);
    const owner = await login();
    const f = await fixture(owner.context, owner.headers, 'Expiry');
    expect(
      (
        await movement(owner.context, owner.headers, f.variantId, f.from, '3', `ex-${f.stamp}`)
      ).status(),
    ).toBe(201);
    const created = await owner.context.post(`/v1/organizations/${tenant}/inventory/reservations`, {
      headers: owner.headers,
      data: {
        variantId: f.variantId,
        locationId: f.from,
        quantity: '2',
        sourceType: 'CERTIFICATION',
        sourceId: `expiry-${f.stamp}`,
        expiresAt: new Date(Date.now() + 1_500).toISOString(),
        idempotencyKey: `expiry-create-${f.stamp}`,
      },
    });
    expect(created.status()).toBe(201);
    const reservation = (await created.json()) as { id: string };
    await expect
      .poll(
        () =>
          sql(
            `SELECT status::text FROM inventory_reservations WHERE tenant_id='${tenant}' AND id='${reservation.id}'`,
          ),
        { timeout: 20_000 },
      )
      .toBe('EXPIRED');
    expect(
      sql(
        `SELECT count(*) FROM inventory_movements m JOIN inventory_snapshots s ON s.tenant_id=m.tenant_id AND s.through_movement_id=m.id WHERE m.tenant_id='${tenant}' AND m.reference_id='${reservation.id}' AND m.idempotency_key='reservation-expiry:${reservation.id}'`,
      ),
    ).toBe('1');
    expect(
      sql(
        `SELECT count(*) FROM inventory_events WHERE tenant_id='${tenant}' AND aggregate_id='${reservation.id}' AND event_type='ReservationReleased'`,
      ),
    ).toBe('1');
  });

  test('allows exactly one of ten concurrent transfer receipts', async () => {
    const owner = await login();
    const f = await fixture(owner.context, owner.headers, 'Transfer race');
    expect(
      (
        await movement(owner.context, owner.headers, f.variantId, f.from, '5', `tr-${f.stamp}`)
      ).status(),
    ).toBe(201);
    const dispatched = await owner.context.post(`/v1/organizations/${tenant}/inventory/transfers`, {
      headers: owner.headers,
      data: {
        variantId: f.variantId,
        fromLocationId: f.from,
        toLocationId: f.to,
        quantity: '5',
        idempotencyKey: `transfer-${f.stamp}`,
      },
    });
    expect(dispatched.status()).toBe(201);
    const transfer = (await dispatched.json()) as { id: string };
    const receipts = await Promise.all(
      Array.from({ length: 10 }, (_, index) =>
        owner.context.post(
          `/v1/organizations/${tenant}/inventory/transfers/${transfer.id}/complete`,
          { headers: owner.headers, data: { idempotencyKey: `complete-${f.stamp}-${index}` } },
        ),
      ),
    );
    expect(receipts.filter((response) => response.status() === 201)).toHaveLength(1);
    expect(receipts.filter((response) => [404, 409].includes(response.status()))).toHaveLength(9);
    const from = await (
      await owner.context.get(
        `/v1/organizations/${tenant}/inventory/availability?variantId=${f.variantId}&locationId=${f.from}`,
      )
    ).json();
    const to = await (
      await owner.context.get(
        `/v1/organizations/${tenant}/inventory/availability?variantId=${f.variantId}&locationId=${f.to}`,
      )
    ).json();
    expect(from).toMatchObject({ onHand: '0', available: '0' });
    expect(to).toMatchObject({ onHand: '5', inTransit: '0', available: '5' });
    expect(
      sql(
        `SELECT count(*) FROM inventory_events WHERE tenant_id='${tenant}' AND aggregate_id='${transfer.id}' AND event_type IN ('TransferCreated','TransferCompleted')`,
      ),
    ).toBe('2');
  });

  test('consumes FIFO layers exactly, records total cost and rejects replay/currency mismatch', async () => {
    const owner = await login();
    const f = await fixture(owner.context, owner.headers, 'FIFO');
    expect(
      (
        await owner.context.put(`/v1/organizations/${tenant}/inventory/policies`, {
          headers: owner.headers,
          data: { variantId: f.variantId, allowNegative: false, costMethod: 'FIFO' },
        })
      ).status(),
    ).toBe(200);
    expect(
      (
        await movement(
          owner.context,
          owner.headers,
          f.variantId,
          f.from,
          '2',
          `fifo-a-${f.stamp}`,
          '10',
        )
      ).status(),
    ).toBe(201);
    expect(
      (
        await movement(
          owner.context,
          owner.headers,
          f.variantId,
          f.from,
          '3',
          `fifo-b-${f.stamp}`,
          '12',
        )
      ).status(),
    ).toBe(201);
    const issue = await movement(
      owner.context,
      owner.headers,
      f.variantId,
      f.from,
      '-4',
      `fifo-issue-${f.stamp}`,
      undefined,
      'MXN',
      'CONSUMPTION',
    );
    expect(issue.status()).toBe(201);
    const issueId = ((await issue.json()) as { id: string }).id;
    expect(
      sql(
        `SELECT total_cost::text FROM inventory_movements WHERE tenant_id='${tenant}' AND id='${issueId}'`,
      ),
    ).toBe('44.000000');
    expect(
      sql(
        `SELECT string_agg(remaining_quantity::text,',' ORDER BY received_at,id) FROM inventory_cost_layers WHERE tenant_id='${tenant}' AND variant_id='${f.variantId}' AND location_id='${f.from}'`,
      ),
    ).toBe('0.000000,1.000000');
    const replay = await movement(
      owner.context,
      owner.headers,
      f.variantId,
      f.from,
      '-4',
      `fifo-issue-${f.stamp}`,
      undefined,
      'MXN',
      'CONSUMPTION',
    );
    expect(replay.status()).toBe(409);
    const currencyMismatch = await movement(
      owner.context,
      owner.headers,
      f.variantId,
      f.from,
      '1',
      `fifo-usd-${f.stamp}`,
      '10',
      'USD',
    );
    expect(currencyMismatch.status()).toBe(400);
  });

  test('protects reservation, transfer and cost-layer history from raw mutation', async () => {
    const reservationId = sql(
      `SELECT id FROM inventory_reservations WHERE tenant_id='${tenant}' ORDER BY created_at DESC LIMIT 1`,
    );
    const transferId = sql(
      `SELECT id FROM inventory_transfers WHERE tenant_id='${tenant}' ORDER BY created_at DESC LIMIT 1`,
    );
    const layerId = sql(
      `SELECT id FROM inventory_cost_layers WHERE tenant_id='${tenant}' ORDER BY received_at DESC LIMIT 1`,
    );
    for (const statement of [
      `UPDATE inventory_reservations SET quantity=999 WHERE tenant_id='${tenant}' AND id='${reservationId}'`,
      `DELETE FROM inventory_reservations WHERE tenant_id='${tenant}' AND id='${reservationId}'`,
      `UPDATE inventory_transfers SET quantity=999 WHERE tenant_id='${tenant}' AND id='${transferId}'`,
      `DELETE FROM inventory_transfers WHERE tenant_id='${tenant}' AND id='${transferId}'`,
      `UPDATE inventory_cost_layers SET unit_cost=999 WHERE tenant_id='${tenant}' AND id='${layerId}'`,
      `UPDATE inventory_cost_layers SET remaining_quantity=original_quantity WHERE tenant_id='${tenant}' AND id='${layerId}'`,
      `DELETE FROM inventory_cost_layers WHERE tenant_id='${tenant}' AND id='${layerId}'`,
    ])
      sql(statement, false);
  });

  test('keeps advanced Inventory tenant-bound and mutation denied to ReadOnly', async () => {
    const owner = await login();
    const readonly = await login('alpha.readonly@nexo.local');
    const beta = await login('beta.owner@nexo.local');
    const f = await fixture(owner.context, owner.headers, 'Authorization');
    expect(
      (
        await movement(owner.context, owner.headers, f.variantId, f.from, '2', `auth-${f.stamp}`)
      ).status(),
    ).toBe(201);
    const denied = await readonly.context.post(
      `/v1/organizations/${tenant}/inventory/reservations`,
      {
        headers: readonly.headers,
        data: {
          variantId: f.variantId,
          locationId: f.from,
          quantity: '1',
          sourceType: 'CERTIFICATION',
          sourceId: `readonly-${f.stamp}`,
          expiresAt: new Date(Date.now() + 60_000).toISOString(),
          idempotencyKey: `readonly-${f.stamp}`,
        },
      },
    );
    expect(denied.status()).toBe(403);
    const crossTenant = await beta.context.post(
      `/v1/organizations/${betaTenant}/inventory/transfers`,
      {
        headers: beta.headers,
        data: {
          variantId: f.variantId,
          fromLocationId: f.from,
          toLocationId: f.to,
          quantity: '1',
          idempotencyKey: `cross-tenant-${f.stamp}`,
        },
      },
    );
    expect(crossTenant.status()).toBe(400);
  });
});
