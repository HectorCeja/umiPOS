# Contract Testing

## Cadena obligatoria

```text
OpenAPI 3.1.1 canónico
  → validación + compatibility baseline 3.0.0
  → manifiesto SDK generado
  → wrapper tipado
  → manifiesto de rutas backend
  → Playwright contra runtime real
```

- `packages/contracts/openapi/openapi.json` es la única fuente de verdad.
- `validate-openapi.mjs` exige estructura y 27 `operationId` únicos.
- `check-breaking-changes.mjs` bloquea breaks respecto de 3.0.0.
- `packages/sdk/scripts/generate-openapi-operations.mjs` genera path/method/operation y `generate:check` falla si está obsoleto.
- el test SDK exige que las superficies Identity/Auth/Authorization existan en OpenAPI;
- `authentication.contract.test.ts` exige que las 11 rutas Nest coincidan con método/path/operationId;
- `authorization.contract.test.ts` exige que las rutas Nest de contexto/evaluación/roles/permisos/features/Membership coincidan con el contrato;
- Playwright prueba comportamiento y cookies reales.

Cambiar un contrato exige primero editar OpenAPI, regenerar, ajustar backend/SDK/pruebas y sólo actualizar baseline cuando la compatibilidad y versión semántica hayan sido revisadas. Los DTO/decoradores nunca generan el contrato canónico.
