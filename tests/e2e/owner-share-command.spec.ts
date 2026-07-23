import { expect, test } from '@playwright/test';
import { readFileSync } from 'node:fs';

test('owner:share detecta IP, conserva allowlist y muestra URLs', () => {
  const script = readFileSync('scripts/owner-share.sh', 'utf8');
  expect(script).toContain('NEXO READY — RED LOCAL');
  expect(script).toContain('NEXO_AUTH_ALLOWED_ORIGINS');
  expect(script).not.toContain('AUTH_ALLOWED_ORIGINS="*"');
  expect(script).toContain('Mailpit');
  expect(script).toContain('MinIO');
});
