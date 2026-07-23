import { expect, test } from '@playwright/test';
import {
  browserAudit,
  chooseNexoSelect,
  evidence,
  expectClean,
  login,
  setOnboardingStep,
} from './owner-corrective.helpers';

test('schedule exposes mouse and keyboard hour/minute selectors', async ({ page }) => {
  await login(page);
  const audit = browserAudit(page);
  await setOnboardingStep(page, 5);
  const edit = page.getByRole('button', { name: /Editar Lunes|Contraer Lunes/ });
  if ((await edit.getAttribute('aria-expanded')) !== 'true') await edit.click();
  const hour = page.getByLabel('Abre: hora').first();
  const minute = page.getByLabel('Abre: minutos').first();
  await chooseNexoSelect(page, /hora/i, '08');
  await chooseNexoSelect(page, /minutos/i, '30');
  await expect(hour).toHaveValue('08');
  await minute.focus();
  await page.keyboard.press('ArrowDown');
  await evidence(page, 'onboarding-time-picker.png');
  expectClean(audit);
});
