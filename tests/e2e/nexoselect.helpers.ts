import { expect, type Page } from '@playwright/test';
import { browserAudit, expectClean, login, web } from './owner-corrective.helpers';

export async function openInventorySelect(page: Page, label = 'Producto o presentación') {
  await login(page);
  const audit = browserAudit(page);
  await page.goto(`${web}/inventory`);
  const trigger = page.getByRole('combobox', { name: label });
  await expect(trigger).toBeVisible();
  await trigger.click();
  const listbox = page.getByRole('listbox').last();
  await expect(listbox).toBeVisible();
  return { trigger, listbox, audit };
}

export function assertClean(audit: ReturnType<typeof browserAudit>) {
  expectClean(audit);
}
