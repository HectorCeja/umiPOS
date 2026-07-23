# NEXO → UMI Portability & Consolidation Assessment

Fecha de corte: 2026-07-23.

## 0. Executive Assessment

El portado es viable. La reutilización directa de código es moderada. La reutilización de diseño, invariantes y pruebas es alta.

NEXO aporta cuatro activos principales:

1. Reglas financieras exactas.
2. Diseño transaccional de Inventory y Physical Cash.
3. Flutter POS con SQLite y recovery.
4. Una base amplia de pruebas y certificación.

NEXO no debe conservar autoridad independiente. UMI será el único escritor de órdenes, pagos, caja, inventario y recibos. Flutter será un cliente enrolado.

El primer portado debe ser pequeño. Debe cubrir entitlement, device bootstrap, catálogo de lectura y una orden idempotente. Debe producir una proyección KDS.

Inventory avanzado, loyalty, gift cards, media avanzada y analytics amplios deben ir después. Estas capacidades necesitan decisiones de producto o modelos UMI estables.

Hay dos bloqueos absolutos:

- NEXO no tiene una procedencia Git reproducible.
- UMI no tiene una línea base de datos única para el destino.

UMI usa `core/ops/...` en el runtime actual. Los documentos `build-v3` usan `umi/tenant/runtime`. El owner debe seleccionar un solo modelo antes de crear tablas POS.

## 1. Scope and Method

Este assessment inspeccionó NEXO y UMI. Usó código, SQL, contratos, tests, Git y documentos.

No se modificó código. No se ejecutó una migración. No se instaló una dependencia. No se modificó una base de datos.

Las referencias siguientes no estaban disponibles:

- `UMIPOS_RESOLUCION_ARQUITECTURA.md`.
- `nexo/docs/UMI_NEXO_PLATFORM_CONSOLIDATION_STRATEGY.md`.

La resolución del usuario fue la autoridad para el destino.

## 2. Architecture Resolution

La resolución fija esta estructura:

```text
UMI PostgreSQL
  |
apps/umi-api
  |- modules/pos
  |- Orders
  |- Payments / Refunds
  |- Kitchen / KDS
  |- Loyalty
  |- Device
  |- Queue / Outbox
  `- @umi/contract

Clients
  |- Flutter POS
  |- KDS
  `- Dashboard
```

No habrá un backend NEXO peer. No habrá dual-write. No habrá un bus entre plataformas.

## 3. Repository Readiness

### NEXO Provenance Gate

Estado: `BLOCKED`.

NEXO tiene:

- 0 commits.
- `HEAD` no resoluble.
- Workspace completo sin rastrear.
- Sin remote.
- Sin baseline.
- Sin rollback Git.

El gate requiere:

1. Un snapshot completo.
2. Un SHA-256 por archivo.
3. Un secret scan.
4. Un inventario de archivos generados e ignorables.
5. Inventarios de dependencias, migraciones, tests, contratos y Flutter.
6. Baselines de build, test, Docker y certificación.
7. Un reporte de licencias.
8. Una declaración de autoría e IA.
9. Un primer commit inmutable.
10. Un tag, por ejemplo `nexo-pre-consolidation-baseline`.
11. Un remote y branch protection.
12. Un backup del snapshot original.

Criterio de cierre: un commit y un tag identifican exactamente el código evaluado.

Regla: `NO PORT CODE` hasta cerrar este gate.

## 4. UMI Preconditions

| Gate                  | Estado                               | Riesgo                      | Clasificación           | Criterio                        |
| --------------------- | ------------------------------------ | --------------------------- | ----------------------- | ------------------------------- |
| Línea base UMI        | Dos modelos candidatos               | Portado a dos arquitecturas | BLOCKS ALL PORTING      | Un branch y un modelo aprobados |
| Backup/restore        | No verificado                        | Pérdida financiera          | BLOCKS FINANCIAL WRITES | Restore reproducible            |
| Migraciones           | Supabase + SQL local + Sqitch futuro | Orden no determinista       | BLOCKS NEW TABLES       | Una cadena versionada           |
| RLS CI                | Hay SQL y tests parciales            | Fuga tenant                 | BLOCKS TENANT TABLES    | Harness en CI real              |
| NEXO Git              | Abierto                              | Fuente no reproducible      | BLOCKS CODE PORT        | Gate de §3                      |
| POS contract          | `pos` key existe; rutas no           | Cliente sin frontera        | BLOCKS POS WRITES       | Schemas y rutas versionados     |
| Entorno no productivo | No verificado                        | Ensayo en producción        | BLOCKS PILOT            | API+DB aisladas                 |
| Operations            | Rollback/alerts incompletos          | Cutover inseguro            | BLOCKS CUTOVER          | Runbook y rollback probado      |

`build-v3` no debe recibir portado en paralelo con `core/ops`. El owner debe elegir una línea.

## 5. Target Architecture

