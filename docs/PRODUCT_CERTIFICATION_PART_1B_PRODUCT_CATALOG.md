# NEXO Product Certification Part 1B — Parte 1

## Veredicto

PASS WITH OBSERVATIONS.

## Executive Summary

El núcleo funcional certificado comprende productos PHYSICAL y SERVICE, categorías de creación/listado, variantes, SKU, barcode, precio estructural, media referenciada, lifecycle y outbox. Se reprodujeron y corrigieron referencias cross-tenant y cross-product que podían dejar el catálogo estructuralmente inconsistente. PostgreSQL ahora respalda estas reglas con foreign keys compuestas. RLS, locking optimista, carreras de identificadores y Web Admin fueron probados contra API y PostgreSQL reales.

## Estado heredado de Part 1A

Part 1A permanece CERTIFIED WITH OBSERVATIONS. La regresión dirigida conserva autenticación, autorización, RLS, tenant isolation, headers, CSP/CORS/CSRF, OpenAPI y SDK. La allowlist CORS continúa siendo exacta y ahora incluye los headers contractuales `idempotency-key` e `if-match`.

## Arquitectura Product/Catalog

`apps/web` consume el controller Product de NestJS. El controller obtiene identidad de sesión y CSRF; `ProductService` autoriza mediante el motor RBAC/ABAC; `PrismaProductRepository` repite autorización dentro de la transacción y usa `withTenantTransaction`; PostgreSQL aplica FORCE RLS. Product, Variant, Category, Barcode, Price, Media, ProductEvent y ProductOutbox son persistidos en PostgreSQL. MinIO almacena media. El worker publica el outbox preliminar.

## Product Types

| Tipo declarado | Estado real            | Evidencia                           |
| -------------- | ---------------------- | ----------------------------------- |
| PHYSICAL       | PASS                   | API, UI y E2E                       |
| SERVICE        | PASS WITH OBSERVATIONS | API/UI; agenda fuera de alcance     |
| BUNDLE         | NOT IMPLEMENTED        | Sin aggregate/composición/endpoints |
| KIT            | NOT IMPLEMENTED        | Sin aggregate/composición/endpoints |
| COMPOSITE      | NOT IMPLEMENTED        | Solo enum histórico                 |
| DIGITAL        | NOT IMPLEMENTED        | Sin delivery/licencia               |
| GIFT_CARD      | NOT IMPLEMENTED        | Sin definición funcional            |
| SUBSCRIPTION   | NOT IMPLEMENTED        | Deshabilitado                       |
| CUSTOM         | NOT IMPLEMENTED        | Sin contrato funcional              |

Los tipos no implementados ahora reciben 400 y OpenAPI limita `CreateProduct` a los tipos operativos. No se eliminó el enum persistente para conservar compatibilidad histórica.

## Product Aggregate

ID, tenant, actor, version y timestamps son autoritativos. Nombre no puede ser vacío ni solo espacios. El tipo es inmutable después de crear. Category, Variant y relaciones hijas son tenant/product-bound. Propiedades desconocidas son rechazadas por la validación global.

## Create

Creación mínima y completa pasan. El tenant y actor provienen de sesión/path autorizado. SKU concurrente produce un ganador 201 y un perdedor 409, con un solo ProductCreated. Create no dispone todavía de idempotency record propio cuando no hay SKU: observación no bloqueante.

## Read/List/Search

List/get/search por nombre, SKU y términos están implementados, limitados a 100, con orden createdAt descendente. No existen pagination/cursor, filtros avanzados o branch availability. Archivados se excluyen de list pero permanecen accesibles por ID autorizado para historia.

## Update

PATCH requiere version. Campos autoritativos no forman parte del DTO. Tenant, actor, ID y timestamps no son editables. Cambios de tipo incompatibles se rechazan.

## Optimistic Locking

Product usa version y `updateMany` atómico. Dos escrituras sobre version 1 producen 200 para el ganador y 409 para la escritura stale; no existe lost update silencioso.

## Lifecycle

DRAFT, ACTIVE, ARCHIVED y DISABLED existen. Archive/restore/activate validan transiciones y version. Archivado es soft delete y preserva referencias. No existe hard delete público.

## SKU

Opcional, normalizado NFKC/uppercase, máximo 100, único por tenant tanto en Product como Variant. Carreras están respaldadas por índices únicos. El mismo valor puede existir en tenants distintos.

