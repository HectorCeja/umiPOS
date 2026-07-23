import { expect, request, test, type APIRequestContext } from '@playwright/test';
import { spawnSync } from 'node:child_process';

const tenant = '10000000-0000-4000-8000-000000000001';
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
          deviceFingerprint: `commerce-closure-${email}-${Date.now()}`,
          deviceName: 'Commerce Domain Closure',
        },
      })
    ).status(),
  ).toBe(200);
  const state = await context.storageState();
  return { context, csrf: state.cookies.find(({ name }) => name === 'nexo_csrf')!.value };
}

const headers = (csrf: string, key?: string, version?: number) => ({
  origin: 'http://localhost:3000',
  'x-csrf-token': csrf,
  'x-request-id': `closure-${key ?? crypto.randomUUID()}`.slice(0, 120),
  ...(key ? { 'idempotency-key': key } : {}),
  ...(version === undefined ? {} : { 'if-match': String(version) }),
});

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

test('closes one physical cash sale through receipt, restart, partial and total refund', async () => {
  test.setTimeout(120_000);
  const stamp = `${Date.now()}-${Math.floor(Math.random() * 1_000_000)}`;
  const owner = await login('alpha.owner@nexo.local');
  const supervisor = await login('alpha.supervisor@nexo.local');
  let sessionId = '';
  try {
    const active = (await (
      await owner.context.get(`/v1/organizations/${tenant}/cash/sessions/active?branchId=${branch}`)
    ).json()) as { id?: string; version?: number } | null;
    if (active?.id && active.version) {
      expect(
        (
          await owner.context.post(`/v1/organizations/${tenant}/cash/sessions/${active.id}/close`, {
            headers: headers(owner.csrf),
            data: {
              version: active.version,
              force: true,
              reason: 'Commerce closure fixture isolation',
              idempotencyKey: `closure-existing-close-${stamp}`,
            },
          })
        ).status(),
      ).toBe(201);
    }
    const register = await owner.context.post(`/v1/organizations/${tenant}/cash/registers`, {
      headers: headers(owner.csrf),
      data: { branchId: branch, name: 'Commerce Closure', code: `CC-${stamp}`, currency: 'MXN' },
    });
    expect(register.status()).toBe(201);
    const registerId = ((await register.json()) as { id: string }).id;
    const opened = await owner.context.post(`/v1/organizations/${tenant}/cash/sessions/open`, {
      headers: headers(owner.csrf),
      data: {
        branchId: branch,
        registerId,
        currency: 'MXN',
        businessDate: '2026-07-22',
        openingFloatMinor: '10000',
        correlationId: crypto.randomUUID(),
        idempotencyKey: `closure-open-${stamp}`,
      },
    });
    expect(opened.status()).toBe(201);
    sessionId = ((await opened.json()) as { id: string }).id;

    const product = await owner.context.post(`/v1/organizations/${tenant}/products`, {
      headers: headers(owner.csrf, `closure-product-${stamp}`),
      data: { name: 'Commerce Closure Physical', sku: `CC-${stamp}`, type: 'PHYSICAL' },
    });
    expect(product.status()).toBe(201);
    const productId = ((await product.json()) as { id: string }).id;
    const detail = (await (
      await owner.context.get(`/v1/organizations/${tenant}/products/${productId}`)
    ).json()) as { version: number; variants: { id: string }[] };
    const variantId = detail.variants[0]!.id;
    expect(
      (
        await owner.context.post(`/v1/organizations/${tenant}/products/${productId}/prices`, {
          headers: headers(owner.csrf, `closure-price-${stamp}`),
          data: { variantId, amount: '100.00', currency: 'MXN', taxProfileKey: 'MX_STANDARD' },
        })
      ).status(),
    ).toBe(201);
    expect(
      (
        await owner.context.post(`/v1/organizations/${tenant}/products/${productId}/activate`, {
          headers: headers(owner.csrf, `closure-activate-${stamp}`),
          data: { version: detail.version },
        })
      ).status(),
    ).toBe(201);

    const location = await owner.context.post(`/v1/organizations/${tenant}/inventory/locations`, {
      headers: headers(owner.csrf),
      data: {
        branchId: branch,
        type: 'WAREHOUSE',
        code: `CC-${stamp}`,
        name: 'Commerce Closure',
      },
    });
    expect(location.status()).toBe(201);
    const locationId = ((await location.json()) as { id: string }).id;
    expect(
      (
        await owner.context.put(`/v1/organizations/${tenant}/inventory/policies`, {
          headers: headers(owner.csrf),
          data: { variantId, allowNegative: false, costMethod: 'FIFO' },
        })
      ).status(),
    ).toBe(200);
    expect(
      (
        await owner.context.post(`/v1/organizations/${tenant}/inventory/movements`, {
          headers: headers(owner.csrf),
          data: {
            variantId,
            locationId,
            type: 'PURCHASE',
            state: 'ON_HAND',
            quantity: '3',
            unitCost: '40.00',
            currency: 'MXN',
            reason: 'Commerce closure stock',
            occurredAt: new Date().toISOString(),
            idempotencyKey: `closure-stock-${stamp}`,
          },
        })
      ).status(),
    ).toBe(201);

    const saleKey = `closure-sale-${stamp}`;
    const creates = await Promise.all(
      Array.from({ length: 10 }, () =>
        owner.context.post(`/v1/organizations/${tenant}/sales`, {
          headers: headers(owner.csrf, saleKey),
          data: {
            branchId: branch,
            currency: 'MXN',
            channel: 'FLUTTER_POS',
            businessDate: '2026-07-22',
          },
        }),
      ),
    );
    expect(creates.every((response) => [200, 201].includes(response.status()))).toBe(true);
    const createBodies = (await Promise.all(creates.map((response) => response.json()))) as {
      id: string;
      version: number;
    }[];
    expect(new Set(createBodies.map(({ id }) => id)).size).toBe(1);
    const saleId = createBodies[0]!.id;
    const item = await owner.context.post(`/v1/organizations/${tenant}/sales/${saleId}/items`, {
      headers: headers(owner.csrf, `closure-item-${stamp}`, 1),
      data: { productVariantId: variantId, quantity: '2' },
    });
    expect(item.status()).toBe(201);
    const itemId = ((await item.json()) as { id: string }).id;
    const checkout = await owner.context.post(
      `/v1/organizations/${tenant}/sales/${saleId}/checkout`,
      { headers: headers(owner.csrf, `closure-checkout-${stamp}`, 2) },
    );
    expect(checkout.status()).toBe(201);
    expect(await checkout.json()).toMatchObject({ totalMinor: '23200' });
    const payment = await owner.context.post(
      `/v1/organizations/${tenant}/sales/${saleId}/payments`,
      {
        headers: headers(owner.csrf, `closure-payment-${stamp}`),
        data: { method: 'CASH', amountMinor: '23200', tenderedMinor: '25000' },
      },
    );
    expect(payment.status()).toBe(201);
    expect(
      (
        await owner.context.post(`/v1/organizations/${tenant}/sales/${saleId}/complete`, {
          headers: headers(owner.csrf, `closure-complete-${stamp}`, 4),
        })
      ).status(),
    ).toBe(201);
    const receipts = await Promise.all(
      Array.from({ length: 10 }, (_, index) =>
        owner.context.post(`/v1/organizations/${tenant}/sales/${saleId}/receipt`, {
          headers: headers(owner.csrf, `closure-receipt-${stamp}-${index}`),
        }),
      ),
    );
    expect(receipts.every((response) => response.status() === 201)).toBe(true);
    const receiptIds = await Promise.all(
      receipts.map(async (response) => ((await response.json()) as { id: string }).id),
    );
    expect(new Set(receiptIds).size).toBe(1);

    const restart = spawnSync('docker', ['compose', 'restart', 'api'], { encoding: 'utf8' });
    expect(restart.status, restart.stderr).toBe(0);
    await expect
      .poll(async () => {
        try {
          return (await owner.context.get('/health/live')).status();
        } catch {
          return 0;
        }
      })
      .toBe(200);
    const replay = await owner.context.post(`/v1/organizations/${tenant}/sales`, {
      headers: headers(owner.csrf, saleKey),
      data: {
        branchId: branch,
        currency: 'MXN',
        channel: 'FLUTTER_POS',
        businessDate: '2026-07-22',
      },
    });
    expect([200, 201]).toContain(replay.status());
    expect(((await replay.json()) as { id: string }).id).toBe(saleId);

    const refund = async (suffix: string, quantity: string, amountMinor: string) => {
      const requested = await owner.context.post(
        `/v1/organizations/${tenant}/sales/${saleId}/refunds`,
        {
          headers: headers(owner.csrf, `closure-refund-${suffix}-${stamp}`),
          data: {
            lines: [
              {
                saleItemId: itemId,
                quantity,
                amountMinor,
                destination: 'AVAILABLE',
                reason: `Commerce closure ${suffix}`,
              },
            ],
          },
        },
      );
      expect(requested.status()).toBe(202);
      const refundId = ((await requested.json()) as { id: string }).id;
      const approval = await supervisor.context.post(`/v1/organizations/${tenant}/cash/approvals`, {
        headers: headers(supervisor.csrf),
        data: {
          branchId: branch,
          actionType: 'CASH_REFUND',
          resourceId: refundId,
          requiredPermission: 'cash.refund',
          thresholdMinor: amountMinor,
          reason: 'Commerce closure control',
          expiresAt: new Date(Date.now() + 600_000).toISOString(),
          correlationId: crypto.randomUUID(),
          idempotencyKey: `closure-cash-approval-${suffix}-${stamp}`,
        },
      });
      expect(approval.status()).toBe(201);
      const approvalId = ((await approval.json()) as { id: string }).id;
      expect(
        (
          await owner.context.post(
            `/v1/organizations/${tenant}/cash/approvals/${approvalId}/decision`,
            {
              headers: headers(owner.csrf),
              data: {
                decision: 'APPROVED',
                reason: 'Commerce closure approved',
                version: 1,
                idempotencyKey: `closure-cash-decision-${suffix}-${stamp}`,
              },
            },
          )
        ).status(),
      ).toBe(201);
      const approveKey = `closure-refund-approve-${suffix}-${stamp}`;
      const approved = await owner.context.post(
        `/v1/organizations/${tenant}/sales/${saleId}/refunds/${refundId}/approve`,
        { headers: headers(owner.csrf, approveKey), data: { reason: 'Commerce closure approved' } },
      );
      expect(approved.status()).toBe(200);
      const replayed = await owner.context.post(
        `/v1/organizations/${tenant}/sales/${saleId}/refunds/${refundId}/approve`,
        { headers: headers(owner.csrf, approveKey), data: { reason: 'Commerce closure approved' } },
      );
      expect(replayed.status()).toBe(200);
      await expect
        .poll(() =>
          sql(`select status from refund_intents where tenant_id='${tenant}' and id='${refundId}'`),
        )
        .toBe('COMPLETED');
    };

    await refund('partial', '0.5', '5800');
    expect(
      await (await owner.context.get(`/v1/organizations/${tenant}/sales/${saleId}`)).json(),
    ).toMatchObject({ sale: { status: 'PARTIALLY_REFUNDED' } });
    await refund('final', '1.5', '17400');

    await expect
      .poll(() =>
        sql(`
          select concat_ws(':',
            s.status,
            (select coalesce(sum(amount_minor),0) from sale_payments where tenant_id=s.tenant_id and sale_id=s.id),
            (select coalesce(sum(amount_minor),0) from refund_intents where tenant_id=s.tenant_id and sale_id=s.id and status='COMPLETED'),
            (select count(*) from sale_receipts where tenant_id=s.tenant_id and sale_id=s.id),
            (select coalesce(sum(case when direction='IN' then amount_minor else -amount_minor end),0) from cash_ledger_entries where tenant_id=s.tenant_id and sale_id=s.id),
            (select coalesce(sum(quantity),0) from inventory_movements where tenant_id=s.tenant_id and variant_id='${variantId}' and location_id='${locationId}'),
            (select count(*) from sales_outbox where tenant_id=s.tenant_id and aggregate_id=s.id and published_at is null and quarantined_at is null)
          ) from sales s where s.tenant_id='${tenant}' and s.id='${saleId}'
        `),
      )
      .toBe('REFUNDED:23200:23200:1:0:3.000000:0');

    expect(
      sql(
        `select count(*) from sales_events where tenant_id='${tenant}' and aggregate_id='${saleId}' and actor_user_id is not null and correlation_id is not null`,
      ),
    ).not.toBe('0');
    expect(
      sql(
        `select count(distinct correlation_id) from sales_events where tenant_id='${tenant}' and aggregate_id='${saleId}'`,
      ),
    ).toBe('1');
  } finally {
    if (sessionId) {
      try {
        const current = (await (
          await owner.context.get(`/v1/organizations/${tenant}/cash/sessions/${sessionId}`)
        ).json()) as { version: number; status: string };
        if (!['CLOSED', 'FORCE_CLOSED'].includes(current.status)) {
          await owner.context.post(`/v1/organizations/${tenant}/cash/sessions/${sessionId}/close`, {
            headers: headers(owner.csrf),
            data: {
              version: current.version,
              force: true,
              reason: 'Commerce closure complete',
              idempotencyKey: `closure-final-close-${Date.now()}`,
            },
          });
        }
      } catch {
        // A restart can still be crossing the socket boundary; the next serial
        // certification run closes any active fixture before opening its own.
      }
    }
    await Promise.all([owner.context.dispose(), supervisor.context.dispose()]);
  }
});