UMI ya tiene:

- `AuthGuard`.
- `TenantAccessGuard`.
- `EntitlementGuard`.
- `RolesGuard`.
- `PRODUCT_KEYS`, con `pos`.
- KDS pairing.
- BullMQ.
- Outbox relay.
- Dead-letter service.
- Orders y catálogo en código y SQL.
- Loyalty y wallet.

UMI no tiene `apps/umi-api/src/modules/pos/`. Tampoco tiene schemas o rutas POS actuales en `@umi/contract`.

Owners candidatos:

| Capacidad                                     | Owner candidato                      |
| --------------------------------------------- | ------------------------------------ |
| Identity, tenant, membership, customer, staff | `core` o el modelo target aprobado   |
| Catalog, orders, payments, refunds            | `ops`                                |
| Inventory y Physical Cash                     | `ops`, con tablas nuevas             |
| Device                                        | `device` o `runtime`, según baseline |
| KDS                                           | `kitchen`                            |
| Loyalty                                       | `loyalty`                            |
| Jobs                                          | `queue`                              |
| Contract                                      | `@umi/contract`                      |

No se recomienda un schema `pos` por defecto. `pos` es un módulo de API, no un owner genérico de tablas.

## 6. Source-to-Target Matrix

| NEXO                       | Responsabilidad actual | UMI owner         | Disposición        | Complejidad | Riesgo             | Evidencia de aceptación |
| -------------------------- | ---------------------- | ----------------- | ------------------ | ----------- | ------------------ | ----------------------- |
| Identity/User/Session      | Identidad propia       | core/auth         | RETIRE             | M           | duplicación        | UMI auth tests          |
| Organization/Tenant        | Tenant propio          | core              | RETIRE             | M           | ID mismatch        | tenant binding          |
| Branch                     | Scope operativo        | location/branch   | ADAPT              | M           | scope mismatch     | location isolation      |
| Membership/Role/Permission | RBAC propio            | core guards       | RETIRE             | M           | privilege drift    | guard matrix            |
| Employee                   | Actor/cashier          | staff             | ADAPT              | M           | actor mismatch     | audit actor             |
| Customer                   | referencia propia      | customer/contact  | RETIRE             | M           | duplicate customer | Customer 360            |
| Product/Category           | catálogo               | ops               | PORT DOMAIN DESIGN | L           | semantic gap       | catalog parity          |
| Pricing                    | precios y snapshots    | ops               | PORT DOMAIN DESIGN | L           | history drift      | exact snapshot          |
| Media                      | objetos                | undecided         | DEFER              | M           | MinIO dependency   | media decision          |
| Inventory                  | ledger y stock         | ops               | PORT DOMAIN DESIGN | XXL         | overselling        | ledger reconciliation   |
| Reservation                | stock hold             | ops               | PORT DOMAIN DESIGN | XL          | race               | last-stock test         |
| Transfer/Count             | operaciones            | ops               | PORT DOMAIN DESIGN | XL          | lost update        | concurrency tests       |
| Costing                    | FIFO/average           | ops               | DEFER              | XL          | valuation          | costing parity          |
| Sales/Checkout             | aggregate              | ops orders        | PORT DOMAIN DESIGN | XL          | state mismatch     | order E2E               |
| Totals/Money               | exact math             | pure library      | REUSE WITH WRAPPER | M           | rounding           | vector tests            |
| Payments                   | allocations            | ops               | PORT DOMAIN DESIGN | XL          | double payment     | concurrency             |
| Attempts                   | outcome recovery       | ops               | PORT DATA MODEL    | L           | unknown outcome    | query-only recovery     |
| Refunds                    | compensation           | ops               | PORT DOMAIN DESIGN | XL          | over-refund        | refund races            |
| Cash Session/Movements     | caja física            | ops               | PORT DOMAIN DESIGN | XL          | wallet collision   | cash reconciliation     |
| Receipts                   | immutable snapshot     | ops               | PORT DOMAIN DESIGN | L           | duplicate folio    | receipt uniqueness      |
| Printing                   | device output          | Flutter           | ADAPT              | M           | hardware           | print acceptance        |
| Devices                    | enrollment             | device            | ADAPT              | L           | token theft        | revoke test             |
| Offline Queue              | local intent           | Flutter           | REUSE WITH WRAPPER | M           | double writer      | recovery E2E            |
| Reports                    | metrics                | umi-api/dashboard | PORT DOMAIN DESIGN | L           | metric drift       | SQL reconciliation      |
| Events/Outbox              | async effects          | queue/domain      | ADAPT              | L           | duplicate job      | worker recovery         |
| Quarantine                 | terminal jobs          | queue             | ADAPT              | M           | silent loss        | DLQ test                |
| Audit                      | actor history          | domain audit      | ADAPT              | M           | missing evidence   | audit completeness      |
| Observability              | OTEL/logs              | shared            | ADAPT              | M           | blind operations   | trace/log test          |
| OpenAPI/SDK                | NEXO contract          | `@umi/contract`   | RETIRE             | L           | contract churn     | contract CI             |
| Flutter POS                | client                 | Flutter           | ADAPT              | XL          | cutover regression | full E2E                |
| NEXO Web Admin             | operations UI          | Dashboard         | RETIRE             | L           | missing screen     | dashboard acceptance    |

