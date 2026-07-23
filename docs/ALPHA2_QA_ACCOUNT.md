# Alpha2 QA account

- Usuario: `alpha2.owner@nexo.local`
- Contraseña: credencial local autorizada de Alpha documentada en el entorno.
- Tenant aislado: `Negocio nuevo Alpha2`; no comparte membership ni caché con Alpha.
- Seed/`manual-acceptance:prepare`: restablece sesiones, datos operativos, ayudas relevantes y onboarding DRAFT paso 1.
- `manual-acceptance:start`: nunca resetea progreso.
- Reset explícito: `pnpm owner:alpha2:reset`.
- No existe bypass de RBAC, CSRF o RLS: Alpha2 usa login, sesión, membership OWNER y tenant reales.
