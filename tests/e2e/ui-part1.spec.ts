import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { mkdir } from 'node:fs/promises';

const web = 'http://localhost:3000';
const api = 'http://localhost:3001';
const password = process.env.TEST_PERSONA_PASSWORD ?? 'Nexo Test Persona 2026!';
const artifacts = 'artifacts/ui-part-1';

async function login(page: import('@playwright/test').Page) {
  const response = await page.request.post(`${api}/v1/auth/login`, {
    headers: { origin: web },
    data: {
      email: 'alpha.owner@nexo.local',
      password,
      deviceFingerprint: `ui-part-1-${Date.now()}`,
      deviceName: 'UI Parte 1 visual certification',
    },
  });
  expect(response.ok()).toBe(true);
}

test.describe('NEXO UI Parte 1', () => {
  test.beforeAll(async () => {
    await mkdir(artifacts, { recursive: true });
  });

  test('Login determinista coincide en estructura y permanece accesible', async ({ browser }) => {
    const context = await browser.newContext({ viewport: { width: 1672, height: 941 } });
    const page = await context.newPage();
    await page.goto(`${web}/?scene=static`);
    await expect(page.getByRole('heading', { name: 'Bienvenido de nuevo' })).toBeVisible();
    await expect(page.locator('.nexo-living-scene')).toHaveAttribute('data-deterministic', 'true');
    await page.screenshot({ path: `${artifacts}/login-1672x941.png` });
    const violations = (await new AxeBuilder({ page }).analyze()).violations.filter(
      ({ impact }) => impact === 'critical' || impact === 'serious',
    );
    expect(violations).toEqual([]);
    await context.close();
  });

  test('Home desktop usa shell, datos reales y escena determinista', async ({ browser }) => {
    const context = await browser.newContext({ viewport: { width: 1600, height: 900 } });
    const page = await context.newPage();
    await login(page);
    await page.goto(`${web}/?scene=static`);
    await expect(page.getByRole('heading', { name: /Buenos días/ })).toBeVisible();
    await expect(page.locator('.metric-card')).toHaveCount(5);
    await expect(page.getByRole('navigation', { name: 'Navegación principal' })).toBeVisible();
    await page.screenshot({ path: `${artifacts}/home-1600x900.png` });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= document.documentElement.clientWidth,
      ),
    ).toBe(true);
    const violations = (await new AxeBuilder({ page }).analyze()).violations.filter(
      ({ impact }) => impact === 'critical' || impact === 'serious',
    );
    expect(violations).toEqual([]);
    await context.close();
  });

  for (const [name, viewport] of [
    ['tablet', { width: 768, height: 1024 }],
    ['mobile', { width: 390, height: 844 }],
  ] as const) {
    test(`Home ${name} no desborda y expone navegación`, async ({ browser }) => {
      const context = await browser.newContext({ viewport });
      const page = await context.newPage();
      await login(page);
      await page.goto(`${web}/?scene=static`);
      const trigger = page.getByRole('button', { name: 'Abrir navegación' });
      await expect(trigger).toBeVisible();
      await trigger.click();
      await expect(page.getByRole('navigation', { name: 'Navegación principal' })).toBeVisible();
      await page.keyboard.press('Escape');
      await expect(trigger).toHaveAttribute('aria-expanded', 'false');
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= document.documentElement.clientWidth,
        ),
      ).toBe(true);
      await page.screenshot({ path: `${artifacts}/home-${name}.png`, fullPage: true });
      await context.close();
    });
  }

  test('reduced motion congela la escena sin ocultar contenido', async ({ browser }) => {
    const context = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      reducedMotion: 'reduce',
    });
    const page = await context.newPage();
    await login(page);
    await page.goto(web);
    await expect(page.getByRole('heading', { name: /Buenos días/ })).toBeVisible();
    await expect(page.locator('.nexo-living-scene__blob').first()).toHaveCSS(
      'animation-name',
      'none',
    );
    await page.screenshot({ path: `${artifacts}/home-reduced-motion.png`, fullPage: true });
    await context.close();
  });
});
