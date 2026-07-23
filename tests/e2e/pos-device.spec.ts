import { createHash, randomUUID } from 'node:crypto';
import { expect, request as createRequest, test } from '@playwright/test';

const alpha = '10000000-0000-4000-8000-000000000001';
const beta = '10000000-0000-4000-8000-000000000002';
const alphaBranch = '20000000-0000-4000-8000-000000000001';

test('real POS enrollment, authentication, tenant isolation and revocation', async () => {
  const owner = await createRequest.newContext({ baseURL: 'http://127.0.0.1:3001' });
  const login = await owner.post('/v1/auth/login', {
    data: {
      email: 'alpha.owner@nexo.local',
      password: 'Nexo Test Persona 2026!',
      deviceFingerprint: `pos-device-${randomUUID()}`,
      deviceName: 'POS Device E2E',
    },
  });
  expect(login.status()).toBe(200);
  const state = await owner.storageState();
  const csrf = state.cookies.find((cookie) => cookie.name === 'nexo_csrf')!.value;
  const invitation = await owner.post(`/v1/organizations/${alpha}/device-enrollments`, {
    headers: { 'x-csrf-token': csrf },
    data: {
      branchId: alphaBranch,
      idempotencyKey: `enroll-${randomUUID()}`,
      capabilities: { keyboard: true, scanner: true },
    },
  });
  expect(invitation.status(), await invitation.text()).toBe(201);
  const invitationBody = (await invitation.json()) as { token: string };
  const fingerprint = createHash('sha256').update(randomUUID()).digest('hex');
  const anonymous = await createRequest.newContext({ baseURL: 'http://127.0.0.1:3001' });
  const consumeData = {
    token: invitationBody.token,
    name: 'Terminal E2E',
    platform: 'linux',
    appVersion: '0.4.0',
    fingerprintHash: fingerprint,
    idempotencyKey: `consume-${randomUUID()}`,
    capabilities: { administrativeOverride: true },
  };
  const [firstConsume, secondConsume] = await Promise.all([
    anonymous.post(`/v1/organizations/${alpha}/device-enrollments/consume`, {
      data: consumeData,
    }),
    anonymous.post(`/v1/organizations/${alpha}/device-enrollments/consume`, {
      data: consumeData,
    }),
  ]);
  const consume = firstConsume.status() === 201 ? firstConsume : secondConsume;
  const replay = firstConsume.status() === 201 ? secondConsume : firstConsume;
  expect(consume.status()).toBe(201);
  expect(replay.status()).toBe(409);
  const enrolled = (await consume.json()) as {
    device: {
      id: string;
      branchId: string;
      status: string;
      capabilities: Record<string, unknown>;
    };
    credential: string;
  };
  expect(enrolled.device).toMatchObject({ branchId: alphaBranch, status: 'ACTIVE' });
  expect(enrolled.device.capabilities).toEqual({ keyboard: true, scanner: true });
  const credentialHeader = { 'x-nexo-device-credential': enrolled.credential };
  expect(
    (
      await anonymous.get(`/v1/organizations/${alpha}/devices/current`, {
        headers: credentialHeader,
      })
    ).status(),
  ).toBe(200);
  expect(
    (
      await anonymous.get(`/v1/organizations/${beta}/devices/current`, {
        headers: credentialHeader,
      })
    ).status(),
  ).toBe(401);
  const revoke = await owner.post(
    `/v1/organizations/${alpha}/devices/${enrolled.device.id}/revoke`,
    { headers: { 'x-csrf-token': csrf }, data: { reason: 'E2E revocation' } },
  );
  expect(revoke.status()).toBe(201);
  expect(
    (
      await anonymous.get(`/v1/organizations/${alpha}/devices/current`, {
        headers: credentialHeader,
      })
    ).status(),
  ).toBe(401);
  await owner.dispose();
  await anonymous.dispose();
});
