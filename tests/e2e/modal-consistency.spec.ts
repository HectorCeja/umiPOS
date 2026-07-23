import { expect, test } from '@playwright/test';
import { readFile } from 'node:fs/promises';

test('shared modal has one upper close, unique labels and native focus containment', async () => {
  const source = await readFile('packages/ui/src/overlays.tsx', 'utf8');
  expect(source).toContain('nexo-dialog__header');
  expect(source).toContain('NexoIcon name="close"');
  expect(source).toContain('const titleId = useId()');
  expect(source).not.toContain('>Cerrar<');
  expect(source).toContain('dialog.showModal()');
});
