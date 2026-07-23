import { expect, test } from '@playwright/test';
import { readFile } from 'node:fs/promises';
test('NexoSelect elimina el indicador nativo y usa SVG autoritativo', async () => {
  const source = await readFile('packages/ui/src/nexo-select.tsx', 'utf8');
  expect(source).toContain('<NexoIcon name="chevron-down"');
  expect(source).not.toContain('<select');
});
