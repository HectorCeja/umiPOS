import { expect, test } from '@playwright/test';
import { readFile } from 'node:fs/promises';

test('Web and Flutter share the official timing and curve vocabulary', async () => {
  const [css, flutter] = await Promise.all([
    readFile('packages/ui/src/styles.css', 'utf8'),
    readFile('packages/nexo_flutter_design/lib/src/theme/nexo_theme.dart', 'utf8'),
  ]);
  for (const [name, value] of [
    ['instant', '80ms'],
    ['fast', '100ms'],
    ['normal', '180ms'],
    ['standard', '220ms'],
    ['slow', '320ms'],
  ])
    expect(css).toContain(`--nexo-duration-${name}: ${value}`);
  for (const value of [80, 100, 180, 220, 320])
    expect(flutter).toContain(`Duration(milliseconds: ${value})`);
  for (const curve of [
    'ease-standard',
    'ease-emphasized',
    'ease-decelerate',
    'ease-accelerate',
    'ease-spring',
  ])
    expect(css).toContain(`--nexo-${curve}`);
});
