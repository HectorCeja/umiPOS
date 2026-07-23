import { readFile } from 'node:fs/promises';
import { stdout } from 'node:process';
import { URL } from 'node:url';

const contract = JSON.parse(
  await readFile(new URL('../openapi/openapi.json', import.meta.url), 'utf8'),
);
if (contract.openapi !== '3.1.1' || typeof contract.info?.version !== 'string') {
  throw new Error('OpenAPI must declare version 3.1.1 and an API version');
}
const operationIds = new Set();
for (const pathItem of Object.values(contract.paths)) {
  for (const [method, operation] of Object.entries(pathItem)) {
    if (!['get', 'post', 'put', 'patch', 'delete'].includes(method)) continue;
    if (!operation.operationId || operationIds.has(operation.operationId)) {
      throw new Error(`Missing or duplicate operationId: ${String(operation.operationId)}`);
    }
    operationIds.add(operation.operationId);
  }
}
stdout.write(`OpenAPI valid: ${operationIds.size} operations\n`);
