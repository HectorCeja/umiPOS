import { expect, request as createRequest, test, type APIRequestContext } from '@playwright/test';

const defaultPassword = process.env.TEST_PERSONA_PASSWORD ?? 'Nexo Test Persona 2026!';
const resetCashierPassword = 'Nexo Reset Persona 2026!';
const alpha = '10000000-0000-4000-8000-000000000001';
const beta = '10000000-0000-4000-8000-000000000002';
const alphaBranch = '20000000-0000-4000-8000-000000000001';
const alphaEmployee = '41000000-0000-4000-8000-000000000005';

async function login(email: string): Promise<APIRequestContext> {
  for (const password of [defaultPassword, resetCashierPassword]) {
    const context = await createRequest.newContext({ baseURL: 'http://127.0.0.1:3001' });
    const response = await context.post('/v1/auth/login', {
      data: {
        deviceFingerprint: `authorization-${email}`,
        deviceName: 'Authorization E2E',
        email,
        password,
        rememberDevice: false,
        rememberMe: false,
      },
    });
    if (response.status() === 200) return context;
    await context.dispose();
  }
  throw new Error(`Unable to authenticate official persona ${email}`);
}

async function evaluate(
  context: APIRequestContext,
  organizationId: string,
  permission: string,
  resource: Readonly<Record<string, string>>,
) {
  const response = await context.post(
    `/v1/organizations/${organizationId}/authorization/evaluate`,
    { data: { permission, resource } },
  );
  expect(response.status()).toBe(200);
  return response.json() as Promise<{
    allowed: boolean;
    reason: string;
    grantedBy?: { role: string; scope: string };
  }>;
}

test.describe.serial('authorization platform with official personas and real services', () => {
  test('resolves database-backed context, roles, permissions, flags and memberships', async () => {
    const owner = await login('alpha.owner@nexo.local');
    const context = await owner.get(
      `/v1/organizations/${alpha}/authorization/context?branchId=${alphaBranch}`,
    );
    expect(context.status()).toBe(200);
    expect(await context.json()).toMatchObject({
      roles: ['OWNER'],
      selectedBranchId: alphaBranch,
      tenantContext: { principalId: '41000000-0000-4000-8000-000000000001', tenantId: alpha },
    });
    expect((await owner.get(`/v1/organizations/${alpha}/roles`)).status()).toBe(200);
    expect((await owner.get(`/v1/organizations/${alpha}/permissions`)).status()).toBe(200);
    expect((await owner.get(`/v1/organizations/${alpha}/feature-flags`)).status()).toBe(200);
    const memberships = await owner.get(`/v1/organizations/${alpha}/memberships`);
    expect(memberships.status()).toBe(200);
    const membershipRows = (await memberships.json()) as Array<{ principalId: string }>;
    // Owner-created organizations and acceptance walkthroughs may add legitimate memberships.
    // Certification asserts the deterministic official personas without assuming a pristine count.
    expect(membershipRows).toEqual(
      expect.arrayContaining(
        Array.from({ length: 6 }, (_, index) => ({
          principalId: `41000000-0000-4000-8000-00000000000${String(index + 1)}`,
        })).map((membership) => expect.objectContaining(membership)),
      ),
    );
    await owner.dispose();
  });

  test('never resolves Organization Alpha identity inside Organization Beta', async () => {
    const alphaOwner = await login('alpha.owner@nexo.local');
    expect((await alphaOwner.get(`/v1/organizations/${beta}/authorization/context`)).status()).toBe(
      403,
    );
    const betaOwner = await login('beta.owner@nexo.local');
    expect((await betaOwner.get(`/v1/organizations/${alpha}/authorization/context`)).status()).toBe(
      403,
    );
    await alphaOwner.dispose();
    await betaOwner.dispose();
  });

  test('Cashier can sell but cannot delete products', async () => {
    const cashier = await login('alpha.cashier@nexo.local');
    await expect(
      evaluate(cashier, alpha, 'sales.create', { branchId: alphaBranch, type: 'sale' }),
    ).resolves.toMatchObject({
      allowed: true,
      grantedBy: { role: 'CASHIER', scope: 'BRANCH' },
    });
    await expect(
      evaluate(cashier, alpha, 'product.delete', { branchId: alphaBranch, type: 'product' }),
    ).resolves.toMatchObject({ allowed: false, reason: 'NO_ACTIVE_GRANT' });
    await cashier.dispose();
  });

  test('Employee cannot close cash and self scope cannot be forged', async () => {
    const employee = await login('alpha.employee@nexo.local');
    await expect(
      evaluate(employee, alpha, 'cash.session.close', {
        branchId: alphaBranch,
        ownerUserId: alphaEmployee,
        type: 'cash_session',
      }),
    ).resolves.toMatchObject({ allowed: false, reason: 'NO_ACTIVE_GRANT' });
    await employee.dispose();
  });

  test('ReadOnly only queries, Supervisor authorizes allowed branch operations, Owner administers', async () => {
    const readOnly = await login('alpha.readonly@nexo.local');
    await expect(
      evaluate(readOnly, alpha, 'product.read', { branchId: alphaBranch, type: 'product' }),
    ).resolves.toMatchObject({ allowed: true });
    await expect(
      evaluate(readOnly, alpha, 'product.update', { branchId: alphaBranch, type: 'product' }),
    ).resolves.toMatchObject({ allowed: false, reason: 'NO_ACTIVE_GRANT' });

    const supervisor = await login('alpha.supervisor@nexo.local');
    await expect(
      evaluate(supervisor, alpha, 'cash.session.close', {
        branchId: alphaBranch,
        type: 'cash_session',
      }),
    ).resolves.toMatchObject({
      allowed: true,
      grantedBy: { role: 'SUPERVISOR', scope: 'BRANCH' },
    });

    const owner = await login('alpha.owner@nexo.local');
    await expect(
      evaluate(owner, alpha, 'membership.revoke', { type: 'membership' }),
    ).resolves.toMatchObject({
      allowed: true,
      grantedBy: { role: 'OWNER', scope: 'ORGANIZATION' },
    });
    await readOnly.dispose();
    await supervisor.dispose();
    await owner.dispose();
  });
});
