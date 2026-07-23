import openApiDocument from '@nexo/contracts/openapi' with { type: 'json' };
import { describe, expect, it } from 'vitest';

import { authorizationRouteManifest } from './authorization.routes.js';

describe('authorization contract', () => {
  it('keeps every implemented route in canonical OpenAPI', () => {
    for (const [method, path, operationId] of authorizationRouteManifest) {
      const operation = (
        openApiDocument.paths as Record<string, Record<string, { operationId?: string }>>
      )[path]?.[method.toLowerCase()];
      expect(operation?.operationId).toBe(operationId);
    }
  });
});