El artefacto `domain-inventory.json` contiene 37 disposiciones.

## 7. Duplicate Authority Elimination

No se portarán como autoridades:

- User.
- Session.
- Organization/Tenant.
- Branch.
- Membership.
- Employee identity.
- Customer.
- Role.
- Permission.
- Entitlement.

Flutter usará IDs UMI. El payload no elegirá el tenant. El guard resolverá el tenant.

No se justifica un `legacyId` permanente. NEXO no tiene una población productiva verificada.

El trabajo probable es un portado de diseño, código y tests. Los seeds y datos de certificación se descartan.

## 8. Identity, Tenancy and Entitlements

El flujo target es:

1. Flutter obtiene una credencial de dispositivo.
2. UMI valida el dispositivo.
3. UMI resuelve tenant y location.
4. UMI valida el entitlement `pos`.
5. UMI devuelve capacidades.
6. UMI registra actor, device, tenant y location.

`pos` ya está en `PRODUCT_KEYS`. Falta completar:

- El catálogo comercial y los grants.
- Routes y schemas POS.
- Device kind y binding.
- Rotación y revocación.
- Dashboard controls.
- Seeds target.
- Tests de spoofing y branch switch.

## 9. Product and Catalog

Fase 1 debe incluir solo productos necesarios para el primer giro.

| Tipo NEXO                   | Disposición                       |
| --------------------------- | --------------------------------- |
| Producto físico o de menú   | Phase 1                           |
| Servicio                    | Later o Phase 1 según giro        |
| Categoría                   | Phase 1                           |
| Barcode                     | Later, salvo hardware obligatorio |
| Variantes/modifiers básicos | Phase 1 para alimentos            |
| Media avanzada              | Later                             |
| Bundles                     | Later                             |
| Gift Card product           | Decision Required                 |

La categoría mutable no debe definir analytics históricos. El order item debe guardar el snapshot.

Catalog define el producto y el precio. Inventory define la disponibilidad física.

## 10. Pricing, Totals and Money

NEXO usa minor units y evita `float`. UMI debe conservar esta regla.

Catálogo de invariantes:

- Money never uses floating point.
- Server totals are authoritative.
- Client totals are advisory.
- Historical snapshots are immutable.
- Refunds never exceed captured value.
- Allocations never exceed the order total.
- Rounding uses one approved rule.

La lógica pura puede reutilizarse con wrapper. Los repositories Prisma no pueden reutilizarse.

Decisiones pendientes:

- HALF_UP u otra política.
- Tax.
- Tips.
- Discounts.
- Manual price.
- Branch pricing.
- Bundles.

Paridad requiere vectores de dinero, SQL constraints y E2E contra UMI.

## 11. Inventory

Inventory aporta el mayor valor técnico y el mayor riesgo.

Se deben portar estas intenciones:

- Ledger append-only.
- On hand, available, reserved y committed.
- In transit, damaged y quarantine.
- Reservations.
- Transfers.
- Counts.
- Returns y compensations.
- Last-stock locking.
- Idempotency.
- Location isolation.
- Cost layers cuando entren en alcance.

Ruta conceptual:

```text
NEXO Prisma design
  -> UMI canonical PostgreSQL DDL
  -> UMI raw SQL repositories
  -> UMI RLS
  -> @umi/contract
  -> Flutter behavior
```

No se copiará el schema Prisma. `tenant` se mapeará a tenant/business UMI. `branch` se mapeará a location/branch UMI.

El destino inicial recomendado es `ops`. Un schema nuevo requiere una decisión explícita.

## 12. Sales, Orders and Checkout

Sale y Order se parecen. No son idénticos.

| NEXO Sale          | UMI Order candidato | Nota                     |
| ------------------ | ------------------- | ------------------------ |
| DRAFT              | draft/open          | decisión de nombre       |
| CHECKED_OUT        | placed/pending      | separar quote y commit   |
| COMPLETED          | completed           | payment policy requerida |
| CANCELLED          | cancelled/canceled  | normalizar spelling      |
| PARTIALLY_REFUNDED | derivado            | no requiere estado base  |
| REFUNDED           | refunded o derivado | decisión                 |

`SaleItem` se convierte en un snapshot de `OrderItem`. `Actor` se convierte en principal/staff. `Branch` se convierte en location.

La transacción inicial debe escribir:

- Order.
- Order items.
- Opening order event.
- Idempotency result.

KDS, Receipt, Loyalty, Reports y recovery leerán la misma orden UMI.

## 13. Payments and Refunds

