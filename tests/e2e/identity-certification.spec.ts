import { expect, request as createRequest, test, type APIRequestContext } from '@playwright/test';

const api = 'http://127.0.0.1:3001';
const webOrigin = 'http://localhost:3000';
const password = process.env.TEST_PERSONA_PASSWORD ?? 'Nexo Test Persona 2026!';

const validLogin = (email = 'alpha.owner@nexo.local') => ({
  deviceFingerprint: `identity-certification-${email}`,
  deviceName: 'Identity certification Chromium',
  email,
  password,
  rememberDevice: false,
  rememberMe: false,
});

async function csrf(context: APIRequestContext) {
  const state = await context.storageState();
  return state.cookies.find(({ name }) => name === 'nexo_csrf')?.value ?? '';
}

test.describe.serial('Part 1A identity adversarial certification', () => {
  test('login rejects malformed, incomplete, oversized and injection payloads without 500', async ({
    request,
  }) => {
    const cases: Array<Readonly<{ data: unknown; expected: number[] }>> = [
      { data: {}, expected: [400] },
      { data: { ...validLogin(), email: null }, expected: [400] },
      { data: { ...validLogin(), password: null }, expected: [400] },
      { data: { ...validLogin(), rememberMe: 'true' }, expected: [400] },
      { data: { ...validLogin(), unexpected: 'field' }, expected: [400] },
      { data: { ...validLogin(), email: "' OR 1=1 --" }, expected: [400] },
      {
        data: { ...validLogin(), email: '<script>alert(1)</script>@example.com' },
        expected: [400],
      },
      { data: { ...validLogin(), password: 'x'.repeat(129) }, expected: [400] },
      { data: { ...validLogin(), deviceName: 'x'.repeat(161) }, expected: [400] },
    ];
    for (const entry of cases) {
      const response = await request.post('/v1/auth/login', {
        data: entry.data,
        headers: { origin: webOrigin },
      });
      expect(entry.expected).toContain(response.status());
      expect(response.status()).not.toBe(500);
    }

    const malformed = await request.fetch('/v1/auth/login', {
      data: '{"email":',
      headers: { 'content-type': 'application/json', origin: webOrigin },
      method: 'POST',
    });
    expect(malformed.status()).toBe(400);
  });

  test('login failures do not enumerate accounts through status, body, headers or cookies', async ({
    request,
  }) => {
    const attempts = [
      { ...validLogin('alpha.owner@nexo.local'), password: 'incorrect password' },
      { ...validLogin('nonexistent.identity@nexo.local'), password: 'incorrect password' },
      { ...validLogin('beta.admin@nexo.local'), password: 'incorrect password' },
    ];
    const observations = [];
    for (const data of attempts) {
      const started = performance.now();
      const response = await request.post('/v1/auth/login', {
        data,
        headers: { origin: webOrigin },
      });
      observations.push({
        body: await response.text(),
        cookies: response.headers()['set-cookie'] ?? '',
        duration: performance.now() - started,
        status: response.status(),
        type: response.headers()['content-type']?.split(';')[0],
      });
    }
    for (const observation of observations) {
      expect(observation.status).toBe(401);
      expect(observation.cookies).toBe('');
      expect(observation.type).toBe('application/problem+json');
      expect(observation.body).not.toContain('alpha.owner');
      expect(observation.body).not.toContain('beta.admin');
    }
    expect(
      new Set(
        observations.map(({ body }) =>
          body.replace(/"instance":"[^"]+"/, '').replace(/"correlationId":"[^"]+"/, ''),
        ),
      ).size,
    ).toBe(1);
    const durations = observations.map(({ duration }) => duration);
    expect(Math.max(...durations) - Math.min(...durations)).toBeLessThan(750);
  });

  test('origin validation is exact and rejects malicious suffixes and unknown LAN origins', async ({
    request,
  }) => {
    for (const origin of [
      'http://localhost:3000.evil.example',
      'http://192.168.100.88:3000',
      'https://evil.example',
    ]) {
      const response = await request.post('/v1/auth/login', {
        data: validLogin(),
        headers: { origin },
      });
      expect(response.status()).toBe(403);
      expect(response.headers()['set-cookie']).toBeUndefined();
    }
  });

  test('cookies are host-only, HttpOnly where required, Strict and removed on logout', async () => {
    const context = await createRequest.newContext({
      baseURL: api,
      extraHTTPHeaders: { origin: webOrigin },
    });
    const login = await context.post('/v1/auth/login', { data: validLogin() });
    expect(login.status()).toBe(200);
    const cookies = (await context.storageState()).cookies;
    const access = cookies.find(({ name }) => name === 'nexo_session');
    const refresh = cookies.find(({ name }) => name === 'nexo_refresh');
    const csrfCookie = cookies.find(({ name }) => name === 'nexo_csrf');
    expect(access).toMatchObject({ httpOnly: true, sameSite: 'Strict', secure: false });
    expect(refresh).toMatchObject({ httpOnly: true, sameSite: 'Strict', secure: false });
    expect(csrfCookie).toMatchObject({ httpOnly: false, sameSite: 'Strict', secure: false });
    for (const cookie of [access, refresh, csrfCookie]) {
      expect(cookie?.domain).toBe('127.0.0.1');
      expect(cookie?.path).toBe('/');
    }
    const logout = await context.post('/v1/auth/logout', {
      headers: { 'x-csrf-token': await csrf(context) },
    });
    expect(logout.status()).toBe(204);
    expect((await context.storageState()).cookies).toHaveLength(0);
    await context.dispose();
  });

  test('altered access token, wrong-session CSRF and refresh without CSRF are rejected', async () => {
    const first = await createRequest.newContext({
      baseURL: api,
      extraHTTPHeaders: { origin: webOrigin },
    });
    const second = await createRequest.newContext({
      baseURL: api,
      extraHTTPHeaders: { origin: webOrigin },
    });
    expect(
      (await first.post('/v1/auth/login', { data: validLogin('alpha.admin@nexo.local') })).status(),
    ).toBe(200);
    expect(
      (
        await second.post('/v1/auth/login', { data: validLogin('alpha.supervisor@nexo.local') })
      ).status(),
    ).toBe(200);

    expect((await first.post('/v1/auth/refresh')).status()).toBe(403);
    expect(
      (
        await first.post('/v1/auth/refresh', {
          headers: { 'x-csrf-token': await csrf(second) },
        })
      ).status(),
    ).toBe(403);

    const state = await first.storageState();
    const access = state.cookies.find(({ name }) => name === 'nexo_session');
    expect(access).toBeTruthy();
    const altered = await createRequest.newContext({
      baseURL: api,
      extraHTTPHeaders: {
        cookie: `nexo_session=${access!.value[0] === 'A' ? 'B' : 'A'}${access!.value.slice(1)}`,
      },
    });
    expect((await altered.get('/v1/identity')).status()).toBe(401);
    await first.dispose();
    await second.dispose();
    await altered.dispose();
  });
});
