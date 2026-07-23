import { expect, test } from '@playwright/test';
import { browserAudit, evidence, expectClean, login, web } from './owner-corrective.helpers';

test('team invitation is sent, listed, resent and revoked', async ({ page }) => {
  await login(page);
  const audit = browserAudit(page);
  await page.goto(`${web}/control-plane/invitations`);
  const email = `owner-corrective-${Date.now()}@nexo.local`;
  await page.getByLabel('Correo electrónico').fill(email);
  await page.getByRole('button', { name: /Cajero/ }).click();
  await page.getByRole('button', { name: 'Enviar invitación' }).click();
  await expect(page.getByText(`Invitación enviada a ${email}.`)).toBeVisible();
  const row = page.locator('.invitation-list article').filter({ hasText: email });
  await expect(row).toContainText('Pendiente');
  await evidence(page, 'team-pending-invitation.png');
  await expect
    .poll(async () => {
      const response = await fetch(
        `http://127.0.0.1:8025/api/v1/search?query=to:${encodeURIComponent(email)}`,
      );
      const result = (await response.json()) as { messages?: unknown[] };
      return result.messages?.length ?? 0;
    })
    .toBeGreaterThan(0);
  const mailpit = await page.context().newPage();
  await mailpit.goto(`http://127.0.0.1:8025/search?query=${encodeURIComponent(`to:${email}`)}`);
  await evidence(mailpit, 'mailpit-invitation-delivered.png');
  await mailpit.close();
  await row.getByRole('button', { name: 'Reenviar' }).click();
  await expect(page.getByText(`Invitación reenviada a ${email}.`)).toBeVisible();
  await row.getByRole('button', { name: 'Revocar' }).click();
  await expect(row).toContainText('Revocada');
  await page.waitForLoadState('networkidle');
  expectClean(audit);
});
