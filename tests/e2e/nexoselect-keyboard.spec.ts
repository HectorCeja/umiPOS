import { expect, test } from '@playwright/test';
import { login, web } from './owner-corrective.helpers';

test('Enter, flechas y Escape respetan navegación de combobox', async ({ page }) => {
  await login(page);
  await page.goto(`${web}/inventory`);
  const trigger = page.getByRole('combobox', { name: 'Producto o presentación' });
  await trigger.focus();
  await page.keyboard.press('Enter');
  await expect(trigger).toHaveAttribute('aria-expanded', 'true');
  await expect(page.getByRole('option').first()).toBeVisible();
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Enter');
  await expect(trigger).toHaveAttribute('aria-expanded', 'false');
  await expect(trigger).not.toHaveAttribute('data-value', '');
});
