# NEXO — Documentación maestra

## Prompt 12 — Sales/Cash Administration (amarillo)

- [Sales Administration](SalesAdministration.md), [Overview](SalesOverview.md), [History](SalesHistory.md), [Detail](SaleDetail.md), [Timeline](SaleTimeline.md), [Exceptions](OperationalExceptions.md) y [Diagnostics](SupportDiagnosticBundle.md).
- [Owner Quickstart](OWNER_QUICKSTART.md) y [Manual acceptance](manual-acceptance/README.md) con 156 escenarios.
- No existe POS web; la venta manual permanece deshabilitada. Ver `PROJECT_STATE.md` para evidencia y bloqueadores.

## Prompt 11 — Cash Management (fase abierta)

- [Platform](CashManagementPlatform.md), [Register](CashRegister.md), [Drawer](CashDrawer.md), [Session](CashSession.md), [Lifecycle](CashSessionLifecycle.md) y [Ledger](CashLedger.md)
- [Sales integration](CashSalesIntegration.md), [Counting](CashCounting.md), [Reconciliation](CashReconciliation.md), [Policies](CashPolicies.md), [Approvals](CashApprovals.md) y [Threat Model](CashThreatModel.md)
- [Flutter readiness](FlutterCashClientReadiness.md), [UMI foundation](UmiCashIntegrationFoundation.md), [Testing](CashTesting.md) y ADR-0039–0041
- [Cleanup local/test tenant-scoped](CashTestCleanup.md) — checkpoint 11.2; la fase continúa amarilla.
- [Worker](CashWorker.md), [Outbox operations](CashOutboxOperations.md), [Quarantine](CashQuarantine.md), [Administrative UI](CashAdministrativeUI.md), [Accessibility](CashAccessibility.md) y [Visual regression](CashVisualRegression.md) — evidencia 11.4; gate todavía amarillo.

## Prompt 10 — Product Experience and Design System

- [UX Research](UXResearch.md), [Experience Principles](ProductExperiencePrinciples.md), [Personas](UserPersonas.md), [Information Architecture](InformationArchitecture.md), [Navigation](Navigation.md), [Responsive](ResponsiveStrategy.md) y [Adaptive Layouts](AdaptiveLayouts.md)
- [User Flows](UserFlows.md), [Wireframes](Wireframes.md), [POS Experience](POSExperienceBlueprint.md), [UX Writing](UXWriting.md) y [Security UX](SecurityUX.md)
- [Design Tokens](DesignTokens.md), [Visual Language](VisualLanguage.md), [Design System](DesignSystem.md), [Components](ComponentInventory.md), [Accessibility](AccessibilityExperience.md), [Storybook](StorybookGovernance.md) y [Visual Regression](VisualRegression.md)
- [Flutter parity](FlutterDesignParity.md), [UMI Experience](UmiExperienceIntegrationBlueprint.md), [UX performance](UXPerformanceBudgets.md) y [Roadmap](Roadmap.md)

## Prompt 9 — Sales Platform

- [Sales Platform](SalesPlatform.md), [Checkout Engine](CheckoutEngine.md), [Receipt Model](ReceiptModel.md), [Sales Policies](SalesPolicies.md), [Flutter readiness](FlutterSalesClientReadiness.md) y [UMI foundation](UmiSalesIntegrationFoundation.md)

## Prompt 8 — Inventory Platform

- [Inventory Platform](InventoryPlatform.md), [Stock Ledger](StockLedger.md), [Availability](Availability.md), [Reservations](Reservations.md) y [Cost Engine](CostEngine.md)

## Prompt 7 — Product Platform

- [Product Platform](ProductPlatform.md), [Product Engine](ProductEngine.md), [Product Model](ProductModel.md) y [Variants](Variants.md)
- [Pricing](Pricing.md), [Categories](Categories.md), [Barcodes](Barcodes.md) y [Media](Media.md)
- [Search Architecture](SearchArchitecture.md), [Domain Events](DomainEvents.md), [Outbox](Outbox.md) y [Product Status](ProductStatus.md)

## Prompt 6 — Control Plane

- [Control Plane](ControlPlane.md), [Smart Onboarding](SmartOnboarding.md) y [Business Templates](BusinessTemplates.md)
- [Organization Administration](OrganizationAdministration.md), [Branch Administration](BranchAdministration.md) e [Invitations](Invitations.md)
- [Organization Settings](OrganizationSettings.md), [Feature Management](FeatureManagement.md), [Application Services](ApplicationServices.md) y [Visual Regression](VisualRegression.md)

## Prompt 5 — Authorization Platform

- [Authorization Architecture](AuthorizationArchitecture.md), [Authorization Context](AuthorizationContext.md) y [Permission Engine](PermissionEngine.md)
- [Permission Registry](PermissionRegistry.md), [Permission Matrix](PermissionMatrix.md), [RBAC](RBAC.md) y [ABAC](ABAC.md)
- [Scopes](Scopes.md), [Feature Flags](FeatureFlags.md) y [Authorization Testing](AuthorizationTesting.md)

