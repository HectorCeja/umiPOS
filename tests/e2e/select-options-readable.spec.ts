import { expect, test } from '@playwright/test';
import { browserAudit, evidence, expectClean, login, web } from './owner-corrective.helpers';

test('currency, language, zone and role choices are readable and selectable', async ({ page }) => {
  await login(page);
  const audit = browserAudit(page);
  await page.goto(`${web}/control-plane/settings`);
  for (const label of ['Moneda', 'Idioma', 'Zona horaria']) {
    const select = page.getByRole('combobox', { name: label });
    await select.click();
    const option = page.getByRole('listbox').last().getByRole('option').first();
    await expect(option).toBeVisible();
    const colors = await option.evaluate((node) => {
      const style = getComputedStyle(node);
      return { color: style.color, background: style.backgroundColor };
    });
    expect(colors.color).not.toBe(colors.background);
    await option.click();
  }
  await page.getByRole('combobox', { name: 'Moneda' }).focus();
  await evidence(page, 'select-options-readable.png');
  await page.goto(`${web}/control-plane/invitations`);
  await expect(page.getByRole('radiogroup', { name: 'Rol sugerido' })).toBeVisible();
  expectClean(audit);
});
