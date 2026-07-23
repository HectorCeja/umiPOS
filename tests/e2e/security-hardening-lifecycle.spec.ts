import { execFileSync } from 'node:child_process';
import { expect, request, test, type APIRequestContext } from '@playwright/test';

const api = 'http://127.0.0.1:3001';
const origin = 'http://localhost:3000';
const alpha = '10000000-0000-4000-8000-000000000001';
const alphaBranch = '20000000-0000-4000-8000-000000000001';
const password = process.env.TEST_PERSONA_PASSWORD ?? 'Nexo Test Persona 2026!';

function sql(statement: string) {
  execFileSync(
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
      '-v',
      'ON_ERROR_STOP=1',
      '-c',
      statement,
    ],
    { stdio: 'pipe' },
  );
}

async function login(email: string) {
  const context = await request.newContext({ baseURL: api, extraHTTPHeaders: { origin } });
  const response = await context.post('/v1/auth/login', {
    data: {
      deviceFingerprint: `hardening-${email}`,
      deviceName: 'Security hardening certification',
      email,
      password,
    },
  });
  expect(response.status()).toBe(200);
  const state = await context.storageState();
  const csrf = state.cookies.find(({ name }) => name === 'nexo_csrf')?.value;
  expect(csrf).toBeTruthy();
  return { context, csrf: csrf! };
}

async function latestInvitationToken(email: string) {
  await expect
    .poll(async () => {
      const response = await fetch(
        `http://127.0.0.1:8025/api/v1/search?query=to:${encodeURIComponent(email)}`,
      );
      return ((await response.json()) as { messages?: unknown[] }).messages?.length ?? 0;
    })
    .toBeGreaterThan(0);
  const search = (await (
    await fetch(`http://127.0.0.1:8025/api/v1/search?query=to:${encodeURIComponent(email)}`)
  ).json()) as { messages: { ID: string; Created: string }[] };
  const newest = [...search.messages].sort((a, b) => b.Created.localeCompare(a.Created))[0]!;
  const message = (await (
    await fetch(`http://127.0.0.1:8025/api/v1/message/${newest.ID}`)
  ).json()) as { Text: string };
  const match = message.Text.match(/[?&]token=([^\s&]+)/);
  expect(match).toBeTruthy();
  return decodeURIComponent(match![1]!);
}

test('invitation resend rotates the token and concurrent acceptance has one winner', async () => {
  sql(
    `DELETE FROM membership_branch_scopes WHERE tenant_id='${alpha}' AND membership_id IN (SELECT id FROM memberships WHERE tenant_id='${alpha}' AND principal_id='42000000-0000-4000-8000-000000000001'); DELETE FROM membership_authorization_roles WHERE tenant_id='${alpha}' AND membership_id IN (SELECT id FROM memberships WHERE tenant_id='${alpha}' AND principal_id='42000000-0000-4000-8000-000000000001'); DELETE FROM memberships WHERE tenant_id='${alpha}' AND principal_id='42000000-0000-4000-8000-000000000001'`,
  );
  await fetch('http://127.0.0.1:8025/api/v1/messages', { method: 'DELETE' });
  const owner = await login('alpha.owner@nexo.local');
  const invited = await login('beta.owner@nexo.local');
  const headers = { origin, 'x-csrf-token': owner.csrf };
  const created = await owner.context.post(`/v1/organizations/${alpha}/invitations`, {
    headers,
    data: {
      accessScope: 'ALL_BRANCHES',
      branchIds: [],
      email: 'beta.owner@nexo.local',
      roleKey: 'CASHIER',
    },
  });
  expect(created.status(), await created.text()).toBe(201);
  const invitation = (await created.json()) as { id: string };
  const oldToken = await latestInvitationToken('beta.owner@nexo.local');
  const resent = await owner.context.post(
    `/v1/organizations/${alpha}/invitations/${invitation.id}/resend`,
    { headers },
  );
  expect(resent.status()).toBe(200);
  await expect
    .poll(async () => {
      const token = await latestInvitationToken('beta.owner@nexo.local');
      return token === oldToken ? '' : token;
    })
    .not.toBe('');
  const token = await latestInvitationToken('beta.owner@nexo.local');
  const invitedHeaders = { origin, 'x-csrf-token': invited.csrf };
  expect(
    (
      await invited.context.post(`/v1/organizations/${alpha}/invitations/accept`, {
        headers: invitedHeaders,
        data: { token: oldToken },
      })
    ).status(),
  ).toBe(403);
  const attempts = await Promise.all([
    invited.context.post(`/v1/organizations/${alpha}/invitations/accept`, {
      headers: invitedHeaders,
      data: { token },
    }),
    invited.context.post(`/v1/organizations/${alpha}/invitations/accept`, {
      headers: invitedHeaders,
      data: { token },
    }),
  ]);
  expect(attempts.map((response) => response.status()).sort()).toEqual([201, 403]);
  expect(
    (
      await invited.context.post(`/v1/organizations/${alpha}/invitations/accept`, {
        headers: invitedHeaders,
        data: { token },
      })
    ).status(),
  ).toBe(403);
  await owner.context.dispose();
  await invited.context.dispose();
});

