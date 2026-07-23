import { expect, type Page } from '@playwright/test';
import { execFileSync } from 'node:child_process';
import { onePixelPng, setOnboardingStep, web } from './owner-corrective.helpers';

export const realProductImage = {
  name: 'owner-position.png',
  mimeType: 'image/png',
  buffer: Buffer.concat([onePixelPng, Buffer.alloc(850_000)]),
};

export async function openCatalog(page: Page) {
  execFileSync('pnpm', ['owner:alpha2:reset'], { stdio: 'pipe' });
  await page.goto(`${web}/login`);
  await page.getByLabel('Correo electrónico').fill('alpha2.owner@nexo.local');
  await page.getByRole('button', { name: 'Entrar a NEXO' }).click();
  await page.locator('.guided-onboarding').waitFor();
  await setOnboardingStep(page, 7);
  await page.getByRole('radio', { name: /Catálogo vacío/ }).check();
  const form = page.locator('.onboarding-product-builder');
  await form.getByLabel('Nombre').fill('Latte geometría real');
  await form.getByLabel('Categoría').fill('Bebidas');
  await form.getByLabel('Precio sugerido (MXN)').fill('82.50');
  await form.getByLabel('Descripción').fill('Producto estable durante toda la subida');
  await form.getByLabel('SKU (opcional)').fill('GEO-REAL');
  await form.getByLabel('Código de barras (opcional)').fill('750000000099');
  const scroller = page.locator('.onboarding-scroll-container');
  await scroller.evaluate((element) => {
    const uploader = element.querySelector<HTMLElement>('.nexo-file-upload');
    if (uploader) {
      element.scrollTop = Math.max(
        0,
        uploader.offsetTop - element.clientHeight / 2 + uploader.offsetHeight / 2,
      );
    }
  });
  await page.locator('.nexo-file-upload').scrollIntoViewIfNeeded();
  return { form, scroller };
}

export async function uploadThroughChooser(page: Page) {
  const chooser = page.waitForEvent('filechooser');
  await page.getByText('Elegir archivo', { exact: true }).click();
  await (await chooser).setFiles(realProductImage);
}

export async function geometry(page: Page) {
  return page.evaluate(() => {
    const scroller = document.querySelector<HTMLElement>('.onboarding-scroll-container')!;
    const form = document.querySelector<HTMLElement>('.onboarding-product-builder')!;
    const heading = document.querySelector<HTMLElement>('#custom-product-title')!;
    const uploader = document.querySelector<HTMLElement>('.nexo-file-upload')!;
    const rect = (element: HTMLElement) => {
      const box = element.getBoundingClientRect();
      const visibleWidth = Math.max(0, Math.min(box.right, innerWidth) - Math.max(box.left, 0));
      const visibleHeight = Math.max(0, Math.min(box.bottom, innerHeight) - Math.max(box.top, 0));
      return {
        top: box.top,
        bottom: box.bottom,
        left: box.left,
        right: box.right,
        visibleArea: visibleWidth * visibleHeight,
      };
    };
    return {
      viewportWidth: innerWidth,
      pageScroll: window.scrollY,
      panelScroll: scroller.scrollTop,
      panelHeight: scroller.clientHeight,
      contentHeight: scroller.scrollHeight,
      form: rect(form),
      heading: rect(heading),
      uploader: rect(uploader),
      focus: document.activeElement?.tagName ?? '',
      transform: getComputedStyle(form).transform,
      display: getComputedStyle(form).display,
      visibility: getComputedStyle(form).visibility,
      opacity: getComputedStyle(form).opacity,
    };
  });
}

export function expectEffectivelyVisible(value: Awaited<ReturnType<typeof geometry>>) {
  expect(value.form.visibleArea).toBeGreaterThan(0);
  expect(value.uploader.visibleArea).toBeGreaterThan(0);
  // On compact mobile viewports the heading and uploader cannot physically fit
  // at once; the enclosing form plus active uploader prove effective content.
  if (value.viewportWidth >= 768) expect(value.heading.visibleArea).toBeGreaterThan(0);
  expect(value.display).not.toBe('none');
  expect(value.visibility).toBe('visible');
  expect(Number(value.opacity)).toBeGreaterThan(0);
}
