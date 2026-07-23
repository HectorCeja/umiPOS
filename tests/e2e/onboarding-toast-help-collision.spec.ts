import { expect, test } from '@playwright/test';
import { openCatalog } from './last-two-blockers.helpers';

test('toast onboarding ocupa zona superior y no intersecta ayuda abierta', async ({ page }) => {
  await openCatalog(page);
  const help = page.locator('.contextual-help__panel');
  if (!(await help.isVisible())) await page.getByRole('button', { name: 'Ver guía' }).click();
  await page.evaluate(() => window.dispatchEvent(new CustomEvent('nexo-test-toast')));
  await page.getByRole('button', { name: 'Continuar' }).click();
  const toast = page.locator('body > .nexo-toast-region .nexo-premium-toast');
  await expect(toast).toBeVisible();
  const [toastBox, helpBox] = await Promise.all([toast.boundingBox(), help.boundingBox()]);
  expect(toastBox).not.toBeNull();
  expect(helpBox).not.toBeNull();
  const intersects = !(
    toastBox!.x + toastBox!.width <= helpBox!.x ||
    helpBox!.x + helpBox!.width <= toastBox!.x ||
    toastBox!.y + toastBox!.height <= helpBox!.y ||
    helpBox!.y + helpBox!.height <= toastBox!.y
  );
  expect(intersects).toBe(false);
  expect(toastBox!.y).toBeGreaterThanOrEqual(0);
});
