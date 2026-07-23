import { expect, test } from '@playwright/test';
import { readFile } from 'node:fs/promises';

test('keynote decisions state purpose, primary action and distraction result', async () => {
  const report = await readFile('artifacts/premium-ux-part-4a/KEYNOTE_TEST.md', 'utf8');
  const rows = report
    .split('\n')
    .filter((line) =>
      /^\| (Login|Onboarding|Dashboard|Ventas|Caja|Productos|Inventario|Equipo|Clientes|Configuración|Perfil|Reportes|Flutter POS|Centro de Ayuda) \|/u.test(
        line,
      ),
    );
  expect(rows).toHaveLength(14);
  expect(report).toContain('Qué se entiende en 5 segundos');
  expect(report).toContain('Jerarquía / distracción');
});
