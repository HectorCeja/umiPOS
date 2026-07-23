import { expect, request, test, type APIRequestContext } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';

const tenant = '10000000-0000-4000-8000-000000000001';
const branch = '20000000-0000-4000-8000-000000000001';
const password = process.env.TEST_PERSONA_PASSWORD ?? 'Nexo Test Persona 2026!';
const performanceSamples: Record<string, number[]> = {};
const recordPerformance = (name: string, started: number) =>
  (performanceSamples[name] ??= []).push(performance.now() - started);
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
          deviceFingerprint: `refund-${email}`,
          deviceName: 'Cash refund E2E',
        },
      })
    ).status(),
  ).toBe(200);
  const state = await context.storageState();
  return { context, csrf: state.cookies.find((cookie) => cookie.name === 'nexo_csrf')!.value };
}
const cashHeaders = (csrf: string) => ({ origin: 'http://localhost:3000', 'x-csrf-token': csrf });
const salesHeaders = (csrf: string, key: string, version?: number) => ({
  ...cashHeaders(csrf),
  'idempotency-key': key,
  ...(version ? { 'if-match': String(version) } : {}),
});

test.describe.serial('Sales to Cash refund E2E', () => {
  let owner: APIRequestContext, supervisor: APIRequestContext;
  let ownerCsrf: string, supervisorCsrf: string, sessionId: string, variantId: string;
  const stamp = Date.now();

  test.beforeAll(async () => {
    ({ context: owner, csrf: ownerCsrf } = await login('alpha.owner@nexo.local'));
    ({ context: supervisor, csrf: supervisorCsrf } = await login('alpha.supervisor@nexo.local'));
  });
  test.afterAll(async () => {
    if (sessionId) {
      const current = (await (
        await owner.get(`/v1/organizations/${tenant}/cash/sessions/${sessionId}`)
      ).json()) as { version: number; status: string };
      if (!['CLOSED', 'FORCE_CLOSED'].includes(current.status)) {
        const closed = await owner.post(
          `/v1/organizations/${tenant}/cash/sessions/${sessionId}/close`,
          {
            headers: cashHeaders(ownerCsrf),
            data: {
              version: current.version,
              force: true,
              reason: 'Refund fixture cleanup',
              idempotencyKey: `refund-fixture-close-${stamp}`,
            },
          },
        );
        expect(closed.status()).toBe(201);
      }
    }
    await mkdir('artifacts/cash-certification/performance', { recursive: true });
    await writeFile(
      'artifacts/cash-certification/performance/refund-results.json',
      `${JSON.stringify(performanceSamples, null, 2)}\n`,
    );
    await Promise.all([owner.dispose(), supervisor.dispose()]);
  });

  async function completedSale(
    suffix: string,
    payments: { method: 'CASH' | 'CARD_EXTERNAL'; amountMinor: string }[],
  ) {
    const sale = await owner.post(`/v1/organizations/${tenant}/sales`, {
      headers: salesHeaders(ownerCsrf, `refund-sale-${suffix}`),
      data: { branchId: branch, currency: 'MXN', channel: 'API', businessDate: '2026-07-14' },
    });
    expect(sale.status()).toBe(201);
    const saleBody = (await sale.json()) as { id: string; version: number };
    const item = await owner.post(`/v1/organizations/${tenant}/sales/${saleBody.id}/items`, {
      headers: salesHeaders(ownerCsrf, `refund-item-${suffix}`, saleBody.version),
      data: { productVariantId: variantId, quantity: '1' },
    });
    expect(item.status()).toBe(201);
    const itemId = ((await item.json()) as { id: string }).id;
    expect(
      (
        await owner.post(`/v1/organizations/${tenant}/sales/${saleBody.id}/checkout`, {
          headers: salesHeaders(ownerCsrf, `refund-checkout-${suffix}`, 2),
        })
      ).status(),
    ).toBe(201);
    for (const [index, payment] of payments.entries()) {
      expect(
        (
          await owner.post(`/v1/organizations/${tenant}/sales/${saleBody.id}/payments`, {
            headers: salesHeaders(ownerCsrf, `refund-payment-${suffix}-${index}`),
            data: {
              ...payment,
              ...(payment.method === 'CASH' ? { tenderedMinor: payment.amountMinor } : {}),
              ...(payment.method === 'CARD_EXTERNAL'
                ? { providerReference: `terminal-${suffix}-${index}` }
                : {}),
            },
          })
        ).status(),
      ).toBe(201);
    }
    const saleStarted = performance.now();
    expect(
      (
        await owner.post(`/v1/organizations/${tenant}/sales/${saleBody.id}/complete`, {
          headers: salesHeaders(ownerCsrf, `refund-complete-${suffix}`, 3 + payments.length),
        })
      ).status(),
    ).toBe(201);
    await expect
      .poll(async () => {
        const status = (await (
          await owner.get(`/v1/organizations/${tenant}/cash/integrations/status?branchId=${branch}`)
        ).json()) as { cashPending: number; salesPending: number };
        return status.cashPending + status.salesPending;
      })
      .toBe(0);
    recordPerformance('postCashSale', saleStarted);
    return { saleId: saleBody.id, itemId };
  }

  async function approveCashRefund(
    suffix: string,
    saleId: string,
    itemId: string,
    amountMinor: string,
    quantity: string,
  ) {
    const requested = await owner.post(`/v1/organizations/${tenant}/sales/${saleId}/refunds`, {
      headers: salesHeaders(ownerCsrf, `refund-request-${suffix}`),
      data: {
        lines: [
          {
            saleItemId: itemId,
            quantity,
            amountMinor,
            destination: 'QUARANTINE',
            reason: `Refund ${suffix}`,
          },
        ],
      },
    });
    expect(requested.status()).toBe(202);
    const refund = (await requested.json()) as { id: string };
    const cashApproval = await supervisor.post(`/v1/organizations/${tenant}/cash/approvals`, {
      headers: cashHeaders(supervisorCsrf),
      data: {
        branchId: branch,
        actionType: 'CASH_REFUND',
        resourceId: refund.id,
        requiredPermission: 'cash.refund',
        thresholdMinor: amountMinor,
        reason: `Control ${suffix}`,
        expiresAt: new Date(Date.now() + 600_000).toISOString(),
        correlationId: crypto.randomUUID(),
        idempotencyKey: `refund-cash-approval-${suffix}`,
      },
    });
    expect(cashApproval.status()).toBe(201);
    const approval = (await cashApproval.json()) as { id: string };
    expect(
      (
        await owner.post(`/v1/organizations/${tenant}/cash/approvals/${approval.id}/decision`, {
          headers: cashHeaders(ownerCsrf),
          data: {
            decision: 'APPROVED',
            reason: 'Refund verified',
            version: 1,
            idempotencyKey: `refund-cash-decision-${suffix}`,
          },
        })
      ).status(),
    ).toBe(201);
    const response = await owner.post(
      `/v1/organizations/${tenant}/sales/${saleId}/refunds/${refund.id}/approve`,
      {
        headers: salesHeaders(ownerCsrf, `refund-sales-approve-${suffix}`),
        data: { reason: 'Commercial refund approved' },
      },
    );
    expect(response.status()).toBe(200);
    return refund.id;
  }

  test('prepares an open Cash session and a sellable service', async () => {
    const activeResponse = await owner.get(
      `/v1/organizations/${tenant}/cash/sessions/active?branchId=${branch}`,
    );
    const active = (await activeResponse.json()) as { id?: string; version?: number } | null;
    if (active?.id && active.version) {
      const closed = await owner.post(
        `/v1/organizations/${tenant}/cash/sessions/${active.id}/close`,
        {
          headers: cashHeaders(ownerCsrf),
          data: {
            version: active.version,
            force: true,
            reason: 'Refund certification fixture recovery',
            idempotencyKey: `refund-fixture-recovery-${stamp}`,
          },
        },
      );
      expect(closed.status()).toBe(201);
    }
    const register = await owner.post(`/v1/organizations/${tenant}/cash/registers`, {
      headers: cashHeaders(ownerCsrf),
      data: { branchId: branch, name: 'Refund Register', code: `REF-${stamp}`, currency: 'MXN' },
    });
    const registerId = ((await register.json()) as { id: string }).id;
    const opened = await owner.post(`/v1/organizations/${tenant}/cash/sessions/open`, {
      headers: cashHeaders(ownerCsrf),
      data: {
        branchId: branch,
        registerId,
        currency: 'MXN',
        businessDate: '2026-07-14',
        openingFloatMinor: '20000',
        correlationId: crypto.randomUUID(),
        idempotencyKey: `refund-open-${stamp}`,
      },
    });
    expect(opened.status()).toBe(201);
    sessionId = ((await opened.json()) as { id: string }).id;
    const product = await owner.post(`/v1/organizations/${tenant}/products`, {
      headers: salesHeaders(ownerCsrf, `refund-product-${stamp}`),
      data: { name: 'Refund Service', sku: `REFUND-${stamp}`, type: 'SERVICE' },
    });
    const productId = ((await product.json()) as { id: string }).id;
    const detail = (await (
      await owner.get(`/v1/organizations/${tenant}/products/${productId}`)
    ).json()) as { version: number; variants: { id: string }[] };
    variantId = detail.variants[0]!.id;
    expect(
      (
        await owner.post(`/v1/organizations/${tenant}/products/${productId}/prices`, {
          headers: salesHeaders(ownerCsrf, `refund-price-${stamp}`),
          data: { variantId, amount: '100.00', currency: 'MXN', taxProfileKey: 'MX_STANDARD' },
        })
      ).status(),
    ).toBe(201);
    expect(
      (
        await owner.post(`/v1/organizations/${tenant}/products/${productId}/activate`, {
          headers: salesHeaders(ownerCsrf, `refund-activate-${stamp}`),
          data: { version: detail.version },
        })
      ).status(),
    ).toBe(201);
  });

  test('posts an approved partial CASH refund exactly once through the worker', async () => {
    const sale = await owner.post(`/v1/organizations/${tenant}/sales`, {
      headers: salesHeaders(ownerCsrf, `refund-sale-${stamp}`),
      data: { branchId: branch, currency: 'MXN', channel: 'API', businessDate: '2026-07-14' },
    });
    const saleBody = (await sale.json()) as { id: string; version: number };
    const item = await owner.post(`/v1/organizations/${tenant}/sales/${saleBody.id}/items`, {
      headers: salesHeaders(ownerCsrf, `refund-item-${stamp}`, saleBody.version),
      data: { productVariantId: variantId, quantity: '1' },
    });
    const itemId = ((await item.json()) as { id: string }).id;
    await owner.post(`/v1/organizations/${tenant}/sales/${saleBody.id}/checkout`, {
      headers: salesHeaders(ownerCsrf, `refund-checkout-${stamp}`, 2),
    });
    await owner.post(`/v1/organizations/${tenant}/sales/${saleBody.id}/payments`, {
      headers: salesHeaders(ownerCsrf, `refund-payment-${stamp}`),
      data: { method: 'CASH', amountMinor: '11600', tenderedMinor: '11600' },
    });
    expect(
      (
        await owner.post(`/v1/organizations/${tenant}/sales/${saleBody.id}/complete`, {
          headers: salesHeaders(ownerCsrf, `refund-complete-${stamp}`, 4),
        })
      ).status(),
    ).toBe(201);
    const requested = await owner.post(`/v1/organizations/${tenant}/sales/${saleBody.id}/refunds`, {
      headers: salesHeaders(ownerCsrf, `refund-request-${stamp}`),
      data: {
        lines: [
          {
            saleItemId: itemId,
            quantity: '0.5',
            amountMinor: '5800',
            destination: 'QUARANTINE',
            reason: 'Partial inspection refund',
          },
        ],
      },
    });
    expect(requested.status()).toBe(202);
    const refund = (await requested.json()) as { id: string };
    const cashApproval = await supervisor.post(`/v1/organizations/${tenant}/cash/approvals`, {
      headers: cashHeaders(supervisorCsrf),
      data: {
        branchId: branch,
        actionType: 'CASH_REFUND',
        resourceId: refund.id,
        requiredPermission: 'cash.refund',
        thresholdMinor: '5800',
        reason: 'Cash refund control',
        expiresAt: new Date(Date.now() + 600_000).toISOString(),
        correlationId: crypto.randomUUID(),
        idempotencyKey: `refund-cash-approval-${stamp}`,
      },
    });
    const approval = (await cashApproval.json()) as { id: string };
    expect(
      (
        await owner.post(`/v1/organizations/${tenant}/cash/approvals/${approval.id}/decision`, {
          headers: cashHeaders(ownerCsrf),
          data: {
            decision: 'APPROVED',
            reason: 'Refund verified',
            version: 1,
            idempotencyKey: `refund-cash-decision-${stamp}`,
          },
        })
      ).status(),
    ).toBe(201);
    const refundStarted = performance.now();
    const approved = await owner.post(
      `/v1/organizations/${tenant}/sales/${saleBody.id}/refunds/${refund.id}/approve`,
      {
        headers: salesHeaders(ownerCsrf, `refund-sales-approve-${stamp}`),
        data: { reason: 'Commercial refund approved' },
      },
    );
    expect(approved.status()).toBe(200);
    const replay = await owner.post(
      `/v1/organizations/${tenant}/sales/${saleBody.id}/refunds/${refund.id}/approve`,
      {
        headers: salesHeaders(ownerCsrf, `refund-sales-approve-${stamp}`),
        data: { reason: 'Commercial refund approved' },
      },
    );
    expect(replay.status()).toBe(200);
    const concurrentReplay = await Promise.all([
      owner.post(`/v1/organizations/${tenant}/sales/${saleBody.id}/refunds/${refund.id}/approve`, {
        headers: salesHeaders(ownerCsrf, `refund-sales-approve-${stamp}`),
        data: { reason: 'Commercial refund approved' },
      }),
      owner.post(`/v1/organizations/${tenant}/sales/${saleBody.id}/refunds/${refund.id}/approve`, {
        headers: salesHeaders(ownerCsrf, `refund-sales-approve-${stamp}`),
        data: { reason: 'Commercial refund approved' },
      }),
    ]);
    expect(concurrentReplay.map((response) => response.status())).toEqual([200, 200]);

    await expect
      .poll(
        async () => {
          const timeline = (await (
            await owner.get(`/v1/organizations/${tenant}/cash/sessions/${sessionId}/timeline`)
          ).json()) as { movementType: string; sourceId?: string }[];
          return timeline.filter(
            (entry) =>
              entry.movementType === 'CASH_REFUND' && entry.sourceId?.startsWith(refund.id),
          ).length;
        },
        { timeout: 15_000 },
      )
      .toBe(1);
    recordPerformance('partialRefund', refundStarted);
  });

  test('posts a total CASH refund from the authoritative Sales amount', async () => {
    const suffix = `${stamp}-total`;
    const sale = await completedSale(suffix, [{ method: 'CASH', amountMinor: '11600' }]);
    const started = performance.now();
    const refundId = await approveCashRefund(suffix, sale.saleId, sale.itemId, '11600', '1');
    await expect
      .poll(
        async () => {
          const rows = (await (
            await owner.get(`/v1/organizations/${tenant}/cash/sessions/${sessionId}/timeline`)
          ).json()) as { movementType: string; sourceId?: string; amountMinor: string }[];
          return rows
            .filter(
              (entry) =>
                entry.movementType === 'CASH_REFUND' && entry.sourceId?.startsWith(refundId),
            )
            .reduce((sum, entry) => sum + BigInt(entry.amountMinor), 0n);
        },
        { timeout: 15_000 },
      )
      .toBe(11600n);
    recordPerformance('totalRefund', started);
  });

  test('posts only the CASH component of a mixed refund', async () => {
    const suffix = `${stamp}-mixed`;
    const sale = await completedSale(suffix, [
      { method: 'CASH', amountMinor: '5000' },
      { method: 'CARD_EXTERNAL', amountMinor: '6600' },
    ]);
    const started = performance.now();
    const refundId = await approveCashRefund(suffix, sale.saleId, sale.itemId, '11600', '1');
    await expect
      .poll(
        async () => {
          const rows = (await (
            await owner.get(`/v1/organizations/${tenant}/cash/sessions/${sessionId}/timeline`)
          ).json()) as { movementType: string; sourceId?: string; amountMinor: string }[];
          return rows
            .filter(
              (entry) =>
                entry.movementType === 'CASH_REFUND' && entry.sourceId?.startsWith(refundId),
            )
            .reduce((sum, entry) => sum + BigInt(entry.amountMinor), 0n);
        },
        { timeout: 15_000 },
      )
      .toBe(5000n);
    recordPerformance('mixedRefund', started);
  });

  test('distributes a mixed refund over multiple CASH allocations exactly once', async () => {
    const suffix = `${stamp}-multi-cash`;
    const sale = await completedSale(suffix, [
      { method: 'CASH', amountMinor: '3000' },
      { method: 'CASH', amountMinor: '4000' },
      { method: 'CARD_EXTERNAL', amountMinor: '4600' },
    ]);
    const refundId = await approveCashRefund(suffix, sale.saleId, sale.itemId, '11600', '1');
    await expect
      .poll(
        async () => {
          const rows = (await (
            await owner.get(`/v1/organizations/${tenant}/cash/sessions/${sessionId}/timeline`)
          ).json()) as { movementType: string; sourceId?: string; amountMinor: string }[];
          const matching = rows.filter(
            (entry) => entry.movementType === 'CASH_REFUND' && entry.sourceId?.startsWith(refundId),
          );
          return {
            count: matching.length,
            amount: matching.reduce((sum, entry) => sum + BigInt(entry.amountMinor), 0n),
          };
        },
        { timeout: 15_000 },
      )
      .toEqual({ count: 2, amount: 7000n });
  });

  test('rejects an excessive refund, an unknown refund and a cross-tenant path', async () => {
    const suffix = `${stamp}-negative-api`;
    const sale = await completedSale(suffix, [{ method: 'CASH', amountMinor: '11600' }]);
    const excessive = await owner.post(`/v1/organizations/${tenant}/sales/${sale.saleId}/refunds`, {
      headers: salesHeaders(ownerCsrf, `refund-excessive-${suffix}`),
      data: {
        lines: [
          {
            saleItemId: sale.itemId,
            quantity: '1',
            amountMinor: '11601',
            destination: 'QUARANTINE',
            reason: 'Excessive refund certification',
          },
        ],
      },
    });
    expect([400, 409, 422]).toContain(excessive.status());
    const unknown = await owner.post(
      `/v1/organizations/${tenant}/sales/${sale.saleId}/refunds/00000000-0000-4000-8000-000000000099/approve`,
      {
        headers: salesHeaders(ownerCsrf, `refund-unknown-${suffix}`),
        data: { reason: 'Unknown refund certification' },
      },
    );
    expect(unknown.status()).toBe(404);
    const crossTenant = await owner.post(
      `/v1/organizations/10000000-0000-4000-8000-000000000002/sales/${sale.saleId}/refunds`,
      {
        headers: salesHeaders(ownerCsrf, `refund-cross-tenant-${suffix}`),
        data: {
          lines: [
            {
              saleItemId: sale.itemId,
              quantity: '0.1',
              amountMinor: '100',
              destination: 'QUARANTINE',
              reason: 'Cross tenant certification',
            },
          ],
        },
      },
    );
    expect([403, 404]).toContain(crossTenant.status());
  });

  test('serializes refund idempotency, cumulative quantity and receipt issuance', async () => {
    const suffix = `${stamp}-concurrency`;
    const sale = await completedSale(suffix, [{ method: 'CASH', amountMinor: '11600' }]);
    const firstPayload = {
      lines: [
        {
          saleItemId: sale.itemId,
          quantity: '0.1',
          amountMinor: '1160',
          destination: 'QUARANTINE',
          reason: 'Concurrent refund certification',
        },
      ],
    };
    const sameKey = await Promise.all(
      Array.from({ length: 10 }, () =>
        owner.post(`/v1/organizations/${tenant}/sales/${sale.saleId}/refunds`, {
          headers: salesHeaders(ownerCsrf, `refund-concurrent-same-${suffix}`),
          data: firstPayload,
        }),
      ),
    );
    expect(sameKey.map((response) => response.status())).toEqual(Array(10).fill(202));
    const replayIds = await Promise.all(
      sameKey.map(async (response) => ((await response.json()) as { id: string }).id),
    );
    expect(new Set(replayIds).size).toBe(1);

    const divergent = await owner.post(`/v1/organizations/${tenant}/sales/${sale.saleId}/refunds`, {
      headers: salesHeaders(ownerCsrf, `refund-concurrent-same-${suffix}`),
      data: {
        lines: [{ ...firstPayload.lines[0], quantity: '0.2', amountMinor: '2320' }],
      },
    });
    expect(divergent.status()).toBe(409);

    const competing = await Promise.all(
      Array.from({ length: 10 }, (_, index) =>
        owner.post(`/v1/organizations/${tenant}/sales/${sale.saleId}/refunds`, {
          headers: salesHeaders(ownerCsrf, `refund-concurrent-distinct-${suffix}-${index}`),
          data: {
            lines: [{ ...firstPayload.lines[0], quantity: '0.9', amountMinor: '10440' }],
          },
        }),
      ),
    );
    expect(competing.filter((response) => response.status() === 202)).toHaveLength(1);
    expect(competing.filter((response) => response.status() === 409)).toHaveLength(9);

    const receipts = await Promise.all(
      Array.from({ length: 10 }, (_, index) =>
        owner.post(`/v1/organizations/${tenant}/sales/${sale.saleId}/receipt`, {
          headers: salesHeaders(ownerCsrf, `receipt-concurrent-${suffix}-${index}`),
        }),
      ),
    );
    expect(receipts.every((response) => response.status() === 201)).toBe(true);
    const receiptIds = await Promise.all(
      receipts.map(async (response) => ((await response.json()) as { id: string }).id),
    );
    expect(new Set(receiptIds).size).toBe(1);
  });
});
