# Branch

`Branch` es una sucursal tenant-owned identificada por la clave compuesta `(tenant_id, id)`. `code` es único dentro de la organización.

Puede sobrescribir locale, zona horaria y moneda; un valor nulo hereda Organization. `business_hours` contiene horarios versionados por esquema de aplicación y `settings` únicamente extensiones no consultables. Estados: `ACTIVE`, `INACTIVE`, `ARCHIVED`. Inventario, caja y empleados no forman parte de esta fase.

Prompt 6 implementa crear/editar/archivar/restaurar con optimistic locking, evidencia y autorización transaccional. Toda FK entrante futura debe incluir `tenant_id`; toda consulta requiere `TenantContext`, permiso y, cuando aplique, alcance de sucursal.
