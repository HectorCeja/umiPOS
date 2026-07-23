import { execFileSync } from 'node:child_process';

import { expect, request, test } from '@playwright/test';

const api = 'http://localhost:3001';
const web = 'http://localhost:3000';

test.describe.serial('failure resilience certification', () => {
  test('Web fails explicitly without false report success when API is unavailable', async ({
    browser,
  }) => {
    test.setTimeout(60_000);
    const session = await request.newContext({
      baseURL: api,
      extraHTTPHeaders: { origin: 'http://localhost:3000' },
    });
    const login = await session.post('/v1/auth/login', {
      data: {
        email: 'alpha.owner@nexo.local',
        password: process.env.TEST_PERSONA_PASSWORD ?? 'Nexo Test Persona 2026!',
        deviceFingerprint: `part3a-web-${Date.now()}`,
        deviceName: 'Part 3A Web degradation',
      },
    });
    expect(login.status()).toBe(200);
    const context = await browser.newContext({ storageState: await session.storageState() });
    const page = await context.newPage();
    const pageErrors: string[] = [];
    page.on('pageerror', (error) => pageErrors.push(error.message));
    try {
      await page.goto(`${web}/reports`);
      await expect(page.getByText('Ingresos confirmados')).toBeVisible();
      execFileSync('docker', ['compose', 'stop', 'api'], { cwd: process.cwd() });
      await page.reload({ waitUntil: 'domcontentloaded' });
      await expect(
        page.getByText(/No pudimos (validar tu sesión|preparar los reportes)/),
      ).toBeVisible({
        timeout: 15_000,
      });
      await expect(page.getByText('Ingresos confirmados')).toHaveCount(0);
      expect(pageErrors).toEqual([]);
    } finally {
      execFileSync('docker', ['compose', 'start', 'api'], { cwd: process.cwd() });
      await expect
        .poll(async () => {
          const probe = await request.newContext({ baseURL: api });
          try {
            return (await probe.get('/health/ready')).status();
          } catch {
            return 0;
          } finally {
            await probe.dispose();
          }
        })
        .toBe(200);
      await Promise.all([context.close(), session.dispose()]);
    }
  });
});
