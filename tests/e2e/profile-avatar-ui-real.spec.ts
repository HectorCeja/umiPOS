import { chromium, expect, test } from '@playwright/test';

const apiBase = process.env.PROFILE_MEDIA_API_URL ?? 'http://localhost:3002';
const webBase = process.env.PROFILE_MEDIA_WEB_URL ?? 'http://localhost:3003';
const password = process.env.TEST_PERSONA_PASSWORD ?? 'Nexo Test Persona 2026!';
const png = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=',
  'base64',
);

test('owner saves, reloads, and removes profile media through the real UI', async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    recordVideo: {
      dir: 'artifacts/flutter-design-parity/part-4e/videos',
      size: { width: 1280, height: 720 },
    },
    viewport: { width: 1280, height: 720 },
  });
  const login = await context.request.post(`${apiBase}/v1/auth/login`, {
    data: {
      deviceFingerprint: 'profile-media-ui-real',
      deviceName: 'Profile media UI real',
      email: 'alpha.owner@nexo.local',
      password,
      rememberDevice: false,
      rememberMe: false,
    },
  });
  expect(login.status()).toBe(200);
  const page = await context.newPage();
  const avatarCspErrors: string[] = [];
  page.on('console', (message) => {
    if (
      message.type() === 'error' &&
      message.text().includes('Content Security Policy') &&
      message.text().includes('/v1/profile/avatar/')
    ) {
      avatarCspErrors.push(message.text());
    }
  });
  page.on('requestfailed', (request) =>
    console.warn(`REQUEST_FAILED ${request.method()} ${new URL(request.url()).origin}`),
  );
  await page.goto(`${webBase}/settings/profile`);
  await page.locator('input[type=file]').setInputFiles({
    name: 'avatar-real.png',
    mimeType: 'image/png',
    buffer: png,
  });
  await expect(page.getByAltText('Vista previa')).toBeVisible();
  await page.screenshot({
    path: 'artifacts/flutter-design-parity/part-4e/screenshots/avatar-preview.png',
  });
  await page.getByRole('button', { name: 'Guardar perfil' }).click();
  await expect(page.getByText(/Perfil guardado\. Verás los cambios/)).toBeVisible({
    timeout: 15_000,
  });
  await page.reload();
  await expect(page.getByAltText('Vista previa')).toBeVisible();
  await page.screenshot({
    path: 'artifacts/flutter-design-parity/part-4e/screenshots/avatar-persisted.png',
  });
  expect(avatarCspErrors).toEqual([]);
  await page.getByRole('button', { name: 'Eliminar foto' }).click();
  await expect(page.getByText('Foto eliminada. Usaremos tus iniciales.')).toBeVisible();
  await page.reload();
  await expect(page.getByAltText('Vista previa')).toHaveCount(0);
  await context.close();
  await browser.close();
});
