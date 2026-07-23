import { expect, test } from '@playwright/test';
import { readFile } from 'node:fs/promises';
test('barrido sistémico protege patrones P0', async () => {
  const [help, feedback, icon] = await Promise.all([
    readFile('apps/web/src/app/contextual-help.tsx', 'utf8'),
    readFile('packages/ui/src/experience.tsx', 'utf8'),
    readFile('packages/ui/src/primitives.tsx', 'utf8'),
  ]);
  expect(help).not.toContain('Contactar a soporte');
  expect(feedback).not.toContain('node.scrollIntoView');
  expect(icon).toContain('nexo-icon-button');
});
