import { expect, request, test, type APIRequestContext } from '@playwright/test';

const tenant = '10000000-0000-4000-8000-000000000001';
const branch = '20000000-0000-4000-8000-000000000001';
const cashierId = '41000000-0000-4000-8000-000000000004';
const password = process.env.TEST_PERSONA_PASSWORD ?? 'Nexo Test Persona 2026!';

async function login(email: string) {
  const context = await request.newContext({
    baseURL: 'http://127.0.0.1:3001',
    extraHTTPHeaders: { origin: 'http://localhost:3000' },
  });
  expect(
    (
      await context.post('/v1/auth/login', {
        data: { email, password, deviceFingerprint: `cash-race-${email}`, deviceName: 'Cash race' },
      })
    ).status(),
  ).toBe(200);
  const state = await context.storageState();
  return { context, csrf: state.cookies.find((cookie) => cookie.name === 'nexo_csrf')!.value };
}
const headers = (csrf: string) => ({ origin: 'http://localhost:3000', 'x-csrf-token': csrf });
const winnerAndConflict = (statuses: number[]) => expect(statuses.sort()).toEqual([201, 409]);

test.describe.serial('Cash PostgreSQL race matrix', () => {
  let owner: APIRequestContext, supervisor: APIRequestContext, cashier: APIRequestContext;
  let ownerCsrf: string, supervisorCsrf: string, cashierCsrf: string;
  let sessionId: string;

  test.beforeAll(async () => {
    ({ context: owner, csrf: ownerCsrf } = await login('alpha.owner@nexo.local'));
    ({ context: supervisor, csrf: supervisorCsrf } = await login('alpha.supervisor@nexo.local'));
    ({ context: cashier, csrf: cashierCsrf } = await login('alpha.cashier@nexo.local'));
  });
  test.afterAll(async () => {
    await Promise.all([owner.dispose(), supervisor.dispose(), cashier.dispose()]);
  });

  test('allows one opening winner for the same Register and Drawer', async () => {
    const stamp = Date.now();
    const register = await owner.post(`/v1/organizations/${tenant}/cash/registers`, {
      headers: headers(ownerCsrf),
      data: { branchId: branch, name: 'Race Register', code: `RR-${stamp}`, currency: 'MXN' },
    });
    const registerId = ((await register.json()) as { id: string }).id;
    const drawer = await owner.post(`/v1/organizations/${tenant}/cash/drawers`, {
      headers: headers(ownerCsrf),
      data: { branchId: branch, name: 'Race Drawer', code: `RD-${stamp}`, registerId },
    });
    const drawerId = ((await drawer.json()) as { id: string }).id;
    const body = {
      branchId: branch,
      registerId,
      drawerId,
      currency: 'MXN',
      businessDate: '2026-07-14',
      openingFloatMinor: '5000',
      correlationId: crypto.randomUUID(),
    };
    const [a, b] = await Promise.all([
      supervisor.post(`/v1/organizations/${tenant}/cash/sessions/open`, {
        headers: headers(supervisorCsrf),
        data: { ...body, idempotencyKey: `race-open-a-${stamp}` },
      }),
      supervisor.post(`/v1/organizations/${tenant}/cash/sessions/open`, {
        headers: headers(supervisorCsrf),
        data: { ...body, idempotencyKey: `race-open-b-${stamp}` },
      }),
    ]);
    winnerAndConflict([a.status(), b.status()]);
    const winner = a.status() === 201 ? a : b;
    sessionId = ((await winner.json()) as { id: string }).id;
  });

  test('serializes suspend and blocks a different idempotency payload', async () => {
    const current = (await (
      await owner.get(`/v1/organizations/${tenant}/cash/sessions/${sessionId}`)
    ).json()) as { version: number };
    const stamp = Date.now();
    const [a, b] = await Promise.all([
      owner.post(`/v1/organizations/${tenant}/cash/sessions/${sessionId}/suspend`, {
        headers: headers(ownerCsrf),
        data: {
          version: current.version,
          reason: 'Race A',
          idempotencyKey: `race-suspend-a-${stamp}`,
        },
      }),
      owner.post(`/v1/organizations/${tenant}/cash/sessions/${sessionId}/suspend`, {
        headers: headers(ownerCsrf),
        data: {
          version: current.version,
          reason: 'Race B',
          idempotencyKey: `race-suspend-b-${stamp}`,
        },
      }),
    ]);
    winnerAndConflict([a.status(), b.status()]);
    const suspended = (await (
      await owner.get(`/v1/organizations/${tenant}/cash/sessions/${sessionId}`)
    ).json()) as { version: number };
    expect(
      (
        await owner.post(`/v1/organizations/${tenant}/cash/sessions/${sessionId}/resume`, {
          headers: headers(ownerCsrf),
          data: {
            version: suspended.version,
            reason: 'Continue',
            idempotencyKey: `race-resume-${stamp}`,
          },
        })
      ).status(),
    ).toBe(201);
  });

  test('produces one approval decision under approve/reject race', async () => {
    const stamp = Date.now();
    const requested = await supervisor.post(`/v1/organizations/${tenant}/cash/approvals`, {
      headers: headers(supervisorCsrf),
      data: {
        branchId: branch,
        actionType: 'WITHDRAWAL',
        resourceId: sessionId,
        requiredPermission: 'cash.withdraw',
        reason: 'Race approval',
        expiresAt: new Date(Date.now() + 600_000).toISOString(),
        correlationId: crypto.randomUUID(),
        idempotencyKey: `race-approval-${stamp}`,
      },
    });
    const approval = (await requested.json()) as { id: string };
    const [approved, rejected] = await Promise.all([
      owner.post(`/v1/organizations/${tenant}/cash/approvals/${approval.id}/decision`, {
        headers: headers(ownerCsrf),
        data: {
          decision: 'APPROVED',
          reason: 'Approve',
          version: 1,
          idempotencyKey: `race-approve-${stamp}`,
        },
      }),
      cashier.post(`/v1/organizations/${tenant}/cash/approvals/${approval.id}/decision`, {
        headers: headers(cashierCsrf),
        data: {
          decision: 'REJECTED',
          reason: 'Reject',
          version: 1,
          idempotencyKey: `race-reject-${stamp}`,
        },
      }),
    ]);
    winnerAndConflict([approved.status(), rejected.status()]);
  });

  test('serializes deposit handover and cancellation without ledger duplication', async () => {
    const stamp = Date.now();
    await owner.post(`/v1/organizations/${tenant}/cash/policies`, {
      headers: headers(ownerCsrf),
      data: {
        branchId: branch,
        configuration: {
          depositApprovalRequired: false,
          transferAllowed: true,
          reopenAllowed: true,
        },
        idempotencyKey: `race-policy-${stamp}`,
      },
    });
    const prepared = await owner.post(
      `/v1/organizations/${tenant}/cash/sessions/${sessionId}/deposits`,
      {
        headers: headers(ownerCsrf),
        data: {
          amountMinor: '500',
          currency: 'MXN',
          destination: 'Safe',
          reason: 'Race deposit',
          correlationId: crypto.randomUUID(),
          idempotencyKey: `race-deposit-${stamp}`,
        },
      },
    );
    const depositId = ((await prepared.json()) as { id: string }).id;
    const [handover, cancel] = await Promise.all([
      owner.post(`/v1/organizations/${tenant}/cash/deposits/${depositId}/transition`, {
        headers: headers(ownerCsrf),
        data: {
          status: 'HANDED_OVER',
          reason: 'Handover won',
          idempotencyKey: `race-handover-${stamp}`,
        },
      }),
      owner.post(`/v1/organizations/${tenant}/cash/deposits/${depositId}/transition`, {
        headers: headers(ownerCsrf),
        data: { status: 'CANCELLED', reason: 'Cancel won', idempotencyKey: `race-cancel-${stamp}` },
      }),
    ]);
    winnerAndConflict([handover.status(), cancel.status()]);
  });

  test('serializes handoff accept/reject', async () => {
    const stamp = Date.now();
    const initiated = await owner.post(
      `/v1/organizations/${tenant}/cash/sessions/${sessionId}/handoffs`,
      {
        headers: headers(ownerCsrf),
        data: {
          incomingCashierId: cashierId,
          reason: 'Race handoff',
          expiresAt: new Date(Date.now() + 600_000).toISOString(),
          correlationId: crypto.randomUUID(),
          idempotencyKey: `race-handoff-${stamp}`,
        },
      },
    );
    let handoff = (await initiated.json()) as {
      id: string;
      version: number;
      expectedAmountMinor: string;
    };
    const counted = await owner.post(
      `/v1/organizations/${tenant}/cash/handoffs/${handoff.id}/count`,
      {
        headers: headers(ownerCsrf),
        data: {
          totalMinor: handoff.expectedAmountMinor,
          version: handoff.version,
          idempotencyKey: `race-handoff-count-${stamp}`,
        },
      },
    );
    handoff = (await counted.json()) as typeof handoff;
    const [accept, reject] = await Promise.all([
      cashier.post(`/v1/organizations/${tenant}/cash/handoffs/${handoff.id}/decision`, {
        headers: headers(cashierCsrf),
        data: {
          decision: 'ACCEPTED',
          reason: 'Accept',
          version: handoff.version,
          idempotencyKey: `race-handoff-accept-${stamp}`,
        },
      }),
      cashier.post(`/v1/organizations/${tenant}/cash/handoffs/${handoff.id}/decision`, {
        headers: headers(cashierCsrf),
        data: {
          decision: 'REJECTED',
          reason: 'Reject',
          version: handoff.version,
          idempotencyKey: `race-handoff-reject-${stamp}`,
        },
      }),
    ]);
    winnerAndConflict([accept.status(), reject.status()]);
  });

  test('releases the concurrency fixture without rewriting its ledger', async () => {
    const current = (await (
      await owner.get(`/v1/organizations/${tenant}/cash/sessions/${sessionId}`)
    ).json()) as { version: number };
    const response = await owner.post(
      `/v1/organizations/${tenant}/cash/sessions/${sessionId}/close`,
      {
        headers: headers(ownerCsrf),
        data: {
          version: current.version,
          force: true,
          reason: 'Concurrency fixture cleanup',
          idempotencyKey: `race-force-close-${Date.now()}`,
        },
      },
    );
    expect(response.status()).toBe(201);
  });
});
