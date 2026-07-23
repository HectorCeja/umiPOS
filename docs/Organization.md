# Organization

`Organization` es la raíz de aislamiento y representa un negocio contratante. Su `id` es también el `tenantId` usado por todas las entidades dependientes; por ello es la única excepción deliberada a almacenar una columna separada `tenant_id`.

## Modelo

- Identidad: UUID inmutable, `slug` único y nombre.
- Ciclo: `ACTIVE`, `SUSPENDED`, `OFFBOARDING`; no hay borrado físico en el MVP.
- Región: ISO 3166-1 alpha-2, locale BCP 47, moneda ISO 4217 y zona IANA.
- Extensibilidad: `branding` y `settings` JSON validados en aplicación; los datos consultables frecuentemente deberán promoverse a columnas mediante migración.
- Concurrencia: `version` para optimistic locking y timestamps UTC.

Prompt 6 implementa creación inicial mediante el bootstrap verificado y atómico de ADR-0030. Administración regional/RFC/dirección usa columnas explícitas y JSON gobernado. Archivar transita a `OFFBOARDING`; restauración espera política de retención/billing. Las consultas tenant usan RLS sobre `organizations.id`.
