import { readFileSync, writeFileSync } from 'node:fs';
import process from 'node:process';
import { URL } from 'node:url';
import { format } from 'prettier';

const contractUrl = new URL('../../contracts/openapi/openapi.json', import.meta.url);
const outputUrl = new URL('../src/generated/openapi-operations.ts', import.meta.url);
const contract = JSON.parse(readFileSync(contractUrl, 'utf8'));
const operations = [];

for (const [path, pathItem] of Object.entries(contract.paths)) {
  for (const [method, operation] of Object.entries(pathItem)) {
    if (operation.operationId)
      operations.push({ method: method.toUpperCase(), operationId: operation.operationId, path });
  }
}
operations.sort((left, right) => left.operationId.localeCompare(right.operationId));

const source = `${[
  '// Generated from packages/contracts/openapi/openapi.json. Do not edit by hand.',
  'export const openApiOperations = {',
  ...operations.map(
    ({ method, operationId, path }) =>
      `  ${JSON.stringify(operationId)}: { method: ${JSON.stringify(method)}, operationId: ${JSON.stringify(operationId)}, path: ${JSON.stringify(path)} },`,
  ),
  '} as const;',
  '',
].join('\n')}`;
const body = await format(source, {
  parser: 'typescript',
  printWidth: 100,
  singleQuote: true,
  trailingComma: 'all',
});

if (process.argv.includes('--check')) {
  const current = readFileSync(outputUrl, 'utf8');
  if (current !== body) {
    process.stderr.write(
      'Generated SDK operation manifest is stale. Run pnpm --filter @nexo/sdk generate.\n',
    );
    process.exitCode = 1;
  }
} else {
  writeFileSync(outputUrl, body);
}
