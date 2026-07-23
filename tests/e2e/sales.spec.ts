import { expect, request, test, type APIRequestContext } from '@playwright/test';

const password = process.env.TEST_PERSONA_PASSWORD ?? 'Nexo Test Persona 2026!';
const tenant = '10000000-0000-4000-8000-000000000001';
const betaTenant = '20000000-0000-4000-8000-000000000001';
const branch = '20000000-0000-4000-8000-000000000001';
async function login(email: string) {
  const context = await request.newContext({
    baseURL: 'http://127.0.0.1:3001',
    extraHTTPHeaders: { origin: 'http://localhost:3000' },
  });
  expect(
    (
      await context.post('/v1/auth/login', {
        data: { email, password, deviceFingerprint: `sales-${email}`, deviceName: 'Sales E2E' },
      })
    ).status(),
  ).toBe(200);
  const state = await context.storageState();
  return { context, csrf: state.cookies.find(({ name }) => name === 'nexo_csrf')!.value };
}
const writeHeaders = (csrf: string, key: string, version?: number) => ({
  origin: 'http://localhost:3000',
  'x-csrf-token': csrf,
  'idempotency-key': key,
  ...(version ? { 'if-match': String(version) } : {}),
});

test.describe.serial('Sales Platform with real PostgreSQL, Inventory and RLS', () => {
  let alpha: APIRequestContext,
    beta: APIRequestContext,
    csrf: string,
    variantId: string,
    serviceVariantId: string,
    warehouseId: string,
    completedSaleId: string,
    completedItemId: string;
  const stamp = Date.now();
  test('prepares sellable Product variants and stock through public APIs', async () => {
    ({ context: alpha, csrf } = await login('alpha.owner@nexo.local'));
    ({ context: beta } = await login('beta.owner@nexo.local'));
    const physical = await alpha.post(`/v1/organizations/${tenant}/products`, {
      headers: writeHeaders(csrf, `unused-${stamp}`),
      data: { name: 'Sales Coffee', sku: `SALE-${stamp}`, type: 'PHYSICAL' },
    });
    expect(physical.status()).toBe(201);
    const productId = ((await physical.json()) as { id: string }).id;
    const detail = await alpha.get(`/v1/organizations/${tenant}/products/${productId}`);
    const body = (await detail.json()) as { version: number; variants: { id: string }[] };
    variantId = body.variants[0]!.id;
    expect(
      (
        await alpha.post(`/v1/organizations/${tenant}/products/${productId}/prices`, {
          headers: writeHeaders(csrf, `unused-p-${stamp}`),
          data: { variantId, amount: '100.00', currency: 'MXN', taxProfileKey: 'MX_STANDARD' },
        })
      ).status(),
    ).toBe(201);
    expect(
      (
        await alpha.post(`/v1/organizations/${tenant}/products/${productId}/activate`, {
          headers: writeHeaders(csrf, `unused-a-${stamp}`),
          data: { version: body.version },
        })
      ).status(),
    ).toBe(201);
    const service = await alpha.post(`/v1/organizations/${tenant}/products`, {
      headers: writeHeaders(csrf, `unused-s-${stamp}`),
      data: { name: 'Sales Service', sku: `SERVICE-${stamp}`, type: 'SERVICE' },
    });
    const serviceId = ((await service.json()) as { id: string }).id;
    const serviceDetail = (await (
      await alpha.get(`/v1/organizations/${tenant}/products/${serviceId}`)
    ).json()) as { version: number; variants: { id: string }[] };
    serviceVariantId = serviceDetail.variants[0]!.id;
    await alpha.post(`/v1/organizations/${tenant}/products/${serviceId}/prices`, {
      headers: writeHeaders(csrf, `unused-sp-${stamp}`),
      data: {
        variantId: serviceVariantId,
        amount: '50.00',
        currency: 'MXN',
        taxProfileKey: 'MX_STANDARD',
      },
    });
    await alpha.post(`/v1/organizations/${tenant}/products/${serviceId}/activate`, {
      headers: writeHeaders(csrf, `unused-sa-${stamp}`),
      data: { version: serviceDetail.version },
    });
    const warehouse = await alpha.post(`/v1/organizations/${tenant}/inventory/locations`, {
      headers: writeHeaders(csrf, `unused-w-${stamp}`),
      data: { branchId: branch, type: 'WAREHOUSE', code: `SW-${stamp}`, name: 'Sales Warehouse' },
    });
    warehouseId = ((await warehouse.json()) as { id: string }).id;
    await alpha.put(`/v1/organizations/${tenant}/inventory/policies`, {
      headers: writeHeaders(csrf, `unused-pol-${stamp}`),
      data: { variantId, allowNegative: false, costMethod: 'FIFO' },
    });
    expect(
      (
        await alpha.post(`/v1/organizations/${tenant}/inventory/movements`, {
          headers: writeHeaders(csrf, `unused-r-${stamp}`),
          data: {
            variantId,
            locationId: warehouseId,
            type: 'PURCHASE',
            state: 'ON_HAND',
            quantity: '10',
            unitCost: '40.00',
            currency: 'MXN',
            reason: 'Sales fixture',
            occurredAt: new Date().toISOString(),
            idempotencyKey: `sales-stock-${stamp}`,
          },
        })
      ).status(),
    ).toBe(201);
  });
  test('completes an exact cash sale and consumes the Inventory reservation', async () => {
    const createKey = `sale-create-${stamp}`;
    const created = await alpha.post(`/v1/organizations/${tenant}/sales`, {
      headers: writeHeaders(csrf, createKey),
      data: { branchId: branch, currency: 'MXN', channel: 'WEB_POS', businessDate: '2026-07-13' },
    });
    expect(created.status()).toBe(201);
    const sale = (await created.json()) as { id: string; version: number };
    const replay = await alpha.post(`/v1/organizations/${tenant}/sales`, {
      headers: writeHeaders(csrf, createKey),
      data: { branchId: branch, currency: 'MXN', channel: 'WEB_POS', businessDate: '2026-07-13' },
    });
    expect(((await replay.json()) as { id: string }).id).toBe(sale.id);
    expect(
      (
        await alpha.post(`/v1/organizations/${tenant}/sales`, {
          headers: writeHeaders(csrf, createKey),
          data: {
            branchId: branch,
            currency: 'MXN',
            channel: 'WEB_POS',
            businessDate: '2026-07-13',
            notes: 'different',
          },
        })
      ).status(),
    ).toBe(409);
    const item = await alpha.post(`/v1/organizations/${tenant}/sales/${sale.id}/items`, {
      headers: writeHeaders(csrf, `sale-item-${stamp}`, sale.version),
      data: { productVariantId: variantId, quantity: '1' },
    });
    expect(item.status()).toBe(201);
    completedSaleId = sale.id;
    completedItemId = ((await item.json()) as { id: string }).id;
    const prepared = await alpha.post(`/v1/organizations/${tenant}/sales/${sale.id}/checkout`, {
      headers: writeHeaders(csrf, `sale-checkout-${stamp}`, 2),
    });
    expect(prepared.status()).toBe(201);
    const paymentAttempts = await Promise.all(
      Array.from({ length: 10 }, () =>
        alpha.post(`/v1/organizations/${tenant}/sales/${sale.id}/payments`, {
          headers: writeHeaders(csrf, `sale-pay-${stamp}`),
          data: { method: 'CASH', amountMinor: '11600', tenderedMinor: '12000' },
        }),
      ),
    );
    expect(paymentAttempts.every((response) => response.status() === 201)).toBe(true);
    const paymentBodies = (await Promise.all(
      paymentAttempts.map((response) => response.json()),
    )) as {
      id: string;
      paymentAttemptId?: string;
      saleVersion: number;
    }[];
    expect(new Set(paymentBodies.map(({ id }) => id)).size).toBe(1);
    expect(new Set(paymentBodies.map(({ paymentAttemptId }) => paymentAttemptId)).size).toBe(1);
    const paymentBody = paymentBodies[0]!;
    expect(paymentBody.saleVersion).toBe(4);
    expect(
      (
        await alpha.post(`/v1/organizations/${tenant}/sales/${sale.id}/payments`, {
          headers: writeHeaders(csrf, `sale-pay-${stamp}`),
          data: { method: 'CASH', amountMinor: '11599', tenderedMinor: '12000' },
        })
      ).status(),
    ).toBe(409);
    expect(
      (
        await alpha.post(`/v1/organizations/${tenant}/sales/${sale.id}/payments`, {
          headers: writeHeaders(csrf, `sale-pay-over-${stamp}`),
          data: { method: 'CASH', amountMinor: '1', tenderedMinor: '1' },
        })
      ).status(),
    ).toBe(409);
    const attemptId = paymentBody.paymentAttemptId ?? paymentBody.id;
    const outcome = await alpha.get(
      `/v1/organizations/${tenant}/sales/${sale.id}/payments/${attemptId}/outcome`,
    );
    expect(outcome.status()).toBe(200);
    expect(await outcome.json()).toMatchObject({
      saleId: sale.id,
      status: 'approved',
      retryGuidance: 'TERMINAL',
    });
    const recoveredByKey = await alpha.get(
      `/v1/organizations/${tenant}/sales/${sale.id}/payment-outcome?idempotencyKey=sale-pay-${stamp}`,
    );
    expect(recoveredByKey.status()).toBe(200);
    expect(await recoveredByKey.json()).toMatchObject({
      saleId: sale.id,
      status: 'approved',
    });
    const completed = await alpha.post(`/v1/organizations/${tenant}/sales/${sale.id}/complete`, {
      headers: writeHeaders(csrf, `sale-complete-${stamp}`, 4),
    });
    expect(completed.status()).toBe(201);
    expect((await completed.json()) as object).toMatchObject({ status: 'COMPLETED', version: 5 });
    const availability = (await (
      await alpha.get(
        `/v1/organizations/${tenant}/inventory/availability?variantId=${variantId}&locationId=${warehouseId}`,
      )
    ).json()) as { onHand: string; reserved: string };
    expect(availability).toMatchObject({ onHand: '9', reserved: '0' });
    expect((await beta.get(`/v1/organizations/${betaTenant}/sales/${sale.id}`)).status()).toBe(403);
  });
  test('generates an immutable receipt and accepts a traced partial refund intent', async () => {
    const receipt = await alpha.post(
      `/v1/organizations/${tenant}/sales/${completedSaleId}/receipt`,
      { headers: writeHeaders(csrf, `receipt-${stamp}`) },
    );
    expect(receipt.status()).toBe(201);
    expect((await receipt.json()) as object).toMatchObject({ version: 1 });
    const refund = await alpha.post(
      `/v1/organizations/${tenant}/sales/${completedSaleId}/refunds`,
      {
        headers: writeHeaders(csrf, `refund-${stamp}`),
        data: {
          lines: [
            {
              saleItemId: completedItemId,
              quantity: '0.5',
              amountMinor: '5800',
              destination: 'QUARANTINE',
              reason: 'Inspection required',
            },
          ],
        },
      },
    );
    expect(refund.status()).toBe(202);
    expect((await refund.json()) as object).toMatchObject({ status: 'REQUESTED' });
    expect(
      (await alpha.get(`/v1/organizations/${tenant}/sales/policies?branchId=${branch}`)).status(),
    ).toBe(200);
    expect((await alpha.get(`/v1/organizations/${tenant}/external-mappings`)).status()).toBe(200);
  });
  test('restores PHYSICAL Inventory exactly once after an external refund', async () => {
    const created = await alpha.post(`/v1/organizations/${tenant}/sales`, {
      headers: writeHeaders(csrf, `return-create-${stamp}`),
      data: { branchId: branch, currency: 'MXN', channel: 'API', businessDate: '2026-07-13' },
    });
    const sale = (await created.json()) as { id: string; version: number };
    const itemResponse = await alpha.post(`/v1/organizations/${tenant}/sales/${sale.id}/items`, {
      headers: writeHeaders(csrf, `return-item-${stamp}`, sale.version),
      data: { productVariantId: variantId, quantity: '1' },
    });
    const itemId = ((await itemResponse.json()) as { id: string }).id;
    expect(
      (
        await alpha.post(`/v1/organizations/${tenant}/sales/${sale.id}/checkout`, {
          headers: writeHeaders(csrf, `return-checkout-${stamp}`, 2),
        })
      ).status(),
    ).toBe(201);
    expect(
      (
        await alpha.post(`/v1/organizations/${tenant}/sales/${sale.id}/payments`, {
          headers: writeHeaders(csrf, `return-payment-${stamp}`),
          data: {
            method: 'CARD_EXTERNAL',
            amountMinor: '11600',
            providerReference: `return-terminal-${stamp}`,
          },
        })
      ).status(),
    ).toBe(201);
    expect(
      (
        await alpha.post(`/v1/organizations/${tenant}/sales/${sale.id}/complete`, {
          headers: writeHeaders(csrf, `return-complete-${stamp}`, 4),
        })
      ).status(),
    ).toBe(201);
    const requested = await alpha.post(`/v1/organizations/${tenant}/sales/${sale.id}/refunds`, {
      headers: writeHeaders(csrf, `return-refund-${stamp}`),
      data: {
        lines: [
          {
            saleItemId: itemId,
            quantity: '1',
            amountMinor: '11600',
            destination: 'AVAILABLE',
            reason: 'Unopened physical return',
          },
        ],
      },
    });
    expect(requested.status()).toBe(202);
    const refundId = ((await requested.json()) as { id: string }).id;
    const approved = await alpha.post(
      `/v1/organizations/${tenant}/sales/${sale.id}/refunds/${refundId}/approve`,
      {
        headers: writeHeaders(csrf, `return-approve-${stamp}`),
        data: { reason: 'Physical return inspected' },
      },
    );
    expect(approved.status()).toBe(200);
    await expect
      .poll(
        async () => {
          const detail = (await (
            await alpha.get(`/v1/organizations/${tenant}/sales/${sale.id}`)
          ).json()) as { sale: { status: string } };
          return detail.sale.status;
        },
        { timeout: 15_000 },
      )
      .toBe('REFUNDED');
    const availability = (await (
      await alpha.get(
        `/v1/organizations/${tenant}/inventory/availability?variantId=${variantId}&locationId=${warehouseId}`,
      )
    ).json()) as { onHand: string };
    expect(availability.onHand).toBe('9');
    const replay = await alpha.post(
      `/v1/organizations/${tenant}/sales/${sale.id}/refunds/${refundId}/approve`,
      {
        headers: writeHeaders(csrf, `return-approve-${stamp}`),
        data: { reason: 'Physical return inspected' },
      },
    );
    expect(replay.status()).toBe(200);
    expect(
      (
        (await (
          await alpha.get(
            `/v1/organizations/${tenant}/inventory/availability?variantId=${variantId}&locationId=${warehouseId}`,
          )
        ).json()) as { onHand: string }
      ).onHand,
    ).toBe('9');
  });
  test('supports mixed payments for a service and suspend/resume/cancel lifecycle', async () => {
    const create = async (key: string) => {
      const response = await alpha.post(`/v1/organizations/${tenant}/sales`, {
        headers: writeHeaders(csrf, key),
        data: {
          branchId: branch,
          currency: 'MXN',
          channel: 'FLUTTER_POS',
          businessDate: '2026-07-13',
        },
      });
      return (await response.json()) as { id: string; version: number };
    };
    const mixed = await create(`mixed-${stamp}`);
    await alpha.post(`/v1/organizations/${tenant}/sales/${mixed.id}/items`, {
      headers: writeHeaders(csrf, `mixed-item-${stamp}`, 1),
      data: { productVariantId: serviceVariantId, quantity: '1' },
    });
    await alpha.post(`/v1/organizations/${tenant}/sales/${mixed.id}/checkout`, {
      headers: writeHeaders(csrf, `mixed-checkout-${stamp}`, 2),
    });
    await alpha.post(`/v1/organizations/${tenant}/sales/${mixed.id}/payments`, {
      headers: writeHeaders(csrf, `mixed-cash-${stamp}`),
      data: { method: 'CASH', amountMinor: '2000', tenderedMinor: '2000' },
    });
    await alpha.post(`/v1/organizations/${tenant}/sales/${mixed.id}/payments`, {
      headers: writeHeaders(csrf, `mixed-card-${stamp}`),
      data: {
        method: 'CARD_EXTERNAL',
        amountMinor: '3800',
        providerReference: 'terminal-approval',
      },
    });
    expect(
      (
        await alpha.post(`/v1/organizations/${tenant}/sales/${mixed.id}/complete`, {
          headers: writeHeaders(csrf, `mixed-complete-${stamp}`, 5),
        })
      ).status(),
    ).toBe(201);
    expect(
      (
        await alpha.put(`/v1/organizations/${tenant}/sales/policies?branchId=${branch}`, {
          headers: writeHeaders(csrf, `policy-expiry-${stamp}`),
          data: { suspendedSaleTtlSeconds: 1 },
        })
      ).status(),
    ).toBe(200);
    const expiring = await create(`expiring-${stamp}`);
    expect(
      (
        await alpha.post(`/v1/organizations/${tenant}/sales/${expiring.id}/suspend`, {
          headers: writeHeaders(csrf, `suspend-${stamp}`, 1),
        })
      ).status(),
    ).toBe(201);
    await expect
      .poll(
        async () => {
          const response = await alpha.get(`/v1/organizations/${tenant}/sales/${expiring.id}`);
          return ((await response.json()) as { sale: { status: string } }).sale.status;
        },
        { timeout: 10_000 },
      )
      .toBe('EXPIRED');
    const lifecycle = await create(`lifecycle-${stamp}`);
    await alpha.post(`/v1/organizations/${tenant}/sales/${lifecycle.id}/suspend`, {
      headers: writeHeaders(csrf, `suspend-resume-${stamp}`, 1),
    });
    expect(
      (
        await alpha.post(`/v1/organizations/${tenant}/sales/${lifecycle.id}/resume`, {
          headers: writeHeaders(csrf, `resume-${stamp}`, 2),
        })
      ).status(),
    ).toBe(201);
    expect(
      (
        await alpha.post(`/v1/organizations/${tenant}/sales/${lifecycle.id}/cancel`, {
          headers: writeHeaders(csrf, `cancel-${stamp}`, 3),
          data: { reason: 'Customer request' },
        })
      ).status(),
    ).toBe(201);
  });
  test('serializes concurrent completion and permits exactly one winner', async () => {
    const created = await alpha.post(`/v1/organizations/${tenant}/sales`, {
      headers: writeHeaders(csrf, `race-create-${stamp}`),
      data: {
        branchId: branch,
        currency: 'MXN',
        channel: 'API',
        businessDate: '2026-07-13',
      },
    });
    const sale = (await created.json()) as { id: string };
    await alpha.post(`/v1/organizations/${tenant}/sales/${sale.id}/items`, {
      headers: writeHeaders(csrf, `race-item-${stamp}`, 1),
      data: { productVariantId: variantId, quantity: '1' },
    });
    await alpha.post(`/v1/organizations/${tenant}/sales/${sale.id}/checkout`, {
      headers: writeHeaders(csrf, `race-checkout-${stamp}`, 2),
    });
    await alpha.post(`/v1/organizations/${tenant}/sales/${sale.id}/payments`, {
      headers: writeHeaders(csrf, `race-payment-${stamp}`),
      data: { method: 'CASH', amountMinor: '11600', tenderedMinor: '11600' },
    });
    const attempts = await Promise.all(
      Array.from({ length: 10 }, (_, index) =>
        alpha.post(`/v1/organizations/${tenant}/sales/${sale.id}/complete`, {
          headers: writeHeaders(csrf, `race-complete-${index}-${stamp}`, 4),
        }),
      ),
    );
    const statuses = attempts.map((response) => response.status());
    expect(statuses.filter((status) => status === 201)).toHaveLength(1);
    expect(statuses.filter((status) => status === 409)).toHaveLength(9);
    const persisted = await alpha.get(`/v1/organizations/${tenant}/sales/${sale.id}`);
    expect((await persisted.json()) as object).toMatchObject({
      sale: { status: 'COMPLETED', version: 5 },
    });
    const availability = (await (
      await alpha.get(
        `/v1/organizations/${tenant}/inventory/availability?variantId=${variantId}&locationId=${warehouseId}`,
      )
    ).json()) as { onHand: string; reserved: string };
    expect(availability).toMatchObject({ onHand: '8', reserved: '0' });
  });
  test('exposes tenant-scoped Sales administration read models and sanitized diagnostics', async () => {
    const base = `/v1/organizations/${tenant}/sales-administration`;
    for (const path of [
      `${base}/overview?branchId=${branch}`,
      `${base}/history?branchId=${branch}&search=${completedSaleId}`,
      `${base}/refunds?branchId=${branch}`,
      `${base}/receipts?branchId=${branch}`,
      `${base}/exceptions?branchId=${branch}`,
      `${base}/${completedSaleId}/detail`,
      `${base}/${completedSaleId}/timeline`,
      `${base}/${completedSaleId}/diagnostic`,
    ]) {
      const response = await alpha.get(path);
      expect(response.status(), path).toBe(200);
      const serialized = JSON.stringify(await response.json());
      expect(serialized).not.toContain('password');
      expect(serialized).not.toContain('sessionToken');
      expect(serialized).not.toContain('stack');
    }
    expect((await beta.get(`${base}/${completedSaleId}/detail`)).status()).toBe(403);
  });
});
