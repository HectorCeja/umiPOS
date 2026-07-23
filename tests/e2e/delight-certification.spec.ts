import { expect, test } from '@playwright/test';
import { readFile } from 'node:fs/promises';

test('success moments combine confirmation, consequence and gentle delight', async () => {
  const [experience, styles] = await Promise.all([
    readFile('apps/web/src/app/contextual-help.tsx', 'utf8'),
    readFile('apps/web/src/app/styles.css', 'utf8'),
  ]);
  expect(experience).toContain('aria-live="polite"');
  expect(experience).toContain('AHORA PUEDES');
  expect(experience).toContain('El cambio ya quedó confirmado');
  expect(styles).toContain('.success-education__mark');
  expect(styles).toContain('.success-education::after');
});