UMI debe tratar un pago externo como acknowledgement. No debe declarar captura provider.

Invariantes:

- Payments ≤ Order total.
- Refunds ≤ Captured value.
- Wallet debit uses the current authoritative balance.
- Cash ledger receives only physical cash.
- Compensation is append-only.
- Financial totals cannot be negative.
- One key creates one logical operation.

Mixed payment debe ser atómico dentro de una sola base. Wallet, cash y external allocations deben usar una transacción.

Los tests NEXO de idempotencia, mixed payment y refund races deben portar su intención.

## 14. Physical Cash

Physical Cash no es Loyalty Wallet.

El owner target debe cubrir:

- Session open.
- Opening amount.
- Cash in/out.
- Sale/refund posting.
- Expected cash.
- Counted cash.
- Variance.
- Close.
- Pending posting guard.
- Double-close protection.
- Location and actor audit.

No se debe reactivar `umi-cash` automáticamente. Se pueden reutilizar utilidades seleccionadas después de una revisión.

## 15. Receipts and Printing

Hay tres objetos distintos:

1. Receipt business record.
2. Printed representation.
3. Fiscal document.

UMI persistirá el receipt business record. Debe ser inmutable y único por orden.

Flutter puede conservar cache, renderer y adapter de impresión. El owner debe elegir hardware, PDF y reprint audit.

CFDI no forma parte del receipt común.

## 16. Device and Offline

El pairing KDS es una base útil. POS necesita más controles:

- Expiration.
- Rotation.
- Revocation.
- Location binding.
- Capabilities.
- Audit.

Flutter puede conservar SQLite, drafts, caches y checkpoints. Debe cambiar el API client y los DTOs.

Regla: la cola local guarda una intención no confirmada. No guarda la autoridad financiera.

Offline financial execution permanece bloqueado.

## 17. Contract Consolidation

La autoridad final será:

```text
@umi/contract
  -> umi-contract-<semver>.json
  -> Dart codegen
```

El contrato NEXO dejará de ser autoridad. Los DTOs Dart manuales deben retirarse por etapas.

Operaciones mínimas:

| Operación                      | Estado              |
| ------------------------------ | ------------------- |
| Device pair/bootstrap          | REQUIRED            |
| Capabilities                   | REQUIRED            |
| Catalog list/detail            | REQUIRED            |
| Create/Get order               | REQUIRED            |
| Payment acknowledgement/result | REQUIRED            |
| Get receipt                    | REQUIRED            |
| Recovery status                | REQUIRED            |
| Update draft order             | DECISION REQUIRED   |
| Checkout quote                 | DECISION REQUIRED   |
| Refund                         | DEFER al primer MVP |

El contrato debe incluir idempotency y correlation metadata. UMI resolverá tenant y location.

## 18. KDS Integration

Una orden POS debe crear una proyección Kitchen en UMI. No debe usar webhook entre repositorios.

La misma transacción debe registrar Order y su evento inicial. Un job local puede materializar la proyección si la entrega es idempotente.

Prueba clave:

1. Flutter crea una orden.
2. UMI confirma el commit.
3. KDS ve un ticket.
4. El ticket tiene tenant y location correctos.
5. Un retry no crea otro ticket.

## 19. Loyalty and Customer 360

POS no creará Customer. UMI asociará la orden con Customer/Contact.

Flutter no almacenará un balance autoritativo. Wallet spend debe bloquear un gasto concurrente.

La transacción puede incluir:

- Order.
- Payment allocation.
- Wallet debit.
- Order event.
- Receipt snapshot.

Points earning puede ser un job posterior. Un efecto externo real puede usar compensación.

Políticas de wallet, gift card y mixed refund siguen abiertas.

## 20. Events, Queues and Jobs

Se deben separar cinco conceptos:

- Domain event.
- Outbox event.
- BullMQ job.
- Audit event.
- Kitchen event.

El monolito puede usar llamadas internas dentro de una transacción. Debe usar jobs para efectos asíncronos reales.

Los publishers NEXO y el sink UMI se retirarán. No habrá bus entre repositorios.

## 21. Reports and Analytics

`umi-api` calculará métricas. Dashboard consumirá el contrato.

Las métricas prioritarias son:

- Gross, refunds y net revenue.
- Sales count y average ticket.
- Payments by method.
- Physical cash net.
- Inventory valuation después de Inventory.
- Tenant/location time series.

Flutter no debe recalcular analytics. Category analytics requiere un snapshot histórico válido.

## 22. Security and RLS

UMI tiene una guard chain correcta. Debe extenderse al device principal.

Cada tabla POS tenant-bound debe tener:

- Tenant/business key.
- Location/branch key cuando aplique.
- FK tenant-bound.
- RLS.
- FORCE RLS.
- Runtime grants.
- Worker policy.
- Audit fields.

