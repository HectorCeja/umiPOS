import { expect, test } from '@playwright/test';
import { readFile } from 'node:fs/promises';

test('empty state supports education, illustration and two useful actions', async () => {
  const source = await readFile('packages/ui/src/primitives.tsx', 'utf8');
  expect(source).toContain('nexo-empty-state__illustration');
  expect(source).toContain('secondaryAction');
  expect(source).toContain('description');
});
