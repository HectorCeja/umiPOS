import { readFile, writeFile } from 'node:fs/promises';

const scenarios = await readFile('docs/manual-acceptance/SCENARIOS.md', 'utf8');
const matches = [...scenarios.matchAll(/^### ([A-Z]-\d+) — (.+)$/gmu)];
const rows = matches.map((match, index) => {
  const next = matches[index + 1]?.index ?? scenarios.length;
  const section = scenarios.slice(match.index, next);
  const severity = section.match(/\*\*Severidad si falla:\*\* ([^.]+)\./u)?.[1] ?? 'Media';
  return `| ${match[1]} | NOT_RUN | ${severity} | ${match[2]} |  |  |  |  |`;
});
const output = `# Resultados de aceptación del propietario

Valores permitidos: \`PASS\`, \`FAIL\`, \`BLOCKED\`, \`NOT_RUN\`. No se debe cerrar la fase con casos críticos/altos sin ejecutar.

| ID | Estado | Severidad | Escenario | Fecha/hora | Rol/branch | Evidencia | Defecto |
|---|---|---|---|---|---|---|---|
${rows.join('\n')}
`;
await writeFile('artifacts/manual-acceptance/current-run/results.md', output);