El worker UMI puede usar BYPASSRLS. Esto es más riesgoso que el worker NEXO. Cada query worker debe incluir un tenant explícito.

Cross-tenant debe devolver 404 cuando corresponda. UMI debe ignorar un actor enviado por el cliente.

## 23. Observability

P0 antes del cutover financiero:

- Request ID.
- Correlation ID.
- Tenant.
- Location.
- Actor/device.
- Operation.
- Duration.
- Outcome.
- Error category.
- Secret redaction.
- Health/readiness.
- Worker heartbeat.
- Queue and dead-letter counts.

P1 incluye OpenTelemetry y métricas de replay. P2 incluye SLOs y alertas formales.

OTel no debe bloquear el primer writer. La trazabilidad mínima sí es obligatoria.

## 24. Test Portability

| Intención                        | Disposición                            |
| -------------------------------- | -------------------------------------- |
| Pure money/state tests           | REUSE AS-IS después de revisar imports |
| Flutter visual tests             | REUSE AS-IS                            |
| Catalog/cart fixtures            | REUSE FIXTURES                         |
| Financial/Inventory/RLS/recovery | PORT TEST INTENT                       |
| Prisma repository tests          | REWRITE                                |
| NEXO API E2E                     | REWRITE contra UMI                     |
| NEXO SDK drift                   | RETIRE                                 |
| NEXO Docker topology             | RETIRE o REWRITE para UMI              |
| Identity ownership tests         | RETIRE                                 |

Las pruebas críticas son last stock, double payment, over-refund, cash reconciliation, receipt uniqueness y isolation.

## 25. Certification Preservation

Una capacidad no está portada cuando el código compila. Está portada cuando sus garantías pasan contra UMI.

| Garantía                  | Owner UMI     | Target test        |
| ------------------------- | ------------- | ------------------ |
| Exact money/totals        | POS/orders    | vector + E2E       |
| Idempotent order          | POS/orders    | replay/concurrency |
| No overselling            | Inventory     | last-stock         |
| Append-only Inventory     | Inventory     | SQL trigger/RLS    |
| Payment ≤ order           | Payments      | SQL + concurrency  |
| No double payment         | Payments      | duplicate key      |
| Exact cash                | Physical Cash | ledger reconcile   |
| Refund ≤ captured         | Refunds       | concurrent refund  |
| Receipt uniqueness        | Receipts      | create/retry       |
| Query-only recovery       | Payments      | timeout outcome    |
| FORCE RLS                 | Database      | role SQL           |
| Tenant/location isolation | Guards/DB     | adversarial E2E    |
| Analytics reconciliation  | Reports       | SQL oracle         |
| Flutter fail-closed       | Flutter       | offline test       |
| Worker recovery           | Queue         | crash/retry        |

El catálogo completo tiene 21 garantías en `preservation-invariants.json`.

## 26. Data Migration Reality

No existe evidencia de datos productivos NEXO.

Clasificación probable:

- DESIGN PORT.
- CODE PORT.
- TEST PORT.
- DEVELOPMENT DATA DISCARD.
- SELECTIVE REFERENCE DATA PORT.

No deben migrarse:

- Seed users.
- Seed organizations y branches.
- Certification sales/payments.
- Inventory fixtures.
- Quarantine probes.

Tax rules, receipt templates y device capabilities requieren revisión owner. Solo se portarán si son decisiones reales.

## 27. Prisma to Raw SQL

Se pueden portar:

- Unique y check constraints.
- Row locks.
- Append-only triggers.
- RLS intent.
- Idempotency records.
- FIFO algorithms.
- Analytics CTE intent.

Se deben reimplementar:

- Prisma repositories.
- Prisma transactions.
- Prisma error mapping.
- Generated client usage.

Riesgos:

- Enum mismatch.
- Null semantics.
- Timestamp defaults.
- BigInt/minor units.
- Scaled quantity.
- Cascades.
- Transaction boundaries.
- ID generation.
- Migration order.

Nunca se debe traducir Prisma tabla por tabla.

## 28. Flutter Cutover

| Capa                     | Cambio               |
| ------------------------ | -------------------- |
| Visual UI/design system  | Unchanged            |
| Navigation               | Small adaptation     |
| SQLite/cache/drafts      | Small adaptation     |
| Device/auth/bootstrap    | Contract replacement |
| Catalog/cart             | Small adaptation     |
| Checkout/payment/receipt | Contract replacement |
| Recovery                 | Major adaptation     |
| Printing                 | Decision required    |

Etapas:

1. Añadir una interfaz temporal `PosBackend`.
2. Implementar `UmiPosClient`.
3. Cambiar bootstrap a UMI.
4. Cambiar catálogo.
5. Cambiar Order.
6. Cambiar Payments/Receipts.
7. Cambiar Cash/Refunds/Inventory.
8. Retirar `NexoClient`.

Cada build tendrá un solo backend writer. No habrá fallback financiero.

## 29. Deployment Consolidation

