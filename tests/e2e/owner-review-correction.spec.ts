import AxeBuilder from '@axe-core/playwright';
import { expect, test, type BrowserContext, type Page } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { createCleanBusiness } from './dynamic-context.helpers';

const web = 'http://localhost:3000';
const api = 'http://localhost:3001';
let organizationId: string;
let fixtureEmail: string;
const password = process.env.TEST_PERSONA_PASSWORD ?? 'Nexo Test Persona 2026!';
const artifacts = path.resolve('artifacts/owner-review-correction/screenshots');

async function login(context: BrowserContext) {
  const response = await context.request.post(`${api}/v1/auth/login`, {
    headers: { origin: web },
    data: {
      email: fixtureEmail,
      password,
      deviceFingerprint: `owner-correction-${Date.now()}`,
      deviceName: 'Owner correction QA',
    },
  });
  expect(response.ok()).toBe(true);
}

async function restartOnboarding(context: BrowserContext) {
  const current = (await (
    await context.request.get(`${api}/v1/organizations/${organizationId}/onboarding`)
  ).json()) as { version: number };
  const csrf = (await context.cookies()).find(({ name }) => name === 'nexo_csrf')?.value ?? '';
  const response = await context.request.post(
    `${api}/v1/organizations/${organizationId}/onboarding/restart`,
    { headers: { 'x-csrf-token': csrf }, data: { version: current.version } },
  );
  expect(response.ok()).toBe(true);
}

async function enterCanonicalShell(page: Page) {
  await page.goto(`${web}/?scene=static`);
  if (await page.locator('.guided-onboarding').isVisible()) {
    for (let step = 0; step < 10; step += 1) {
      await page.getByRole('button', { name: /Empezar|Continuar/ }).click();
    }
    await page.getByRole('button', { name: 'Entrar a NEXO' }).click();
  }
  await expect(page.locator('[data-nexo-app-shell="canonical"]')).toBeVisible();
}

async function capture(page: Page, name: string) {
  await page.screenshot({ path: path.join(artifacts, `${name}.png`), fullPage: true });
}

