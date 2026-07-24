import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import { login, web } from './owner-corrective.helpers';

const artifacts = 'artifacts/ui-part-2';

test.beforeAll(async () => {
  await mkdir(artifacts, { recursive: true });
});

async function signIn(page: Page) {
  await login(page);
}

async function certify(page: Page, route: string, heading: RegExp, name: string) {
  await page.goto(`${web}${route}?scene=static`);
  await expect(page.getByRole('heading', { name: heading }).first()).toBeVisible();
  await expect(page.locator('.module-living-scene')).toHaveAttribute('data-deterministic', 'true');
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
  );
  expect(overflow).toBe(false);
  const axe = await new AxeBuilder({ page }).analyze();
  expect(
    axe.violations.filter((item) => ['critical', 'serious'].includes(item.impact ?? '')),
  ).toEqual([]);
  await page.screenshot({ path: `${artifacts}/${name}.png`, fullPage: true });
}

test.describe.serial('UI Parte 2', () => {
  test.beforeEach(async ({ page }) => {
    await signIn(page);
  });

  test('módulos de datos comparten shell, scene y accesibilidad', async ({ page }) => {
    await certify(page, '/inventory', /Inventario/, 'inventory-desktop');
    await certify(page, '/products', /Productos/, 'products-desktop');
    await certify(page, '/reports', /Reportes/, 'reports-desktop');
    await certify(page, '/sales', /Ventas/, 'sales-desktop');
    await certify(page, '/cash', /Caja/, 'cash-desktop');
  });

  test('equipo, configuración y perfil conservan identidad', async ({ page }) => {
    await certify(page, '/control-plane/invitations', /Personas y acceso/, 'team-desktop');
    await certify(page, '/control-plane/settings', /Datos del negocio/, 'settings-desktop');
    await certify(page, '/settings/profile', /Perfil y preferencias/, 'profile-desktop');
  });

  test('Command Palette es global, navegable y restaura contexto', async ({ page }) => {
    await page.goto(`${web}/reports?scene=static`);
    await page.keyboard.press('Control+K');
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await expect(dialog.getByText('Reportes')).toBeVisible();
    await page.screenshot({ path: `${artifacts}/command-palette.png` });
    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
  });

  test('móvil y reduced motion no desbordan ni dependen de animación', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await certify(page, '/inventory', /Inventario/, 'inventory-mobile-reduced');
    await certify(page, '/reports', /Reportes/, 'reports-mobile-reduced');
  });
});
