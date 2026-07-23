import { expect, request as createRequest, test, type APIRequestContext } from '@playwright/test';

const password = process.env.TEST_PERSONA_PASSWORD ?? 'Nexo Test Persona 2026!';

async function csrf(context: APIRequestContext): Promise<string> {
  const state = await context.storageState();
  const value = state.cookies.find((cookie) =>
    ['__Host-nexo_csrf', 'nexo_csrf'].includes(cookie.name),
  )?.value;
  if (!value) throw new Error('CSRF cookie was not issued');
  return value;
}

async function login(email: string, credential = password): Promise<APIRequestContext> {
  const context = await createRequest.newContext({ baseURL: 'http://127.0.0.1:3001' });
  const response = await context.post('/v1/auth/login', {
    data: {
      deviceFingerprint: `playwright-${email}`,
      deviceName: 'Playwright Chromium',
      email,
      password: credential,
      rememberDevice: true,
      rememberMe: true,
    },
  });
  expect(response.status()).toBe(200);
  return context;
}

async function latestMailToken(email: string): Promise<string> {
  await expect
    .poll(async () => {
      const response = await fetch(
        `http://127.0.0.1:8025/api/v1/search?query=to:${encodeURIComponent(email)}`,
      );
      const payload = (await response.json()) as { messages?: unknown[] };
      return payload.messages?.length ?? 0;
    })
    .toBeGreaterThan(0);
  const search = await fetch(
    `http://127.0.0.1:8025/api/v1/search?query=to:${encodeURIComponent(email)}`,
  );
  const payload = (await search.json()) as { messages: Array<{ ID: string }> };
  const message = await fetch(`http://127.0.0.1:8025/api/v1/message/${payload.messages[0]?.ID}`);
  const detail = (await message.json()) as { Text: string };
  const token = /token=([A-Za-z0-9_-]+)/.exec(detail.Text)?.[1];
  if (!token) throw new Error('Mail did not contain a token');
  return token;
}

