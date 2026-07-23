import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import { mkdir } from 'node:fs/promises';

const web = 'http://localhost:3000';
const artifacts = 'artifacts/ui-part-2/owner-review/navigation';
const navigationLabels = ['Reportes', 'Equipo', 'Configuración', 'Ayuda'];

async function signIn(page: Page) {
  await page.goto(`${web}/login?scene=static`);
  if (
    await page
      .getByRole('button', { name: 'Entrar a NEXO' })
      .isVisible()
      .catch(() => false)
  ) {
    await page.getByRole('button', { name: 'Entrar a NEXO' }).click();
    await expect(page.getByRole('heading', { name: /Héctor/ })).toBeVisible();
  }
}

async function hasHorizontalOverflow(page: Page) {
  return page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
  );
}

async function openNavigation(page: Page) {
  const trigger = page.getByRole('button', { name: 'Abrir navegación' });
  await expect(trigger).toBeVisible();
  await trigger.focus();
  await page.keyboard.press('Enter');
  const navigation = page.locator('aside.product-sidebar');
  await expect(navigation).toBeVisible();
  await expect(trigger).toHaveAttribute('aria-expanded', 'true');
  return { navigation, trigger };
}

async function expectCompleteNavigation(page: Page) {
  const navigation = page.locator('aside.product-sidebar');
  for (const label of navigationLabels) {
    const link = navigation.getByRole('link', { name: label, exact: true });
    await link.scrollIntoViewIfNeeded();
    await expect(link).toBeVisible();
  }
  const logout = navigation.getByRole('button', { name: 'Cerrar sesión' });
  await logout.scrollIntoViewIfNeeded();
  await expect(logout).toBeVisible();
}

test.beforeAll(async () => {
  await mkdir(artifacts, { recursive: true });
});

test.describe.serial('responsive shared navigation', () => {
  test.beforeEach(async ({ page }) => {
    await signIn(page);
  });

  test('desktop 1280x720 keeps every authorized destination and footer accessible', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto(`${web}/control-plane/settings?scene=static`);
    const navigation = page.locator('aside.product-sidebar');
    await expect(navigation).toBeVisible();
    await expectCompleteNavigation(page);
    await expect(navigation.getByRole('link', { name: 'Configuración' })).toHaveAttribute(
      'aria-current',
      'page',
    );
    expect(await hasHorizontalOverflow(page)).toBe(false);
    await expect(page.getByRole('button', { name: 'Abrir navegación' })).toBeHidden();
    await page.screenshot({ path: `${artifacts}/desktop-1280x720.png`, fullPage: true });
  });

  for (const viewport of [
    { name: 'tablet-768x1024', width: 768, height: 1024 },
    { name: 'tablet-landscape-1024x768', width: 1024, height: 768 },
    { name: 'mobile-390x844', width: 390, height: 844 },
    { name: 'low-1024x600', width: 1024, height: 600 },
    { name: 'landscape-low-568x320', width: 568, height: 320 },
  ]) {
    test(`${viewport.name} exposes the complete drawer without clipping`, async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto(`${web}/control-plane/settings?scene=static`);
      const { navigation, trigger } = await openNavigation(page);
      await expectCompleteNavigation(page);
      expect(await hasHorizontalOverflow(page)).toBe(false);
      const axe = await new AxeBuilder({ page }).analyze();
      expect(
        axe.violations.filter((violation) =>
          ['critical', 'serious'].includes(violation.impact ?? ''),
        ),
      ).toEqual([]);
      await page.screenshot({
        path: `${artifacts}/${viewport.name}-drawer-open.png`,
        fullPage: true,
      });
      await page.keyboard.press('Escape');
      await expect(navigation).toBeHidden();
      await expect(trigger).toBeFocused();
      await page.screenshot({
        path: `${artifacts}/${viewport.name}-drawer-closed.png`,
        fullPage: true,
      });
    });
  }

  test('drawer traps focus and close button restores it', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`${web}/reports?scene=static`);
    const { navigation, trigger } = await openNavigation(page);
    await expect(navigation.getByRole('button', { name: 'Cerrar navegación' })).toBeFocused();
    await page.keyboard.press('Shift+Tab');
    await expect(navigation.getByRole('button', { name: 'Cerrar sesión' })).toBeFocused();
    await navigation.getByRole('button', { name: 'Cerrar navegación' }).click();
    await expect(trigger).toBeFocused();
  });

  test('reduced motion keeps drawer content immediate and complete', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(`${web}/reports?scene=static`);
    await openNavigation(page);
    await expectCompleteNavigation(page);
    const duration = await page
      .locator('.product-sidebar')
      .evaluate((element) => getComputedStyle(element).transitionDuration);
    expect(duration).toContain('0.001s');
    await page.screenshot({ path: `${artifacts}/mobile-reduced-motion.png`, fullPage: true });
  });

  test('Command Palette retains the shared authorized destinations', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`${web}/reports?scene=static`);
    await page.keyboard.press('Control+K');
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    for (const label of ['Reportes', 'Equipo', 'Configuración']) {
      await expect(dialog.getByText(label, { exact: true })).toHaveCount(1);
    }
    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
  });
});
