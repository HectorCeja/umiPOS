import { expect, test } from '@playwright/test';
import { readFile } from 'node:fs/promises';

test('Select base define el contrato de ancho desde el layout', async () => {
  const ui = await readFile('packages/ui/src/styles.css', 'utf8');
  for (const declaration of [
    'box-sizing: border-box',
    'width: 100%',
    'max-width: 100%',
    'min-width: 0',
    'text-overflow: ellipsis',
  ]) {
    expect(ui).toContain(declaration);
  }
});
