import { expect, test } from '@playwright/test';
import { readFile } from 'node:fs/promises';
test('Servicio resuelve briefcase en selector y mapping', async () => {
  const source = await readFile('apps/web/src/app/products/page.tsx', 'utf8');
  expect(source).toContain('title="Servicio"');
  expect(source.match(/briefcase/gu)?.length).toBeGreaterThanOrEqual(2);
  expect(source).not.toContain(
    'selected={kind === \'SERVICE\'}\n                icon={<NexoIcon name="image"',
  );
});
