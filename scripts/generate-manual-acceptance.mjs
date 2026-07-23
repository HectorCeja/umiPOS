import { mkdir, writeFile } from 'node:fs/promises';
import { format } from 'prettier';
const categories = [
  ['A', 'Entorno y acceso'],
  ['B', 'Identity'],
  ['C', 'Authorization'],
  ['D', 'Organizations'],
  ['E', 'Branches'],
  ['F', 'Products'],
  ['G', 'Variants'],
  ['H', 'Pricing'],
  ['I', 'Inventory'],
  ['J', 'Sales'],
  ['K', 'Payments'],
  ['L', 'Suspended Sales'],
  ['M', 'Cancellations'],
  ['N', 'Refunds'],
  ['O', 'Receipts'],
  ['P', 'Cash Sessions'],
  ['Q', 'Deposits'],
  ['R', 'Transfers'],
  ['S', 'Reconciliation'],
  ['T', 'Approvals'],
  ['U', 'Outbox'],
  ['V', 'Quarantine'],
  ['W', 'Accessibility'],
  ['X', 'Responsive'],
  ['Y', 'Security'],
  ['Z', 'Recovery'],
];
const actions = [
  'consultar el estado autorizado',
  'ejecutar el flujo principal',
  'validar un dato inválido',
  'repetir la intención idempotente',
  'cambiar de sucursal',
  'intentar sin permiso',
];
const roles = ['Owner', 'Administrator', 'Supervisor', 'Cashier', 'Employee', 'ReadOnly'];
let output =
  '# Escenarios de aceptación manual — Fase 12\n\n156 escenarios útiles (6 por categoría). Todos usan datos ficticios y servicios locales reales.\n\n';
for (const [letter, name] of categories) {
  output += `## ${letter}. ${name}\n\n`;
  for (let index = 0; index < 6; index++) {
    const id = `${letter}-${String(index + 1).padStart(2, '0')}`;
    const negative = index >= 2;
    output += `### ${id} — ${actions[index]}\n\n- **Objetivo:** ${actions[index]} en ${name} y confirmar que la respuesta sea autoritativa.\n- **Rol:** ${roles[index]}.\n- **Precondiciones:** entorno preparado; Organization Alpha (dataset Café Horizonte); sucursal Centro, salvo el caso cross-branch.\n- **Pasos:** 1) iniciar sesión; 2) abrir ${name}; 3) ${actions[index]}; 4) actualizar la vista; 5) copiar el correlation ID si aparece.\n- **Resultado esperado:** ${negative ? 'la operación se bloquea con un código estable y no cambia datos' : 'la vista refleja el resultado persistido por el backend y el timeline conserva trazabilidad'}.\n- **Evidencia:** captura, hora, usuario, URL, request/correlation ID y resultado observado.\n- **Severidad si falla:** ${index === 5 ? 'Crítica' : index >= 2 ? 'Alta' : 'Media'}.\n- **Módulo responsable:** ${name}.\n- **Diagnóstico:** usar el bundle sanitizado; nunca adjuntar cookies, tokens, contraseñas, PAN/CVV o payloads completos.\n\n`;
  }
}
await mkdir('docs/manual-acceptance', { recursive: true });
await writeFile(
  'docs/manual-acceptance/SCENARIOS.md',
  await format(output, { parser: 'markdown' }),
);
console.log('Generated 156 manual acceptance scenarios');
