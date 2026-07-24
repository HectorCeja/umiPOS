import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { createCleanBusiness } from './dynamic-context.helpers';

const web = 'http://localhost:3000';
const api = 'http://localhost:3001';
let organizationId: string;
let fixtureEmail: string;
const password = process.env.TEST_PERSONA_PASSWORD ?? 'Nexo Test Persona 2026!';
const artifacts = path.resolve('artifacts/login-onboarding-cinematic');

async function capture(page: Page, name: string) {
  await page.screenshot({
    path: path.join(artifacts, name),
    fullPage: true,
    animations: 'disabled',
  });
}

test.describe.serial('Login + Onboarding cinematic', () => {
  test.describe.configure({ timeout: 90_000 });
  test.beforeAll(async () => {
    await mkdir(artifacts, { recursive: true });
    const fixture = createCleanBusiness();
    organizationId = fixture.organizationId;
    fixtureEmail = fixture.email;
  });

  test('login real, error localizado, responsive, reduced motion y axe', async ({ browser }) => {
    for (const [name, viewport] of [
      ['login-desktop.png', { width: 1440, height: 900 }],
      ['login-tablet.png', { width: 768, height: 1024 }],
      ['login-mobile.png', { width: 390, height: 844 }],
    ] as const) {
      const context = await browser.newContext({ viewport });
      const page = await context.newPage();
      await page.goto(web);
      await expect(page.getByRole('heading', { name: 'Bienvenido de nuevo' })).toBeVisible();
      await expect(page.locator('.ambient-experience--login')).toBeVisible();
      await expect(page.locator('.nexo-living-scene__blob')).toHaveCount(4);
      await expect(page.locator('.nexo-living-scene__light-leaks')).toBeVisible();
      await expect(page.locator('.nexo-living-scene__particles')).toBeVisible();
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= document.documentElement.clientWidth,
        ),
      ).toBe(true);
      await capture(page, name);
      await context.close();
    }

    const context = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      reducedMotion: 'reduce',
    });
    const page = await context.newPage();
    await page.goto(web);
    await expect(page.locator('.nexo-living-scene__photo')).toHaveCSS('animation-name', 'none');
    await capture(page, 'login-reduced-motion.png');
    const violations = (await new AxeBuilder({ page }).analyze()).violations.filter(
      ({ impact }) => impact === 'critical' || impact === 'serious',
    );
    expect(violations).toEqual([]);
    await page.locator('input[type="password"]').fill('incorrecta');
    await page.getByLabel('Correo electrónico').fill(fixtureEmail);
    await page.getByRole('button', { name: 'Entrar a NEXO' }).click();
    await expect(page.locator('.login-error')).toContainText('No pudimos iniciar sesión');
    await page.locator('input[type="password"]').fill(password);
    await page.getByRole('button', { name: 'Entrar a NEXO' }).click();
    await page.locator('.product-main, .guided-onboarding').first().waitFor();
    const stateResponse = await page.request.get(
      `${api}/v1/organizations/${organizationId}/onboarding`,
    );
    const state = (await stateResponse.json()) as { version: number };
    const csrf =
      (await context.cookies()).find((cookie) => cookie.name === 'nexo_csrf')?.value ?? '';
    const restarted = await page.request.post(
      `${api}/v1/organizations/${organizationId}/onboarding/restart`,
      {
        headers: { 'x-csrf-token': csrf },
        data: { version: state.version },
      },
    );
    expect(restarted.ok()).toBe(true);
    await page.goto(web);
    await expect(page.locator('.overline', { hasText: 'PASO 1 DE 11' })).toBeVisible();
    await context.close();
  });

  test('onboarding autoritativo, editable, persistente y capturable', async ({ browser }) => {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await context.newPage();
    const login = await page.request.post(`${api}/v1/auth/login`, {
      headers: { origin: web },
      data: {
        email: fixtureEmail,
        password,
        deviceFingerprint: `cinematic-${Date.now()}`,
        deviceName: 'Cinematic certification',
      },
    });
    expect(login.ok()).toBe(true);
    const before = (await (
      await page.request.get(`${api}/v1/organizations/${organizationId}/onboarding`)
    ).json()) as { version: number };
    const csrfBefore =
      (await context.cookies()).find((cookie) => cookie.name === 'nexo_csrf')?.value ?? '';
    const reset = await page.request.post(
      `${api}/v1/organizations/${organizationId}/onboarding/restart`,
      { headers: { 'x-csrf-token': csrfBefore }, data: { version: before.version } },
    );
    expect(reset.ok()).toBe(true);
    await page.goto(web);
    await expect(page.locator('.overline', { hasText: 'PASO 1 DE 11' })).toBeVisible();
    await capture(page, 'onboarding-welcome-desktop.png');
    const violations = (await new AxeBuilder({ page }).analyze()).violations.filter(
      ({ impact }) => impact === 'critical' || impact === 'serious',
    );
    expect(violations).toEqual([]);

    const captures = new Map<number, string>([
      [1, 'onboarding-business.png'],
      [3, 'onboarding-region.png'],
      [4, 'onboarding-branch.png'],
      [5, 'onboarding-schedule.png'],
      [7, 'onboarding-catalog.png'],
      [10, 'onboarding-review.png'],
    ]);
    for (let step = 1; step <= 10; step += 1) {
      await page.getByRole('button', { name: /Empezar|Continuar/ }).click();
      await expect(page.locator('.guided-onboarding')).toHaveAttribute('data-step', String(step));
      const screenshot = captures.get(step);
      if (screenshot) await capture(page, screenshot);
      if (step === 1) {
        await page.getByLabel('Nombre comercial').fill('Negocio Cinematic');
      }
      if (step === 2) await page.getByRole('button', { name: /Cafetería/ }).click();
      if (step === 7) {
        await page.getByRole('radio', { name: /Catálogo vacío/ }).click();
        const productForm = page.locator('.onboarding-product-builder');
        await productForm.getByLabel(/^Nombre/).fill('Tisana Horizonte');
        await productForm.getByRole('combobox', { name: /Categoría/ }).click();
        await page.getByRole('option', { name: 'Bebidas' }).click();
        await productForm.getByLabel(/Precio sugerido/).fill('64');
        await expect(
          productForm.getByRole('heading', { name: 'Crea tu primer producto' }),
        ).toBeVisible();
        await capture(page, 'onboarding-custom-product.png');
      }
    }
    await page.reload();
    await expect(page.locator('.overline', { hasText: 'PASO 11 DE 11' })).toBeVisible();
    await page.getByRole('button', { name: 'Entrar a NEXO' }).click();
    await capture(page, 'onboarding-complete.png');

    const latestResponse = await page.request.get(
      `${api}/v1/organizations/${organizationId}/onboarding`,
    );
    const latest = (await latestResponse.json()) as { version: number };
    const csrf =
      (await context.cookies()).find((cookie) => cookie.name === 'nexo_csrf')?.value ?? '';
    const restarted = await page.request.post(
      `${api}/v1/organizations/${organizationId}/onboarding/restart`,
      {
        headers: { 'x-csrf-token': csrf },
        data: { version: latest.version },
      },
    );
    expect(restarted.ok()).toBe(true);
    await page.goto(web);
    await expect(page.locator('.overline', { hasText: 'PASO 1 DE 11' })).toBeVisible();

    for (const [name, viewport] of [
      ['onboarding-welcome-tablet.png', { width: 768, height: 1024 }],
      ['onboarding-welcome-mobile.png', { width: 390, height: 844 }],
    ] as const) {
      await page.setViewportSize(viewport);
      await expect(page.locator('.guided-onboarding')).toBeVisible();
      await capture(page, name);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= document.documentElement.clientWidth,
        ),
      ).toBe(true);
    }
    await page.setViewportSize({ width: 1440, height: 900 });
    for (let step = 1; step <= 10; step += 1) {
      await page.getByRole('button', { name: /Empezar|Continuar/ }).click();
      await expect(page.locator('.guided-onboarding')).toHaveAttribute('data-step', String(step));
      if (step === 1) {
        await page.getByLabel('Nombre comercial').fill('Negocio Cinematic');
      }
      if (step === 2) await page.getByRole('button', { name: /Cafetería/ }).click();
    }
    await page.getByRole('button', { name: 'Entrar a NEXO' }).click();
    await expect(page.locator('.product-main')).toBeVisible();
    await context.close();
  });
});
