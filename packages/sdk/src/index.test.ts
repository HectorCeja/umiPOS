import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

import {
  authenticationOperationIds,
  authorizationOperationIds,
  identityFoundationOperationIds,
} from './index.js';

describe('identity SDK surface', () => {
  it('keeps unique operation identifiers', () => {
    expect(new Set(identityFoundationOperationIds).size).toBe(
      identityFoundationOperationIds.length,
    );
  });

  it('matches every identity operation in canonical OpenAPI', () => {
    const contract = JSON.parse(
      readFileSync(new URL('../../contracts/openapi/openapi.json', import.meta.url), 'utf8'),
    ) as { paths: Record<string, Record<string, { operationId?: string }>> };
    const operationIds = new Set(
      Object.values(contract.paths).flatMap((path) =>
        Object.values(path).flatMap((operation) =>
          operation.operationId === undefined ? [] : [operation.operationId],
        ),
      ),
    );
    for (const operationId of [
      ...identityFoundationOperationIds,
      ...authenticationOperationIds,
      ...authorizationOperationIds,
    ])
      expect(operationIds).toContain(operationId);
  });
});
