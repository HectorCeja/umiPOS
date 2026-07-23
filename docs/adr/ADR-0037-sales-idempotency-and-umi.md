# ADR-0037: Idempotencia persistida y eventos públicos para UMI

- Estado: Aceptada
- Fecha: 2026-07-13

## Decisión

Cada comando crítico usa clave con unicidad `(tenant, operation, key)`, fingerprint SHA-256 canónico, respuesta reproducible y TTL. Misma clave/payload reproduce; payload distinto retorna `IDEMPOTENCY_CONFLICT`. Aggregate version evita doble finalización concurrente.

Eventos internos versionados se guardan en outbox con entrega at-least-once. Un mapper produce contratos públicos `nexo.*` mínimos. `UmiSalesIntegrationPort` permanece deshabilitado/local hasta contar con documentación UMI. Mappings son genéricos, tenant-owned y no filtran entidades internas.

## Alternativas

- Idempotencia en memoria/Redis: descartada como autoridad por reinicios y pérdida.
- Publicar dentro de la transacción a UMI: descartado por indisponibilidad externa.
- Copiar aggregate completo: descartado por acoplamiento y exposición de datos.

## Fuentes

- [Square idempotency](https://developer.squareup.com/docs/build-basics/common-api-patterns/idempotency)
- [OWASP Transaction Authorization Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Transaction_Authorization_Cheat_Sheet.html)
