import { expect, test } from '@playwright/test';
import { login, web } from './owner-corrective.helpers';

test('help is keyboard reachable and announced', async ({ page }) => {
  await login(page);
  await page.goto(`${web}/sales`);
  const trigger = page.getByRole('button', { name: /Ver guía/ });
  await trigger.focus();
  await page.keyboard.press('Enter');
  const panel = page.locator('.contextual-help__panel');
  await expect(panel).toHaveAttribute('role', 'status');
  await panel.getByRole('button', { name: /Cerrar ayuda/ }).focus();
  await page.keyboard.press('Enter');
  await expect(panel).toHaveCount(0);
});
