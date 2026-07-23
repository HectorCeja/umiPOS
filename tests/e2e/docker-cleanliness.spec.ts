import { expect, test } from '@playwright/test';
import { readFileSync } from 'node:fs';

test('la limpieza Docker es conservadora y nunca toca volúmenes', () => {
  const script = readFileSync('scripts/owner-storage.mjs', 'utf8');
  expect(script).not.toContain("['system', 'prune'");
  expect(script).not.toContain("['volume', 'prune'");
  expect(script).not.toContain("['volume', 'rm'");
  expect(script).toContain("['builder', 'prune'");
  expect(script).toContain("['image', 'prune'");
  expect(script).toContain('until=168h');
});
