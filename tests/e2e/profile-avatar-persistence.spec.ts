import { expect, request as createRequest, test, type APIRequestContext } from '@playwright/test';

const apiBase = process.env.PROFILE_MEDIA_API_URL ?? 'http://127.0.0.1:3001';
const password = process.env.TEST_PERSONA_PASSWORD ?? 'Nexo Test Persona 2026!';
const png = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=',
  'base64',
);

async function login(): Promise<{ context: APIRequestContext; csrf: string }> {
  const context = await createRequest.newContext({ baseURL: apiBase });
  const response = await context.post('/v1/auth/login', {
    data: {
      deviceFingerprint: 'profile-media-real-e2e',
      deviceName: 'Profile media real E2E',
      email: 'alpha.owner@nexo.local',
      password,
      rememberDevice: false,
      rememberMe: false,
    },
  });
  expect(response.status()).toBe(200);
  const state = await context.storageState();
  const csrf = state.cookies.find((cookie) => cookie.name === 'nexo_csrf')?.value;
  expect(csrf).toBeTruthy();
  return { context, csrf: csrf ?? '' };
}

async function upload(context: APIRequestContext, csrf: string, fileName: string) {
  const prepared = await context.post('/v1/profile/avatar/uploads', {
    headers: { 'x-csrf-token': csrf },
    data: { contentType: 'image/png', fileName, size: png.byteLength },
  });
  expect(prepared.status()).toBe(201);
  const intent = (await prepared.json()) as { objectKey: string; uploadUrl: string };
  const sent = await context.put(intent.uploadUrl, {
    data: png,
    headers: { 'content-type': 'image/png' },
  });
  expect(sent.ok()).toBe(true);
  const completed = await context.post('/v1/profile/avatar/complete', {
    headers: { 'x-csrf-token': csrf },
    data: { objectKey: intent.objectKey },
  });
  expect(completed.status()).toBe(201);
  return (await completed.json()) as { avatarUrl: string };
}

function avatarPath(avatarUrl: string) {
  const url = new URL(avatarUrl);
  return `${url.pathname}${url.search}`;
}

test.describe.serial('profile media persistence with PostgreSQL and MinIO', () => {
  test('persists, replaces, survives a new session, and deletes an avatar', async () => {
    const firstSession = await login();
    const first = await upload(firstSession.context, firstSession.csrf, 'avatar-first.png');
    expect(first.avatarUrl).toContain('/v1/profile/avatar/');
    const firstRead = await firstSession.context.get(avatarPath(first.avatarUrl));
    expect(firstRead.status()).toBe(200);
    expect(await firstRead.body()).toEqual(png);

    const identity = await firstSession.context.get('/v1/identity');
    expect(identity.status()).toBe(200);
    expect(((await identity.json()) as { avatarUrl?: string }).avatarUrl).toBe(first.avatarUrl);
    await firstSession.context.dispose();

    const secondSession = await login();
    const restored = await secondSession.context.get('/v1/identity');
    expect(((await restored.json()) as { avatarUrl?: string }).avatarUrl).toBe(first.avatarUrl);

    const replacement = await upload(secondSession.context, secondSession.csrf, 'avatar-next.png');
    expect(replacement.avatarUrl).not.toBe(first.avatarUrl);
    expect((await secondSession.context.get(avatarPath(first.avatarUrl))).status()).toBe(404);
    expect((await secondSession.context.get(avatarPath(replacement.avatarUrl))).status()).toBe(200);

    const removed = await secondSession.context.delete('/v1/profile/avatar', {
      headers: { 'x-csrf-token': secondSession.csrf },
    });
    expect(removed.status()).toBe(200);
    expect(await removed.json()).toMatchObject({ avatarUrl: null });
    expect((await secondSession.context.get(avatarPath(replacement.avatarUrl))).status()).toBe(404);
    const finalIdentity = await secondSession.context.get('/v1/identity');
    expect(((await finalIdentity.json()) as { avatarUrl?: string | null }).avatarUrl).toBeNull();
    await secondSession.context.dispose();
  });

  test('rejects forged content and another user object key', async () => {
    const owner = await login();
    const prepared = await owner.context.post('/v1/profile/avatar/uploads', {
      headers: { 'x-csrf-token': owner.csrf },
      data: { contentType: 'image/png', fileName: 'forged.png', size: 4 },
    });
    const intent = (await prepared.json()) as { objectKey: string; uploadUrl: string };
    expect(
      (
        await owner.context.put(intent.uploadUrl, {
          data: Buffer.from('nope'),
          headers: { 'content-type': 'image/png' },
        })
      ).ok(),
    ).toBe(true);
    expect(
      (
        await owner.context.post('/v1/profile/avatar/complete', {
          headers: { 'x-csrf-token': owner.csrf },
          data: { objectKey: intent.objectKey },
        })
      ).status(),
    ).toBe(422);
    await owner.context.dispose();
  });
});