| NEXO infra    | UMI equivalent        | Destino                    |
| ------------- | --------------------- | -------------------------- |
| API           | umi-api               | RETIRE después del cutover |
| Worker        | umi-worker            | MERGE                      |
| PostgreSQL    | UMI PostgreSQL        | RETIRE NEXO                |
| Redis         | UMI Redis             | MERGE                      |
| MinIO         | Sin decisión          | DEFER                      |
| OTEL config   | UMI observability     | ADAPT                      |
| Migrate image | UMI migration tooling | RETIRE                     |
| Web Admin     | Dashboard             | RETIRE                     |
| Flutter       | Cliente UMI           | KEEP/ADAPT                 |

Ninguna pieza debe sobrevivir solo porque existe.

## 30. MVP Options

### MVP MINIMAL

Incluye entitlement, pairing, bootstrap, catalog read, order create, idempotency, RLS y KDS ticket.

Excluye Payment, Cash, Refund, Inventory y printing.

Riesgo: prueba arquitectura, pero no completa una venta financiera.

Esfuerzo: L.

### MVP SELLABLE

Añade exact totals, cash acknowledgement, receipt, basic Physical Cash, audit y dashboard básico.

Excluye Inventory avanzado, Loyalty avanzada, provider payments y CFDI.

Riesgo: requiere decisiones de caja, impuestos y receipt.

Esfuerzo: XL.

### MVP FULL COMMERCE

Añade Inventory, mixed payments, refunds, loyalty/wallet, analytics y printing.

Riesgo: alcance XXL. No es un primer incremento seguro.

Esfuerzo: XXL.

El owner debe elegir el producto. Este assessment recomienda usar MVP MINIMAL como prueba técnica y MVP SELLABLE como primer objetivo comercial.

## 31. Phased Roadmap

| Fase | Objetivo             | Dependencias                      | Exit gate              | Esfuerzo |
| ---- | -------------------- | --------------------------------- | ---------------------- | -------- |
| 0    | Provenance           | ninguna                           | NEXO commit/tag        | M        |
| 1    | UMI safety           | baseline, backup, migrations, RLS | restore + CI           | L        |
| 2    | Entitlement/contract | 1                                 | POS schemas/routes     | M        |
| 3    | Device/bootstrap     | 2                                 | revoke/location tests  | L        |
| 4    | Catalog/pricing read | 2-3                               | snapshot parity        | L        |
| 5    | Orders/checkout      | 4                                 | idempotent order + KDS | XL       |
| 6    | Payments/receipts    | 5                                 | no double pay/receipt  | XL       |
| 7    | Physical Cash        | 6                                 | cash reconciliation    | XL       |
| 8    | Kitchen projection   | 5                                 | one KDS ticket         | L        |
| 9    | Loyalty/Customer 360 | 6                                 | wallet concurrency     | XL       |
| 10   | Inventory foundation | 5                                 | no overselling         | XL       |
| 11   | Inventory advanced   | 10                                | ledger/count/transfer  | XXL      |
| 12   | Refunds              | 6,7,10                            | no over-refund         | XL       |
| 13   | Analytics            | 6-12                              | SQL reconciliation     | L        |
| 14   | Flutter cutover      | 3-13                              | one writer build       | XL       |
| 15   | NEXO retirement      | 14                                | rollback window closed | M        |

Rollback usa flags, contract version, additive SQL, backup y client build selection. No usa dual-write.

## 32. Effort Estimates

Escala relativa: XS, S, M, L, XL, XXL.

Critical path:

`Provenance → UMI baseline → backup/migrations/RLS → contract → device → order writer → totals → payment/receipt → Flutter`.

Inventory avanzado es XXL. Orders, payments, cash, loyalty, refunds y Flutter son XL.

Confianza: LOW a MEDIUM. Tax, tips, refunds, hardware y baseline UMI bloquean una estimación más precisa.

Trabajo paralelo:

- Flutter UI adapter.
- Test-intent catalog.
- Observability baseline.
- Dashboard read surfaces.

## 33. Risk Register

