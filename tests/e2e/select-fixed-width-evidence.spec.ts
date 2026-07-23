import { test } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { openInventoryWithLongValues } from './select-sizing.helpers';

const output = path.resolve('artifacts/select-fixed-width/screenshots');

for (const viewport of [
  { width: 1280, height: 720, name: 'desktop' },
  { width: 900, height: 768, name: 'tablet' },
  { width: 390, height: 844, name: 'mobile' },
]) {
  test(`evidencia select largo ${viewport.name}`, async ({ page }) => {
    await mkdir(output, { recursive: true });
    await page.setViewportSize(viewport);
    const { product } = await openInventoryWithLongValues(page);
    const closeHelp = page.locator('.contextual-help__panel').getByRole('button', {
      name: /Cerrar ayuda/,
    });
    if (await closeHelp.isVisible()) await closeHelp.click();
    await product.scrollIntoViewIfNeeded();
    await page.locator('.inventory-query').screenshot({
      path: path.join(output, `inventory-select-long-${viewport.name}.png`),
      animations: 'disabled',
    });
  });
}
