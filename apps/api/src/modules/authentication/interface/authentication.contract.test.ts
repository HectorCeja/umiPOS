import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

import { authenticationRouteManifest } from './authentication.routes.js';

describe('authentication OpenAPI conformance manifest', () => {
  it('maps every backend authentication route to the canonical operation', () => {
    const contract = JSON.parse(
      readFileSync(
        new URL('../../../../../../packages/contracts/openapi/openapi.json', import.meta.url),
        'utf8',
      ),
    ) as { paths: Record<string, Record<string, { operationId?: string }>> };
    for (const [method, path, operationId] of authenticationRouteManifest) {
      expect(contract.paths[path]?.[method.toLowerCase()]?.operationId).toBe(operationId);
    }
  });
});