test('MFA state and trusted-device input cannot grant authorization', async () => {
  const employee = await login('alpha.employee@nexo.local');
  const context = await employee.context.get(
    `/v1/organizations/${alpha}/authorization/context?branchId=${alphaBranch}`,
  );
  expect(context.status()).toBe(200);
  const body = (await context.json()) as { roles: string[] };
  expect(body.roles).toEqual(['EMPLOYEE']);
  const forged = await employee.context.post(`/v1/organizations/${alpha}/authorization/evaluate`, {
    data: {
      mfaStatus: 'ENROLLED',
      trusted: true,
      permission: 'membership.update',
      resource: { branchId: alphaBranch, type: 'membership' },
    },
  });
  expect(forged.status()).toBe(400);
  await employee.context.dispose();
});

test('existing session revalidates membership, organization and branch lifecycle', async () => {
  const employee = await login('alpha.employee@nexo.local');
  const contextUrl = `/v1/organizations/${alpha}/authorization/context?branchId=${alphaBranch}`;
  expect((await employee.context.get(contextUrl)).status()).toBe(200);
  try {
    sql(
      `UPDATE memberships SET status='SUSPENDED' WHERE tenant_id='${alpha}' AND principal_id='41000000-0000-4000-8000-000000000005'`,
    );
    expect((await employee.context.get(contextUrl)).status()).toBe(403);
    sql(
      `UPDATE memberships SET status='ACTIVE' WHERE tenant_id='${alpha}' AND principal_id='41000000-0000-4000-8000-000000000005'`,
    );
    expect((await employee.context.get(contextUrl)).status()).toBe(200);
    sql(`UPDATE organizations SET status='SUSPENDED' WHERE id='${alpha}'`);
    expect((await employee.context.get(contextUrl)).status()).toBe(403);
    sql(`UPDATE organizations SET status='ACTIVE' WHERE id='${alpha}'`);
    expect((await employee.context.get(contextUrl)).status()).toBe(200);
    sql(`UPDATE branches SET status='INACTIVE' WHERE tenant_id='${alpha}' AND id='${alphaBranch}'`);
    expect((await employee.context.get(contextUrl)).status()).toBe(403);
  } finally {
    sql(`UPDATE organizations SET status='ACTIVE' WHERE id='${alpha}'`);
    sql(`UPDATE branches SET status='ACTIVE' WHERE tenant_id='${alpha}' AND id='${alphaBranch}'`);
    sql(
      `UPDATE memberships SET status='ACTIVE' WHERE tenant_id='${alpha}' AND principal_id='41000000-0000-4000-8000-000000000005'`,
    );
    await employee.context.dispose();
  }
});
