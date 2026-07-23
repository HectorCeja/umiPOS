import { expect, test } from '@playwright/test';
import { readFileSync } from 'node:fs';

test('los recursos de larga vida tienen liberación explícita', () => {
  const experience = readFileSync('packages/ui/src/experience.tsx', 'utf8');
  const shell = readFileSync('apps/web/src/app/global-shell.tsx', 'utf8');
  const products = readFileSync('apps/web/src/app/products/page.tsx', 'utf8');
  const profile = readFileSync('apps/web/src/app/settings/profile/page.tsx', 'utf8');
  const navigation = readFileSync('apps/web/src/app/section-navigation.tsx', 'utf8');
  const worker = readFileSync('apps/worker/src/main.ts', 'utf8');
  expect(experience).toContain("removeEventListener('pointermove'");
  expect(experience).toContain("removeEventListener('visibilitychange'");
  expect(shell).toContain('window.clearInterval(timer)');
  expect(shell).toContain("removeEventListener('nexo:identity-updated'");
  expect(products).toContain('URL.revokeObjectURL(value)');
  expect(profile).toContain('URL.revokeObjectURL(url)');
  expect(navigation).toContain('observer.disconnect()');
  expect(worker).toContain('clearInterval(lifecycleHandle)');
});