## Prompt 4.1B — Authentication Platform

- [Authentication Architecture](AuthenticationArchitecture.md), [Session Management](SessionManagement.md) y [Token Lifecycle](TokenLifecycle.md)
- [Threat Model Authentication](ThreatModelAuthentication.md), [CSRF](CSRF.md) y [Security Events](SecurityEvents.md)
- [Identity Provider Decision](IdentityProviderDecision.md), [Contract Testing](ContractTesting.md), [Playwright Guide](PlaywrightGuide.md) y [Performance Budgets](PerformanceBudgets.md)

## Prompt 4.1A — Identity Platform Foundation

- [Identity](Identity.md), [User](User.md) y [User Lifecycle](UserLifecycle.md)
- [Email Identity](EmailIdentity.md), [Password Domain](PasswordDomain.md)
- [Identity Architecture](IdentityArchitecture.md) e [Identity Configuration](IdentityConfiguration.md)
- [Project State](PROJECT_STATE.md), [Phase Report](PHASE_REPORT.md) y [Quality Gate](QUALITY_GATE.md)

## Prompt 3 — núcleo multi-tenant

- [Organization](Organization.md), [Branch](Branch.md) y [Membership](Membership.md)
- [Tenant Context](TenantContext.md) y [Authorization](AuthorizationFoundation.md)
- [RLS](RLS.md), [Security Architecture](SecurityArchitecture.md) y [Threat Model](ThreatModel.md)
- [OpenAPI Contracts](OpenAPIContracts.md), [Phase Report](PHASE_REPORT.md) y [Quality Gate](QUALITY_GATE.md)

**Estado:** Prompt 10 completado y validado  
**Versión documental:** 8.0.0  
**Fecha de corte:** 2026-07-14  
**Mercado inicial:** México  
**Propietarios:** Producto, Arquitectura, UX, Seguridad, Datos, QA y Operaciones

Esta carpeta es la fuente única de verdad para NEXO. Una decisión posterior que contradiga estos documentos requiere actualizar la especificación, su trazabilidad y, cuando corresponda, crear o reemplazar un ADR. Los requisitos usan identificadores estables; no deben renumerarse al eliminarse, sino marcarse como retirados.

## Mapa documental

| Documento                                                      | Contenido normativo                                                      |
| -------------------------------------------------------------- | ------------------------------------------------------------------------ |
| [01-producto.md](01-producto.md)                               | Visión, objetivos, mercado, personas, giros, MVP y métricas              |
| [02-experiencia-y-diseno.md](02-experiencia-y-diseno.md)       | Principios UX, onboarding, responsive, accesibilidad y sistema de diseño |
| [03-requisitos.md](03-requisitos.md)                           | Requisitos funcionales y no funcionales numerados                        |
| [04-arquitectura.md](04-arquitectura.md)                       | Arquitectura general, tecnológica, multi-tenant, offline e integraciones |
| [05-dominio-y-modulos.md](05-dominio-y-modulos.md)             | Modelo conceptual, módulos, responsabilidades y dependencias             |
| [06-seguridad-y-privacidad.md](06-seguridad-y-privacidad.md)   | Modelo de amenazas, OWASP 2025, ASVS 5.0 y privacidad mexicana           |
| [07-calidad-y-convenciones.md](07-calidad-y-convenciones.md)   | Convenciones, estrategia de pruebas y gobierno de calidad                |
| [08-operaciones.md](08-operaciones.md)                         | CI/CD, observabilidad, logging, backups y recuperación                   |
| [09-roadmap-y-aceptacion.md](09-roadmap-y-aceptacion.md)       | Roadmap, criterios de aceptación y salida a producción                   |
| [10-adrs.md](10-adrs.md)                                       | Registro inicial de decisiones arquitectónicas                           |
| [11-glosario.md](11-glosario.md)                               | Lenguaje ubicuo y términos operativos                                    |
| [12-fuentes-y-trazabilidad.md](12-fuentes-y-trazabilidad.md)   | Fuentes oficiales, alternativas y matrices de trazabilidad               |
| [13-foundation-architecture.md](13-foundation-architecture.md) | Workspace, runtime local, comandos, CI y deuda de foundation             |
| [14-dependency-register.md](14-dependency-register.md)         | Justificación de dependencias directas                                   |
| [15-foundation-validation.md](15-foundation-validation.md)     | Evidencia ejecutada y verificaciones bloqueadas por entorno              |
| [PROJECT_STATE.md](PROJECT_STATE.md)                           | Estado recuperable, runtime real, riesgos y siguiente fase               |
| [ControlPlane.md](ControlPlane.md)                             | Límite administrativo, bootstrap y flujo de capas                        |
| [SmartOnboarding.md](SmartOnboarding.md)                       | Flujo reiniciable y aplicación atómica                                   |
| [BusinessTemplates.md](BusinessTemplates.md)                   | Plantillas versionadas como datos                                        |
| [OrganizationAdministration.md](OrganizationAdministration.md) | Ciclo y configuración de Organization                                    |
| [BranchAdministration.md](BranchAdministration.md)             | Administración de Branch                                                 |
| [Invitations.md](Invitations.md)                               | Invitaciones seguras y Membership                                        |
| [OrganizationSettings.md](OrganizationSettings.md)             | Configuración regional e i18n                                            |
| [FeatureManagement.md](FeatureManagement.md)                   | Administración de disponibilidad                                         |
| [ApplicationServices.md](ApplicationServices.md)               | Casos de uso y límites                                                   |
| [VisualRegression.md](VisualRegression.md)                     | Baselines Playwright                                                     |

