# Authorization Foundation

> Superseded as implementation guidance by [Authorization Architecture](AuthorizationArchitecture.md), [Authorization Context](AuthorizationContext.md), [Permission Engine](PermissionEngine.md), [RBAC](RBAC.md), [ABAC](ABAC.md), [Scopes](Scopes.md) and [Permission Matrix](PermissionMatrix.md). This document preserves Prompt 3 historical intent; Prompt 5 is the current executable specification.

Autenticación queda fuera de alcance. La autorización adopta default-deny, comprobación en cada petición y dos capas:

- RBAC concede permisos base por MembershipRole.
- ABAC exige igualdad de tenant, membresía ACTIVE, estado admisible del recurso y alcance de Branch.

Permisos iniciales: lectura/actualización de Organization; lectura/creación/actualización de Branch; lectura/creación/actualización/revocación de Membership. OWNER posee todos; ADMIN no revoca; SUPERVISOR administra sucursales y lee membresías; el resto solo lee organización/sucursales dentro de su alcance.

Los controladores no deben contener matrices ad hoc. Un resultado ausente por RLS y un recurso inexistente se exponen indistinguiblemente para evitar enumeración. Cambios de permisos requieren ADR, pruebas negativas y actualización OpenAPI.
