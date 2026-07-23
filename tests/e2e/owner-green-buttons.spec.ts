import { expect, test } from '@playwright/test';
import { readFileSync } from 'node:fs';

test('ninguna variante de botón usa el color de éxito como acción', () => {
  const webStyles = readFileSync('apps/web/src/app/styles.css', 'utf8');
  const uiStyles = readFileSync('packages/ui/src/styles.css', 'utf8');
  expect(webStyles).not.toMatch(/\.nexo-button--primary[\s\S]{0,240}#(?:78e3b4|48c991|46c992)/i);
  expect(webStyles).not.toMatch(/button\s*\{[\s\S]{0,180}background:\s*#12664f/i);
  expect(uiStyles).toMatch(
    /\.nexo-button--success[\s\S]{0,180}background:\s*var\(--nexo-primary\)/,
  );
});
