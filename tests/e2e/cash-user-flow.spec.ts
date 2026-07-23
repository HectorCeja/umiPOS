import { expect, test } from '@playwright/test';
import { browserAudit, evidence, expectClean, login, web } from './owner-corrective.helpers';

test('cash has an explicit selected register, drawer and contextual next action', async ({
  page,
}) => {
  await login(page);
  const audit = browserAudit(page);
  await page.goto(`${web}/cash`);
  await expect(page.getByText('Cómo funciona Caja')).toBeVisible();
  const registers = page.getByRole('radio', { name: /Punto de cobro/ });
  await expect(registers.first()).toBeVisible();
  await registers.first().click();
  await expect(registers.first()).toHaveAttribute('aria-checked', 'true');
  await page.getByText('Configurar puntos de cobro').click();
  await expect(page.getByRole('button', { name: 'Crear cajón de efectivo' })).toBeEnabled();
  await evidence(page, 'cash-selected-register.png');
  expectClean(audit);
});