| Riesgo                       | Prob.   | Impacto | Severidad | Mitigación                   | Fase | Blocker |
| ---------------------------- | ------- | ------- | --------- | ---------------------------- | ---- | ------- |
| NEXO sin Git                 | Alta    | Crítico | Crítica   | Provenance gate              | 0    | Sí      |
| Backup UMI incompleto        | Media   | Crítico | Crítica   | Restore drill                | 1    | Sí      |
| Migration tooling dividido   | Alta    | Alto    | Crítica   | Una cadena                   | 1    | Sí      |
| build-v3 divergence          | Alta    | Crítico | Crítica   | Seleccionar baseline         | 1    | Sí      |
| Sale/Order mismatch          | Alta    | Alto    | Alta      | State decision record        | 5    | Sí      |
| Tenant/Organization mismatch | Media   | Alto    | Alta      | ID map sin legacy permanente | 1    | Sí      |
| Branch/Location mismatch     | Alta    | Alto    | Alta      | location contract            | 3    | Sí      |
| RLS translation              | Media   | Crítico | Crítica   | FORCE RLS harness            | 1    | Sí      |
| Prisma→SQL error             | Media   | Alto    | Alta      | constraint review            | 5+   | No      |
| Financial regression         | Media   | Crítico | Crítica   | invariant tests              | 5+   | Sí      |
| Inventory complexity         | Alta    | Alto    | Alta      | phases 10-11                 | 10   | No      |
| Flutter churn                | Alta    | Medio   | Alta      | adapter stages               | 2-14 | No      |
| Offline recovery regression  | Media   | Crítico | Crítica   | query-only tests             | 6    | Sí      |
| KDS duplicate                | Media   | Alto    | Alta      | idempotent projection        | 5/8  | Sí      |
| Loyalty atomicity            | Media   | Crítico | Crítica   | one DB transaction           | 9    | Sí      |
| Cash naming collision        | Alta    | Alto    | Alta      | Physical Cash name           | 7    | Sí      |
| Test rewrite cost            | Alta    | Medio   | Alta      | port intent first            | all  | No      |
| Certification evidence loss  | Media   | Alto    | Alta      | archive artifacts            | 0/15 | Sí      |
| Deployment regression        | Media   | Alto    | Alta      | staged rollback              | 14   | Sí      |
| Team capacity                | UNKNOWN | Alto    | UNKNOWN   | owner assignment             | all  | No      |
| Scope creep                  | Alta    | Alto    | Alta      | MVP gates                    | all  | Sí      |
| Premature NEXO shutdown      | Media   | Crítico | Crítica   | retirement criteria          | 15   | Sí      |

## 34. Rollback Strategy

Cada fase usa:

- Feature flags.
- Endpoint enablement.
- Contract versions.
- Additive migrations.
- Backward-compatible reads.
- Backup restore.
- Deployment rollback.
- Flutter release rollback.

Antes del financial cutover, solo un backend puede escribir. UMI puede usar certification tenants aislados.

Abortar una fase si ocurre:

- RLS failure.
- Money mismatch.
- Inventory mismatch.
- KDS duplicate.
- Idempotency failure.
- Receipt duplicate.
- Wallet inconsistency.
- Restore failure.

No ejecutar rollback destructivo sin backup.

## 35. NEXO Retirement

| Pieza                 | Estado durante portado | Estado final        |
| --------------------- | ---------------------- | ------------------- |
| Backend/DB/Worker/Web | PORT SOURCE            | RETIRED             |
| OpenAPI/SDK           | REFERENCE ONLY         | ARCHIVED            |
| Flutter               | ACTIVE SOURCE          | UMI CLIENT          |
| Docs/tests/artifacts  | REFERENCE ONLY         | ARCHIVED permanente |
| Domain design         | PORT SOURCE            | REFERENCE ONLY      |

No se recomienda un borrado inmediato.

Retirement requiere:

- Domains required ported.
- Flutter cutover.
- UMI acceptance PASS.
- Financial and Inventory reconciliation.
- RLS and KDS PASS.
- Rollback window closed.
- Docs and artifacts preserved.
- NEXO baseline tagged.

## 36. Acceptance Test Catalog

| Test                     | Fase  | Resultado            | Automatización | Severidad |
| ------------------------ | ----- | -------------------- | -------------- | --------- |
| POS entitlement          | 2     | 403 sin grant        | CI E2E         | P0        |
| Secure pairing/revoke    | 3     | token bound/revoked  | CI E2E         | P0        |
| Tenant/location binding  | 3     | no spoof             | SQL+E2E        | P0        |
| Catalog exact            | 4     | contract equals DB   | integration    | P1        |
| Authoritative totals     | 5     | client cannot forge  | unit+E2E       | P0        |
| Order idempotency        | 5     | one order            | concurrency    | P0        |
| KDS ticket unique        | 5/8   | one ticket           | integration    | P0        |
| No duplicate payment     | 6     | one allocation       | concurrency    | P0        |
| Receipt uniqueness       | 6     | one receipt/folio    | concurrency    | P0        |
| Physical Cash exact      | 7     | variance exact       | SQL+E2E        | P0        |
| Wallet authority         | 9     | no stale spend       | concurrency    | P0        |
| No over-refund           | 12    | limit enforced       | concurrency    | P0        |
| No overselling           | 10    | winners=stock        | concurrency    | P0        |
| Inventory ledger exact   | 10-11 | state=ledger         | SQL            | P0        |
| Offline fail-closed      | 6     | no local success     | Flutter        | P0        |
| Query-only recovery      | 6     | no second write      | Flutter+API    | P0        |
| Cross-tenant/location    | all   | zero leaks           | SQL+E2E        | P0        |
| Worker recovery/DLQ      | 8+    | no loss/duplicate    | integration    | P1        |
| Analytics reconciliation | 13    | difference zero      | SQL oracle     | P1        |
| Backup restore           | 1     | verified restore     | operations     | P0        |
| Migration reproducible   | 1     | clean replay         | CI             | P0        |
| Deployment rollback      | 14    | prior build recovers | operations     | P0        |
| Flutter logout cleanup   | 3/14  | no tenant residue    | Flutter        | P0        |

