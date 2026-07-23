import { expect, request, test, type APIRequestContext } from '@playwright/test';

const tenant = '10000000-0000-4000-8000-000000000001';
const branch = '20000000-0000-4000-8000-000000000001';
const incomingCashier = '41000000-0000-4000-8000-000000000004';
const password = process.env.TEST_PERSONA_PASSWORD ?? 'Nexo Test Persona 2026!';

async function login(email: string) {
  const context = await request.newContext({
    baseURL: 'http://127.0.0.1:3001',
    extraHTTPHeaders: { origin: 'http://localhost:3000' },
  });
  const response = await context.post('/v1/auth/login', {
    data: { email, password, deviceFingerprint: `cash-${email}`, deviceName: 'Cash E2E' },
  });
  expect(response.status()).toBe(200);
  const state = await context.storageState();
  return { context, csrf: state.cookies.find((cookie) => cookie.name === 'nexo_csrf')!.value };
}

const headers = (csrf: string) => ({
  origin: 'http://localhost:3000',
  'x-csrf-token': csrf,
});

test.describe.serial('Cash completion with real PostgreSQL', () => {
  let owner: APIRequestContext;
  let supervisor: APIRequestContext;
  let cashier: APIRequestContext;
  let ownerCsrf: string;
  let supervisorCsrf: string;
  let cashierCsrf: string;
  let sessionId: string;
  let secondSessionId: string;

  test.beforeAll(async () => {
    ({ context: owner, csrf: ownerCsrf } = await login('alpha.owner@nexo.local'));
    ({ context: supervisor, csrf: supervisorCsrf } = await login('alpha.supervisor@nexo.local'));
    ({ context: cashier, csrf: cashierCsrf } = await login('alpha.cashier@nexo.local'));
  });

  test.afterAll(async () => {
    for (const id of [sessionId, secondSessionId].filter(Boolean)) {
      const current = await owner.get(`/v1/organizations/${tenant}/cash/sessions/${id}`);
      if (current.status() === 200) {
        const body = (await current.json()) as { status: string; version: number };
        if (!['CLOSED', 'FORCE_CLOSED'].includes(body.status)) {
          await owner.post(`/v1/organizations/${tenant}/cash/sessions/${id}/close`, {
            headers: headers(ownerCsrf),
            data: {
              version: body.version,
              force: true,
              reason: 'Cash E2E fixture cleanup',
              idempotencyKey: crypto.randomUUID(),
            },
          });
        }
      }
    }
    await Promise.all([owner.dispose(), supervisor.dispose(), cashier.dispose()]);
  });

  test('opens, suspends and resumes with safe replay', async () => {
    const stamp = Date.now();
    const register = await owner.post(`/v1/organizations/${tenant}/cash/registers`, {
      headers: headers(ownerCsrf),
      data: { branchId: branch, name: 'Cash Main', code: `CM-${stamp}`, currency: 'MXN' },
    });
    expect(register.status()).toBe(201);
    const registerId = ((await register.json()) as { id: string }).id;
    const drawer = await owner.post(`/v1/organizations/${tenant}/cash/drawers`, {
      headers: headers(ownerCsrf),
      data: { branchId: branch, name: 'Drawer Main', code: `DM-${stamp}`, registerId },
    });
    expect(drawer.status()).toBe(201);
    const drawerId = ((await drawer.json()) as { id: string }).id;
    const opened = await owner.post(`/v1/organizations/${tenant}/cash/sessions/open`, {
      headers: headers(ownerCsrf),
      data: {
        branchId: branch,
        registerId,
        drawerId,
        currency: 'MXN',
        businessDate: '2026-07-14',
        openingFloatMinor: '10000',
        idempotencyKey: `open-${stamp}`,
        correlationId: crypto.randomUUID(),
      },
    });
    const initial = (await opened.json()) as { id: string; version: number; message?: string };
    expect(opened.status(), JSON.stringify(initial)).toBe(201);
    sessionId = initial.id;

    const suspendBody = {
      version: initial.version,
      reason: 'Scheduled break',
      idempotencyKey: `suspend-${stamp}`,
    };
    const [first, concurrent] = await Promise.all([
      owner.post(`/v1/organizations/${tenant}/cash/sessions/${sessionId}/suspend`, {
        headers: headers(ownerCsrf),
        data: suspendBody,
      }),
      owner.post(`/v1/organizations/${tenant}/cash/sessions/${sessionId}/suspend`, {
        headers: headers(ownerCsrf),
        data: suspendBody,
      }),
    ]);
    expect([first.status(), concurrent.status()].sort()).toEqual([201, 201]);
    const suspended = (await first.json()) as { version: number };
    const resumed = await owner.post(
      `/v1/organizations/${tenant}/cash/sessions/${sessionId}/resume`,
      {
        headers: headers(ownerCsrf),
        data: {
          version: suspended.version,
          reason: 'Break completed',
          idempotencyKey: `resume-${stamp}`,
        },
      },
    );
    expect(resumed.status()).toBe(201);
  });

  test('persists policy, blocks self approval and prepares deposit', async () => {
    const stamp = Date.now();
    const policy = await owner.post(`/v1/organizations/${tenant}/cash/policies`, {
      headers: headers(ownerCsrf),
      data: {
        branchId: branch,
        configuration: {
          depositApprovalRequired: true,
          selfApprovalAllowed: false,
          transferAllowed: true,
          reopenAllowed: true,
        },
        idempotencyKey: `policy-${stamp}`,
      },
    });
    expect(policy.status()).toBe(201);
    const requestApproval = await supervisor.post(`/v1/organizations/${tenant}/cash/approvals`, {
      headers: headers(supervisorCsrf),
      data: {
        branchId: branch,
        actionType: 'DEPOSIT',
        resourceId: sessionId,
        requiredPermission: 'cash.deposit',
        reason: 'Safe deposit',
        expiresAt: new Date(Date.now() + 600_000).toISOString(),
        correlationId: crypto.randomUUID(),
        idempotencyKey: `approval-${stamp}`,
      },
    });
    expect(requestApproval.status()).toBe(201);
    const approval = (await requestApproval.json()) as { id: string };
    const selfDecision = await supervisor.post(
      `/v1/organizations/${tenant}/cash/approvals/${approval.id}/decision`,
      {
        headers: headers(supervisorCsrf),
        data: { decision: 'APPROVED', reason: 'Self', version: 1, idempotencyKey: `self-${stamp}` },
      },
    );
    expect(selfDecision.status()).toBe(409);
    const decision = await owner.post(
      `/v1/organizations/${tenant}/cash/approvals/${approval.id}/decision`,
      {
        headers: headers(ownerCsrf),
        data: {
          decision: 'APPROVED',
          reason: 'Approved by owner',
          version: 1,
          idempotencyKey: `decision-${stamp}`,
        },
      },
    );
    expect(decision.status()).toBe(201);
    const deposit = await owner.post(
      `/v1/organizations/${tenant}/cash/sessions/${sessionId}/deposits`,
      {
        headers: headers(ownerCsrf),
        data: {
          amountMinor: '1000',
          currency: 'MXN',
          destination: 'Safe',
          reason: 'Daily safe deposit',
          approvalId: approval.id,
          correlationId: crypto.randomUUID(),
          idempotencyKey: `deposit-${stamp}`,
        },
      },
    );
    expect(deposit.status()).toBe(201);
    const prepared = (await deposit.json()) as { id: string; status: string };
    expect(prepared.status).toBe('PREPARED');
    const handedOver = await owner.post(
      `/v1/organizations/${tenant}/cash/deposits/${prepared.id}/transition`,
      {
        headers: headers(ownerCsrf),
        data: {
          status: 'HANDED_OVER',
          reason: 'Custody transferred to safe operator',
          idempotencyKey: `deposit-handover-${stamp}`,
        },
      },
    );
    expect(handedOver.status()).toBe(201);
    const confirmed = await owner.post(
      `/v1/organizations/${tenant}/cash/deposits/${prepared.id}/transition`,
      {
        headers: headers(ownerCsrf),
        data: {
          status: 'CONFIRMED_MANUALLY',
          reason: 'Manual receipt verified; not bank reconciliation',
          idempotencyKey: `deposit-confirm-${stamp}`,
        },
      },
    );
    expect(confirmed.status()).toBe(201);
    const invalidCancel = await owner.post(
      `/v1/organizations/${tenant}/cash/deposits/${prepared.id}/transition`,
      {
        headers: headers(ownerCsrf),
        data: {
          status: 'CANCELLED',
          reason: 'Invalid late cancellation',
          idempotencyKey: `deposit-invalid-cancel-${stamp}`,
        },
      },
    );
    expect(invalidCancel.status()).toBe(409);

    const cancellable = await owner.post(
      `/v1/organizations/${tenant}/cash/sessions/${sessionId}/deposits`,
      {
        headers: headers(ownerCsrf),
        data: {
          amountMinor: '500',
          currency: 'MXN',
          destination: 'Safe',
          reason: 'Deposit cancelled before custody transfer',
          approvalId: approval.id,
          correlationId: crypto.randomUUID(),
          idempotencyKey: `deposit-cancellable-${stamp}`,
        },
      },
    );
    expect(cancellable.status()).toBe(201);
    const cancellableBody = (await cancellable.json()) as { id: string };
    const cancelled = await owner.post(
      `/v1/organizations/${tenant}/cash/deposits/${cancellableBody.id}/transition`,
      {
        headers: headers(ownerCsrf),
        data: {
          status: 'CANCELLED',
          reason: 'Deposit retained in drawer',
          idempotencyKey: `deposit-cancel-${stamp}`,
        },
      },
    );
    expect(cancelled.status()).toBe(201);
    const cancelledReplay = await owner.post(
      `/v1/organizations/${tenant}/cash/deposits/${cancellableBody.id}/transition`,
      {
        headers: headers(ownerCsrf),
        data: {
          status: 'CANCELLED',
          reason: 'Deposit retained in drawer',
          idempotencyKey: `deposit-cancel-${stamp}`,
        },
      },
    );
    expect(await cancelledReplay.json()).toEqual(await cancelled.json());
  });

  test('transfers atomically with exact idempotent replay and records handoff', async () => {
    const stamp = Date.now();
    const register = await owner.post(`/v1/organizations/${tenant}/cash/registers`, {
      headers: headers(ownerCsrf),
      data: { branchId: branch, name: 'Cash Secondary', code: `CS-${stamp}`, currency: 'MXN' },
    });
    expect(register.status()).toBe(201);
    const registerId = ((await register.json()) as { id: string }).id;
    const opened = await supervisor.post(`/v1/organizations/${tenant}/cash/sessions/open`, {
      headers: headers(supervisorCsrf),
      data: {
        branchId: branch,
        registerId,
        currency: 'MXN',
        businessDate: '2026-07-14',
        openingFloatMinor: '5000',
        idempotencyKey: `open-secondary-${stamp}`,
        correlationId: crypto.randomUUID(),
      },
    });
    expect(opened.status()).toBe(201);
    secondSessionId = ((await opened.json()) as { id: string }).id;
    const transferBody = {
      sourceSessionId: sessionId,
      destinationSessionId: secondSessionId,
      amountMinor: '500',
      currency: 'MXN',
      reason: 'Change transfer',
      correlationId: crypto.randomUUID(),
      idempotencyKey: `transfer-${stamp}`,
    };
    const transfer = await owner.post(`/v1/organizations/${tenant}/cash/transfers`, {
      headers: headers(ownerCsrf),
      data: transferBody,
    });
    expect(transfer.status()).toBe(201);
    const replay = await owner.post(`/v1/organizations/${tenant}/cash/transfers`, {
      headers: headers(ownerCsrf),
      data: transferBody,
    });
    expect(replay.status()).toBe(201);
    expect(await replay.json()).toEqual(await transfer.json());

    const initiated = await owner.post(
      `/v1/organizations/${tenant}/cash/sessions/${secondSessionId}/handoffs`,
      {
        headers: headers(ownerCsrf),
        data: {
          incomingCashierId: incomingCashier,
          reason: 'End supervisor custody',
          expiresAt: new Date(Date.now() + 600_000).toISOString(),
          correlationId: crypto.randomUUID(),
          idempotencyKey: `handoff-initiate-${stamp}`,
        },
      },
    );
    expect(initiated.status()).toBe(201);
    let handoff = (await initiated.json()) as {
      id: string;
      version: number;
      status: string;
      expectedAmountMinor: string;
    };
    expect(handoff.status).toBe('COUNT_REQUIRED');
    const counted = await owner.post(
      `/v1/organizations/${tenant}/cash/handoffs/${handoff.id}/count`,
      {
        headers: headers(ownerCsrf),
        data: {
          denominations: [
            {
              denominationMinor: '100',
              quantity: Number(handoff.expectedAmountMinor) / 100,
            },
          ],
          version: handoff.version,
          idempotencyKey: `handoff-count-${stamp}`,
        },
      },
    );
    expect(counted.status()).toBe(201);
    handoff = (await counted.json()) as typeof handoff;
    expect(handoff.status).toBe('PENDING_ACCEPTANCE');
    const accepted = await cashier.post(
      `/v1/organizations/${tenant}/cash/handoffs/${handoff.id}/decision`,
      {
        headers: headers(cashierCsrf),
        data: {
          decision: 'ACCEPTED',
          reason: 'Cash and custody verified',
          version: handoff.version,
          idempotencyKey: `handoff-accept-${stamp}`,
        },
      },
    );
    expect(accepted.status()).toBe(201);
    handoff = (await accepted.json()) as typeof handoff;
    const completed = await owner.post(
      `/v1/organizations/${tenant}/cash/handoffs/${handoff.id}/complete`,
      {
        headers: headers(ownerCsrf),
        data: { version: handoff.version, idempotencyKey: `handoff-complete-${stamp}` },
      },
    );
    expect(completed.status()).toBe(201);
    expect(((await completed.json()) as { status: string }).status).toBe('COMPLETED');
  });

  test('closes and reopens with bound approval while preserving history', async () => {
    const stamp = Date.now();
    const before = (await (
      await owner.get(`/v1/organizations/${tenant}/cash/sessions/${sessionId}`)
    ).json()) as { version: number; expectedAmountMinor: string };
    const count = await owner.post(
      `/v1/organizations/${tenant}/cash/sessions/${sessionId}/counts`,
      {
        headers: headers(ownerCsrf),
        data: {
          currency: 'MXN',
          totalMinor: before.expectedAmountMinor,
          idempotencyKey: `reopen-count-${stamp}`,
        },
      },
    );
    expect(count.status()).toBe(201);
    const reconcile = await owner.post(
      `/v1/organizations/${tenant}/cash/sessions/${sessionId}/reconcile`,
      {
        headers: headers(ownerCsrf),
        data: { idempotencyKey: `reopen-reconcile-${stamp}` },
      },
    );
    expect(reconcile.status()).toBe(201);
    const ready = (await (
      await owner.get(`/v1/organizations/${tenant}/cash/sessions/${sessionId}`)
    ).json()) as { version: number };
    const closed = await owner.post(
      `/v1/organizations/${tenant}/cash/sessions/${sessionId}/close`,
      {
        headers: headers(ownerCsrf),
        data: { version: ready.version, idempotencyKey: `reopen-close-${stamp}` },
      },
    );
    expect(closed.status()).toBe(201);
    const closedBody = (await closed.json()) as { version: number; status: string };
    expect(closedBody.status).toBe('CLOSED');

    const requestApproval = await supervisor.post(`/v1/organizations/${tenant}/cash/approvals`, {
      headers: headers(supervisorCsrf),
      data: {
        branchId: branch,
        actionType: 'REOPEN',
        resourceId: sessionId,
        requiredPermission: 'cash.session.reopen',
        reason: 'Corrective operation required',
        expiresAt: new Date(Date.now() + 600_000).toISOString(),
        correlationId: crypto.randomUUID(),
        idempotencyKey: `reopen-approval-${stamp}`,
      },
    });
    expect(requestApproval.status()).toBe(201);
    const approval = (await requestApproval.json()) as { id: string; version: number };
    const decision = await owner.post(
      `/v1/organizations/${tenant}/cash/approvals/${approval.id}/decision`,
      {
        headers: headers(ownerCsrf),
        data: {
          decision: 'APPROVED',
          reason: 'Controlled correction authorized',
          version: approval.version ?? 1,
          idempotencyKey: `reopen-decision-${stamp}`,
        },
      },
    );
    expect(decision.status()).toBe(201);
    const reopenBody = {
      version: closedBody.version,
      reason: 'Corrective operation only',
      approvalId: approval.id,
      correlationId: crypto.randomUUID(),
      idempotencyKey: `reopen-${stamp}`,
    };
    const [reopened, replay] = await Promise.all([
      owner.post(`/v1/organizations/${tenant}/cash/sessions/${sessionId}/reopen`, {
        headers: headers(ownerCsrf),
        data: reopenBody,
      }),
      owner.post(`/v1/organizations/${tenant}/cash/sessions/${sessionId}/reopen`, {
        headers: headers(ownerCsrf),
        data: reopenBody,
      }),
    ]);
    expect([reopened.status(), replay.status()].sort()).toEqual([201, 201]);
    expect((await reopened.json()) as object).toMatchObject({ status: 'REOPENED' });
    const timeline = (await (
      await owner.get(`/v1/organizations/${tenant}/cash/sessions/${sessionId}/timeline`)
    ).json()) as unknown[];
    expect(timeline.length).toBeGreaterThan(0);
  });
});
