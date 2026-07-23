import { expect, test } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import { login, web } from './owner-corrective.helpers';

const evidence = 'artifacts/nexoselect/screenshots';

test.use({ video: 'on' });

test('evidencia visual desktop, búsqueda, selección y mobile', async ({ page }) => {
  await mkdir(evidence, { recursive: true });
  await login(page);
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(`${web}/inventory`);
  const contextualHelp = page.locator('.contextual-help__panel');
  if (await contextualHelp.isVisible()) {
    await contextualHelp.getByRole('button', { name: /Cerrar/i }).click();
  }

  const trigger = page.getByRole('combobox', { name: 'Producto o presentación' });
  await expect(trigger).toBeVisible();
  await page.screenshot({ path: `${evidence}/inventory-trigger-desktop.png`, fullPage: true });

  await trigger.click();
  const listbox = page.getByRole('listbox').last();
  await expect(listbox.getByRole('option').first()).toBeVisible();
  await page.waitForTimeout(180);
  await page.screenshot({ path: `${evidence}/inventory-rich-dropdown-desktop.png` });

  const firstOption = listbox.getByRole('option').first();
  const firstLabel = (await firstOption.innerText()).split('\n')[0] ?? '';
  const search = page.getByRole('searchbox', { name: /Buscar en Producto/ });
  await search.fill(firstLabel.slice(0, Math.min(5, firstLabel.length)));
  await expect(listbox.getByRole('option').first()).toBeVisible();
  await page.screenshot({ path: `${evidence}/inventory-search.png` });
  await listbox.getByRole('option').first().click();
  await expect(trigger).not.toHaveAttribute('data-value', '');
  await page.screenshot({ path: `${evidence}/inventory-selected.png` });

  await trigger.click();
  await search.fill('resultado-inexistente-nexo-92814');
  await expect(page.getByText('No encontramos productos con ese nombre.')).toBeVisible();
  await page.screenshot({ path: `${evidence}/inventory-empty-state.png` });
  await page.keyboard.press('Escape');

  await page.setViewportSize({ width: 390, height: 844 });
  await trigger.scrollIntoViewIfNeeded();
  await trigger.click();
  await expect(page.getByRole('listbox').last()).toBeVisible();
  await page.screenshot({ path: `${evidence}/inventory-dropdown-mobile-390.png` });
});
