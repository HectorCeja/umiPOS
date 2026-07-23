import { expect, test } from '@playwright/test';
import { readFileSync } from 'node:fs';

test('las observaciones repetidas exigen investigación sistémica y confirmación del owner', () => {
  const policy = readFileSync('docs/OWNER_REGRESSION_POLICY.md', 'utf8');
  for (const requirement of [
    'causa sistémica',
    'reproducción exacta',
    'prueba de regresión',
    'evidencia visual',
    'confirmación del owner',
  ])
    expect(policy).toContain(requirement);
});
