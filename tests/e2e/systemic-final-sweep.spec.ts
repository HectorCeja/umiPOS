import { expect, test } from '@playwright/test';
import { readFile } from 'node:fs/promises';

test('upload, feedback persistente y Select resuelven desde componentes compartidos', async () => {
  const [experience, onboarding, selectCss, inventory] = await Promise.all([
    readFile('packages/ui/src/experience.tsx', 'utf8'),
    readFile('apps/web/src/app/product-experience.tsx', 'utf8'),
    readFile('apps/web/src/app/owner-master-pass-2b.css', 'utf8'),
    readFile('apps/web/src/app/inventory/page.tsx', 'utf8'),
  ]);
  expect(experience).toContain('PremiumToastPortal');
  expect(onboarding).not.toContain('className="onboarding-content" key={step}');
  expect(selectCss).toContain('padding-inline-start: var(--nexo-space-4');
  expect(inventory).toContain('scrollIntoView');
  expect(inventory).toContain('is-highlighted');
});
