import { expect, request, test, type APIRequestContext } from '@playwright/test';
import { spawnSync } from 'node:child_process';

const password = process.env.TEST_PERSONA_PASSWORD ?? 'Nexo Test Persona 2026!';
const tenant = '10000000-0000-4000-8000-000000000001';
const branch = '20000000-0000-4000-8000-000000000001';

async function login() {
  const context = await request.newContext({
    baseURL: 'http://127.0.0.1:3001',
    extraHTTPHeaders: { origin: 'http://localhost:3000' },
  });
  expect(
    (
      await context.post('/v1/auth/login', {
        data: {
          email: 'alpha.owner@nexo.local',
          password,
          deviceFingerprint: `sales-foundation-${Date.now()}`,
          deviceName: 'Sales Foundation Certification',
        },
      })
    ).status(),
  ).toBe(200);
  const state = await context.storageState();
  return { context, csrf: state.cookies.find(({ name }) => name === 'nexo_csrf')!.value };
}

const headers = (csrf: string, key: string, version?: number) => ({
  origin: 'http://localhost:3000',
  'x-csrf-token': csrf,
  'idempotency-key': key,
  ...(version === undefined ? {} : { 'if-match': String(version) }),
});

test.describe.serial('Sales foundation certification', () => {
  let api: APIRequestContext;
  let csrf: string;
  let physicalVariant: string;
  let serviceVariant: string;
  let location: string;
  const stamp = Date.now();

  test.beforeAll(async () => {
    ({ context: api, csrf } = await login());
    const createProduct = async (type: 'PHYSICAL' | 'SERVICE', name: string) => {
      const created = await api.post(`/v1/organizations/${tenant}/products`, {
        headers: headers(csrf, `sf-product-${type}-${stamp}`),
        data: { name, sku: `SF-${type}-${stamp}`, type },
      });
      expect(created.status()).toBe(201);
      const product = (await created.json()) as { id: string };
      const detail = (await (
        await api.get(`/v1/organizations/${tenant}/products/${product.id}`)
      ).json()) as { version: number; variants: { id: string }[] };
      await api.post(`/v1/organizations/${tenant}/products/${product.id}/prices`, {
        headers: headers(csrf, `sf-price-${type}-${stamp}`),
        data: {
          variantId: detail.variants[0]!.id,
          amount: type === 'PHYSICAL' ? '10.00' : '25.00',
          currency: 'MXN',
          taxProfileKey: 'MX_STANDARD',
        },
      });
      await api.post(`/v1/organizations/${tenant}/products/${product.id}/activate`, {
        headers: headers(csrf, `sf-activate-${type}-${stamp}`),
        data: { version: detail.version },
      });
      return detail.variants[0]!.id;
    };
    physicalVariant = await createProduct('PHYSICAL', 'Sales Foundation Physical');
    serviceVariant = await createProduct('SERVICE', 'Sales Foundation Service');
    const createdLocation = await api.post(`/v1/organizations/${tenant}/inventory/locations`, {
      headers: headers(csrf, `sf-location-${stamp}`),
      data: { branchId: branch, type: 'WAREHOUSE', code: `SF-${stamp}`, name: 'Sales Foundation' },
    });
    expect(createdLocation.status()).toBe(201);
    location = ((await createdLocation.json()) as { id: string }).id;
    await api.put(`/v1/organizations/${tenant}/inventory/policies`, {
      headers: headers(csrf, `sf-policy-${stamp}`),
      data: { variantId: physicalVariant, allowNegative: false, costMethod: 'FIFO' },
    });
    const receipt = await api.post(`/v1/organizations/${tenant}/inventory/movements`, {
      headers: headers(csrf, `sf-receipt-${stamp}`),
      data: {
        variantId: physicalVariant,
        locationId: location,
        type: 'PURCHASE',
        state: 'ON_HAND',
        quantity: '5',
        unitCost: '5.00',
        currency: 'MXN',
        reason: 'Sales foundation last stock',
        occurredAt: new Date().toISOString(),
        idempotencyKey: `sf-stock-${stamp}`,
      },
    });
    expect(receipt.status()).toBe(201);
  });

  const createSale = async (key: string, extra: Record<string, unknown> = {}) => {
    return api.post(`/v1/organizations/${tenant}/sales`, {
      headers: headers(csrf, key),
      data: {
        branchId: branch,
        currency: 'MXN',
        channel: 'WEB_POS',
        businessDate: '2026-07-22',
        ...extra,
      },
    });
  };

  test('rejects authoritative fields and zero or excessive-precision quantities', async () => {
    const forged = await createSale(`sf-forged-${stamp}`, {
      totalMinor: '1',
      status: 'COMPLETED',
      sellerUserId: '20000000-0000-4000-8000-000000000001',
    });
    expect(forged.status()).toBe(400);
    const created = await createSale(`sf-validation-${stamp}`);
    expect(created.status()).toBe(201);
    const sale = (await created.json()) as { id: string; version: number };
    for (const quantity of ['0', '-1', '0.0000001']) {
      const response = await api.post(`/v1/organizations/${tenant}/sales/${sale.id}/items`, {
        headers: headers(csrf, `sf-invalid-${quantity}-${stamp}`, sale.version),
        data: { productVariantId: physicalVariant, quantity },
      });
      expect(response.status(), `quantity ${quantity}`).toBe(400);
    }
  });

  test('recovers one sale from one hundred duplicate requests and an API restart', async () => {
    test.setTimeout(60_000);
    const key = `sf-same-create-${stamp}`;
    const responses = await Promise.all(Array.from({ length: 100 }, () => createSale(key)));
    expect(responses.every((response) => [200, 201, 429].includes(response.status()))).toBe(true);
    const accepted = responses.filter((response) => [200, 201].includes(response.status()));
    expect(accepted.length).toBeGreaterThan(0);
    const ids = new Set(
      await Promise.all(
        accepted.map(async (response) => ((await response.json()) as { id: string }).id),
      ),
    );
    expect(ids.size).toBe(1);
    const originalId = [...ids][0]!;
    const restart = spawnSync('docker', ['compose', 'restart', 'api'], { encoding: 'utf8' });
    expect(restart.status, restart.stderr).toBe(0);
    let recovered: Awaited<ReturnType<typeof createSale>> | undefined;
    for (let attempt = 0; attempt < 60; attempt++) {
      try {
        const health = await api.get('/health/live');
        if (health.status() === 200) {
          const candidate = await createSale(key);
          if (candidate.status() !== 429) {
            recovered = candidate;
            break;
          }
        }
      } catch {}
      await new Promise((resolve) => setTimeout(resolve, 250));
    }
    expect(recovered).toBeDefined();
    expect([200, 201]).toContain(recovered!.status());
    expect(((await recovered!.json()) as { id: string }).id).toBe(originalId);
    let divergent = await createSale(key, { notes: 'different payload' });
    for (let attempt = 0; divergent.status() === 429 && attempt < 60; attempt++) {
      await new Promise((resolve) => setTimeout(resolve, 250));
      divergent = await createSale(key, { notes: 'different payload' });
    }
    expect(divergent.status()).toBe(409);
  });

  test('creates ten independent unique branch folios', async () => {
    const responses = await Promise.all(
      Array.from({ length: 10 }, (_, index) => createSale(`sf-independent-${stamp}-${index}`)),
    );
    expect(responses.every((response) => response.status() === 201)).toBe(true);
    const bodies = (await Promise.all(responses.map((response) => response.json()))) as {
      id: string;
      folio: string;
    }[];
    expect(new Set(bodies.map(({ id }) => id)).size).toBe(10);
    expect(new Set(bodies.map(({ folio }) => folio)).size).toBe(10);
  });

  test('allows only five of ten sales to reserve the five available units', async () => {
    const sales = await Promise.all(
      Array.from({ length: 10 }, async (_, index) => {
        const response = await createSale(`sf-last-stock-sale-${stamp}-${index}`);
        return (await response.json()) as { id: string; version: number };
      }),
    );
    await Promise.all(
      sales.map((sale, index) =>
        api.post(`/v1/organizations/${tenant}/sales/${sale.id}/items`, {
          headers: headers(csrf, `sf-last-stock-item-${stamp}-${index}`, sale.version),
          data: { productVariantId: physicalVariant, quantity: '1' },
        }),
      ),
    );
    const checkouts = await Promise.all(
      sales.map((sale, index) =>
        api.post(`/v1/organizations/${tenant}/sales/${sale.id}/checkout`, {
          headers: headers(csrf, `sf-last-stock-checkout-${stamp}-${index}`, 2),
        }),
      ),
    );
    expect(checkouts.filter((response) => response.status() === 201)).toHaveLength(5);
    expect(checkouts.filter((response) => response.status() === 409)).toHaveLength(5);
    const availability = (await (
      await api.get(
        `/v1/organizations/${tenant}/inventory/availability?variantId=${physicalVariant}&locationId=${location}`,
      )
    ).json()) as { onHand: string; available: string; reserved: string };
    expect(availability).toMatchObject({ onHand: '5', available: '0', reserved: '5' });
  });

  test('snapshots SERVICE price without creating an inventory reservation', async () => {
    const created = await createSale(`sf-service-${stamp}`);
    const sale = (await created.json()) as { id: string; version: number };
    const item = await api.post(`/v1/organizations/${tenant}/sales/${sale.id}/items`, {
      headers: headers(csrf, `sf-service-item-${stamp}`, sale.version),
      data: { productVariantId: serviceVariant, quantity: '0.125' },
    });
    expect(item.status()).toBe(201);
    expect(await item.json()).toMatchObject({
      quantity: '0.125',
      unitAmountMinor: '2500',
      subtotalMinor: '313',
    });
    const checkout = await api.post(`/v1/organizations/${tenant}/sales/${sale.id}/checkout`, {
      headers: headers(csrf, `sf-service-checkout-${stamp}`, 2),
    });
    expect(checkout.status()).toBe(201);
    expect(await checkout.json()).toMatchObject({ totalMinor: '363' });
  });
});
