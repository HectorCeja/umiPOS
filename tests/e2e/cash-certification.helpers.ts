import { expect, request, type APIRequestContext } from '@playwright/test';

export const cashTenant = '10000000-0000-4000-8000-000000000001';
export const cashBranch = '20000000-0000-4000-8000-000000000001';
export const cashPassword = process.env.TEST_PERSONA_PASSWORD ?? 'Nexo Test Persona 2026!';

export type CashActor = { context: APIRequestContext; csrf: string };
export type CashSessionFixture = {
  sessionId: string;
  registerId: string;
  drawerId?: string;
  version: number;
};

export async function cashLogin(email: string): Promise<CashActor> {
  const context = await request.newContext({
    baseURL: 'http://127.0.0.1:3001',
    extraHTTPHeaders: { origin: 'http://localhost:3000' },
  });
  const response = await context.post('/v1/auth/login', {
    data: {
      email,
      password: cashPassword,
      deviceFingerprint: `cash-cert-${email}-${crypto.randomUUID()}`,
      deviceName: 'Cash certification',
    },
  });
  expect(response.status(), await response.text()).toBe(200);
  const state = await context.storageState();
  const csrf = state.cookies.find((cookie) => cookie.name === 'nexo_csrf')?.value;
  expect(csrf).toBeTruthy();
  return { context, csrf: csrf! };
}

export const cashHeaders = (actor: CashActor) => ({
  origin: 'http://localhost:3000',
  'x-csrf-token': actor.csrf,
});

export async function createCashSession(
  actor: CashActor,
  options: { drawer?: boolean; openingFloatMinor?: string; label?: string } = {},
): Promise<CashSessionFixture> {
  const stamp = `${Date.now()}-${crypto.randomUUID().slice(0, 6)}`;
  const label = options.label ?? 'Certification';
  const register = await actor.context.post(`/v1/organizations/${cashTenant}/cash/registers`, {
    headers: cashHeaders(actor),
    data: {
      branchId: cashBranch,
      name: `${label} Register`,
      code: `CERT-${stamp}`,
      currency: 'MXN',
    },
  });
  expect(register.status(), await register.text()).toBe(201);
  const registerId = ((await register.json()) as { id: string }).id;
  let drawerId: string | undefined;
  if (options.drawer) {
    const drawer = await actor.context.post(`/v1/organizations/${cashTenant}/cash/drawers`, {
      headers: cashHeaders(actor),
      data: {
        branchId: cashBranch,
        name: `${label} Drawer`,
        code: `CERT-D-${stamp}`,
        registerId,
      },
    });
    expect(drawer.status(), await drawer.text()).toBe(201);
    drawerId = ((await drawer.json()) as { id: string }).id;
  }
  let opened;
  const correlationId = crypto.randomUUID();
  for (let attempt = 0; attempt < 5; attempt += 1) {
    opened = await actor.context.post(`/v1/organizations/${cashTenant}/cash/sessions/open`, {
      headers: cashHeaders(actor),
      data: {
        branchId: cashBranch,
        registerId,
        ...(drawerId ? { drawerId } : {}),
        currency: 'MXN',
        businessDate: '2026-07-14',
        openingFloatMinor: options.openingFloatMinor ?? '100000',
        idempotencyKey: `cert-open-${stamp}`,
        correlationId,
      },
    });
    if (opened.status() !== 409) break;
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
  if (opened === undefined) throw new Error('Cash session open did not execute');
  expect(opened.status(), await opened.text()).toBe(201);
  const body = (await opened.json()) as { id: string; version: number };
  return {
    sessionId: body.id,
    registerId,
    ...(drawerId ? { drawerId } : {}),
    version: body.version,
  };
}

export async function getCashSession(actor: CashActor, sessionId: string) {
  const response = await actor.context.get(
    `/v1/organizations/${cashTenant}/cash/sessions/${sessionId}`,
  );
  expect(response.status(), await response.text()).toBe(200);
  return (await response.json()) as {
    id: string;
    status: string;
    version: number;
    expectedAmountMinor: string;
  };
}

export async function forceCloseCashSession(actor: CashActor, sessionId: string) {
  const current = await getCashSession(actor, sessionId);
  if (['CLOSED', 'FORCE_CLOSED'].includes(current.status)) return;
  const response = await actor.context.post(
    `/v1/organizations/${cashTenant}/cash/sessions/${sessionId}/close`,
    {
      headers: cashHeaders(actor),
      data: {
        version: current.version,
        force: true,
        reason: 'Certification fixture cleanup',
        idempotencyKey: `cert-cleanup-${sessionId}-${crypto.randomUUID()}`,
      },
    },
  );
  expect([201, 409]).toContain(response.status());
}

export async function requestAndApprove(
  requester: CashActor,
  approver: CashActor,
  actionType: string,
  resourceId: string,
  permission: string,
) {
  const key = crypto.randomUUID();
  const requested = await requester.context.post(`/v1/organizations/${cashTenant}/cash/approvals`, {
    headers: cashHeaders(requester),
    data: {
      branchId: cashBranch,
      actionType,
      resourceId,
      requiredPermission: permission,
      reason: `Certification ${actionType}`,
      expiresAt: new Date(Date.now() + 600_000).toISOString(),
      correlationId: crypto.randomUUID(),
      idempotencyKey: `cert-approval-${key}`,
    },
  });
  expect(requested.status(), await requested.text()).toBe(201);
  const approval = (await requested.json()) as { id: string; version: number };
  const decision = await approver.context.post(
    `/v1/organizations/${cashTenant}/cash/approvals/${approval.id}/decision`,
    {
      headers: cashHeaders(approver),
      data: {
        decision: 'APPROVED',
        reason: 'Certification approval',
        version: approval.version ?? 1,
        idempotencyKey: `cert-decision-${key}`,
      },
    },
  );
  expect(decision.status(), await decision.text()).toBe(201);
  return approval.id;
}

export function expectOneWinner(responses: { status(): number }[], success = 201) {
  const statuses = responses.map((response) => response.status());
  expect(statuses.filter((status) => status === success)).toHaveLength(1);
  expect(statuses.filter((status) => status === 409)).toHaveLength(responses.length - 1);
}
