import { expect, test } from '@playwright/test';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, writeFileSync, existsSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

test('la limpieza es simulada por defecto y --apply solo elimina salidas regenerables', () => {
  const root = mkdtempSync(join(tmpdir(), 'nexo-clean-'));
  try {
    mkdirSync(join(root, '.turbo'), { recursive: true });
    mkdirSync(join(root, 'data/postgres'), { recursive: true });
    mkdirSync(join(root, 'uploads'), { recursive: true });
    writeFileSync(join(root, '.turbo/cache'), 'cache');
    writeFileSync(join(root, 'data/postgres/owner-data'), 'never-delete');
    writeFileSync(join(root, 'uploads/avatar.png'), 'never-delete');
    execFileSync('node', ['scripts/owner-storage.mjs', 'cache-clean', '--root', root]);
    expect(existsSync(join(root, '.turbo/cache'))).toBe(true);
    execFileSync('node', ['scripts/owner-storage.mjs', 'cache-clean', '--root', root, '--apply']);
    expect(existsSync(join(root, '.turbo'))).toBe(false);
    expect(existsSync(join(root, 'data/postgres/owner-data'))).toBe(true);
    expect(existsSync(join(root, 'uploads/avatar.png'))).toBe(true);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
