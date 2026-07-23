# Tenant Context

El contexto es un valor explícito, inmutable y obligatorio: `tenantId`, `principalId`, `membershipId`, rol y alcance de sucursales. No usa globals ni `AsyncLocalStorage`.

## Resolución

1. Un adaptador futuro entrega un `VerifiedPrincipal`; headers o body nunca producen esa identidad.
2. El `organizationId` de la ruta es solamente un candidato no confiable.
3. En una transacción se ejecuta `set_config('app.current_tenant_id', tenantId, true)`.
4. RLS permite buscar la membresía ACTIVE del principal en ese tenant.
5. Solo tras validarla se construye `TenantContext`; en cualquier otro caso se deniega.
6. Servicios y repositorios reciben el contexto como argumento y operan en esa misma transacción.

El tercer parámetro `true` hace el ajuste local a la transacción y evita fuga al devolver la conexión al pool. Las tareas asíncronas deberán transportar un envelope firmado con tenant/principal y volver a resolver autorización al consumirlo.
