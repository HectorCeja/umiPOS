import { expect, test, type BrowserContext, type Page } from '@playwright/test';
import { copyFile, mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { createCleanBusiness } from './dynamic-context.helpers';
import { setOnboardingStep } from './owner-corrective.helpers';

const web = 'http://localhost:3000';
const api = 'http://localhost:3001';
const password = process.env.TEST_PERSONA_PASSWORD ?? 'Nexo Test Persona 2026!';
const root = path.resolve('artifacts/owner-review-correction');
const artifactMode = process.env.NEXO_E2E_ARTIFACT_MODE === 'evidence';

async function login(context: BrowserContext, email = 'alpha.owner@nexo.local') {
  const response = await context.request.post(`${api}/v1/auth/login`, {
    headers: { origin: web },
    data: {
      email,
      password,
      deviceFingerprint: `owner-evidence-${Date.now()}`,
      deviceName: 'Owner correction evidence',
    },
  });
  expect(response.ok()).toBe(true);
}

async function saveVideo(page: Page, context: BrowserContext, name: string) {
  const video = page.video();
  await context.close();
  if (video) await copyFile(await video.path(), path.join(root, 'videos', `${name}.webm`));
}

test.describe.serial('owner correction evidence', () => {
  test.describe.configure({ timeout: 600_000 });
  test.beforeAll(async () => {
    await mkdir(path.join(root, 'videos', '.raw'), { recursive: true });
  });

  test('records ten owner-review journeys', async ({ browser }) => {
    if (!artifactMode) {
      const ownerContext = await browser.newContext({ viewport: { width: 1280, height: 720 } });
      await login(ownerContext);
      const ownerPage = await ownerContext.newPage();
      await ownerPage.goto(web);
      await expect(ownerPage.locator('[data-nexo-app-shell="canonical"]')).toBeVisible();
      for (const label of ['Productos', 'Inventario', 'Reportes', 'Ventas', 'Caja']) {
        await ownerPage.getByRole('link', { name: label, exact: true }).click();
        await expect(ownerPage.getByRole('heading', { level: 1 }).first()).toBeVisible();
      }
      await ownerContext.close();

      const business = createCleanBusiness();
      const onboardingContext = await browser.newContext({
        viewport: { width: 390, height: 844 },
      });
      await login(onboardingContext, business.email);
      const onboardingPage = await onboardingContext.newPage();
      await onboardingPage.goto(web);
      await expect(onboardingPage.locator('.guided-onboarding')).toBeVisible();
      await onboardingPage.getByRole('button', { name: 'Empezar' }).click();
      await expect(onboardingPage.locator('.guided-onboarding')).toHaveAttribute('data-step', '1');
      await onboardingContext.close();
      return;
    }

    const record = async (
      name: string,
      viewport: { width: number; height: number },
      action: (page: Page, context: BrowserContext) => Promise<void>,
      reducedMotion: 'reduce' | 'no-preference' = 'no-preference',
    ) => {
      const context = await browser.newContext({
        viewport,
        reducedMotion,
        ...(artifactMode
          ? { recordVideo: { dir: path.join(root, 'videos', '.raw'), size: viewport } }
          : {}),
      });
      const page = await context.newPage();
      await action(page, context);
      await saveVideo(page, context, name);
    };

    await record('01-login-no-page-scroll', { width: 1280, height: 720 }, async (page) => {
      await page.goto(`${web}/login`);
      await page.waitForTimeout(2500);
      expect(
        await page.evaluate(() => document.documentElement.scrollHeight <= innerHeight + 1),
      ).toBe(true);
    });

    await record(
      '02-home-editorial-reveal',
      { width: 1440, height: 900 },
      async (page, context) => {
        await login(context);
        await page.goto(web);
        await expect(page.locator('[data-nexo-app-shell="canonical"]')).toBeVisible();
        await page.waitForTimeout(2200);
      },
    );

    await record(
      '03-home-products-inventory-reports',
      { width: 1280, height: 720 },
      async (page, context) => {
        await login(context);
        await page.goto(web);
        for (const label of ['Productos', 'Inventario', 'Reportes']) {
          await page.getByRole('link', { name: label, exact: true }).click();
          await page.waitForTimeout(900);
        }
      },
    );

    await record(
      '04-home-sales-cash-editorial',
      { width: 1280, height: 720 },
      async (page, context) => {
        await login(context);
        await page.goto(web);
        for (const label of ['Ventas', 'Caja']) {
          await page.getByRole('link', { name: label, exact: true }).click();
          await page.waitForTimeout(1900);
        }
      },
    );

    for (const [name, targetStep] of [
      ['05-onboarding-welcome', 0],
      ['06-onboarding-internal-scroll', 5],
      ['07-onboarding-schedule', 7],
      ['08-onboarding-review', 10],
    ] as const) {
      await record(name, { width: 1280, height: 720 }, async (page, context) => {
        const business = createCleanBusiness();
        await login(context, business.email);
        await page.goto(web);
        await setOnboardingStep(page, targetStep);
        await page.goto(web);
        const scroll = page.locator('.onboarding-scroll-container');
        await scroll.evaluate((element) =>
          element.scrollTo({ top: element.scrollHeight, behavior: 'smooth' }),
        );
        await page.waitForTimeout(1600);
        if (targetStep === 10) {
          await page.getByRole('button', { name: 'Entrar a NEXO' }).click();
          await expect(page.locator('[data-nexo-app-shell="canonical"]')).toBeVisible();
        } else {
          for (let step = targetStep; step < 10; step += 1) {
            await page.getByRole('button', { name: /Empezar|Continuar/ }).click();
          }
          await page.getByRole('button', { name: 'Entrar a NEXO' }).click();
        }
      });
    }

    await record(
      '09-reduced-motion',
      { width: 1280, height: 720 },
      async (page, context) => {
        await login(context);
        await page.goto(web);
        await expect(page.locator('.home-editorial-message')).toHaveCSS('animation-name', 'none');
        await page.waitForTimeout(1200);
      },
      'reduce',
    );

    await record('10-mobile-onboarding', { width: 390, height: 844 }, async (page, context) => {
      const business = createCleanBusiness();
      await login(context, business.email);
      await page.goto(web);
      await page.getByRole('button', { name: 'Empezar' }).click();
      await page
        .locator('.onboarding-scroll-container')
        .evaluate((element) => element.scrollTo({ top: element.scrollHeight, behavior: 'smooth' }));
      await page.waitForTimeout(1600);
      for (let step = 1; step < 10; step += 1) {
        await page.getByRole('button', { name: 'Continuar' }).click();
      }
      await page.getByRole('button', { name: 'Entrar a NEXO' }).click();
      await expect(page.locator('[data-nexo-app-shell="canonical"]')).toBeVisible();
    });
  });

  test('records measured route timings', async ({ browser }) => {
    const anonymous = await browser.newContext({ viewport: { width: 1280, height: 720 } });
    const loginPage = await anonymous.newPage();
    const loginSamples: number[] = [];
    for (let sample = 0; sample < 3; sample += 1) {
      const started = performance.now();
      await loginPage.goto(`${web}/login?scene=static`);
      await expect(loginPage.getByRole('button', { name: 'Entrar a NEXO' })).toBeVisible();
      loginSamples.push(performance.now() - started);
    }
    await anonymous.close();
    const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
    await login(context);
    const page = await context.newPage();
    const samples: Record<string, number[]> = {
      loginReady: loginSamples,
      homeReady: [],
      homeSales: [],
      salesCash: [],
      onboardingTransition: [],
    };
    for (let sample = 0; sample < 3; sample += 1) {
      let started = performance.now();
      await page.goto(`${web}/?scene=static`);
      await expect(page.locator('[data-nexo-app-shell="canonical"]')).toBeVisible();
      samples.homeReady.push(performance.now() - started);
      started = performance.now();
      await page.getByRole('link', { name: 'Ventas', exact: true }).click();
      await expect(page.locator('.nexo-editorial-header--sales')).toBeVisible();
      samples.homeSales.push(performance.now() - started);
      started = performance.now();
      await page.getByRole('link', { name: 'Caja', exact: true }).click();
      await expect(page.locator('.nexo-editorial-header--cash')).toBeVisible();
      samples.salesCash.push(performance.now() - started);
    }
    const onboardingBusiness = createCleanBusiness();
    const onboardingContext = await browser.newContext({ viewport: { width: 1280, height: 720 } });
    await login(onboardingContext, onboardingBusiness.email);
    const onboardingPage = await onboardingContext.newPage();
    await onboardingPage.goto(`${web}/?scene=static`);
    let started = performance.now();
    await onboardingPage.getByRole('button', { name: 'Empezar' }).click();
    await expect(onboardingPage.locator('.guided-onboarding')).toHaveAttribute('data-step', '1');
    samples.onboardingTransition.push(performance.now() - started);
    await onboardingContext.close();
    const summary = Object.fromEntries(
      Object.entries(samples).map(([key, values]) => [
        key,
        {
          samplesMs: values.map((value) => Math.round(value * 100) / 100),
          p50Ms: values.toSorted((a, b) => a - b)[Math.floor(values.length * 0.5)],
          p95Ms: values.toSorted((a, b) => a - b)[Math.ceil(values.length * 0.95) - 1],
        },
      ]),
    );
    await writeFile(path.join(root, 'performance.json'), `${JSON.stringify(summary, null, 2)}\n`);
    await context.close();
  });
});
