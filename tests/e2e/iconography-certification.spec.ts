import { expect, test } from '@playwright/test';
import { readFile } from 'node:fs/promises';

test('canonical navigation uses semantic SVG icons, never emoji or abstract glyphs', async () => {
  const [shell, icons] = await Promise.all([
    readFile('apps/web/src/app/global-shell.tsx', 'utf8'),
    readFile('packages/ui/src/iconography.tsx', 'utf8'),
  ]);
  expect(shell).toContain('<NexoIcon name={item.icon}');
  expect(shell).not.toMatch(/[🏠🧾💵📦🗃👥👤📊]/u);
  for (const name of [
    'receipt',
    'cash-register',
    'package',
    'warehouse',
    'users',
    'chart',
    'settings',
    'life-buoy',
  ])
    expect(icons).toContain(`'${name}'`);
});