Referencias obligatorias para todo cambio técnico: [ARCHITECTURE_GUARDRAILS.md](../ARCHITECTURE_GUARDRAILS.md) y [DECISION_LOG.md](../DECISION_LOG.md).

## Jerarquía y gobierno

1. Ley y regulación aplicable prevalecen sobre esta documentación.
2. Requisitos y ADR aceptados prevalecen sobre diagramas o ejemplos narrativos.
3. Seguridad y privacidad son criterios de aceptación, no fases posteriores.
4. Toda historia debe enlazar al menos un `RF`, sus `RNF` aplicables, pruebas y telemetría.
5. Las palabras **DEBE**, **NO DEBE**, **DEBERÍA** y **PUEDE** se interpretan con sentido normativo.

## Supuestos y límites

- NEXO es un SaaS B2B; la organización cliente determina los fines del tratamiento de los datos de sus clientes y NEXO opera normalmente como encargado, sin perjuicio del análisis contractual definitivo.
- El MVP registra ventas, impuestos configurables y recibos comerciales. No timbra CFDI, no procesa ni almacena datos de tarjeta y no sustituye asesoría fiscal/contable.
- México usa inicialmente `es-MX`, `America/Mexico_City` configurable por sucursal y MXN; ninguna regla del dominio debe depender de esos valores.
- “Offline” en MVP significa continuidad limitada del POS en un dispositivo previamente autorizado, no paridad funcional total sin red.
- Objetivo de verificación: OWASP ASVS 5.0.0 nivel 2 para la aplicación completa; controles de nivel 3 se aplican selectivamente a administración de plataforma, secretos, aislamiento y operaciones críticas.

## Control de cambios

Cambios de alcance requieren Product Owner; cambios de límites, datos, seguridad, SLO o tecnología requieren revisión de Arquitectura y responsables afectados. Cada release conserva una instantánea versionada de requisitos, ADR y evidencia de pruebas. Se revisan fuentes regulatorias y estándares al menos trimestralmente y antes de cada release mayor.

# Prompt 9 — Sales Platform

- [Sales Platform](SalesPlatform.md), [Sale Aggregate](SaleAggregate.md), [Sale Lifecycle](SaleLifecycle.md) y [Sale Items](SaleItems.md)
- [Checkout Engine](CheckoutEngine.md), [Totals Engine](TotalsEngine.md), [Discount Foundation](DiscountFoundation.md) y [Tax Foundation](TaxFoundation.md)
- [Payment Abstraction](PaymentAbstraction.md), [Mixed Payments](MixedPayments.md), [Suspended Sales](SuspendedSales.md), [Cancellations](SalesCancellations.md) y [Refund Foundation](RefundFoundation.md)
- [Sales Policies](SalesPolicies.md), [Receipt Model](ReceiptModel.md), [Idempotency](SalesIdempotency.md), [Concurrency](SalesConcurrency.md) e [Inventory Coordination](SalesInventoryCoordination.md)
- [Domain Events](SalesDomainEvents.md), [UMI Integration](UmiSalesIntegrationFoundation.md), [External Mappings](ExternalMappings.md) y [Flutter readiness](FlutterSalesClientReadiness.md)
- [Performance](SalesPerformanceBudgets.md), [Threat Model](SalesThreatModel.md), [Testing](SalesTesting.md) y [ADR-0033–0037](adr/README.md)
- [Investigación y comparación oficial](SalesResearch.md)

# Prompt 8 — Inventory Platform

- [Inventory Platform](InventoryPlatform.md), [Inventory Engine](InventoryEngine.md), [Stock Ledger](StockLedger.md)
- [Availability](Availability.md), [Reservations](Reservations.md), [Cost Engine](CostEngine.md)
- [Movement Types](MovementTypes.md), [Inventory Policies](InventoryPolicies.md), [Locations](Locations.md), [Stock Validation](StockValidation.md)
- [ADR-0032](adr/ADR-0032-inventory-ledger-and-cost-boundaries.md)
