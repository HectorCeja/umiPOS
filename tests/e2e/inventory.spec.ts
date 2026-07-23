import { expect, request, test, type APIRequestContext } from '@playwright/test';
const password = process.env.TEST_PERSONA_PASSWORD ?? 'Nexo Test Persona 2026!';
async function login(email: string) {
  const context = await request.newContext({
    baseURL: 'http://127.0.0.1:3001',
    extraHTTPHeaders: { origin: 'http://localhost:3000' },
  });
  const response = await context.post('/v1/auth/login', {
    data: {
      email,
      password,
      deviceFingerprint: `inventory-${email}`,
      deviceName: 'Inventory E2E',
    },
  });
  expect(response.status()).toBe(200);
  const state = await context.storageState();
  return { context, csrf: state.cookies.find((x) => x.name === 'nexo_csrf')!.value };
}
const h = (csrf: string) => ({ origin: 'http://localhost:3000', 'x-csrf-token': csrf });
test.describe.serial('Inventory ledger with real PostgreSQL', () => {
  const tenant = '10000000-0000-4000-8000-000000000001',
    betaTenant = '10000000-0000-4000-8000-000000000002',
    branch = '20000000-0000-4000-8000-000000000001';
  let owner: APIRequestContext,
    beta: APIRequestContext,
    csrf: string,
    variantId: string,
    warehouseA: string,
    warehouseB: string,
    reservationId: string,
    transferId: string;
  const key = Date.now();
  test('receives stock through immutable ledger', async () => {
    ({ context: owner, csrf } = await login('alpha.owner@nexo.local'));
    ({ context: beta } = await login('beta.owner@nexo.local'));
    const product = await owner.post(`/v1/organizations/${tenant}/products`, {
      headers: h(csrf),
      data: { name: 'Inventory E2E', sku: `INV-${key}`, type: 'PHYSICAL' },
    });
    expect(product.status()).toBe(201);
    const id = ((await product.json()) as { id: string }).id;
    const detail = await owner.get(`/v1/organizations/${tenant}/products/${id}`);
    variantId = ((await detail.json()) as { variants: { id: string }[] }).variants[0]!.id;
    const a = await owner.post(`/v1/organizations/${tenant}/inventory/locations`, {
      headers: h(csrf),
      data: { branchId: branch, type: 'WAREHOUSE', code: `WA-${key}`, name: 'Warehouse A' },
    });
    expect(a.status()).toBe(201);
    warehouseA = ((await a.json()) as { id: string }).id;
    const b = await owner.post(`/v1/organizations/${tenant}/inventory/locations`, {
      headers: h(csrf),
      data: { branchId: branch, type: 'WAREHOUSE', code: `WB-${key}`, name: 'Warehouse B' },
    });
    warehouseB = ((await b.json()) as { id: string }).id;
    expect(
      (
        await owner.put(`/v1/organizations/${tenant}/inventory/policies`, {
          headers: h(csrf),
          data: { variantId, allowNegative: false, costMethod: 'FIFO' },
        })
      ).status(),
    ).toBe(200);
    expect(
      (
        await owner.post(`/v1/organizations/${tenant}/inventory/movements`, {
          headers: h(csrf),
          data: {
            variantId,
            locationId: warehouseA,
            type: 'PURCHASE',
            state: 'ON_HAND',
            quantity: '10',
            unitCost: '12.50',
            currency: 'MXN',
            reason: 'Initial receipt',
            occurredAt: new Date().toISOString(),
            idempotencyKey: `receive-${key}`,
          },
        })
      ).status(),
    ).toBe(201);
    expect(await availability(warehouseA)).toMatchObject({ onHand: '10', available: '10' });
  });
  test('reserves, releases and rejects over-reservation', async () => {
    const reservation = await owner.post(`/v1/organizations/${tenant}/inventory/reservations`, {
      headers: h(csrf),
      data: {
        variantId,
        locationId: warehouseA,
        quantity: '3',
        sourceType: 'POS_CART',
        sourceId: `cart-${key}`,
        expiresAt: new Date(Date.now() + 60000).toISOString(),
        idempotencyKey: `reserve-${key}`,
      },
    });
    expect(reservation.status()).toBe(201);
    reservationId = ((await reservation.json()) as { id: string }).id;
    expect(await availability(warehouseA)).toMatchObject({ reserved: '3', available: '7' });
    expect(
      (
        await owner.post(`/v1/organizations/${tenant}/inventory/reservations`, {
          headers: h(csrf),
          data: {
            variantId,
            locationId: warehouseA,
            quantity: '8',
            sourceType: 'POS_CART',
            sourceId: `cart-over-${key}`,
            expiresAt: new Date(Date.now() + 60000).toISOString(),
            idempotencyKey: `reserve-over-${key}`,
          },
        })
      ).status(),
    ).toBe(409);
    expect(
      (
        await owner.post(
          `/v1/organizations/${tenant}/inventory/reservations/${reservationId}/release`,
          {
            headers: h(csrf),
            data: { reason: 'Cart cancelled', idempotencyKey: `release-${key}` },
          },
        )
      ).status(),
    ).toBe(201);
    expect(await availability(warehouseA)).toMatchObject({ reserved: '0', available: '10' });
  });
  test('expires reservations and releases their ledger allocation', async () => {
    const response = await owner.post(`/v1/organizations/${tenant}/inventory/reservations`, {
      headers: h(csrf),
      data: {
        variantId,
        locationId: warehouseA,
        quantity: '1',
        sourceType: 'POS_CART',
        sourceId: `cart-expiry-${key}`,
        expiresAt: new Date(Date.now() + 1_000).toISOString(),
        idempotencyKey: `reserve-expiry-${key}`,
      },
    });
    expect(response.status()).toBe(201);
    await expect
      .poll(async () => (await availability(warehouseA)).reserved, { timeout: 10_000 })
      .toBe('0');
  });
  test('transfers with in-transit state, completes and counts by correction', async () => {
    const transfer = await owner.post(`/v1/organizations/${tenant}/inventory/transfers`, {
      headers: h(csrf),
      data: {
        variantId,
        fromLocationId: warehouseA,
        toLocationId: warehouseB,
        quantity: '4',
        idempotencyKey: `transfer-${key}`,
      },
    });
    expect(transfer.status()).toBe(201);
    transferId = ((await transfer.json()) as { id: string }).id;
    expect(await availability(warehouseB)).toMatchObject({ onHand: '0', inTransit: '4' });
    expect(
      (
        await owner.post(`/v1/organizations/${tenant}/inventory/transfers/${transferId}/complete`, {
          headers: h(csrf),
          data: { idempotencyKey: `complete-${key}` },
        })
      ).status(),
    ).toBe(201);
    expect(await availability(warehouseB)).toMatchObject({ onHand: '4', inTransit: '0' });
    expect(
      (
        await owner.post(`/v1/organizations/${tenant}/inventory/counts`, {
          headers: h(csrf),
          data: {
            variantId,
            locationId: warehouseB,
            countedQuantity: '3',
            reason: 'Cycle count',
            idempotencyKey: `count-${key}`,
          },
        })
      ).status(),
    ).toBe(201);
    expect(await availability(warehouseB)).toMatchObject({ onHand: '3' });
  });
  test('keeps Tenant B outside Tenant A inventory', async () => {
    expect(
      (
        await beta.get(
          `/v1/organizations/${betaTenant}/inventory/availability?variantId=${variantId}&locationId=${warehouseA}`,
        )
      ).status(),
    ).toBe(400);
  });
  async function availability(locationId: string) {
    const response = await owner.get(
      `/v1/organizations/${tenant}/inventory/availability?variantId=${variantId}&locationId=${locationId}`,
    );
    expect(response.status()).toBe(200);
    return response.json() as Promise<Record<string, string>>;
  }
});
