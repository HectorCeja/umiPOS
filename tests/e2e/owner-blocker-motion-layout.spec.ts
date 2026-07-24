import { expect, test, type Locator, type Page } from '@playwright/test';
import { execFileSync } from 'node:child_process';
import { mkdir } from 'node:fs/promises';
import {
  browserAudit,
  expectClean,
  login,
  setOnboardingStep,
  web,
} from './owner-corrective.helpers';

const evidence = 'artifacts/owner-blocker-motion-layout';

async function ready(page: Page, marker: string) {
  await expect(page.getByText('Validando tu sesión…')).toBeHidden({ timeout: 20_000 });
  await expect(page.getByText(marker, { exact: false }).first()).toBeVisible({ timeout: 20_000 });
}

async function box(locator: Locator) {
  const value = await locator.boundingBox();
  expect(value).not.toBeNull();
  return value!;
}

async function dismissHelp(page: Page) {
  const close = page.getByRole('button', { name: /^Cerrar ayuda/ });
  if (await close.isVisible().catch(() => false))
    await close.click({ force: true, timeout: 1_500 }).catch(() => undefined);
}

test.describe('owner blockers: NexoSelect motion and optical alignment', () => {
  test.describe.configure({ timeout: 180_000 });
  test.use({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });

  test.beforeAll(async () => {
    await mkdir(`${evidence}/after`, { recursive: true });
  });

  test('panel positioning never participates in its visual animation', async ({ page }) => {
    const audit = browserAudit(page);
    await login(page);
    await page.goto(`${web}/inventory`);
    await ready(page, 'Producto o presentación');
    await page.waitForTimeout(500);
    const trigger = page.getByRole('combobox', { name: 'Producto o presentación' });
    await trigger.scrollIntoViewIfNeeded();
    const triggerBox = await box(trigger);
    await trigger.evaluate((element) => (element as HTMLButtonElement).click());
    const positioner = page.locator('.nexo-select-positioner');
    const panel = page.locator('.nexo-select-content');
    await expect(panel).toBeVisible();

    const contract = await page.evaluate(() => {
      const positionerElement = document.querySelector<HTMLElement>('.nexo-select-positioner')!;
      const panelElement = document.querySelector<HTMLElement>('.nexo-select-content')!;
      const options = [...document.querySelectorAll<HTMLElement>('.nexo-select-option')];
      const panelStyle = getComputedStyle(panelElement);
      return {
        positionerAnimation: getComputedStyle(positionerElement).animationName,
        panelAnimation: panelStyle.animationName,
        panelKeyframes: [...document.styleSheets]
          .flatMap((sheet) => {
            try {
              return [...sheet.cssRules];
            } catch {
              return [];
            }
          })
          .filter(
            (rule) => rule instanceof CSSKeyframesRule && rule.name === panelStyle.animationName,
          )
          .map((rule) => rule.cssText)
          .join(' '),
        options: options.map((option) => ({
          animation: getComputedStyle(option).animationName,
          delay: getComputedStyle(option).animationDelay,
          transform: getComputedStyle(option).transform,
        })),
      };
    });
    expect(contract.positionerAnimation).toBe('none');
    expect(contract.panelAnimation).toBe('nexo-select-enter');
    expect(contract.panelKeyframes).not.toMatch(/translateX|translate3d|matrix3d/i);
    expect(contract.options).toEqual(
      contract.options.map(() => ({ animation: 'none', delay: '0s', transform: 'none' })),
    );

    await panel.evaluate(async (element) => {
      await Promise.all(element.getAnimations().map(async (animation) => animation.finished));
    });
    const triggerAfterOpen = await box(trigger);
    expect(Math.abs(triggerAfterOpen.x - triggerBox.x)).toBeLessThanOrEqual(0.5);
    expect(Math.abs(triggerAfterOpen.y - triggerBox.y)).toBeLessThanOrEqual(0.5);
    const panelBox = await box(panel);
    expect(Math.abs(panelBox.x - triggerBox.x)).toBeLessThanOrEqual(1);
    const side = await positioner.getAttribute('data-side');
    const connectedEdge =
      side === 'top'
        ? Math.abs(panelBox.y + panelBox.height - triggerAfterOpen.y)
        : Math.abs(panelBox.y - (triggerAfterOpen.y + triggerAfterOpen.height));
    expect(connectedEdge).toBeLessThanOrEqual(2);
    await page.screenshot({ path: `${evidence}/after/nexoselect-connected-retina.png` });
    expectClean(audit);
  });

  test('mandatory owner surfaces share control baselines and stable grids', async ({ page }) => {
    const audit = browserAudit(page);
    await login(page);
    for (const surface of [
      { route: '/control-plane/branches', marker: 'Nombre de la sucursal', name: 'branches' },
      { route: '/control-plane/invitations', marker: 'Correo electrónico', name: 'team' },
      { route: '/products', marker: 'Nombre del producto', name: 'products' },
      { route: '/inventory', marker: 'Producto o presentación', name: 'inventory' },
    ]) {
      await page.goto(`${web}${surface.route}`);
      await ready(page, surface.marker);
      await dismissHelp(page);
      await page.waitForTimeout(350);
      await page.screenshot({
        path: `${evidence}/after/${surface.name}-retina.png`,
        fullPage: true,
        animations: 'disabled',
      });
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth),
      ).toBeLessThanOrEqual(1);
    }

    await page.goto(`${web}/inventory`);
    await ready(page, 'Producto o presentación');
    const product = await box(page.getByRole('combobox', { name: 'Producto o presentación' }));
    const location = await box(page.getByRole('combobox', { name: 'Ubicación de inventario' }));
    const action = await box(page.getByRole('button', { name: 'Consultar existencias' }));
    expect(Math.abs(product.y - location.y)).toBeLessThanOrEqual(1);
    expect(Math.abs(product.y - action.y)).toBeLessThanOrEqual(1);
    expect(Math.abs(product.height - location.height)).toBeLessThanOrEqual(1);

    await page.goto(`${web}/control-plane/branches`);
    await ready(page, 'Nombre de la sucursal');
    const branchName = await box(page.getByRole('combobox', { name: 'Nombre de la sucursal' }));
    const branchCode = await box(page.getByRole('textbox', { name: 'Código' }));
    expect(Math.abs(branchName.y - branchCode.y)).toBeLessThanOrEqual(1);
    expect(Math.abs(branchName.height - branchCode.height)).toBeLessThanOrEqual(1);
    expectClean(audit);
  });

  test('onboarding product form keeps the same optical field contract', async ({ page }) => {
    const audit = browserAudit(page);
    execFileSync('node', ['scripts/owner-onboarding.mjs', 'alpha2'], { stdio: 'pipe' });
    await page.goto(`${web}/login`);
    await page.getByLabel('Correo electrónico').fill('alpha2.owner@nexo.local');
    await page.getByRole('button', { name: 'Entrar a NEXO' }).click();
    await expect(page.locator('.guided-onboarding')).toBeVisible({ timeout: 20_000 });
    await setOnboardingStep(page, 7);
    await dismissHelp(page);
    const builder = page.locator('.onboarding-product-builder');
    await expect(builder).toBeVisible();
    for (const field of [
      builder.getByLabel('Nombre'),
      builder.getByLabel('Categoría'),
      builder.getByLabel('Precio sugerido (MXN)'),
      builder.getByLabel('Descripción'),
    ])
      expect((await box(field)).width).toBeGreaterThan(120);
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth),
    ).toBeLessThanOrEqual(1);
    await page.screenshot({
      path: `${evidence}/after/onboarding-catalog-retina.png`,
      fullPage: true,
      animations: 'disabled',
    });
    expectClean(audit);
  });
});