## 37. Owner Decisions

Hay 26 decisiones en `questions-for-owners.json`.

Las más urgentes son:

1. ¿Cuál branch y modelo UMI es la línea base?
2. ¿Inventory entra en MVP?
3. ¿Qué giro se atiende primero?
4. ¿Qué métodos de pago existen?
5. ¿External acknowledgement es aceptable?
6. ¿Qué impuestos, tips y descuentos aplican?
7. ¿Qué política de refund aplica?
8. ¿Wallet y Gift Cards entran?
9. ¿Qué receipt y hardware son obligatorios?
10. ¿El POS puede cambiar de location?
11. ¿Quién abre y cierra caja?
12. ¿KDS es obligatorio?
13. ¿Quién crea el baseline Git NEXO?

No se debe usar una suposición insegura para responderlas.

## 38. Recommended Sequence

### IMMEDIATE

1. Preservar este assessment.
2. Asignar owners para los gates.

### BEFORE ANY PORT

3. Crear el baseline Git NEXO.
4. Seleccionar branch y modelo UMI.
5. Probar backup/restore.
6. Fijar migration tooling y RLS CI.

### BEFORE FIRST UMI POS WRITE

7. Completar entitlement y contract seam.
8. Adaptar device pairing.
9. Conectar Flutter bootstrap.
10. Portar catálogo read-only.
11. Implementar Order writer y KDS projection.
12. Portar exact money.

### BEFORE FINANCIAL CUTOVER

13. Implementar payment acknowledgement y receipt.
14. Portar Physical Cash.
15. Probar recovery, RLS y rollback.

### BEFORE CUSTOMER PILOT

16. Elegir Loyalty e Inventory scope.
17. Portar las capacidades elegidas.
18. Ejecutar el catálogo P0.

### BEFORE GENERAL AVAILABILITY

19. Portar refunds y analytics.
20. Completar Flutter cutover.
21. Cerrar la ventana de rollback.
22. Retirar el runtime NEXO.

Inventory se mueve después del primer writer. Esta secuencia reduce el riesgo del MVP.

## 39. Final Recommendation

El portado NEXO→UMI es viable.

Reutilización aproximada por categoría:

| Categoría      | Nivel                                     | Método                      |
| -------------- | ----------------------------------------- | --------------------------- |
| UI Flutter     | HIGH                                      | código y assets             |
| Domain logic   | MODERATE-HIGH                             | reglas puras y diseño       |
| Data model     | MODERATE                                  | intención, no schema físico |
| Tests          | HIGH como intención; MODERATE como código | framework/fixture review    |
| Infrastructure | LOW-MODERATE                              | patrones, no runtime peer   |
| Documentation  | VERY HIGH                                 | invariantes y evidencia     |

Se reimplementarán repositories, guards POS, rutas UMI y SQL target. Se retirarán autoridades Identity/Customer/Tenant NEXO y el runtime NEXO.

El primer entregable de implementación debe ser:

> Un módulo POS mínimo en UMI con entitlement, device principal, contrato versionado y `Create/Get Order` idempotente. La orden debe producir un ticket KDS único.

No debe incluir Payments, Inventory o portado masivo en el primer PR.

El mayor riesgo es portar contra el modelo UMI incorrecto. El segundo riesgo es perder invariantes durante la traducción Prisma→raw SQL.

No se debe:

- Copiar el schema Prisma.
- Crear dual-write.
- Crear un bus entre repositorios.
- Confiar tenant/actor al payload.
- Activar pagos sin backup, RLS e idempotencia.
- Retirar NEXO antes del cutover completo.

## 40. Blockers

Ocho blockers:

1. NEXO provenance.
2. UMI target baseline.
3. Backup/restore.
4. Migration chain.
5. RLS CI harness.
6. POS module and contract absent.
7. Product policies open.
8. Cutover operations incomplete.

## 41. Evidence

La evidencia está en:

`artifacts/architecture/nexo-umi-portability-assessment/`

Contiene los 26 mapas y registros solicitados. Cada archivo usa rutas y estados observados.

## 42. Files Created

Solo se crearon:

- `docs/NEXO_UMI_PORTABILITY_CONSOLIDATION_ASSESSMENT.md`.
- `artifacts/architecture/nexo-umi-portability-assessment/*`.

## 43. Read-Only Confirmation

No se modificó NEXO o UMI. No se ejecutó una migración. No se copió código.

No se inició la implementación. No se creó un contrato. No se creó un remote.
