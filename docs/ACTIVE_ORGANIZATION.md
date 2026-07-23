# Active Organization

La organización activa es la única fuente de contexto del Web Admin. `GET /v1/organizations`
devuelve exclusivamente organizaciones activas para las que la identidad autenticada tiene una
membresía activa. `apps/web/src/app/active-organization.ts` valida la selección persistida y elige
una organización accesible; nunca acepta un UUID arbitrario ni usa una organización seed.

La selección se conserva en `nexo.active-organization` y la sucursal en `nexo.active-branch`.
Productos, Inventario, Caja, Ventas, Reportes, Configuración, onboarding y el shell consumen este
contexto. Cambiar de organización limpia la sucursal anterior y vuelve a resolver una sucursal
activa del nuevo tenant.

## Seguridad

La función PostgreSQL `app.active_organizations_for_current_user()` filtra por
`app.current_user_id()`. RLS permite leer únicamente membresías propias durante el descubrimiento
y organizaciones asociadas a esas membresías. Las escrituras siguen exigiendo
`app.current_tenant_id()`; no existe `BYPASSRLS` ni confianza en un tenant enviado sin autorización.

## Verificación

Ejecutar `pnpm exec playwright test tests/e2e/active-organization.spec.ts tests/e2e/dynamic-context.spec.ts`.
