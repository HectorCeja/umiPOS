import { expect, request as createRequest, test, type APIRequestContext } from '@playwright/test';

const api = 'http://127.0.0.1:3001';
const origin = 'http://localhost:3000';
const alpha = '10000000-0000-4000-8000-000000000001';
const beta = '10000000-0000-4000-8000-000000000002';
const alphaBranch = '20000000-0000-4000-8000-000000000001';
const betaBranch = '20000000-0000-4000-8000-000000000002';
const password = process.env.TEST_PERSONA_PASSWORD ?? 'Nexo Test Persona 2026!';

async function login(email: string) {
  const context = await createRequest.newContext({ baseURL: api, extraHTTPHeaders: { origin } });
  const response = await context.post('/v1/auth/login', {
    data: {
      deviceFingerprint: `authorization-certification-${email}`,
      deviceName: 'Authorization certification',
      email,
      password,
      rememberDevice: false,
      rememberMe: false,
    },
  });
  expect(response.status()).toBe(200);
  const state = await context.storageState();
  const csrf = state.cookies.find(({ name }) => name === 'nexo_csrf')?.value;
  expect(csrf).toBeTruthy();
  return { context, csrf: csrf! };
}

async function ownContext(context: APIRequestContext) {
  const response = await context.get(
    `/v1/organizations/${alpha}/authorization/context?branchId=${alphaBranch}`,
  );
  expect(response.status()).toBe(200);
  return response.json() as Promise<{
    roles: string[];
    tenantContext: { membershipId: string };
  }>;
}

async function ownMembership(context: APIRequestContext) {
  const current = await ownContext(context);
  const response = await context.get(`/v1/organizations/${alpha}/memberships`);
  expect(response.status()).toBe(200);
  const memberships = (await response.json()) as Array<{ id: string; version: number }>;
  const membership = memberships.find(({ id }) => id === current.tenantContext.membershipId);
  expect(membership).toBeTruthy();
  return { current, membership: membership! };
}