## Barcodes/GS1

EAN/UPC/GTIN validan longitudes GS1 y check digit. QR/INTERNAL aceptan identifiers opacos normalizados. Unicidad es tenant-scoped. La carrera produce 201/409. La relación opcional con variante ahora exige que la variante pertenezca al mismo producto.

## Categories

Create/list, parent, slug, orden, status y trigger anti-ciclos existen. Parent ahora usa FK compuesta tenant/category. No hay endpoints rename/move/archive/restore/delete; esas capacidades quedan NOT IMPLEMENTED, por lo que ciclos por API no son alcanzables.

## Variants

Option combinations se normalizan NFKC/case-insensitive y ordenan canónicamente. `{color,size}` equivale a `{size,color}`. El índice tenant/product/optionKey evita duplicados. SKU de variante es tenant-scoped.

## Attributes and Options

Solo `optionValues` de variante está implementado. No existen aggregates separados de Attribute, Option Group, modificadores o tags; se clasifican NOT IMPLEMENTED.

## Bundles

NOT IMPLEMENTED. No se certifica estructura ni ejecución.

## Kits

NOT IMPLEMENTED. No se certifica ensamblado ni inventario.

## Composite Products

NOT IMPLEMENTED; solo permanece el valor del enum.

## Services

PASS WITH OBSERVATIONS. Service se crea, edita, activa y archiva. No existe agenda, duración o resources. Inventory tracking no forma parte del DTO Product.

## Digital Products

NOT IMPLEMENTED.

## Gift Card Definition

NOT IMPLEMENTED. No se afirma certificación financiera.

## Custom Products

NOT IMPLEMENTED. No actúa como bypass de catálogo/precio/impuestos.

## Units of Measure

`unitCode` es una referencia string de máximo 16 con default EA/H87 usado por UI. No existe catálogo UoM ni conversiones; PARTIAL y transferido a Inventory/Pricing.

## Branch Availability

NOT IMPLEMENTED en Product. El catálogo actual es organization-scoped. Los roles BRANCH con `product.read` no cuentan con un endpoint Product que reciba branch context, divergencia documentada para la parte de availability.

## Channel Visibility

NOT IMPLEMENTED. POS consume catálogo por sus coordinadores, pero no existe aggregate de canales/availability en Product.

## Tax/Pricing Boundaries

Product guarda referencias `taxProfileKey`, currency, amount decimal y variant. El motor fiscal/pricing completo queda para Parte 2. Price variant ahora debe pertenecer al mismo product.

## Referential Integrity

La migración `20260721203000_product_catalog_referential_integrity` agrega Product→Category, Category→Parent y child Product/Variant constraints compuestos. Delete permanece RESTRICT. Se corrigieron referencias cross-tenant, huérfanas y cross-product.

## Tenant Isolation

PASS. API A/B y SQL con FORCE RLS demuestran que Tenant A no puede observar o relacionar categorías de B. Los constraints incluyen tenant_id.

## Branch Isolation

NOT APPLICABLE/PARTIAL para Product Core: no existe branch availability. Autorización branch-scoped permanece default-deny; no se aceptan branchId cliente.

## Permission Matrix

Owner y Administrator administran catálogo según registro. Supervisor solo posee product.read/update con scope BRANCH; Cashier, Employee y ReadOnly poseen product.read pero no mutaciones. Cashier create devuelve 403. La ausencia de branch-aware Product read se conserva como observación de contrato.

## Feature Flags

No existe flag backend que active los tipos incompletos. La autoridad ahora es `enabledProductTypes`, limitada a PHYSICAL/SERVICE. Flags cliente no modifican esa decisión.

## Events and Outbox

Create/update/archive/restore/activate, variant, category, price y media escriben ProductEvent y ProductOutbox en la misma transacción. La carrera de SKU demostró un solo evento para el único aggregate confirmado. La integración externa/UMI no se certifica.

## Audit

ProductEvent conserva tenant, actor, aggregate, tipo, payload mínimo y timestamp. Correlation ID no se persiste actualmente en ProductEvent: observación alineada con Audit Denials parcial de Part 1A.

## OpenAPI

