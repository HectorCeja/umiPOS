import { expect, test, type Page } from '@playwright/test';

const host = process.env.DEV_LAN_HOST;
const web = host ? `http://${host}:${process.env.DEV_WEB_PORT ?? '3000'}` : '';
const api = host ? `http://${host}:${process.env.DEV_API_PORT ?? '3001'}` : '';
const password = process.env.TEST_PERSONA_PASSWORD ?? 'Nexo Test Persona 2026!';

function browserFailures(page: Page) {
  const failures: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error') failures.push(`console: ${message.text()}`);
  });
  page.on('pageerror', (error) => failures.push(`pageerror: ${error.message}`));
  page.on('requestfailed', (request) =>
    failures.push(
      `requestfailed: ${request.method()} ${request.url()} ${request.failure()?.errorText}`,
    ),
  );
  return failures;
}

test.describe('development LAN security contract', () => {
  test.skip(!host, 'Set DEV_LAN_HOST to run the real LAN-origin suite.');

  test('CSP, preflight, login, session, media navigation and logout work via LAN', async ({
    page,
  }) => {
    const failures = browserFailures(page);
    const documentResponse = await page.goto(`${web}/login`);
    const csp = documentResponse?.headers()['content-security-policy'] ?? '';
    expect(csp).toContain(api);
    expect(csp).toContain(`http://${host}:${process.env.DEV_OBJECT_STORAGE_PORT ?? '9000'}`);
    expect(csp).not.toContain('connect-src *');

    const preflight = await page.request.fetch(`${api}/v1/auth/login`, {
      method: 'OPTIONS',
      headers: {
        Origin: web,
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'content-type',
      },
    });
    expect(preflight.status()).toBe(204);
    expect(preflight.headers()['access-control-allow-origin']).toBe(web);
    expect(preflight.headers()['access-control-allow-credentials']).toBe('true');

    await page.getByLabel('Correo electrónico').fill('alpha.owner@nexo.local');
    await page.getByLabel(/Contraseña/).fill(password);
    await page.getByRole('button', { name: 'Entrar a NEXO' }).click();
    await expect(page.locator('[data-nexo-app-shell="canonical"]')).toBeVisible({
      timeout: 30_000,
    });
    const session = (await page.context().cookies()).find(({ name }) => name === 'nexo_session');
    expect(session).toMatchObject({
      domain: host,
      httpOnly: true,
      sameSite: 'Strict',
      secure: false,
    });

    for (const route of ['/products', '/inventory', '/settings/profile']) {
      await page.goto(`${web}${route}`);
      await expect(page.locator('[data-nexo-app-shell="canonical"]')).toBeVisible();
      await page.waitForLoadState('networkidle');
    }
    await page.reload();
    await expect(page.locator('[data-nexo-app-shell="canonical"]')).toBeVisible();
    const brokenImages = await page
      .locator('img')
      .evaluateAll((images) =>
        images
          .filter((image) => !image.complete || image.naturalWidth === 0)
          .map((image) => image.src),
      );
    expect(brokenImages).toEqual([]);
    await page.screenshot({
      path: 'artifacts/dev-lan-access/lan-authenticated-profile.png',
      fullPage: true,
    });

    await page.locator('.profile-trigger').click();
    await page.getByRole('menuitem', { name: 'Cerrar sesión' }).click();
    await expect(page.getByRole('heading', { name: 'Bienvenido de nuevo' })).toBeVisible();
    await expect
      .poll(async () =>
        (await page.context().cookies()).filter(
          ({ domain, name }) => domain === host && name === 'nexo_session',
        ),
      )
      .toEqual([]);
    expect(failures, failures.join('\n')).toEqual([]);
  });

  for (const origin of [
    'http://192.168.100.88:3000',
    `http://${host}.evil.com:3000`,
    `http://evil.com/?origin=${web}`,
  ]) {
    test(`rejects unknown or malicious origin ${origin}`, async ({ request }) => {
      const response = await request.post(`${api}/v1/auth/login`, {
        headers: { origin },
        data: {
          email: 'alpha.owner@nexo.local',
          password,
          deviceFingerprint: 'rejected-lan-origin',
          deviceName: 'Rejected LAN origin',
        },
      });
      expect(response.status()).toBe(403);
      expect(response.headers()['access-control-allow-origin']).toBeUndefined();
    });
  }
});