test.describe.serial('Part 1A authorization escalation and isolation', () => {
  test('Administrator cannot elevate itself to Owner', async () => {
    const admin = await login('alpha.admin@nexo.local');
    const { current, membership } = await ownMembership(admin.context);
    expect(current.roles).toEqual(['ADMINISTRATOR']);
    const response = await admin.context.patch(
      `/v1/organizations/${alpha}/memberships/${current.tenantContext.membershipId}`,
      {
        headers: { 'x-csrf-token': admin.csrf },
        data: {
          accessScope: 'ALL_BRANCHES',
          branchIds: [],
          roleKey: 'OWNER',
          status: 'ACTIVE',
          version: membership.version,
        },
      },
    );
    expect(response.status()).toBe(403);
    expect((await ownContext(admin.context)).roles).toEqual(['ADMINISTRATOR']);
    await admin.context.dispose();
  });

  test('Administrator cannot delegate Owner through an invitation', async () => {
    const admin = await login('alpha.admin@nexo.local');
    const response = await admin.context.post(`/v1/organizations/${alpha}/invitations`, {
      headers: { 'x-csrf-token': admin.csrf },
      data: {
        accessScope: 'ALL_BRANCHES',
        branchIds: [],
        email: 'authorization-owner-escalation@nexo.invalid',
        roleKey: 'OWNER',
      },
    });
    expect(response.status()).toBe(403);
    await admin.context.dispose();
  });

  test('non-owners cannot modify an Owner or bypass authorization with identity headers', async () => {
    const admin = await login('alpha.admin@nexo.local');
    const owner = await login('alpha.owner@nexo.local');
    const { current: ownerContext, membership: ownerMembership } = await ownMembership(
      owner.context,
    );
    const response = await admin.context.patch(
      `/v1/organizations/${alpha}/memberships/${ownerContext.tenantContext.membershipId}`,
      {
        headers: {
          'x-csrf-token': admin.csrf,
          'x-user-id': '41000000-0000-4000-8000-000000000001',
          'x-role': 'OWNER',
          'x-tenant-id': alpha,
        },
        data: {
          accessScope: 'ALL_BRANCHES',
          branchIds: [],
          roleKey: 'ADMINISTRATOR',
          status: 'ACTIVE',
          version: ownerMembership.version,
        },
      },
    );
    expect(response.status()).toBe(403);
    await admin.context.dispose();
    await owner.context.dispose();
  });

  test('Cashier cannot alter memberships or feature flags', async () => {
    const cashier = await login('alpha.cashier@nexo.local');
    const current = await ownContext(cashier.context);
    const response = await cashier.context.patch(
      `/v1/organizations/${alpha}/memberships/${current.tenantContext.membershipId}`,
      {
        headers: { 'x-csrf-token': cashier.csrf },
        data: {
          accessScope: 'ALL_BRANCHES',
          branchIds: [],
          roleKey: 'OWNER',
          status: 'ACTIVE',
          version: 1,
        },
      },
    );
    expect(response.status()).toBe(403);
    const feature = await cashier.context.patch(`/v1/organizations/${alpha}/features/POS`, {
      headers: { 'x-csrf-token': cashier.csrf },
      data: { enabled: false, version: 1 },
    });
    expect(feature.status()).toBe(403);
    await cashier.context.dispose();
  });

  test('tenant and branch identifiers cannot cross authorization boundaries', async () => {
    const alphaOwner = await login('alpha.owner@nexo.local');
    const betaOwner = await login('beta.owner@nexo.local');
    for (const context of [alphaOwner.context, betaOwner.context]) {
      const foreignTenant = context === alphaOwner.context ? beta : alpha;
      expect(
        (await context.get(`/v1/organizations/${foreignTenant}/authorization/context`)).status(),
      ).toBe(403);
      expect((await context.get(`/v1/organizations/${foreignTenant}/memberships`)).status()).toBe(
        403,
      );
    }
    expect(
      (
        await alphaOwner.context.get(
          `/v1/organizations/${alpha}/authorization/context?branchId=${betaBranch}`,
        )
      ).status(),
    ).toBe(403);
    await alphaOwner.context.dispose();
    await betaOwner.context.dispose();
  });

  test('disabled features, unknown permissions and forged ownership default deny', async () => {
    const owner = await login('alpha.owner@nexo.local');
    const flagsResponse = await owner.context.get(`/v1/organizations/${alpha}/feature-flags`);
    expect(flagsResponse.status()).toBe(200);
    const flags = (await flagsResponse.json()) as Array<{
      enabled: boolean;
      key: string;
      version: number;
    }>;
    const appointments = flags.find(({ key }) => key === 'APPOINTMENTS');
    expect(appointments).toBeTruthy();
    const disable = await owner.context.patch(`/v1/organizations/${alpha}/features/APPOINTMENTS`, {
      headers: { 'x-csrf-token': owner.csrf },
      data: { enabled: false, version: appointments!.version },
    });
    expect(disable.status()).toBe(200);
    const employee = await login('alpha.employee@nexo.local');
    try {
      for (const data of [
        {
          permission: 'appointments.manage',
          resource: { branchId: alphaBranch, type: 'appointment' },
          reason: 'FEATURE_DISABLED',
        },
        {
          permission: 'internal.root',
          resource: { branchId: alphaBranch, type: 'system' },
          reason: 'UNKNOWN_PERMISSION',
        },
        {
          permission: 'cash.session.close',
          resource: {
            branchId: alphaBranch,
            ownerUserId: '41000000-0000-4000-8000-000000000005',
            type: 'cash_session',
          },
          reason: 'NO_ACTIVE_GRANT',
        },
      ]) {
        const response = await employee.context.post(
          `/v1/organizations/${alpha}/authorization/evaluate`,
          { data: { permission: data.permission, resource: data.resource } },
        );
        expect(response.status()).toBe(200);
        expect(await response.json()).toMatchObject({ allowed: false, reason: data.reason });
      }
    } finally {
      const restore = await owner.context.patch(
        `/v1/organizations/${alpha}/features/APPOINTMENTS`,
        {
          headers: { 'x-csrf-token': owner.csrf },
          data: { enabled: true, version: appointments!.version + 1 },
        },
      );
      expect(restore.status()).toBe(200);
      await employee.context.dispose();
      await owner.context.dispose();
    }
  });
});