144 operaciones válidas. `CreateProduct` referencia `OperationalProductType` (PHYSICAL/SERVICE); Product conserva el enum persistente completo para lectura histórica. Campos tenant/actor/timestamps no son writeable.

## SDK

SDK regenerado desde el contrato y drift check requerido en gate final.

## Web Admin

Create/edit/media/detail se ejecutaron en Chromium. Se corrigió CORS para los headers contractuales y se consumen las respuestas mutativas antes de cambiar estado/navegar, eliminando `net::ERR_ABORTED`. La UI no muestra éxito cuando la API falla. Console y Network finales limpias.

## Import/Export

NOT IMPLEMENTED.

## Historical Compatibility

Archive es soft-delete; IDs y filas permanecen. Relaciones de Inventory/Sales usan RESTRICT. No se modificaron snapshots financieros.

## Migrations and Seeds

Las 40 migraciones se aplicaron correctamente al entorno seeded. Product tables usan FORCE RLS. Seed y rollback transaccional dirigido pasan. No se ejecutó una restauración desde un backup productivo real.

## Concurrency

Probadas: duplicate SKU, duplicate barcode, canonical variant duplicate y stale update. Resultado determinista 201/409, sin duplicados, sin evento extra y sin lost update. Category move, bundle composition y branch availability no existen.

## Vulnerabilidades o defectos encontrados

1. Category cross-tenant/missing aceptada al crear Product.
2. Barcode/Price/Media podían referenciar variante de otro Product dentro del tenant.
3. Tipos solo-enum eran aceptados como si fueran funcionales.
4. Nombre con espacios era aceptado.
5. Tipo podía cambiar sin validar compatibilidad.
6. Transiciones de lifecycle no utilizaban la matriz de dominio.
7. CORS omitía idempotency-key/if-match y bloqueaba Web Admin.
8. Respuestas mutativas no consumidas aparecían como ERR_ABORTED al navegar.
9. Fixture UI esperaba feedback inline obsoleto y barcode E2E era reutilizado.

## Correcciones aplicadas

Validación transaccional, FKs compuestas, tipo inmutable, tipos operativos explícitos, nombres no blank, lifecycle validado, contrato OpenAPI corregido, CORS exacto ampliado a headers contractuales y sincronización Web/tests corregida.

## Riesgos restantes

Idempotencia de Create sin SKU; pagination/filtros; branch availability; channel visibility; UoM formal; audit correlation; aggregates Bundle/Kit/etc.; matriz Media completa y Pricing/Tax permanecen para partes posteriores.

## Tests ejecutados

Product unit; Product/Catalog/RLS API; structural certification; concurrency; Product Web create/edit/media/detail; authorization regression; seed rollback; OpenAPI; SDK; builds y `pnpm check`.

## Tests no ejecutados

Capacidades NOT IMPLEMENTED no recibieron pruebas funcionales artificiales. No se ejecutaron import/export, bundle/kit cycles, branch availability, channels ni backup migration. Media A/B completa pasa a Parte 2.

## Quality Gates

- E2E dirigido completo: 21/21 PASS, sin retries.
- Smoke estructural sobre artefacto final: 8/8 PASS.
- `pnpm check`: PASS; 29/29 tareas globales.
- OpenAPI: 144 operaciones válidas; compatibility 3.0.0 PASS.
- SDK drift: PASS.
- API/Web production build y health: PASS.
- API image: `sha256:c0fd8a8e2aea6cb4d3ba3c2a4de2d09f58bc3c12681c3f2c0855192ec7d387b4`.
- Web image: `sha256:614349fdbdf481f9414777bae8acf47d4816266d05c51f125ae6d24f6bde92a9`.

## Evidencia

- `tests/e2e/product-catalog-integrity-certification.spec.ts`
- `tests/e2e/product.spec.ts`
- `tests/e2e/product-editing.spec.ts`
- migración `20260721203000_product_catalog_referential_integrity`
- digest de contenedores y health checks del cierre.

## Archivos modificados

Product domain/service/repository/DTO, Prisma schema+migration, API CORS, Web Product flow, OpenAPI/SDK, fixtures/tests y este reporte.

## Observaciones para Parte 2 de 5

Certificar Media A/B, signed URL/object ownership, MIME/magic bytes, Pricing y Tax references. Mantener regresión de los constraints compuestos, tipos operativos, RLS, CORS y Web mutation response consumption.