test.describe.serial('identity platform with real services', () => {
  test.beforeAll(async () => {
    await fetch('http://127.0.0.1:8025/api/v1/messages', { method: 'DELETE' });
  });

  test('login, identity, session rotation, session listing and logout', async () => {
    const context = await login('alpha.owner@nexo.local');
    const identity = await context.get('/v1/identity');
    expect(identity.status()).toBe(200);
    expect(await identity.json()).toMatchObject({ email: 'alpha.owner@nexo.local' });

    const sessions = await context.get('/v1/sessions');
    expect(sessions.status()).toBe(200);
    expect((await sessions.json()) as unknown[]).not.toHaveLength(0);

    const refresh = await context.post('/v1/auth/refresh', {
      headers: { 'x-csrf-token': await csrf(context) },
    });
    expect(refresh.status()).toBe(200);

    const logout = await context.post('/v1/auth/logout', {
      headers: { 'x-csrf-token': await csrf(context) },
    });
    expect(logout.status()).toBe(204);
    expect((await context.get('/v1/identity')).status()).toBe(401);
    await context.dispose();
  });

  test('session-bound CSRF rejects a missing token', async () => {
    const context = await login('alpha.admin@nexo.local');
    const response = await context.post('/v1/auth/logout');
    expect(response.status()).toBe(403);
    expect((await context.get('/v1/identity')).status()).toBe(200);
    await context.dispose();
  });

  test('refresh token reuse closes the whole session family', async () => {
    const context = await login('alpha.supervisor@nexo.local');
    const beforeRotation = await context.storageState();
    const refresh = await context.post('/v1/auth/refresh', {
      headers: { 'x-csrf-token': await csrf(context) },
    });
    expect(refresh.status()).toBe(200);
    const replay = await createRequest.newContext({
      baseURL: 'http://127.0.0.1:3001',
      storageState: beforeRotation,
    });
    expect(
      (
        await replay.post('/v1/auth/refresh', {
          headers: {
            'x-csrf-token':
              beforeRotation.cookies.find((cookie) =>
                ['__Host-nexo_csrf', 'nexo_csrf'].includes(cookie.name),
              )?.value ?? '',
          },
        })
      ).status(),
    ).toBe(401);
    expect((await context.get('/v1/identity')).status()).toBe(401);
    await replay.dispose();
    await context.dispose();
  });

  test('concurrent refresh has one winner and then closes the raced family', async () => {
    const original = await login('beta.owner@nexo.local');
    const state = await original.storageState();
    const csrfToken =
      state.cookies.find((cookie) => ['__Host-nexo_csrf', 'nexo_csrf'].includes(cookie.name))
        ?.value ?? '';
    const first = await createRequest.newContext({
      baseURL: 'http://127.0.0.1:3001',
      storageState: state,
    });
    const second = await createRequest.newContext({
      baseURL: 'http://127.0.0.1:3001',
      storageState: state,
    });
    const statuses = await Promise.all([
      first
        .post('/v1/auth/refresh', { headers: { 'x-csrf-token': csrfToken } })
        .then((response) => response.status()),
      second
        .post('/v1/auth/refresh', { headers: { 'x-csrf-token': csrfToken } })
        .then((response) => response.status()),
    ]);
    expect(statuses.sort()).toEqual([200, 401]);
    expect((await first.get('/v1/identity')).status()).toBe(401);
    expect((await second.get('/v1/identity')).status()).toBe(401);
    await original.dispose();
    await first.dispose();
    await second.dispose();
  });

  test('a User can list and remotely revoke another owned session', async () => {
    const first = await login('alpha.readonly@nexo.local');
    const second = await login('alpha.readonly@nexo.local');
    const sessionsResponse = await first.get('/v1/sessions');
    expect(sessionsResponse.status()).toBe(200);
    const sessions = (await sessionsResponse.json()) as Array<{ id: string; current: boolean }>;
    const remote = sessions.find((session) => !session.current);
    expect(remote).toBeDefined();
    expect(
      (
        await first.delete(`/v1/sessions/${String(remote?.id)}`, {
          headers: { 'x-csrf-token': await csrf(first) },
        })
      ).status(),
    ).toBe(204);
    expect((await second.get('/v1/identity')).status()).toBe(401);
    await first.dispose();
    await second.dispose();
  });

  test('password reset is delivered through Mailpit and revokes sessions', async ({ request }) => {
    const email = 'alpha.cashier@nexo.local';
    expect(
      (await request.post('/v1/auth/password-reset/request', { data: { email } })).status(),
    ).toBe(202);
    const token = await latestMailToken(email);
    expect(
      (
        await request.post('/v1/auth/password-reset/complete', {
          data: { password: 'passwordpassword', token },
        })
      ).status(),
    ).toBe(403);
    const changedPassword = 'Nexo Reset Persona 2026!';
    expect(
      (
        await request.post('/v1/auth/password-reset/complete', {
          data: { password: changedPassword, token },
        })
      ).status(),
    ).toBe(204);
    expect(
      (
        await request.post('/v1/auth/password-reset/complete', {
          data: { password: changedPassword, token },
        })
      ).status(),
    ).toBe(403);
    const context = await login(email, changedPassword);
    await context.dispose();
  });

  test('email verification is delivered through Mailpit', async ({ request }) => {
    const email = 'beta.admin@nexo.local';
    expect(
      (await request.post('/v1/auth/email-verification/request', { data: { email } })).status(),
    ).toBe(202);
    const token = await latestMailToken(email);
    expect(
      (await request.post('/v1/auth/email-verification/complete', { data: { token } })).status(),
    ).toBe(204);
    expect(
      (await request.post('/v1/auth/email-verification/complete', { data: { token } })).status(),
    ).toBe(403);
    const context = await login(email);
    await context.dispose();
  });
});
