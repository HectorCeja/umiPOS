import { expect, test } from '@playwright/test';
import { readFile } from 'node:fs/promises';

test('uploader, overlays y cierre se resuelven en componentes compartidos', async () => {
  const [experience, primitives, help, products] = await Promise.all([
    readFile('packages/ui/src/experience.tsx', 'utf8'),
    readFile('packages/ui/src/primitives.tsx', 'utf8'),
    readFile('apps/web/src/app/contextual-help.tsx', 'utf8'),
    readFile('apps/web/src/app/products/page.tsx', 'utf8'),
  ]);
  expect(experience).toContain('scrollSnapshot');
  expect(experience).toContain('event.preventDefault()');
  expect(experience).toContain('input.current?.click()');
  expect(experience).toContain('window.setTimeout(restoreScroll, 120)');
  expect(primitives).toContain('nexo-overlay-close');
  expect(help).toContain('nexo-overlay-close');
  expect(products).not.toContain('<SuccessEducation');
  expect(products).not.toContain('<NextStepRecommendation');
});
