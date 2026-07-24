import { expect, test } from '@playwright/test';
import {
  browserAudit,
  completeOnboarding,
  expectClean,
  login,
  web,
} from './owner-corrective.helpers';

test('formularios críticos tienen ayudas, defaults y controles utilizables', async ({ page }) => {
  await login(page);
  await completeOnboarding(page);
  const audit = browserAudit(page);
  await page.goto(`${web}/cash`);
  await expect(page.getByRole('textbox', { name: 'Monto', exact: true })).toHaveValue('100.00');
  await expect(page.getByRole('combobox', { name: 'Motivo' })).toHaveAttribute(
    'data-value',
    'Fondo adicional para cambio',
  );
  await expect(page.getByRole('textbox', { name: 'Monto', exact: true })).toHaveAttribute(
    'inputmode',
    'decimal',
  );
  await page.waitForLoadState('networkidle');
  await page.goto(`${web}/products`);
  await page.waitForLoadState('networkidle');
  await expect(page.getByLabel('Nombre del producto')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Agregar al catálogo' })).toBeVisible();
  expectClean(audit);
});
