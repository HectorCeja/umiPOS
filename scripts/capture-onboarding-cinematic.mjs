import { mkdir, rename } from 'node:fs/promises';
import { chromium } from '@playwright/test';

const output = 'artifacts/login-onboarding-cinematic';
const api = 'http://localhost:3001';
const organizationId = '11111111-1111-4111-8111-111111111111';
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  recordVideo: { dir: output, size: { width: 1440, height: 900 } },
});
const page = await context.newPage();
const login = await page.request.post(`${api}/v1/auth/login`, {
  headers: { origin: 'http://localhost:3000' },
  data: {
    email: 'alpha.owner@nexo.local',
    password: 'Nexo Test Persona 2026!',
    deviceFingerprint: `cinematic-video-${Date.now()}`,
    deviceName: 'Onboarding cinematic capture',
  },
});
if (!login.ok()) throw new Error('No fue posible iniciar la sesión demo para capturar el video.');
const state = await (
  await page.request.get(`${api}/v1/organizations/${organizationId}/onboarding`)
).json();
const csrf = (await context.cookies()).find((cookie) => cookie.name === 'nexo_csrf')?.value ?? '';
if (state.status === 'COMPLETED') {
  const restart = await page.request.post(
    `${api}/v1/organizations/${organizationId}/onboarding/restart`,
    {
      headers: { 'x-csrf-token': csrf },
      data: { version: state.version },
    },
  );
  if (!restart.ok()) throw new Error('No fue posible reiniciar el onboarding demo para el video.');
}
await page.goto('http://localhost:3000');
await page.locator('.ambient-experience--onboarding').waitFor({ state: 'visible' });
await page.waitForTimeout(10_000);
const video = page.video();
await context.close();
await browser.close();
if (!video) throw new Error('Playwright no generó el video del onboarding.');
await rename(await video.path(), `${output}/onboarding-cinematic-v2.webm`);
