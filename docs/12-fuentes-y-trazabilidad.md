# Investigación, fuentes y trazabilidad

## Investigación Prompt 3 — consultada 2026-07-12

- PostgreSQL: [RLS](https://www.postgresql.org/docs/current/ddl-rowsecurity.html), [CREATE POLICY](https://www.postgresql.org/docs/current/sql-createpolicy.html), [roles](https://www.postgresql.org/docs/current/user-manag.html) y [set_config](https://www.postgresql.org/docs/current/functions-admin.html).
- OWASP: [ASVS 5.0](https://github.com/OWASP/ASVS), [Top 10 2025 A01](https://owasp.org/Top10/2025/A01_2025-Broken_Access_Control/), [Authorization](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html) y [Multi-Tenant Security](https://cheatsheetseries.owasp.org/cheatsheets/Multi_Tenant_Security_Cheat_Sheet.html).
- Contratos: [OpenAPI 3.1.1](https://spec.openapis.org/oas/v3.1.1.html).
- Persistencia: [Prisma database drivers](https://www.prisma.io/docs/orm/core-concepts/supported-databases/database-drivers).
- Infraestructura: [Docker Ubuntu](https://docs.docker.com/engine/install/ubuntu/), [post-install](https://docs.docker.com/engine/install/linux-postinstall/) y [PostgreSQL](https://docs.docker.com/guides/postgresql/).

## Investigación Prompt 4.1B — consultada 2026-07-12

- OWASP: [Authentication](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html), [Password Storage](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html), [Session Management](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html), [CSRF](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html) y [Forgot Password](https://cheatsheetseries.owasp.org/cheatsheets/Forgot_Password_Cheat_Sheet.html).
- [NIST SP 800-63B](https://pages.nist.gov/800-63-4/sp800-63b.html): contraseñas, blocklists, rate limiting y gestión de autenticadores.
- IdP oficiales: documentación/precios de [Keycloak](https://www.keycloak.org/docs/latest/server_admin/#_organizations), [Auth0](https://auth0.com/docs/manage-users/organizations), [Clerk](https://clerk.com/docs/guides/organizations/overview), [Ory](https://www.ory.sh/docs), [FusionAuth](https://fusionauth.io/docs/lifecycle/manage-tenants) y [ZITADEL](https://zitadel.com/docs/guides/manage/console/organizations).

## Método y fecha de vigencia

Fuentes consultadas y revisadas hasta el 2026-07-13. Se priorizaron organismos normativos y documentación de los proyectos/proveedores. La vigencia regulatoria y de framework es mutable: Arquitectura, Seguridad y Legal deben revisar trimestralmente y antes de release mayor/fiscal. Una fuente respalda una práctica; no implica certificación de NEXO.

## Fuentes oficiales principales

### Seguridad y privacidad

- [OWASP Top 10:2025](https://owasp.org/Top10/2025/): categorías oficiales A01–A10, incluida cadena de suministro y manejo de condiciones excepcionales.
- [OWASP ASVS](https://owasp.org/www-project-application-security-verification-standard/): versión estable 5.0.0 y formato de IDs versionados; base de verificación L2.
- [OWASP Cheat Sheet Series](https://cheatsheetseries.owasp.org/): controles especializados.
- [Multi-Tenant Security Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Multi_Tenant_Security_Cheat_Sheet.html): contexto tenant autenticado, namespaces, RLS/defensa y auditoría.
- [Authentication](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html), [Session Management](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html), [Authorization](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html) y [Logging](https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html).
- [NIST SP 800-63B Digital Identity Guidelines](https://pages.nist.gov/800-63-4/sp800-63b.html): autenticadores, contraseñas, rate limiting y recuperación; se verifica revisión vigente al implementar.
- [Ley Federal de Protección de Datos Personales en Posesión de los Particulares, texto vigente](https://www.diputados.gob.mx/LeyesBiblio/pdf/LFPDPPP.pdf): nueva ley 20-03-2025 y última reforma indicada 14-11-2025 al corte.
- [PCI DSS](https://www.pcisecuritystandards.org/standards/pci-dss/): baseline futuro si NEXO procesa/transmite/afecta datos de tarjeta; MVP minimiza alcance.

### Accesibilidad y experiencia web

- [W3C WCAG 2.2 Recommendation](https://www.w3.org/TR/WCAG22/): objetivo AA y criterios verificables.
- [WAI — novedades WCAG 2.2](https://www.w3.org/WAI/standards-guidelines/wcag/new-in-22/): foco, target, drag, authentication y otros criterios añadidos.
- [WAI-ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/): patrones de interacción; se prefiere HTML nativo.
- [RFC 9457 — Problem Details for HTTP APIs](https://www.rfc-editor.org/rfc/rfc9457): formato de errores API.
- [BCP 47](https://www.rfc-editor.org/rfc/bcp/bcp47.txt), [IANA Time Zone Database](https://www.iana.org/time-zones) e [ISO 4217 Maintenance Agency](https://www.six-group.com/en/products-services/financial-information/data-standards.html): idioma, zonas y monedas.

### Arquitectura y plataforma

- [Next.js App Router](https://nextjs.org/docs/app) y [Self-hosting](https://nextjs.org/docs/app/guides/self-hosting): renderizado, runtime, proxy, cache y coordinación multi-instancia.
- [NestJS Modules](https://docs.nestjs.com/modules): encapsulación y grafo modular.
- [PostgreSQL Row Security Policies](https://www.postgresql.org/docs/current/ddl-rowsecurity.html): RLS/default deny/roles; [Continuous Archiving and PITR](https://www.postgresql.org/docs/current/continuous-archiving.html): recuperación.
- [OpenTelemetry concepts/signals](https://opentelemetry.io/docs/concepts/signals/) y [log correlation](https://opentelemetry.io/docs/specs/otel/logs/): traces, metrics, logs y contexto.
- [OpenAPI Specification](https://spec.openapis.org/oas/latest.html): contrato REST.
- [CloudEvents Specification](https://cloudevents.io/): referencia para envelope de eventos cuando aporte interoperabilidad.
- [Node.js release schedule](https://nodejs.org/en/about/previous-releases): selección de Node 24 LTS y exclusión de versiones EOL/Current.
- [Prisma system requirements](https://docs.prisma.io/docs/orm/reference/system-requirements) y [Prisma ORM overview](https://www.prisma.io/docs/orm): requisitos de Node, ESM y driver adapter en Prisma 7.
- [Storybook for Next.js with Vite](https://storybook.js.org/docs/get-started/frameworks/nextjs-vite/): integración recomendada para Storybook.
- [ESLint configuration files](https://eslint.org/docs/latest/use/configure/configuration-files): flat config y configuración type-aware.

### Autorización — Prompt 5

- [OWASP Authorization Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html) y [ASVS 5.0.0](https://github.com/OWASP/ASVS/tree/v5.0.0): deny-by-default, evaluación por petición/objeto y verificación.
- [Google Zanzibar](https://research.google/pubs/zanzibar-googles-consistent-global-authorization-system/): separación de relaciones y decisión consistente a escala.
- [OpenFGA documentation](https://openfga.dev/docs), [Cedar documentation](https://docs.cedarpolicy.com/), [Oso documentation](https://www.osohq.com/docs) y [Casbin documentation](https://casbin.org/docs/overview/): alternativas de modelo/policy engine evaluadas.
- [GitHub organization roles](https://docs.github.com/en/organizations/managing-peoples-access-to-your-organization-with-roles/roles-in-an-organization), [Stripe organization roles](https://docs.stripe.com/get-started/account/teams/roles) y [Shopify roles and permissions](https://help.shopify.com/en/manual/your-account/users/roles): principios de roles estables, permisos específicos y alcance.

### Control Plane — Prompt 6

- [OWASP Authorization Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html): deny-by-default, evaluación por petición y atributos autoritativos.
- [OWASP Forgot Password Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Forgot_Password_Cheat_Sheet.html): principios de tokens URL aleatorios, ligados, expirables y de uso único aplicados a invitaciones.
- [PostgreSQL Row Security Policies](https://www.postgresql.org/docs/current/ddl-rowsecurity.html): `FORCE ROW LEVEL SECURITY`, default deny y policies por rol.
- [OpenAPI 3.1 Specification](https://spec.openapis.org/oas/v3.1.1.html): contrato design-first del Control Plane.
- [Playwright Visual Comparisons](https://playwright.dev/docs/test-snapshots): baselines deterministas y revisión explícita.
- [OpenTelemetry JavaScript](https://opentelemetry.io/docs/languages/js/) y [semantic conventions](https://opentelemetry.io/docs/specs/semconv/): spans y atributos de baja cardinalidad.
- [WCAG 2.2](https://www.w3.org/TR/WCAG22/): labels, errores identificables, foco y tamaños de objetivo en onboarding/administración.

### México fiscal

- [SAT — Formato de Factura (Anexo 20)](https://wwwmat.sat.gob.mx/cs/Satellite?c=ConsultaInfo&childpagename=SatTyR%2FConsultaInfo%2FSAT_LandingConsultaInformacion&cid=1462228635025&packedargs=d%3DTouch&pagename=TySWrapper): estructura/sintaxis CFDI; 4.0 es versión señalada como válida desde 01-04-2023 al corte.
- [SAT — información para emitir factura](https://www.sat.gob.mx/minisitio/Factura/emite_quenecesitoparafacturar.htm): datos/catálogos/requisitos.

## Comparación y fundamento de alternativas

| Decisión       | Seleccionada         | Alternativas evaluadas            | Fundamento verificable / reevaluación                                 |
| -------------- | -------------------- | --------------------------------- | --------------------------------------------------------------------- |
| Topología      | monolito modular     | microservicios, monolito por capa | transacción/operación simple; extraer con escala/ownership            |
| Frontend       | Next.js PWA          | Vite SPA, nativo                  | web híbrida + administración; revisar Web Vitals/offline/dispositivo  |
| Backend        | NestJS               | Fastify, Go, .NET/Java            | módulos/ecosistema TS; benchmark puede motivar servicio especializado |
| Datos          | PostgreSQL           | documental, distributed SQL       | ACID/constraints/RLS; revisar escala/residencia                       |
| Tenant         | shared+RLS           | schema/DB por tenant              | coste/operación; tier silo por regulación/riesgo                      |
| API            | REST/OpenAPI         | GraphQL, gRPC                     | contratos/caching/tooling; gRPC interno con extracción                |
| Offline        | PWA acotada          | online-only, local-first, nativa  | continuidad con riesgo controlado; nativa si hardware/evidencia       |
| Infra          | managed containers   | Kubernetes, functions             | menor carga inicial; ADR-015 sigue propuesta hasta nube               |
| Observabilidad | OpenTelemetry        | SDK vendor                        | portabilidad/correlación; backend por evaluación de coste             |
| CFDI/pagos     | adaptadores post-MVP | núcleo MVP                        | reduce PCI/fiscal sin bloquear modelo extensible                      |
| Autorización   | motor typed embebido | OpenFGA, Cedar, Oso, Casbin       | verdad DB/transacción simple; revisar por escala/policy custom        |

## Matriz de trazabilidad por capacidad

| Jornada/capacidad      | Requisitos                | Módulos     | Riesgos/controles   | Criterios              |
| ---------------------- | ------------------------- | ----------- | ------------------- | ---------------------- |
| Onboarding/acceso      | RF-001..015, RNF-060      | 01–05       | RS-010..25, PRIV-02 | CA-001, 006, 030–034   |
| Catálogo/import        | RF-020..025               | 06,17       | RS-030,035–036      | CA-001, 054            |
| Venta                  | RF-050..059, RNF-001..023 | 06–11,14    | RS-020,040..45      | CA-002,008,010–014,050 |
| Inventario             | RF-030..035               | 07,09       | RS-041–042          | CA-002,011–012         |
| Caja                   | RF-060..065               | 09–11       | RS-020,041–043,070  | CA-004,012             |
| Agenda                 | RF-070..075               | 08,12       | RS-020,041          | CA-003,011             |
| Reportes/export        | RF-080..085               | 13,17       | RS-024,036,054      | CA-005,035–036         |
| Offline                | RF-100..105               | 18,09       | RS-037,040,045      | CA-020..023            |
| Privacidad/offboarding | RF-040..044,095           | 02,08,15,17 | PRIV-01..10         | CA-034..036            |
| Plataforma/entrega     | RF-090..093, RNF-050..055 | 15,16,19,23 | RS-060..075         | CA-051..055            |

## Matriz de ownership

| Artefacto               | Accountable              | Consultados             | Cadencia                   |
| ----------------------- | ------------------------ | ----------------------- | -------------------------- |
| Visión/MVP/roadmap      | Product                  | UX, Tech, Sales/Support | mensual                    |
| Requisitos/aceptación   | Product + QA             | todas disciplinas       | cada release               |
| Arquitectura/ADR        | Principal Architect      | Security, DBA, DevOps   | cambio material/trimestral |
| Modelo/diccionario      | Data/DBA + módulo owner  | Security/Product        | cada migración             |
| Sistema de diseño/RA    | UX + Accessibility owner | QA/Frontend             | continuo/release           |
| ASVS/threat model       | Security                 | Engineering/QA/Privacy  | release mayor              |
| Privacidad/legal/fiscal | Legal/Privacy            | Product/Security        | trimestral/cambio legal    |
| SLO/runbooks/DR         | DevOps/SRE               | módulos, DBA, Security  | mensual/trimestral         |
| Evidencia de calidad    | QA Lead                  | owners                  | cada release               |

## Preguntas abiertas controladas

No bloquean el blueprint, pero deben resolverse antes del hito indicado:

1. Proveedor/región/coste/residencia y backend de observabilidad — antes de IaC de producción.
2. Build vs buy del IdP y requisitos de passkeys — antes de implementar identidad.
3. Hardware certificado (impresoras, cajones, escáneres) y navegadores/tabletas mínimos — antes de private beta.
4. Política exacta de stock negativo, cierre ciego y límites offline por plan/giro — discovery con pilotos.
5. Tabla legal de retención, contrato responsable/encargado, transferencias y SLA de derechos — antes de capturar PII beta.
6. Pricing/planes y límites — antes de GA, sin contaminar permisos.
7. Proveedor PAC/PSP y alcance PCI — antes de V1.2, con RFP y evaluación legal/security.

## Auditoría de completitud documental

El índice cubre visión, negocio/técnica, público/personas/giros, MVP/roadmap, arquitectura general/modular, responsive/UX/design system, RF/RNF/accesibilidad/seguridad, multi-tenant, dominio/módulos/dependencias, convenciones, testing, CI/CD/offline, observabilidad/logging, backups/DR, aceptación, glosario y ADR. La completitud no equivale a cierre de discovery: preguntas abiertas tienen owner e hito y no deben resolverse de forma arbitraria durante implementación.
