# PostgreSQL Row Level Security

Todas las tablas tenant-owned usan `tenant_id NOT NULL`, índices que comienzan por tenant y FKs compuestas. Organization es la raíz: su `id` equivale al tenant.

Cada tabla ejecuta `ENABLE ROW LEVEL SECURITY` y `FORCE ROW LEVEL SECURITY`. La política restrictiva compara con `app.current_tenant_id()` tanto en `USING` como `WITH CHECK`; políticas permisivas separadas habilitan runtime y read-only. Sin contexto, la función devuelve NULL y la expresión no concede filas (default-deny).

La garantía se extiende desde Tenant/Control Plane a Identity vinculada, Product, Inventory y Sales. La validación real de Prompt 9/10 cubre 41 tablas con RLS forzado, ausencia de contexto, lectura A-only, escrituras B→A rechazadas y restricciones append-only en ledgers, ventas históricas y evidencia. Las pruebas SQL de aislamiento siguen devolviendo todas sus aserciones en `1`.

Roles runtime/read-only no son propietarios, superusuarios ni `BYPASSRLS`. Migration conserva DDL y Maintenance recibe monitorización, no datos de tenant por defecto. Ninguna aplicación se conecta como owner.

RLS mitiga consultas defectuosas, pero el rol runtime puede llamar `set_config`; por eso no sustituye la validación del principal contra Membership. Las pruebas reales deben usar las credenciales runtime, nunca el owner de migración.
