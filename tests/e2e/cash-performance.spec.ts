import { expect, test, type APIResponse } from '@playwright/test';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { cpus, freemem, totalmem } from 'node:os';
import {
  cashBranch,
  cashHeaders,
  cashLogin,
  cashTenant,
  createCashSession,
  forceCloseCashSession,
  getCashSession,
  requestAndApprove,
  type CashActor,
} from './cash-certification.helpers.js';

type SampleMap = Record<string, number[]>;
const samples: SampleMap = {};
const percentile = (values: number[], value: number) =>
  [...values].sort((a, b) => a - b)[Math.max(0, Math.ceil(values.length * value) - 1)] ?? 0;

async function measured<T>(name: string, operation: () => Promise<T>) {
  const started = performance.now();
  const response = await operation();
  (samples[name] ??= []).push(performance.now() - started);
  return response;
}

test.describe.serial('Cash warmed performance matrix', () => {
  let owner: CashActor;
  let supervisor: CashActor;
  let cashier: CashActor;

  test.beforeAll(async () => {
    owner = await cashLogin('alpha.owner@nexo.local');
    supervisor = await cashLogin('alpha.supervisor@nexo.local');
    cashier = await cashLogin('alpha.cashier@nexo.local');
    const policy = await owner.context.post(`/v1/organizations/${cashTenant}/cash/policies`, {
      headers: cashHeaders(owner),
      data: {
        configuration: {
          depositApprovalRequired: false,
          transferAllowed: true,
          reopenAllowed: true,
          selfApprovalAllowed: false,
          varianceToleranceMinor: '1000000',
        },
        idempotencyKey: crypto.randomUUID(),
      },
    });
    expect(policy.status()).toBe(201);
  });

  test.afterAll(async () => {
    for (const file of ['refund-results.json', 'worker-results.json']) {
      try {
        const external = JSON.parse(
          await readFile(`artifacts/cash-certification/performance/${file}`, 'utf8'),
        ) as Record<string, number[]>;
        for (const [name, values] of Object.entries(external)) {
          (samples[name] ??= []).push(...values);
        }
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
      }
    }
    const results = Object.fromEntries(
      Object.entries(samples).map(([name, values]) => [
        name,
        {
          p50Ms: Number(percentile(values, 0.5).toFixed(2)),
          p95Ms: Number(percentile(values, 0.95).toFixed(2)),
          maxMs: Number(Math.max(...values).toFixed(2)),
          samples: values.length,
        },
      ]),
    );
    const evidence = {
      measuredAt: new Date().toISOString(),
      warmed: true,
      environment: 'Docker Compose local, PostgreSQL 18, two workers',
      hardware: {
        cpu: cpus()[0]?.model ?? 'unknown',
        logicalCpus: cpus().length,
        totalMemoryBytes: totalmem(),
        freeMemoryBytesAtReport: freemem(),
      },
      dataset: 'seed plus five isolated Cash workflows',
      results,
    };
    await mkdir('artifacts/cash-certification/performance', { recursive: true });
    await writeFile(
      'artifacts/cash-certification/performance/results.json',
      `${JSON.stringify(evidence, null, 2)}\n`,
    );
    await Promise.all([
      owner.context.dispose(),
      supervisor.context.dispose(),
      cashier.context.dispose(),
    ]);
  });

  test('measures every stateful Cash command over five isolated workflows', async () => {
    for (let iteration = 0; iteration < 5; iteration += 1) {
      const source = await measured('open', () =>
        createCashSession(owner, {
          label: `Performance ${iteration}`,
          openingFloatMinor: '100000',
        }),
      );
      const destination = await createCashSession(supervisor, {
        label: `Performance destination ${iteration}`,
        openingFloatMinor: '100000',
      });
      await measured('getActiveSession', () =>
        owner.context.get(
          `/v1/organizations/${cashTenant}/cash/sessions/active?branchId=${cashBranch}`,
        ),
      );
      let current = await getCashSession(owner, source.sessionId);
      const suspended = await measured('suspend', () =>
        owner.context.post(
          `/v1/organizations/${cashTenant}/cash/sessions/${source.sessionId}/suspend`,
          {
            headers: cashHeaders(owner),
            data: {
              version: current.version,
              reason: 'Performance',
              idempotencyKey: crypto.randomUUID(),
            },
          },
        ),
      );
      expect(suspended.status()).toBe(201);
      current = (await suspended.json()) as typeof current;
      expect(
        (
          await measured('resume', () =>
            owner.context.post(
              `/v1/organizations/${cashTenant}/cash/sessions/${source.sessionId}/resume`,
              {
                headers: cashHeaders(owner),
                data: {
                  version: current.version,
                  reason: 'Performance',
                  idempotencyKey: crypto.randomUUID(),
                },
              },
            ),
          )
        ).status(),
      ).toBe(201);
      for (const [name, type] of [
        ['cashIn', 'CASH_IN'],
        ['cashOut', 'CASH_OUT'],
        ['withdrawal', 'WITHDRAWAL'],
      ] as const) {
        const response = await measured(name, () =>
          owner.context.post(
            `/v1/organizations/${cashTenant}/cash/sessions/${source.sessionId}/movements`,
            {
              headers: cashHeaders(owner),
              data: {
                type,
                amountMinor: '100',
                currency: 'MXN',
                reason: 'Performance',
                correlationId: crypto.randomUUID(),
                idempotencyKey: crypto.randomUUID(),
              },
            },
          ),
        );
        expect(response.status()).toBe(201);
      }
      const approvalRequest = await measured('createApproval', () =>
        supervisor.context.post(`/v1/organizations/${cashTenant}/cash/approvals`, {
          headers: cashHeaders(supervisor),
          data: {
            branchId: cashBranch,
            actionType: 'WITHDRAWAL',
            resourceId: source.sessionId,
            requiredPermission: 'cash.withdraw',
            reason: 'Performance approval',
            expiresAt: new Date(Date.now() + 600_000).toISOString(),
            correlationId: crypto.randomUUID(),
            idempotencyKey: crypto.randomUUID(),
          },
        }),
      );
      const approval = (await approvalRequest.json()) as { id: string };
      expect(
        (
          await measured('approve', () =>
            owner.context.post(
              `/v1/organizations/${cashTenant}/cash/approvals/${approval.id}/decision`,
              {
                headers: cashHeaders(owner),
                data: {
                  decision: 'APPROVED',
                  reason: 'Performance',
                  version: 1,
                  idempotencyKey: crypto.randomUUID(),
                },
              },
            ),
          )
        ).status(),
      ).toBe(201);
      const rejectRequest = await supervisor.context.post(
        `/v1/organizations/${cashTenant}/cash/approvals`,
        {
          headers: cashHeaders(supervisor),
          data: {
            branchId: cashBranch,
            actionType: 'WITHDRAWAL',
            resourceId: source.sessionId,
            requiredPermission: 'cash.withdraw',
            reason: 'Performance rejection',
            expiresAt: new Date(Date.now() + 600_000).toISOString(),
            correlationId: crypto.randomUUID(),
            idempotencyKey: crypto.randomUUID(),
          },
        },
      );
      const rejectId = ((await rejectRequest.json()) as { id: string }).id;
      expect(
        (
          await measured('reject', () =>
            owner.context.post(
              `/v1/organizations/${cashTenant}/cash/approvals/${rejectId}/decision`,
              {
                headers: cashHeaders(owner),
                data: {
                  decision: 'REJECTED',
                  reason: 'Performance',
                  version: 1,
                  idempotencyKey: crypto.randomUUID(),
                },
              },
            ),
          )
        ).status(),
      ).toBe(201);
      const prepared = await measured('prepareDeposit', () =>
        owner.context.post(
          `/v1/organizations/${cashTenant}/cash/sessions/${source.sessionId}/deposits`,
          {
            headers: cashHeaders(owner),
            data: {
              amountMinor: '100',
              currency: 'MXN',
              destination: 'Safe',
              reason: 'Performance',
              correlationId: crypto.randomUUID(),
              idempotencyKey: crypto.randomUUID(),
            },
          },
        ),
      );
      const depositId = ((await prepared.json()) as { id: string }).id;
      for (const [name, status] of [
        ['handoverDeposit', 'HANDED_OVER'],
        ['confirmDeposit', 'CONFIRMED_MANUALLY'],
      ] as const) {
        expect(
          (
            await measured(name, () =>
              owner.context.post(
                `/v1/organizations/${cashTenant}/cash/deposits/${depositId}/transition`,
                {
                  headers: cashHeaders(owner),
                  data: {
                    status,
                    reason: 'Performance',
                    idempotencyKey: crypto.randomUUID(),
                  },
                },
              ),
            )
          ).status(),
        ).toBe(201);
      }
      const cancellable = await owner.context.post(
        `/v1/organizations/${cashTenant}/cash/sessions/${source.sessionId}/deposits`,
        {
          headers: cashHeaders(owner),
          data: {
            amountMinor: '100',
            currency: 'MXN',
            destination: 'Safe',
            reason: 'Performance',
            correlationId: crypto.randomUUID(),
            idempotencyKey: crypto.randomUUID(),
          },
        },
      );
      const cancelId = ((await cancellable.json()) as { id: string }).id;
      expect(
        (
          await measured('cancelDeposit', () =>
            owner.context.post(
              `/v1/organizations/${cashTenant}/cash/deposits/${cancelId}/transition`,
              {
                headers: cashHeaders(owner),
                data: {
                  status: 'CANCELLED',
                  reason: 'Performance',
                  idempotencyKey: crypto.randomUUID(),
                },
              },
            ),
          )
        ).status(),
      ).toBe(201);
      expect(
        (
          await measured('transfer', () =>
            owner.context.post(`/v1/organizations/${cashTenant}/cash/transfers`, {
              headers: cashHeaders(owner),
              data: {
                sourceSessionId: source.sessionId,
                destinationSessionId: destination.sessionId,
                amountMinor: '100',
                currency: 'MXN',
                reason: 'Performance',
                correlationId: crypto.randomUUID(),
                idempotencyKey: crypto.randomUUID(),
              },
            }),
          )
        ).status(),
      ).toBe(201);
      current = await getCashSession(owner, source.sessionId);
      expect(
        (
          await measured('count', () =>
            owner.context.post(
              `/v1/organizations/${cashTenant}/cash/sessions/${source.sessionId}/counts`,
              {
                headers: cashHeaders(owner),
                data: {
                  currency: 'MXN',
                  totalMinor: current.expectedAmountMinor,
                  idempotencyKey: crypto.randomUUID(),
                },
              },
            ),
          )
        ).status(),
      ).toBe(201);
      expect(
        (
          await measured('reconcile', () =>
            owner.context.post(
              `/v1/organizations/${cashTenant}/cash/sessions/${source.sessionId}/reconcile`,
              {
                headers: cashHeaders(owner),
                data: { idempotencyKey: crypto.randomUUID() },
              },
            ),
          )
        ).status(),
      ).toBe(201);
      await measured('timeline', () =>
        owner.context.get(
          `/v1/organizations/${cashTenant}/cash/sessions/${source.sessionId}/timeline`,
        ),
      );
      await measured('operationalSummary', () =>
        owner.context.get(
          `/v1/organizations/${cashTenant}/cash/sessions/${source.sessionId}/summary`,
        ),
      );
      await measured('quarantineQuery', () =>
        owner.context.get(
          `/v1/organizations/${cashTenant}/cash/integrations/quarantine?branchId=${cashBranch}`,
        ),
      );
      const closeCurrent = await getCashSession(owner, source.sessionId);
      const close = await measured('close', () =>
        owner.context.post(
          `/v1/organizations/${cashTenant}/cash/sessions/${source.sessionId}/close`,
          {
            headers: cashHeaders(owner),
            data: {
              version: closeCurrent.version,
              force: false,
              reason: 'Performance',
              idempotencyKey: crypto.randomUUID(),
            },
          },
        ),
      );
      expect(close.status(), await close.text()).toBe(201);
      await forceCloseCashSession(owner, destination.sessionId);

      const forceFixture = await createCashSession(owner, { label: `Force ${iteration}` });
      const forceCurrent = await getCashSession(owner, forceFixture.sessionId);
      expect(
        (
          await measured('forceClose', () =>
            owner.context.post(
              `/v1/organizations/${cashTenant}/cash/sessions/${forceFixture.sessionId}/close`,
              {
                headers: cashHeaders(owner),
                data: {
                  version: forceCurrent.version,
                  force: true,
                  reason: 'Performance',
                  idempotencyKey: crypto.randomUUID(),
                },
              },
            ),
          )
        ).status(),
      ).toBe(201);
      const approvalId = await requestAndApprove(
        supervisor,
        owner,
        'REOPEN',
        forceFixture.sessionId,
        'cash.session.reopen',
      );
      const closed = await getCashSession(owner, forceFixture.sessionId);
      expect(
        (
          await measured('reopen', () =>
            owner.context.post(
              `/v1/organizations/${cashTenant}/cash/sessions/${forceFixture.sessionId}/reopen`,
              {
                headers: cashHeaders(owner),
                data: {
                  version: closed.version,
                  reason: 'Performance',
                  approvalId,
                  correlationId: crypto.randomUUID(),
                  idempotencyKey: crypto.randomUUID(),
                },
              },
            ),
          )
        ).status(),
      ).toBe(201);
      await forceCloseCashSession(owner, forceFixture.sessionId);
      const handoffFixture = await createCashSession(owner, {
        label: `Handoff performance ${iteration}`,
      });
      const initiated = await measured('initiateHandoff', () =>
        owner.context.post(
          `/v1/organizations/${cashTenant}/cash/sessions/${handoffFixture.sessionId}/handoffs`,
          {
            headers: cashHeaders(owner),
            data: {
              incomingCashierId: '41000000-0000-4000-8000-000000000004',
              reason: 'Performance',
              expiresAt: new Date(Date.now() + 600_000).toISOString(),
              correlationId: crypto.randomUUID(),
              idempotencyKey: crypto.randomUUID(),
            },
          },
        ),
      );
      expect(initiated.status(), await initiated.text()).toBe(201);
      let handoff = (await initiated.json()) as {
        id: string;
        version: number;
        expectedAmountMinor: string;
      };
      const counted = await measured('countHandoff', () =>
        owner.context.post(`/v1/organizations/${cashTenant}/cash/handoffs/${handoff.id}/count`, {
          headers: cashHeaders(owner),
          data: {
            totalMinor: handoff.expectedAmountMinor,
            version: handoff.version,
            idempotencyKey: crypto.randomUUID(),
          },
        }),
      );
      expect(counted.status(), await counted.text()).toBe(201);
      handoff = (await counted.json()) as typeof handoff;
      const accepted = await measured('acceptHandoff', () =>
        cashier.context.post(
          `/v1/organizations/${cashTenant}/cash/handoffs/${handoff.id}/decision`,
          {
            headers: cashHeaders(cashier),
            data: {
              decision: 'ACCEPTED',
              reason: 'Performance',
              version: handoff.version,
              idempotencyKey: crypto.randomUUID(),
            },
          },
        ),
      );
      expect(accepted.status(), await accepted.text()).toBe(201);
      handoff = (await accepted.json()) as typeof handoff;
      const completed = await measured('completeHandoff', () =>
        owner.context.post(`/v1/organizations/${cashTenant}/cash/handoffs/${handoff.id}/complete`, {
          headers: cashHeaders(owner),
          data: { version: handoff.version, idempotencyKey: crypto.randomUUID() },
        }),
      );
      expect(completed.status(), await completed.text()).toBe(201);
      await forceCloseCashSession(owner, handoffFixture.sessionId);
    }
  });
});
