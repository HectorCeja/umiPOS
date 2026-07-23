import { expect, test } from '@playwright/test';
import {
  browserAudit,
  evidence,
  expectClean,
  login,
  setOnboardingStep,
} from './owner-corrective.helpers';

test('team invitation email is a compact single-line field', async ({ page }) => {
  await login(page);
  await setOnboardingStep(page, 9);
  const audit = browserAudit(page);
  const email = page.locator('.onboarding-team-step input[type=email]');
  await expect(email).toBeVisible();
  const box = await email.boundingBox();
  expect(box?.height ?? 0).toBeLessThanOrEqual(56);
  await email.fill('persona.qa@nexo.local');
  await expect(email).toHaveValue('persona.qa@nexo.local');
  await evidence(page, 'onboarding-team-email-compact.png');
  expectClean(audit);
});
