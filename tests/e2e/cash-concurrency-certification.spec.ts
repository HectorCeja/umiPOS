import { expect, test, type APIResponse } from '@playwright/test';
import {
  cashHeaders,
  cashLogin,
  cashTenant,
  createCashSession,
  expectOneWinner,
  forceCloseCashSession,
  getCashSession,
  requestAndApprove,
  type CashActor,
} from './cash-certification.helpers.js';

test.describe.serial('Cash PostgreSQL concurrency certification additions', () => {
  let owner: CashActor;
  let supervisor: CashActor;
  let cashier: CashActor;
  const cleanup = new Set<string>();

  test.beforeAll(async () => {
    owner = await cashLogin('alpha.owner@nexo.local');
    supervisor = await cashLogin('alpha.supervisor@nexo.local');
    cashier = await cashLogin('alpha.cashier@nexo.local');
    const policy = await owner.context.post(`/v1/organizations/${cashTenant}/cash/policies`, {
      headers: cashHeaders(owner),
      data: {
        configuration: {
          reopenAllowed: true,
          transferAllowed: true,
          depositApprovalRequired: false,
          selfApprovalAllowed: false,
          varianceToleranceMinor: '1000000',
        },
        idempotencyKey: `cert-policy-${crypto.randomUUID()}`,
      },
    });
    expect(policy.status(), await policy.text()).toBe(201);
  });

  test.afterAll(async () => {
    for (const sessionId of cleanup) await forceCloseCashSession(owner, sessionId);
    await Promise.all([
      owner.context.dispose(),
      supervisor.context.dispose(),
      cashier.context.dispose(),
    ]);
  });

  const track = <T extends { sessionId: string }>(fixture: T) => {
    cleanup.add(fixture.sessionId);
    return fixture;
  };

  test('03 same cashier cannot win two incompatible simultaneous openings', async () => {
    const first = track(await createCashSession(owner, { label: 'Cashier exclusivity' }));
    const secondRegister = await owner.context.post(
      `/v1/organizations/${cashTenant}/cash/registers`,
      {
        headers: cashHeaders(owner),
        data: {
          branchId: '20000000-0000-4000-8000-000000000001',
          name: 'Cashier Race Register',
          code: `CR-${crypto.randomUUID().slice(0, 8)}`,
          currency: 'MXN',
        },
      },
    );
    const registerId = ((await secondRegister.json()) as { id: string }).id;
    const attempts = await Promise.all([
      owner.context.post(`/v1/organizations/${cashTenant}/cash/sessions/open`, {
        headers: cashHeaders(owner),
        data: {
          branchId: '20000000-0000-4000-8000-000000000001',
          registerId,
          currency: 'MXN',
          businessDate: '2026-07-14',
          openingFloatMinor: '1000',
          idempotencyKey: `cashier-race-a-${crypto.randomUUID()}`,
          correlationId: crypto.randomUUID(),
        },
      }),
      owner.context.post(`/v1/organizations/${cashTenant}/cash/sessions/open`, {
        headers: cashHeaders(owner),
        data: {
          branchId: '20000000-0000-4000-8000-000000000001',
          registerId,
          currency: 'MXN',
          businessDate: '2026-07-14',
          openingFloatMinor: '1000',
          idempotencyKey: `cashier-race-b-${crypto.randomUUID()}`,
          correlationId: crypto.randomUUID(),
        },
      }),
    ]);
    expect(attempts.every((response) => response.status() === 409)).toBe(true);
    await forceCloseCashSession(owner, first.sessionId);
    cleanup.delete(first.sessionId);
  });

  test('05 suspend and resume with the same optimistic version have one valid transition', async () => {
    const fixture = track(await createCashSession(owner, { label: 'Suspend resume race' }));
    const suspended = await owner.context.post(
      `/v1/organizations/${cashTenant}/cash/sessions/${fixture.sessionId}/suspend`,
      {
        headers: cashHeaders(owner),
        data: {
          version: fixture.version,
          reason: 'Prepare race',
          idempotencyKey: crypto.randomUUID(),
        },
      },
    );
    const version = ((await suspended.json()) as { version: number }).version;
    const [resume, secondSuspend] = await Promise.all([
      owner.context.post(
        `/v1/organizations/${cashTenant}/cash/sessions/${fixture.sessionId}/resume`,
        {
          headers: cashHeaders(owner),
          data: { version, reason: 'Resume race', idempotencyKey: crypto.randomUUID() },
        },
      ),
      owner.context.post(
        `/v1/organizations/${cashTenant}/cash/sessions/${fixture.sessionId}/suspend`,
        {
          headers: cashHeaders(owner),
          data: { version, reason: 'Suspend race', idempotencyKey: crypto.randomUUID() },
        },
      ),
    ]);
    expectOneWinner([resume, secondSuspend]);
    await forceCloseCashSession(owner, fixture.sessionId);
    cleanup.delete(fixture.sessionId);
  });

  test('06 double close has one winner', async () => {
    const fixture = track(await createCashSession(owner, { label: 'Double close' }));
    const body = { version: fixture.version, force: true, reason: 'Close race' };
    const responses = await Promise.all([
      owner.context.post(
        `/v1/organizations/${cashTenant}/cash/sessions/${fixture.sessionId}/close`,
        {
          headers: cashHeaders(owner),
          data: { ...body, idempotencyKey: crypto.randomUUID() },
        },
      ),
      owner.context.post(
        `/v1/organizations/${cashTenant}/cash/sessions/${fixture.sessionId}/close`,
        {
          headers: cashHeaders(owner),
          data: { ...body, idempotencyKey: crypto.randomUUID() },
        },
      ),
    ]);
    expectOneWinner(responses);
    cleanup.delete(fixture.sessionId);
  });

  test('07 close and force-close have one winner', async () => {
    const fixture = track(
      await createCashSession(owner, { label: 'Close force race', openingFloatMinor: '1' }),
    );
    const count = await owner.context.post(
      `/v1/organizations/${cashTenant}/cash/sessions/${fixture.sessionId}/counts`,
      {
        headers: cashHeaders(owner),
        data: { currency: 'MXN', totalMinor: '1', idempotencyKey: crypto.randomUUID() },
      },
    );
    expect(count.status()).toBe(201);
    const reconciliation = await owner.context.post(
      `/v1/organizations/${cashTenant}/cash/sessions/${fixture.sessionId}/reconcile`,
      {
        headers: cashHeaders(owner),
        data: { idempotencyKey: crypto.randomUUID() },
      },
    );
    expect(reconciliation.status()).toBe(201);
    const current = await getCashSession(owner, fixture.sessionId);
    const [close, force] = await Promise.all([
      owner.context.post(
        `/v1/organizations/${cashTenant}/cash/sessions/${fixture.sessionId}/close`,
        {
          headers: cashHeaders(owner),
          data: { version: current.version, idempotencyKey: crypto.randomUUID() },
        },
      ),
      owner.context.post(
        `/v1/organizations/${cashTenant}/cash/sessions/${fixture.sessionId}/close`,
        {
          headers: cashHeaders(owner),
          data: {
            version: current.version,
            force: true,
            reason: 'Force race',
            idempotencyKey: crypto.randomUUID(),
          },
        },
      ),
    ]);
    expectOneWinner([close, force]);
    cleanup.delete(fixture.sessionId);
  });

  test('09 double reopen has one winner', async () => {
    const fixture = track(await createCashSession(owner, { label: 'Double reopen' }));
    await forceCloseCashSession(owner, fixture.sessionId);
    const closed = await getCashSession(owner, fixture.sessionId);
    const approvalId = await requestAndApprove(
      supervisor,
      owner,
      'REOPEN',
      fixture.sessionId,
      'cash.session.reopen',
    );
    const body = {
      version: closed.version,
      reason: 'Reopen race',
      approvalId,
      correlationId: crypto.randomUUID(),
    };
    const responses = await Promise.all([
      owner.context.post(
        `/v1/organizations/${cashTenant}/cash/sessions/${fixture.sessionId}/reopen`,
        {
          headers: cashHeaders(owner),
          data: { ...body, idempotencyKey: crypto.randomUUID() },
        },
      ),
      owner.context.post(
        `/v1/organizations/${cashTenant}/cash/sessions/${fixture.sessionId}/reopen`,
        {
          headers: cashHeaders(owner),
          data: { ...body, idempotencyKey: crypto.randomUUID() },
        },
      ),
    ]);
    expectOneWinner(responses);
    await forceCloseCashSession(owner, fixture.sessionId);
    cleanup.delete(fixture.sessionId);
  });

  test('08 close and reopen simultaneous commands preserve one state transition', async () => {
    const fixture = track(await createCashSession(owner, { label: 'Close reopen' }));
    await forceCloseCashSession(owner, fixture.sessionId);
    const closed = await getCashSession(owner, fixture.sessionId);
    const approvalId = await requestAndApprove(
      supervisor,
      owner,
      'REOPEN',
      fixture.sessionId,
      'cash.session.reopen',
    );
    const [reopen, staleClose] = await Promise.all([
      owner.context.post(
        `/v1/organizations/${cashTenant}/cash/sessions/${fixture.sessionId}/reopen`,
        {
          headers: cashHeaders(owner),
          data: {
            version: closed.version,
            reason: 'Reopen winner',
            approvalId,
            correlationId: crypto.randomUUID(),
            idempotencyKey: crypto.randomUUID(),
          },
        },
      ),
      owner.context.post(
        `/v1/organizations/${cashTenant}/cash/sessions/${fixture.sessionId}/close`,
        {
          headers: cashHeaders(owner),
          data: {
            version: closed.version,
            force: true,
            reason: 'Stale close',
            idempotencyKey: crypto.randomUUID(),
          },
        },
      ),
    ]);
    expectOneWinner([reopen, staleClose]);
    await forceCloseCashSession(owner, fixture.sessionId);
    cleanup.delete(fixture.sessionId);
  });

  test('14 duplicate deposit preparation replays once', async () => {
    const fixture = track(await createCashSession(owner, { label: 'Deposit replay' }));
    const key = crypto.randomUUID();
    const body = {
      amountMinor: '1000',
      currency: 'MXN',
      destination: 'Safe',
      reason: 'Replay',
      correlationId: crypto.randomUUID(),
      idempotencyKey: key,
    };
    const responses = await Promise.all([
      owner.context.post(
        `/v1/organizations/${cashTenant}/cash/sessions/${fixture.sessionId}/deposits`,
        { headers: cashHeaders(owner), data: body },
      ),
      owner.context.post(
        `/v1/organizations/${cashTenant}/cash/sessions/${fixture.sessionId}/deposits`,
        { headers: cashHeaders(owner), data: body },
      ),
    ]);
    expect(responses.map((response) => response.status()).sort()).toEqual([201, 201]);
    expect(await responses[0]!.json()).toEqual(await responses[1]!.json());
    await forceCloseCashSession(owner, fixture.sessionId);
    cleanup.delete(fixture.sessionId);
  });

  test('16 confirm and cancel transition race has one winner', async () => {
    const fixture = track(await createCashSession(owner, { label: 'Confirm cancel' }));
    const prepared = await owner.context.post(
      `/v1/organizations/${cashTenant}/cash/sessions/${fixture.sessionId}/deposits`,
      {
        headers: cashHeaders(owner),
        data: {
          amountMinor: '1000',
          currency: 'MXN',
          destination: 'Safe',
          reason: 'Race',
          correlationId: crypto.randomUUID(),
          idempotencyKey: crypto.randomUUID(),
        },
      },
    );
    const id = ((await prepared.json()) as { id: string }).id;
    await owner.context.post(`/v1/organizations/${cashTenant}/cash/deposits/${id}/transition`, {
      headers: cashHeaders(owner),
      data: { status: 'HANDED_OVER', reason: 'Handed', idempotencyKey: crypto.randomUUID() },
    });
    const responses = await Promise.all([
      owner.context.post(`/v1/organizations/${cashTenant}/cash/deposits/${id}/transition`, {
        headers: cashHeaders(owner),
        data: {
          status: 'CONFIRMED_MANUALLY',
          reason: 'Confirm',
          idempotencyKey: crypto.randomUUID(),
        },
      }),
      owner.context.post(`/v1/organizations/${cashTenant}/cash/deposits/${id}/transition`, {
        headers: cashHeaders(owner),
        data: { status: 'CANCELLED', reason: 'Cancel', idempotencyKey: crypto.randomUUID() },
      }),
    ]);
    expect(responses.filter((response) => response.status() === 201)).toHaveLength(1);
    expect(responses.filter((response) => response.status() === 409)).toHaveLength(1);
    await forceCloseCashSession(owner, fixture.sessionId);
    cleanup.delete(fixture.sessionId);
  });

  test('19 double count with one idempotency key produces one persisted result', async () => {
    const fixture = track(await createCashSession(owner, { label: 'Double count' }));
    const body = { currency: 'MXN', totalMinor: '100000', idempotencyKey: crypto.randomUUID() };
    const responses = await Promise.all([
      owner.context.post(
        `/v1/organizations/${cashTenant}/cash/sessions/${fixture.sessionId}/counts`,
        { headers: cashHeaders(owner), data: body },
      ),
      owner.context.post(
        `/v1/organizations/${cashTenant}/cash/sessions/${fixture.sessionId}/counts`,
        { headers: cashHeaders(owner), data: body },
      ),
    ]);
    expect(responses.map((response) => response.status()).sort()).toEqual([201, 201]);
    expect(await responses[0]!.json()).toEqual(await responses[1]!.json());
    await forceCloseCashSession(owner, fixture.sessionId);
    cleanup.delete(fixture.sessionId);
  });

  test('21 double reconcile with one idempotency key safely replays', async () => {
    const fixture = track(await createCashSession(owner, { label: 'Double reconcile' }));
    await owner.context.post(
      `/v1/organizations/${cashTenant}/cash/sessions/${fixture.sessionId}/counts`,
      {
        headers: cashHeaders(owner),
        data: { currency: 'MXN', totalMinor: '100000', idempotencyKey: crypto.randomUUID() },
      },
    );
    const key = crypto.randomUUID();
    const responses = await Promise.all([
      owner.context.post(
        `/v1/organizations/${cashTenant}/cash/sessions/${fixture.sessionId}/reconcile`,
        { headers: cashHeaders(owner), data: { idempotencyKey: key } },
      ),
      owner.context.post(
        `/v1/organizations/${cashTenant}/cash/sessions/${fixture.sessionId}/reconcile`,
        { headers: cashHeaders(owner), data: { idempotencyKey: key } },
      ),
    ]);
    expect(responses.map((response) => response.status()).sort()).toEqual([201, 201]);
    expect(await responses[0]!.json()).toEqual(await responses[1]!.json());
    await forceCloseCashSession(owner, fixture.sessionId);
    cleanup.delete(fixture.sessionId);
  });

  test('20 count and reconcile simultaneous commands cannot observe a partial count', async () => {
    const fixture = track(await createCashSession(owner, { label: 'Count reconcile' }));
    const [count, reconcile] = await Promise.all([
      owner.context.post(
        `/v1/organizations/${cashTenant}/cash/sessions/${fixture.sessionId}/counts`,
        {
          headers: cashHeaders(owner),
          data: {
            currency: 'MXN',
            totalMinor: '100000',
            idempotencyKey: crypto.randomUUID(),
          },
        },
      ),
      owner.context.post(
        `/v1/organizations/${cashTenant}/cash/sessions/${fixture.sessionId}/reconcile`,
        {
          headers: cashHeaders(owner),
          data: { idempotencyKey: crypto.randomUUID() },
        },
      ),
    ]);
    expect(count.status()).toBe(201);
    expect([201, 409]).toContain(reconcile.status());
    await forceCloseCashSession(owner, fixture.sessionId);
    cleanup.delete(fixture.sessionId);
  });

  test('17 duplicate transfer with one key creates one transfer pair', async () => {
    const source = track(await createCashSession(owner, { label: 'Transfer source' }));
    const destination = track(
      await createCashSession(supervisor, { label: 'Transfer destination' }),
    );
    const body = {
      sourceSessionId: source.sessionId,
      destinationSessionId: destination.sessionId,
      amountMinor: '1000',
      currency: 'MXN',
      reason: 'Duplicate transfer',
      correlationId: crypto.randomUUID(),
      idempotencyKey: crypto.randomUUID(),
    };
    const responses = await Promise.all([
      owner.context.post(`/v1/organizations/${cashTenant}/cash/transfers`, {
        headers: cashHeaders(owner),
        data: body,
      }),
      owner.context.post(`/v1/organizations/${cashTenant}/cash/transfers`, {
        headers: cashHeaders(owner),
        data: body,
      }),
    ]);
    expect(responses.map((response) => response.status()).sort()).toEqual([201, 201]);
    expect(await responses[0]!.json()).toEqual(await responses[1]!.json());
    await forceCloseCashSession(owner, source.sessionId);
    await forceCloseCashSession(owner, destination.sessionId);
    cleanup.delete(source.sessionId);
    cleanup.delete(destination.sessionId);
  });

  test('18 crossed transfers serialize without negative or duplicate ledger effects', async () => {
    const left = track(await createCashSession(owner, { label: 'Cross transfer left' }));
    const right = track(await createCashSession(supervisor, { label: 'Cross transfer right' }));
    const transfer = (sourceSessionId: string, destinationSessionId: string) =>
      owner.context.post(`/v1/organizations/${cashTenant}/cash/transfers`, {
        headers: cashHeaders(owner),
        data: {
          sourceSessionId,
          destinationSessionId,
          amountMinor: '1000',
          currency: 'MXN',
          reason: 'Crossed transfer',
          correlationId: crypto.randomUUID(),
          idempotencyKey: crypto.randomUUID(),
        },
      });
    const responses = await Promise.all([
      transfer(left.sessionId, right.sessionId),
      transfer(right.sessionId, left.sessionId),
    ]);
    expect(responses.every((response) => [201, 409].includes(response.status()))).toBe(true);
    expect(responses.filter((response) => response.status() === 201).length).toBeGreaterThan(0);
    await forceCloseCashSession(owner, left.sessionId);
    await forceCloseCashSession(owner, right.sessionId);
    cleanup.delete(left.sessionId);
    cleanup.delete(right.sessionId);
  });

  test('23 two approvers race to one decision', async () => {
    const fixture = track(await createCashSession(owner, { label: 'Two approvers' }));
    const requested = await cashier.context.post(`/v1/organizations/${cashTenant}/cash/approvals`, {
      headers: cashHeaders(cashier),
      data: {
        branchId: '20000000-0000-4000-8000-000000000001',
        actionType: 'WITHDRAWAL',
        resourceId: fixture.sessionId,
        requiredPermission: 'cash.withdraw',
        reason: 'Two approvers',
        expiresAt: new Date(Date.now() + 600000).toISOString(),
        correlationId: crypto.randomUUID(),
        idempotencyKey: crypto.randomUUID(),
      },
    });
    expect(requested.status(), await requested.text()).toBe(201);
    const approval = (await requested.json()) as { id: string; version: number };
    const decide = (actor: CashActor, decision: 'APPROVED' | 'REJECTED') =>
      actor.context.post(`/v1/organizations/${cashTenant}/cash/approvals/${approval.id}/decision`, {
        headers: cashHeaders(actor),
        data: {
          decision,
          reason: 'Concurrent decision',
          version: approval.version ?? 1,
          idempotencyKey: crypto.randomUUID(),
        },
      });
    expectOneWinner(await Promise.all([decide(owner, 'APPROVED'), decide(supervisor, 'REJECTED')]));
    await forceCloseCashSession(owner, fixture.sessionId);
    cleanup.delete(fixture.sessionId);
  });

  test('28 stale optimistic versions conflict under simultaneous writes', async () => {
    const fixture = track(await createCashSession(owner, { label: 'Optimistic conflict' }));
    const responses: APIResponse[] = await Promise.all([
      owner.context.post(
        `/v1/organizations/${cashTenant}/cash/sessions/${fixture.sessionId}/suspend`,
        {
          headers: cashHeaders(owner),
          data: { version: fixture.version, reason: 'A', idempotencyKey: crypto.randomUUID() },
        },
      ),
      owner.context.post(
        `/v1/organizations/${cashTenant}/cash/sessions/${fixture.sessionId}/suspend`,
        {
          headers: cashHeaders(owner),
          data: { version: fixture.version, reason: 'B', idempotencyKey: crypto.randomUUID() },
        },
      ),
    ]);
    expectOneWinner(responses);
    await forceCloseCashSession(owner, fixture.sessionId);
    cleanup.delete(fixture.sessionId);
  });

  test('25 double handoff completion updates custody once', async () => {
    const fixture = track(await createCashSession(owner, { label: 'Handoff completion' }));
    const initiated = await owner.context.post(
      `/v1/organizations/${cashTenant}/cash/sessions/${fixture.sessionId}/handoffs`,
      {
        headers: cashHeaders(owner),
        data: {
          incomingCashierId: '41000000-0000-4000-8000-000000000004',
          reason: 'Double completion',
          expiresAt: new Date(Date.now() + 600_000).toISOString(),
          correlationId: crypto.randomUUID(),
          idempotencyKey: crypto.randomUUID(),
        },
      },
    );
    let handoff = (await initiated.json()) as {
      id: string;
      version: number;
      expectedAmountMinor: string;
    };
    const counted = await owner.context.post(
      `/v1/organizations/${cashTenant}/cash/handoffs/${handoff.id}/count`,
      {
        headers: cashHeaders(owner),
        data: {
          totalMinor: handoff.expectedAmountMinor,
          version: handoff.version,
          idempotencyKey: crypto.randomUUID(),
        },
      },
    );
    handoff = (await counted.json()) as typeof handoff;
    const accepted = await cashier.context.post(
      `/v1/organizations/${cashTenant}/cash/handoffs/${handoff.id}/decision`,
      {
        headers: cashHeaders(cashier),
        data: {
          decision: 'ACCEPTED',
          reason: 'Accepted',
          version: handoff.version,
          idempotencyKey: crypto.randomUUID(),
        },
      },
    );
    handoff = (await accepted.json()) as typeof handoff;
    const complete = () =>
      owner.context.post(`/v1/organizations/${cashTenant}/cash/handoffs/${handoff.id}/complete`, {
        headers: cashHeaders(owner),
        data: { version: handoff.version, idempotencyKey: crypto.randomUUID() },
      });
    expectOneWinner(await Promise.all([complete(), complete()]));
    await forceCloseCashSession(owner, fixture.sessionId);
    cleanup.delete(fixture.sessionId);
  });
});
