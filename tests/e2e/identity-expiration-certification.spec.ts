import { execFileSync } from 'node:child_process';

import { expect, request as createRequest, test } from '@playwright/test';

const api = 'http://127.0.0.1:3001';
const origin = 'http://localhost:3000';
const password = process.env.TEST_PERSONA_PASSWORD ?? 'Nexo Test Persona 2026!';

async function authenticatedSession(email: string) {
  const context = await createRequest.newContext({ baseURL: api, extraHTTPHeaders: { origin } });
  const login = await context.post('/v1/auth/login', {
    data: {
      deviceFingerprint: `expiration-certification-${email}`,
      deviceName: 'Expiration certification',
      email,
      password,
      rememberDevice: false,
      rememberMe: false,
    },
  });
  expect(login.status()).toBe(200);
  const identity = await context.get('/v1/identity');
  expect(identity.status()).toBe(200);
  return {
    context,
    sessionId: ((await identity.json()) as { sessionId: string }).sessionId,
  };
}

function expire(sessionId: string, column: 'idle_expires_at' | 'absolute_expires_at') {
  if (!/^[0-9a-f-]{36}$/i.test(sessionId)) throw new Error('Unexpected session identifier');
  const assignment =
    column === 'absolute_expires_at'
      ? "idle_expires_at = now() - interval '2 seconds', absolute_expires_at = now() - interval '1 second'"
      : "idle_expires_at = now() - interval '1 second'";
  execFileSync('docker', [
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
    `update sessions set ${assignment} where id = '${sessionId}'::uuid`,
  ]);
}

test('idle expiration invalidates an otherwise valid access token', async () => {
  const { context, sessionId } = await authenticatedSession('alpha.cashier@nexo.local');
  expire(sessionId, 'idle_expires_at');
  expect((await context.get('/v1/identity')).status()).toBe(401);
  await context.dispose();
});

test('absolute expiration cannot be extended by activity', async () => {
  const { context, sessionId } = await authenticatedSession('alpha.readonly@nexo.local');
  expect((await context.get('/v1/identity')).status()).toBe(200);
  expire(sessionId, 'absolute_expires_at');
  expect((await context.get('/v1/identity')).status()).toBe(401);
  await context.dispose();
});
