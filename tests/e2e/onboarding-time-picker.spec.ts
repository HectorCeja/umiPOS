import { expect, test } from '@playwright/test';
import {
  browserAudit,
  chooseNexoSelect,
  evidence,
  expectClean,
  loginIsolatedOnboarding,
  setOnboardingStep,
} from './owner-corrective.helpers';

test('schedule exposes mouse and keyboard hour/minute selectors', async ({ page }) => {
  await loginIsolatedOnboarding(page);
  const audit = browserAudit(page);
  await setOnboardingStep(page, 5);
  const edit = page.getByRole('button', { name: /Editar Lunes|Contraer Lunes/ });
  if ((await edit.getAttribute('aria-expanded')) !== 'true') await edit.click();
  const hour = page.getByRole('combobox', { name: 'Abre: hora' });
  const minute = page.getByRole('combobox', { name: 'Abre: minutos' });
  await chooseNexoSelect(page, 'Abre: hora', '08');
  await chooseNexoSelect(page, 'Abre: minutos', '30');
  await expect(hour).toHaveAttribute('data-value', '08');
  await expect(minute).toHaveAttribute('data-value', '30');
  await hour.focus();
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('End');
  await page.keyboard.press('Enter');
  await expect(hour).not.toHaveAttribute('data-value', '08');
  await evidence(page, 'onboarding-time-picker.png');
  expectClean(audit);
});
