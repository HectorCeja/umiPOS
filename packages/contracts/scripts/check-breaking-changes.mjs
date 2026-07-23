import { readFile } from 'node:fs/promises';
import { stdout } from 'node:process';
import { URL } from 'node:url';

const readJson = async (name) =>
  JSON.parse(await readFile(new URL(`../openapi/${name}`, import.meta.url), 'utf8'));
const [current, baseline] = await Promise.all([
  readJson('openapi.json'),
  readJson('compatibility-baseline.json'),
]);
const currentOperations = new Set();
for (const [path, pathItem] of Object.entries(current.paths)) {
  for (const method of ['get', 'post', 'put', 'patch', 'delete']) {
    if (pathItem[method]) currentOperations.add(`${method.toUpperCase()} ${path}`);
  }
}
const breaks = baseline.operations
  .filter((operation) => !currentOperations.has(operation))
  .map((operation) => `removed operation ${operation}`);
for (const [schema, properties] of Object.entries(baseline.schemas)) {
  const currentProperties = current.components.schemas[schema]?.properties;
  if (!currentProperties) breaks.push(`removed schema ${schema}`);
  else
    for (const property of properties)
      if (!currentProperties[property]) breaks.push(`removed property ${schema}.${property}`);
}
if (breaks.length) throw new Error(`Breaking OpenAPI changes:\n${breaks.join('\n')}`);
stdout.write(`OpenAPI compatibility ${baseline.version} passed\n`);