test.describe.serial('owner review correction', () => {
  test.describe.configure({ timeout: 180_000 });
  test.beforeAll(async () => {
    await mkdir(artifacts, { recursive: true });
    const fixture = createCleanBusiness();
    organizationId = fixture.organizationId;
    fixtureEmail = fixture.email;
  });

  for (const viewport of [
    { width: 1280, height: 720 },
    { width: 1366, height: 768 },
    { width: 1440, height: 900 },
  ]) {
    test(`Login fits ${viewport.width}x${viewport.height} without page scroll`, async ({
      browser,
    }) => {
      const context = await browser.newContext({ viewport });
      const page = await context.newPage();
      await page.goto(`${web}/login?scene=static`);
      await expect(page.getByRole('heading', { name: /Vende Mejor/ })).toBeVisible();
      await expect(page.getByText('Inventario actualizado')).toBeVisible();
      await expect(page.getByRole('button', { name: 'Entrar a NEXO' })).toBeVisible();
      expect(
        await page.evaluate(() => document.documentElement.scrollHeight <= innerHeight + 1),
      ).toBe(true);
      if (viewport.width === 1280) {
        const axe = await new AxeBuilder({ page }).analyze();
        expect(
          axe.violations.filter(({ impact }) => impact === 'critical' || impact === 'serious'),
        ).toEqual([]);
      }
      await capture(page, `login-${viewport.width}x${viewport.height}`);
      await context.close();
    });
  }

  for (const viewport of [
    { width: 1512, height: 982 },
    { width: 1920, height: 1080 },
    { width: 768, height: 1024 },
    { width: 390, height: 844 },
    { width: 568, height: 320 },
  ]) {
    test(`Login remains accessible at ${viewport.width}x${viewport.height}`, async ({
      browser,
    }) => {
      const context = await browser.newContext({ viewport });
      const page = await context.newPage();
      await page.goto(`${web}/login?scene=static`);
      await expect(page.getByRole('button', { name: 'Entrar a NEXO' })).toBeVisible();
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1),
      ).toBe(true);
      if (viewport.width >= 781) {
        expect(
          await page.evaluate(() => document.documentElement.scrollHeight <= innerHeight + 1),
        ).toBe(true);
      }
      await capture(page, `login-${viewport.width}x${viewport.height}`);
      await context.close();
    });
  }

  test('Onboarding keeps body fixed, scrolls its panel and exposes all 11 steps', async ({
    browser,
  }) => {
    const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
    await login(context);
    await restartOnboarding(context);
    const page = await context.newPage();
    await page.goto(`${web}/?scene=static`);
    for (let step = 0; step < 11; step += 1) {
      await expect(page.locator('.guided-onboarding')).toHaveAttribute('data-step', String(step));
      const scroll = page.locator('.onboarding-scroll-container');
      await expect(scroll).toHaveCSS('overflow-y', 'auto');
      await expect(page.locator('.onboarding-actions')).toBeVisible();
      const geometry = await page.evaluate(() => {
        const panel = document.querySelector<HTMLElement>('.onboarding-content');
        const map = document.querySelector<HTMLElement>('.journey-summary');
        return {
          bodyStable: document.documentElement.scrollHeight <= innerHeight + 1,
          panelBottom: panel?.getBoundingClientRect().bottom ?? Infinity,
          panelTop: panel?.getBoundingClientRect().top ?? -1,
          mapBottom: map?.getBoundingClientRect().bottom ?? 0,
          horizontal: document.documentElement.scrollWidth > document.documentElement.clientWidth,
        };
      });
      expect(geometry.bodyStable).toBe(true);
      expect(geometry.horizontal).toBe(false);
      expect(geometry.panelTop).toBeGreaterThanOrEqual(0);
      expect(geometry.panelBottom).toBeLessThanOrEqual(720);
      expect(geometry.mapBottom).toBeLessThanOrEqual(720);
      await scroll.evaluate((element) => element.scrollTo({ top: element.scrollHeight }));
      await expect(scroll.locator(':scope > *').last()).toBeInViewport();
      await capture(page, `onboarding-step-${String(step + 1).padStart(2, '0')}`);
      if ([0, 4, 7, 10].includes(step)) {
        const axe = await new AxeBuilder({ page }).analyze();
        expect(
          axe.violations.filter(({ impact }) => impact === 'critical' || impact === 'serious'),
        ).toEqual([]);
      }
      if (step === 0) {
        await page.getByRole('button', { name: /Empezar/ }).click();
        await page.getByLabel('Nombre comercial').fill('Negocio Owner Review');
      } else if (step === 1) {
        await page.getByRole('button', { name: /Continuar/ }).click();
        await page.getByRole('button', { name: /Cafetería/ }).click();
      } else if (step < 10) {
        await page.getByRole('button', { name: /Continuar/ }).click();
      }
    }
    await expect(page.getByRole('button', { name: 'Entrar a NEXO' })).toBeVisible();
    const completed = page.waitForResponse(
      (response) =>
        response.request().method() === 'POST' &&
        response.url().endsWith(`/v1/organizations/${organizationId}/onboarding/complete`),
    );
    await page.getByRole('button', { name: 'Entrar a NEXO' }).click();
    expect((await completed).ok()).toBe(true);
    await expect(page.locator('[data-nexo-app-shell="canonical"]')).toBeVisible({
      timeout: 15_000,
    });
    await context.close();
  });

  for (const viewport of [
    { width: 1024, height: 768 },
    { width: 768, height: 1024 },
    { width: 390, height: 844 },
    { width: 568, height: 320 },
  ]) {
    test(`Onboarding remains reachable at ${viewport.width}x${viewport.height}`, async ({
      browser,
    }) => {
      const context = await browser.newContext({ viewport });
      await login(context);
      await restartOnboarding(context);
      const page = await context.newPage();
      await page.goto(`${web}/?scene=static`);
      const scroll = page.locator('.onboarding-scroll-container');
      await expect(scroll).toHaveCSS('overflow-y', 'auto');
      await expect(page.getByRole('button', { name: 'Empezar' })).toBeVisible();
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1),
      ).toBe(true);
      await scroll.evaluate((element) => element.scrollTo({ top: element.scrollHeight }));
      await expect(scroll.locator(':scope > *').last()).toBeInViewport();
      await capture(page, `onboarding-${viewport.width}x${viewport.height}`);
      for (let step = 0; step < 10; step += 1) {
        await page.getByRole('button', { name: /Empezar|Continuar/ }).click();
        if (step === 0) {
          await page.getByLabel('Nombre comercial').fill('Negocio Owner Review');
        } else if (step === 1) {
          await page.getByRole('button', { name: /Cafetería/ }).click();
        }
      }
      await page.getByRole('button', { name: 'Entrar a NEXO' }).click();
      await expect(page.locator('[data-nexo-app-shell="canonical"]')).toBeVisible();
      await context.close();
    });
  }

  test('canonical menu chrome has identical geometry and computed treatment', async ({
    browser,
  }) => {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    await login(context);
    const page = await context.newPage();
    await enterCanonicalShell(page);
    let reference: unknown;
    for (const [name, route] of [
      ['home', '/'],
      ['products', '/products'],
      ['inventory', '/inventory'],
      ['reports', '/reports'],
      ['sales', '/sales'],
      ['cash', '/cash'],
      ['profile', '/settings/profile'],
      ['organizations', '/control-plane/organizations'],
    ] as const) {
      await page.goto(`${web}${route}?scene=static`);
      await expect(page.locator('[data-nexo-app-shell="canonical"]')).toBeVisible();
      const chrome = await page.evaluate(() => {
        const read = (selector: string) => {
          const element = document.querySelector<HTMLElement>(selector)!;
          const style = getComputedStyle(element);
          const box = element.getBoundingClientRect();
          return {
            width: box.width,
            height: box.height,
            background: style.background,
            border: style.border,
            padding: style.padding,
            boxShadow: style.boxShadow,
            opacity: style.opacity,
          };
        };
        return { sidebar: read('.product-sidebar'), topbar: read('.product-topbar') };
      });
      reference ??= chrome;
      expect(chrome).toEqual(reference);
      await capture(page, `menu-${name}`);
    }
    await context.close();
  });

  test('Home, Sales and Cash expose delayed editorial treatment and reduced motion removes delay', async ({
    browser,
  }) => {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    await login(context);
    const page = await context.newPage();
    await enterCanonicalShell(page);
    for (const [name, route, selector] of [
      ['home', '/', '.home-editorial-message'],
      ['sales', '/sales', '.nexo-editorial-header--sales'],
      ['cash', '/cash', '.nexo-editorial-header--cash'],
    ] as const) {
      await page.goto(`${web}${route}?scene=static`);
      await expect(page.locator(selector)).toBeVisible();
      const reveal = page
        .locator(`${selector} [data-editorial-reveal], ${selector}[data-editorial-reveal]`)
        .first();
      const delay = Number.parseFloat(
        await reveal.evaluate((element) => getComputedStyle(element).animationDelay),
      );
      expect(delay).toBeCloseTo(0.32, 2);
      if (name === 'home') {
        await expect(page.locator(selector)).toHaveCSS('text-align', 'center');
        await expect(page.locator(selector)).toHaveCSS('place-content', 'center');
      }
      const axe = await new AxeBuilder({ page }).analyze();
      expect(
        axe.violations.filter(({ impact }) => impact === 'critical' || impact === 'serious'),
      ).toEqual([]);
      await page.waitForTimeout(1800);
      await capture(page, `${name}-editorial`);
    }
    await context.close();

    const reduced = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      reducedMotion: 'reduce',
    });
    await login(reduced);
    const reducedPage = await reduced.newPage();
    await enterCanonicalShell(reducedPage);
    await reducedPage.goto(`${web}/?scene=static`);
    await expect(reducedPage.locator('.home-editorial-message')).toHaveCSS(
      'animation-name',
      'none',
    );
    await reduced.close();
  });
});
