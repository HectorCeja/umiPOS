import { expect, test, type Page } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import {
  geometry,
  openCatalog,
  realProductImage,
  uploadThroughChooser,
} from './last-two-blockers.helpers';

const root = path.resolve('artifacts/owner-final-acceptance-master-last-two-blockers/screenshots');
test.use({ video: 'on' });

async function shot(page: Page, name: string) {
  await mkdir(root, { recursive: true });
  await page.screenshot({ path: path.join(root, name), animations: 'disabled' });
}

test('evidencia desktop del formulario estable antes, durante y después', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 720 });
  const { form } = await openCatalog(page);
  const before = await geometry(page);
  await shot(page, '01-upload-before-1280.png');
  const chooser = page.waitForEvent('filechooser');
  await page.getByText('Elegir archivo', { exact: true }).click();
  const pending = (await chooser).setFiles(realProductImage);
  await shot(page, '02-upload-during-1280.png');
  await pending;
  await expect(form.getByAltText('Vista previa')).toBeVisible();
  const after = await geometry(page);
  expect(Math.abs(after.panelScroll - before.panelScroll)).toBeLessThanOrEqual(2);
  await shot(page, '03-upload-after-same-viewport-1280.png');
});

test('evidencia móvil del formulario y preview sin salto', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const { form } = await openCatalog(page);
  await shot(page, '04-upload-before-390.png');
  await uploadThroughChooser(page);
  await expect(form.getByAltText('Vista previa')).toBeVisible();
  await shot(page, '05-upload-after-preview-390.png');
});

test('evidencia toast y guía coordinados con cierre compartido y auto dismiss', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 720 });
  await openCatalog(page);
  const help = page.locator('.contextual-help__panel');
  if (!(await help.isVisible())) await page.getByRole('button', { name: 'Ver guía' }).click();
  await page.getByRole('button', { name: 'Continuar' }).click();
  const toast = page.locator('body > .nexo-toast-region .nexo-premium-toast');
  await expect(toast).toBeVisible();
  await shot(page, '06-toast-help-no-collision.png');
  await shot(page, '07-shared-close-buttons.png');
  await expect(toast).toBeHidden({ timeout: 4600 });
  await shot(page, '08-toast-dismissed-after-official-duration.png');
});
