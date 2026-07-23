# Prompt Handoff — UI Implementation Parte 1

## Owner Final Acceptance Gate Part 1A — 2026-07-19

Status: **TECHNICAL CORRECTIVE PASS COMPLETE — OWNER CONFIRMATION REQUIRED**. All requested systemic corrections have connected regressions and Chromium evidence, but owner feedback remains formally open until visual confirmation. NEXO Product Certification remains blocked.

## Owner Final Polish Pass Part 1A checkpoint — 2026-07-18

Status: **PART 1A COMPLETE**. All ten owner observations and 30 additional Round 4 improvements are resolved and evidenced. The next transition requires explicit owner direction. NEXO Product Certification remains blocked.

## Premium UX & Product Polish Part 4B final checkpoint — 2026-07-18

Status: **PART 4B COMPLETE; PREMIUM UX & PRODUCT POLISH TECHNICALLY CERTIFIED**. The final Red Team closed 75 new details and the unedited launch walkthrough is clean. Clients remains outside active scope and Flutter runtime remains an external toolchain limitation. Do not start NEXO Product Certification until the owner explicitly approves this transition.

## Premium UX & Product Polish Part 4A checkpoint — 2026-07-18

Status: **PART 4A COMPLETE**. Fourteen screens, eight official benchmark systems, a 16-dimension scorecard, 10 three-option design decisions and 50 implemented Red Team improvements are certified. The overall evidence-based score is 9.5; no score is represented as market research. Continue only with explicitly authorized Premium UX work; Product Certification remains blocked.

## Premium UX & Product Polish Part 3B checkpoint — 2026-07-18

Status: **PART 3B COMPLETE**. Delight moments, confidence copy, next-step continuity, progressive disclosure, a 31-item additional self-critique and the complete owner walkthrough are certified. Console and Network are clean through Logout. Evidence is in `artifacts/premium-ux-part-3b/`. Continue only with explicitly authorized Premium UX work; Product Certification remains blocked.

## Premium UX & Product Polish Part 3A checkpoint — 2026-07-18

Status: **PART 3A COMPLETE**. Official motion tokens, overlay/page transitions, hover/press/focus feedback, premium toasts, contextual loaders, 11 skeleton families, reduced-motion behavior, emotion targets and 30 implemented self-critique improvements are certified. Evidence is in `artifacts/premium-ux-part-3a/`. Continue only with explicitly authorized Premium UX work; Product Certification remains blocked.

## Premium UX & Product Polish Part 2 checkpoint — 2026-07-18

Status: **PART 2 COMPLETE**. Continuous contextual onboarding, Help Center search, glossary, FAQ, checklist, viewed history, persistent/resettable help, educational success/empty states and next-step recommendations are certified. Tests and evidence live in `artifacts/premium-ux-part-2/`. Continue only with explicitly authorized Premium UX polish work; Product Certification remains blocked.

## Premium UX & Product Polish Part 1B checkpoint — 2026-07-18

Status: **PART 1B COMPLETE**. Component Library, semantic iconography, layouts, responsive, overlays, uploads, sidebar and topbar are certified. `pnpm check` and 16 focused Part 1B cases pass; artifacts are in `artifacts/premium-ux-part-1b/`. Continue only with explicitly authorized Premium UX polish work. Do not start NEXO Product Certification.

## Active handoff — UI/API Corrective Pass 2

Estado: **CORRECTIVE PASS 2 COMPLETE — OWNER REVALIDATION REQUIRED**. `pnpm check`, Flutter POS, Flutter real API E2E y 23 E2E Web correctivos pasan; el paquete contiene 39 capturas. La única siguiente acción autorizada es la revalidación del owner en `docs/owner-validation/START_HERE.md`. NEXO Product Certification permanece bloqueada.

## Active handoff — Flutter POS V1 freeze

Flutter Design Parity Part 5 of 5 is **COMPLETED** and Flutter POS V1 is **CERTIFIED** at version 1.0. The next authorized roadmap block is NEXO Product Certification. Do not reopen frozen V1 scope or start UMI/Owner Knowledge Base work without a new authorized requirement. Native execution remains pending on appropriate platform runners; financial offline remains disabled by design.

## NEXO POS V1 productive completion

All REQUIRED FOR V1 implementation gates pass. The next authorized prompt is **Flutter Design Parity — Part 5 of 5 — Design and Behavior Certification**. Do not reopen Profile Media, POS contracts, cash posting or recovery without a demonstrated regression. Preserve offline finance as DISABLED BY DESIGN FOR V1. The only open condition is native build/video execution on runners with CMake/Android/macOS/Windows toolchains. Evidence: `artifacts/flutter-design-parity/productive-completion/`.

## Flutter parity handoff — Part 3 of 5

LivingScene and Motion are implemented in `packages/nexo_flutter_design`. No POS domain flow exists. Part 4 may consume the typed scene/component APIs; it must not redefine variants, tokens or artwork mappings.

## Authorized POS correction handoff

- Keep `.nexo-operational-toolbar` unique; do not merge it into `.nexo-toolbar`.
- POS baseline was never updated and matches the post-fix capture exactly.
- Do not update the four Control Plane snapshots yet. Desktop approval was conditional on responsive.
- Current blocker: the mobile rule in `apps/web/src/app/styles.css` hides links six and later. Reportes
  is sixth; Equipo, Configuración and Ayuda are unavailable in that pattern.
- Fixing responsive navigation requires new authorization. Verdict remains INCOMPLETE.

## UI Implementation Parte 2 — operational handoff

- Verdict: **INCOMPLETE**, never reinterpret as owner visual approval.
- Reuse `packages/ui/src/operations.tsx`; do not introduce a second table/filter primitive family.
- `LivingSceneVariant` now includes onboarding/catalog/products/inventory/sales/cash/reports/team/
  profile/settings/command/focused/minimal. Keep one engine per shell.
- `/reports` uses authoritative Sales overview only. Add charts only after a real time-series contract.
- Inventory UI must not mutate balances. A future full adjustment/transfer/count experience needs a
  public location/read model and existing ledger application services.
- Onboarding is eleven presentation steps (0–10); review and launch are combined. Persistence,
  restart and completion remain server-versioned.
- Green evidence: Unified 55/55, UI Parte 2 4/4, domain/RLS suites and Cash 40/40.
- Red evidence: Control Plane visual baselines (4) and Storybook POS baseline (1). Do not run snapshot
  update until owner review explicitly approves the new shared scene output.
- Artifacts live in `artifacts/ui-part-2/`; videos in `artifacts/ui-part-2/videos/`.
- No POS web, checkout web, UMI-derived work, auth/domain change or direct outbox publish was added.

- Reuse the semantic tokens and surfaces in `packages/ui`; do not fork visual values per module.
- Reuse `LivingScene` variants and quality/deterministic contracts for Onboarding, Reports and Inventory. Keep ambient animation outside business state.
- Reuse the dashboard shell, responsive drawer and Home fixtures/presenters; do not duplicate navigation.
- Visual QA uses `?scene=static` and artifacts under `artifacts/ui-part-1/`.
- Connected evidence: repository gate PASS, UI 12/12, focused Login/Home 9/9, healthy runtime and pending outboxes 0/0/0.
- Human visual approval remains pending. No POS web or UMI alignment was introduced.

## Previous handoff — Prompt 12.8 UI stabilization

- Do not treat this sprint as the final visual implementation. Wait for owner-approved
  mockups and preserve the stabilized persistence/component contracts.
- Avatar is authoritative across upload, profile, identity, refresh and shell rendering.
- Products use public category/product/price/barcode/media services for the complete
  approved administration input set.
- Review `docs/UI_KNOWN_VISUAL_LIMITATIONS.md` before changing presentation and
  `docs/UIContrastMatrix.md` before changing color tokens.
- Human visual status remains FAIL. No POS web, checkout or UMI work exists.
- Stabilization evidence is green: root check, connected 55/55, UI 12/12, clean global
  regression, both RLS suites, two workers and operational pending outboxes 0/0/0.
- Preserve `serializeProduct` when evolving media: Prisma `BigInt` must never be returned
  directly through Fastify JSON responses.

## Previous handoff — Prompt 12.7 UI V1

- Direction: Enterprise Luxury structure + Hospitality warmth; Future Retail only for visual selection.
- Implementation: dark-first V1 tokens, Instrument Sans + Manrope, animated ambient canvas, route/layer/card motion, reduced-motion fallback, unified shell and visual custom-product onboarding.
- Evidence: `artifacts/nexo-ui-v1/IMPLEMENTATION_MAP.md` and PNG captures in the same directory.
- Verification: production web build PASS; UI 9/9; web 4/4; unified Playwright 51/51.
- Human status: owner visual review required; prior FAIL remains authoritative.
- Boundaries: domain/OpenAPI/SDK/RLS/Auth/Cash/Sales/Inventory/UMI unchanged; no POS web.

## Previous 12.6 handoff

Do not start Phase 13. Human status is still **FAIL — VISUAL EXPERIENCE**. Review
`docs/InternationalDesignReview.md` and all three captures in
`artifacts/design-freeze/directions/` before judging the selected Enterprise Modern
implementation in `artifacts/design-freeze/selected/`. Dark is intentionally the only
supported approval theme. Manrope is pinned under OFL; the generated still-life is an
original project asset. Connected browser evidence is 50/50. No POS web, domain or UMI
work was introduced. The next action is exclusively owner visual acceptance.

## Previous handoff — Prompt 12.5 international experience automated green; owner review pending

Use only `http://localhost:3000`. The owner’s **FAIL — PRODUCT EXPERIENCE, CONSISTENCY AND USABILITY** remains authoritative. The repository now includes reusable mutation feedback, accessible modern selectors, per-day schedules, visual catalog and role selection, real private avatar upload, consistent dark-first theme/overlays, branch deduplication and a richer Spanish command palette. Custom Roles remain disabled under the existing versioned allowlist; do not replace Authorization with arbitrary UI-defined permissions.

Evidence: `pnpm check`; experience Playwright `50/50`; clean global regression (`5/5 + 8/8 + 3/3 + 5/5 + 40/40 + 6/6 + 7/7 + 12/12`); both RLS suites; OpenAPI 8.7.0/128 and SDK; two healthy workers; pending outboxes `0/0/0`. Follow `docs/OWNER_TESTING_TOUR_V2.md` for the new human review. Automated green does not mean perceptual approval. No POS web, checkout web or UMI alignment exists.

## Previous handoff — Prompt 12.4 unified experience

Use only `http://localhost:3000`. The owner’s latest FAIL remains authoritative. The root onboarding now persists all editable decisions and exact journey step; the official shell covers every business route; `/settings/profile` uses OpenAPI 8.6.0 `PATCH /v1/profile`; Product and Inventory surfaces use their existing services; Team/Settings use configuration services without displaying the technical platform name. Evidence includes `pnpm check`, Unified Experience Playwright `40/40`, clean global regression (`5/5 + 8/8 + 3/3 + 5/5 + 40/40 + 6/6 + 7/7 + 12/12`), both RLS suites, OpenAPI 125 operations, synchronized SDK, two healthy workers and pending outboxes `0/0/0`.

Before new human review run `pnpm manual-acceptance:prepare`, then follow `artifacts/manual-acceptance/current-run/OWNER_TESTING_TOUR.md` and `SCREEN_READINESS.md`. Do not interpret automated green as perceptual approval. No POS web or UMI alignment was introduced.

## Previous handoff — Prompt 12.3 automated product polish green

Use only `http://localhost:3000` for the owner journey. Root now routes real session state to Login, persisted Control Plane onboarding or Home. The 12-part onboarding saves/version-checks through existing endpoints. Home presents real Sales summary and branch context, activation and human empty states. Logout is explicit and CSRF-protected; branch selection uses active Control Plane branches. Cash/Sales use es-MX task language and hide diagnostics behind advanced disclosure.

The owner FAIL remains authoritative until re-review. Evidence: `pnpm check`, Product 4/4, UI/Storybook 12/12, both RLS suites, healthy services/two workers, operational pending outboxes 0/0/0, performance JSON and 15 files under `artifacts/product-polish`. No backend/domain/OpenAPI/SDK, POS web or UMI alignment change occurred.

## Previous handoff — Prompt 12.2 product experience review

The first owner run failed for product perception, not functionality. The web now starts with session restoration/login and a business-first Home instead of an administrative form. It presents Café Horizonte, Centro, user, Owner and online status; adds stable module navigation, breadcrumb, global command palette, profile/help/logout, responsive navigation, refined design tokens and humanized Sales/Cash presentation without visible UUIDs.

Do not interpret this as a backend or architecture phase: APIs, SDK, domain, RLS, Authorization, workers, outbox and module boundaries are unchanged. No POS web or UMI alignment was introduced. Use `docs/ProductExperienceReview.md` and the top Prompt 12.2 gate in `docs/QUALITY_GATE.md` for evidence. The owner should repeat acceptance against the redesigned experience before broader Flutter work.

## Previous handoff — Prompt 12.1 automated green; owner pending

Automated certification is complete: Sales Administration Playwright `44/44`, visual baselines `27/27`, accessibility/keyboard/reflow `8/8`, Storybook/UI `12/12`, full traceability, OpenAPI 8.5.0/124 and synchronized SDK, performance, RLS, global regression, healthy API/web/two workers, and pending outboxes Cash/Sales/Inventory `0/0/0`. The clean runner found and fixed the non-UUID Sales search predicate bug.

`pnpm manual-acceptance:prepare` produced `artifacts/manual-acceptance/current-run/START_HERE.md`. The owner must execute the checklist and then run `pnpm manual-acceptance:record`; do not mark Phase 12 closed before real results exist. Manual administrative sale remains disabled, no operational web POS exists, and no UMI alignment change was made.

## Prompt 12 checkpoint — do not start Phase 13

Phase 11 remains certified. Phase 12 added Sales Administration read models/UI, OpenAPI 8.5.0/124, SDK, permissions, presentational components/stories, sanitized diagnostics, performance harness, manual acceptance preparer, 156 scenarios and Owner Quickstart. No web POS, manual checkout, Flutter or UMI-derived boundary change was added.

Evidence is green for `pnpm check`, Sales `6/6`, connected UI `1/1`, UI `12/12`, nine performance operations, global regression and RLS; services are healthy and pending outboxes zero. Keep Phase 12 yellow until the 44-scenario browser matrix, requested Sales visual baselines, complete command-to-UI mapping and executed owner preparation are complete.

## Prompt 11.5 certification checkpoint — remain yellow

Do not develop features or change Cash/UMI boundaries. The audit found no missing architecture/domain and no critical debt. Certification discovered and fixed only a test-isolation defect: `cash-ui.spec.ts` now force-closes the session it opens. A previous Identity password-reset journey also proves that every integral cycle must reseed before Cash tests. With `seed -> Redis FLUSHDB -> tenant-scoped Cash cleanup`, the current Cash group is `20/20`; root `pnpm check`, the existing RLS SQL suite and the UI baseline are green.

The final gate is not met: refund negative coverage is incomplete, concurrency is `6/30`, Cash functional Playwright is `20/40`, automated two-worker crash/retry/restart certification is incomplete, performance has not been fully measured, and two clean integral cycles plus global/workflow-specific RLS regression have not run. Use `docs/CashRequirementCoverage.md` as the authoritative coverage map. Keep Phase 11 yellow.

## Prompt 11.4 checkpoint — 2026-07-14; no cerrar Fase 11

Continue without implementing a POS. The current contract is OpenAPI 8.4.0/116 with synchronized SDK. Migration 34 (`20260714153000_cash_refund_allocation_distribution`) distributes refunds over captured CASH allocations and preserves one posting per allocation. Register/Drawer PATCH operations, branch-aware transactional authorization, dynamic CSP nonces and a connected `/cash` administration console were added.

Actually executed: refund positive matrix `5/5`; PostgreSQL race subset `6/6`; quarantine API `3/3`; connected Cash UI `2/2`; combined real suite `16/16`; API tests `15/15`; UI/Storybook/axe/keyboard/tablet/dark/visual `12/12`; root `pnpm check`; two real workers healthy during refund processing; manual lease expiry recovery, publish-before-mark replay and permanent quarantine evidence. API, web and infrastructure were healthy, and Cash, Sales and Inventory pending outboxes were zero after the final query. Opening-float double counting and unvalidated deposit approval IDs were corrected.

Still blocking: negative refund cases; 30/30 race matrix; automated two-worker crash/restart/starvation matrix; full connected UI and 40 browser flows; post-connection Storybook/axe/keyboard/tablet/dark/visual gate; complete performance measurements; two clean integral cycles; global regression and integral RLS. Keep `PROJECT_STATE`, `QUALITY_GATE` and this handoff yellow until those facts are executed, and do not recommend starting a POS from this checkpoint.

## Prompt 11.3 checkpoint — no cerrar Fase 11

Continuar sin iniciar POS. La base actual incluye OpenAPI 8.3.0/114, migraciones 31–33 para claims/quarantine, refund mixto/aprobación y lectura runtime tenant-scoped del sink; worker con `SKIP LOCKED`, leases, backoff y quarantine; endpoint sanitizado de quarantine/status; componentes y consola Cash.

Evidencia verde ejecutada: refund parcial/replay `2/2` desde cleanup, Cash E2E `4/4`, subset de concurrencia `5/5`, UI unit `9/9`, UI browser `12/12`, contratos/SDK. Bloqueadores obligatorios: refund total/mixto y negativos, completar 30 carreras, dos workers/crash recovery, conectar todas las mutaciones UI y sus E2E, performance completa, dos ciclos integrales limpios, regresiones/RLS/outbox-zero finales. Mantener estado amarillo hasta cerrar todos.

## Prompt 11.2 checkpoint — 2026-07-14

Do not start POS. Added migration `20260714123000_cash_handoff_state_machine`, handoff ports/routes/repository state machine, permission `cash.session.handoff.accept`, OpenAPI 8.2.0/112 plus generated SDK, and migration `20260714143000_cash_test_cleanup_guard` with `scripts/cash-test-cleanup.sh`. Deposit cancellation appends a compensating entry. The worker image was rebuilt, became healthy and delivered Cash public allowlist events to its local idempotent sink.

Actually executed: Cash E2E 3/3, API tests 14/14, OpenAPI validation/compatibility, SDK generation check/build, API build, two consecutive tenant-scoped cleanup runs, runtime ledger-delete denial, worker health and observed Cash pending outbox zero. Phase 11 is still yellow because the full refund/reopen/deposit E2E, race matrix, administrative UI/accessibility/visual suite, performance matrix, quarantine diagnostics and entire repeated Quality Gate remain incomplete.

## Objetivo y resumen ejecutivo

Prompt 11 continúa abierto. Se implementaron dominio/ledger/persistencia/RLS, permisos, contrato parcial, API principal y posting real de pagos CASH desde Sales. No iniciar POS ni declarar Cash completo hasta cerrar los bloqueadores enumerados abajo.

## Archivos, migraciones, contratos y eventos

- Nuevos: `packages/cash/**`, `apps/api/src/modules/cash/**`, migraciones `20260714110000` a `20260714115000`, `packages/database/tests/cash.integration.sql`, documentos `Cash*`, ADR-0039–0041.
- Modificados: Authorization registry/engine tests, Worker, OpenAPI 8.0.0/SDK, RLS test, app module, UI barrel correction, logs/guardrails/anti-patterns/state.
- Cash events/outbox persistidos; `CashSessionOpened`, `CashMovementRecorded`, `CashSalePosted`, close/force-close están implementados. El worker postea allocations CASH capturadas mediante función estrecha SECURITY DEFINER y deduplica por PaymentAllocation.

## Decisiones, riesgos y deuda bloqueante

Cash es autoridad física, Sales autoridad comercial; ledger append-only; close/open es handoff principal; UMI sólo proyección allowlist. Bloqueadores: approvals/deposits/transfers/reopen/handoff/refund completos, policy adapter persistido, idempotency store en todos los comandos, carreras, Cash outbox/UMI worker, UI/Storybook/E2E/visual/axe y performance. No son deuda aceptada y el gate sigue amarillo.

## Evidencia y siguiente ejecución

`pnpm check`, OpenAPI/SDK, 25 migraciones, Cash SQL integration, RLS 57-table, Compose real, producto E2E 33/33 y UI/axe/visual 8/8 están verdes. Debe repetirse toda evidencia tras completar los gaps. Lectura obligatoria: ADR-0039–0041, `CashManagementPlatform`, `CashLedger`, `CashSalesIntegration`, `CashThreatModel`, `PROJECT_STATE`, `QUALITY_GATE`, guardrails y este handoff.

---

# Historial — Prompt 10

## Objetivo y resumen

Prompt 10 cierra el blueprint de experiencia y endurece `@nexo/ui` como única fuente web de tokens/componentes. IA, flujos, wireframes, POS, accesibilidad, escritura, Flutter parity y opciones UMI quedan documentados. No se implementó Cash, POS conectado, Flutter, UMI productivo ni lógica comercial nueva.

## Decisiones y archivos

- ADR-0038: tokens semánticos + shells adaptativos + UI presentacional.
- Nuevos documentos: `UXResearch`, `ProductExperiencePrinciples`, `UserPersonas`, `InformationArchitecture`, `Navigation`, `ResponsiveStrategy`, `AdaptiveLayouts`, `UserFlows`, `Wireframes`, `POSExperienceBlueprint`, `UXWriting`, `VisualLanguage`, `DesignTokens`, `DesignSystem`, `ComponentInventory`, `FormPatterns`, `TablePatterns`, `GlobalStates`, `AccessibilityExperience`, `StorybookGovernance`, `FlutterDesignParity`, `UmiExperienceIntegrationBlueprint`, `UXPerformanceBudgets`, `SecurityUX` y `Roadmap`.
- Código: `packages/ui/src/{primitives,overlays,navigation,data,admin,pos}.tsx`, tokens CSS, stories/tests; `playwright.ui.config.ts`, UI E2E/snapshots.
- Dependencia nueva única: `@axe-core/playwright` 4.10.2, solo desarrollo y justificada en el register.

## Requisitos obligatorios para Cash y POS

Cash debe exponer estados/errores autoritativos y nunca calcularse en UI. POS consume Sales/Cash mediante casos de uso, conserva idempotency key en retry, muestra conectividad/conflictos, usa `@nexo/ui`, touch ≥44 px, teclado/escáner y los snapshots monetarios del servidor. No se permiten forks de componentes ni permisos visuales como autoridad.

## Evidencia, riesgos y pendiente

`pnpm check`, Storybook, 8/8 UI browser tests, axe sin critical/serious, cuatro baselines nuevos, 33/33 E2E producto, OpenAPI/SDK y Compose reales verdes. Pendientes no críticos: research primario, hardware POS, selección final de iconos, Flutter prototype y contratos UMI. Workspace untracked sigue como riesgo operativo.

## Lectura obligatoria siguiente

Toda `/docs`; en especial ADR-0038, DesignSystem, DesignTokens, InformationArchitecture, UserFlows, POSExperienceBlueprint, SecurityUX, AccessibilityExperience, SalesPlatform, PaymentAbstraction, ReceiptModel, PROJECT_STATE, QUALITY_GATE, guardrails y este handoff.

## Recomendación

Cash Management antes de POS conectado; después Customers. Flutter y UMI productivo esperan evidencia/contratos externos.

---

# Historial — Prompt 9

## Objetivo y resumen ejecutivo

Sales Platform queda como autoridad headless de ventas. `@nexo/sales` contiene Aggregate, lifecycle, checkout/totals exactos, snapshots, pagos, recibos, refund foundation, policies, puertos y eventos. API y Worker aportan adaptadores tenant-aware; Product/Inventory se consumen sólo por interfaces públicas. Prompt 9 cerró con Quality Gate verde.

## Alcance, archivos y migraciones

- Nuevos: `packages/sales/**`, módulo `apps/api/src/modules/sales/**`, `tests/e2e/sales.spec.ts`, documentos `docs/Sales*`, `Sale*`, `Checkout*`, `Payment*`, UMI/Flutter y ADR-0033–0037.
- Modificados: Product/Inventory public ports, Authorization registry v4, Worker, Prisma/seed/RLS, OpenAPI/SDK, guardrails, decision log, anti-patterns, permission matrix, roadmap y state/report/gate.
- Migraciones: `20260714060000_sales_platform`, `20260714061000_sales_payments_refunds_audit`, `20260714062000_sales_suspension_expiry`, `20260714063000_worker_tenant_function_grant`; correcciones Inventory `040000/041000`. Total: 19.
- Contrato: OpenAPI 7.1.0, 82 operaciones. Eventos internos versionados y públicos `nexo.sale.*`, `nexo.product.sold`, `nexo.receipt.generated` mediante `UmiSalesIntegrationPort`/sink local deshabilitable.

## Decisiones obligatorias

No calcular totales en clientes; no usar float; no consultar tablas Product/Inventory; no almacenar PAN/CVV; no borrar Sales completadas; toda escritura crítica usa autorización DB, RLS, idempotencia y versión. UMI sólo recibe proyecciones allowlist; Flutter usa los mismos comandos/queries neutrales.

## Riesgos, deuda y exclusiones deliberadas

Sin proveedor productivo de pago, conexión UMI, Flutter, POS UI, Cash ledger, CFDI, impresoras, promoción avanzada, DLQ/broker productivo ni offline. Refund registra intención/líneas/destino y trazabilidad, pero la ejecución de reversos y retorno físico queda deliberadamente para sus adaptadores futuros. Son alcance futuro, no implementación simulada. Los gates KMS/SIEM/pentest/ASVS y baseline Git siguen abiertos; no existe deuda crítica aceptada.

## Evidencia final

`pnpm check`, 33/33 Playwright, RLS real con todas las aserciones `1`, 19 migraciones, 41 tablas FORCE, OpenAPI 82 operaciones, outboxes drenados y Compose saludable. Medición warmed de 200 muestras: Create Sale p95 28.9 ms y List Sales p95 23.6 ms.

## Siguiente fase recomendada

Primero UX research y Design System para journeys POS, luego Cash Management y finalmente POS Experience web. Customers puede paralelizarse. Antes de Flutter deben cerrarse hardware/offline; antes de UMI productivo se necesita su documentación contractual.

## Lectura obligatoria siguiente

Toda `/docs`; especialmente SalesPlatform, CheckoutEngine, TotalsEngine, PaymentAbstraction, SalesInventoryCoordination, SalesIdempotency, SalesThreatModel, UmiSalesIntegrationFoundation, FlutterSalesClientReadiness, ADR-0033–0037, PROJECT_STATE, QUALITY_GATE, guardrails y este handoff.

---

# Historial — Prompt 8 completo

Inventory Platform quedó implementada con ledger inmutable por `ProductVariant.id`, disponibilidad multidimensional, jerarquía de ubicaciones, reservas, transferencias, conteos, políticas/costos, snapshots y outbox. ADR-0032 es obligatoria. Archivos nuevos principales: `packages/inventory`, módulo Inventory API, migración `20260714020000_inventory_platform`, E2E Inventory y documentos Inventory.

No agregar stock a Product; no actualizar/borrar movimientos; no usar `onHand` como `available`; no permitir que POS acceda Prisma. Evidencia final: 13 migraciones, OpenAPI 66 operaciones, 27/27 E2E, 27 tablas FORCE RLS y outbox drenado.

Lectura obligatoria siguiente: InventoryPlatform, InventoryEngine, StockLedger, Availability, Reservations, CostEngine, InventoryPolicies, Locations, ADR-0032, PROJECT_STATE, QUALITY_GATE y guardrails.

---

# Historial — after Prompt 6

## Objective and executive summary

Prompt 6 is complete. A verified User can bootstrap a tenant, complete data-driven onboarding, administer Organization/Branch/settings/features, invite a User through Mailpit and manage Membership role/state/Branch scope while retaining tenant isolation. Controllers and UI call Application Services; protected writes revalidate the central engine inside their database transaction.

## New files

- `packages/control-plane/**` and `apps/api/src/modules/control-plane/**`.
- Migration `20260713150000_control_plane`.
- Control Plane web routes/shell, real E2E and five visual baselines.
- Ten Prompt 6 architecture/administration documents and ADR-0030.

## Modified files

- Prisma schema/seed/RLS, Authorization registry/engine, observability and CI/root quality scripts.
- OpenAPI 4.0.0 (44 operations), SDK and contract tests.
- README, Roadmap, PROJECT_STATE, PHASE_REPORT, QUALITY_GATE, guardrails, anti-patterns, decision log, threat/RLS/permissions/dependency/source documentation.

## ADR and important decisions

ADR-0030 is the only new ADR. Bootstrap is the only pre-Membership tenant transaction. Templates are versioned global data and runtime read-only. Restart never rolls back applied settings. Invitation tokens are opaque/digested/email+tenant+role+scope bound and single-use. Audit events are append-only. Feature flags never grant permissions.

## Quality evidence

`pnpm check` is green. Compose was rebuilt and all long-running services are healthy; nine migrations are applied. Real RLS returned `1` for all assertions. Playwright passed 20/20, including 5/5 visual comparisons. OpenAPI, backend manifest, SDK and compatibility baseline are synchronized.

## Risks and pending

Production email/KMS/SIEM/pentest/ASVS evidence and a reviewed git baseline remain open. Template authoring UI, Organization restore and logo object upload are intentionally deferred. No critical debt exists.

## Prompt 7 — entrega completada

Product Platform está operativa: dominio puro, persistencia tenant, API design-first, MinIO, búsqueda por puerto, eventos/outbox, worker dedicado, observabilidad y pruebas reales. ADR-0031 fija Product/Variant como límite. Archivos nuevos principales: `packages/product`, `apps/api/src/modules/product`, dos migraciones, `tests/e2e/product.spec.ts` y doce documentos Product.

Decisiones obligatorias: Inventory referencia siempre `ProductVariant.id`; Product jamás contiene stock; no emitir eventos fuera de la transacción; no dar al worker acceso a aggregates; no habilitar Subscription ni composición comercial sin su fase.

Riesgos no críticos: traducciones explícitas y composición versionada son extensiones futuras; broker externo reemplazará el sink estructurado conservando envelope. Workspace sigue sin baseline commit.

## Prompt 8 recommendation

Construir Inventory Foundation con ledger inmutable, ubicación/sucursal, reservas e idempotencia. Consumir `ProductCreated/Updated/Archived` desde outbox sin dependencia directa. Lectura obligatoria: ProductPlatform, ProductEngine, ProductModel, Variants, Pricing, DomainEvents, Outbox, RLS, ADR-0031, PROJECT_STATE, QUALITY_GATE y guardrails raíz.

## Historial: Prompt 7 recommendation original

Build Catalog/Product foundation before Inventory/POS. Consume the Authorization Engine and feature state, use tenant-first/composite keys, forced RLS, canonical OpenAPI and real Alpha/Beta tests. Do not materialize onboarding category suggestions as catalog rows implicitly. The roadmap remains correctly ordered; no reorder ADR is needed.

## Mandatory reading

## Login + Onboarding cinematic handoff — 2026-07-15

La revisión visual debe comenzar en `http://localhost:3000`. Autoridad: `login.png` y `onboarding.png`. Implementación: `apps/web/src/app/cinematic-experience.tsx`, la capa Login/Onboarding de `product-experience.tsx`, CSS al final de `styles.css` y assets en `apps/web/public/cinematic`. Evidencia: `artifacts/login-onboarding-cinematic`. No cambiar Authentication, Smart Onboarding, dominio, UMI ni convertir la web en POS.

All `/docs`, especially PROJECT_STATE, QUALITY_GATE, ControlPlane, SmartOnboarding, BusinessTemplates, ApplicationServices, Invitations, RLS, AuthorizationArchitecture and PermissionMatrix; ADR-0023–0030; root guardrails, decision log, anti-patterns and this handoff.

## Prompt 11.1 recovery handoff — 2026-07-14

Do not start POS. Resume from the Cash completion changes in `packages/cash`, the API Cash repository/controller/service, migrations `20260714120000`, `20260714121000` and `20260714122000`, worker Cash publication, OpenAPI 8.1.0 and `tests/e2e/cash.spec.ts`. Preserve the append-only ledger and the current yellow status.

Verified: 28 migrations, OpenAPI 108 operations, SDK, global lint/typecheck/tests, and Cash Playwright 3/3 against PostgreSQL. Remaining blockers: multi-step handoff, repeatable Cash cleanup, full refund/reopen/deposit-transition/race coverage, worker quarantine/outbox-zero validation, minimal administrative UI with accessibility/visual tests, performance measurements, full Compose rebuild after the latest worker patch, and synchronized final documentation.

# Prompt 11.6 handoff — Phase 11 certified

Phase 11 is closed green as of 2026-07-14. The authoritative evidence commands are `pnpm cash:certify -- cycle-1`, `pnpm cash:certify -- cycle-2`, and `bash scripts/global-regression.sh`. Final artifacts live in `artifacts/cash-certification/`.

Final counts: Cash Playwright 40/40; UI gate 12/12; concurrency requirements 30/30 mapped; performance 34/34 operations; RLS general plus 8 Cash-specific controls; 35 migrations; OpenAPI 8.4.0/116; Cash/Sales/Inventory pending outboxes all zero. Two real workers passed claim, crash-before-publish, lease takeover, crash-after-publish, idempotent replay, bounded retry, invalid-version quarantine and continued processing.

Critical files for the next phase: `docs/CashRequirementCoverage.md`, `docs/CashTesting.md`, `docs/CashConcurrency.md`, `docs/CashPerformanceBudgets.md`, `docs/CashWorker.md`, `docs/CashAdministrativeUI.md`, `packages/contracts/openapi/openapi.json`, `packages/sdk`, `packages/cash`, `apps/api/src/modules/cash`, `apps/web/src/app/cash`, and `apps/worker/src/main.ts`.

Do not reinterpret the administrative Cash console as a POS. Do not change UMI ownership/namespaces/contracts before Phase 13. Flutter remains the future payment client; the web remains administration/support. No critical debt or blocking Cash TODO remains.

# Handoff — UI Parte 1

Parte 2 must reuse `packages/ui/src/styles.css`, `LivingScene`, semantic motion durations and the Home shell. Use `variant="dashboard"` for dense modules and `minimal` for support surfaces; prefer balanced/reduced quality, deterministic mode in screenshots and never create per-screen ambient loops. Responsive patterns and QA commands are documented under `docs/ui/`. Onboarding, Reportes, Inventory and future POS presentation must preserve domain boundaries and must not turn the administrative web into checkout.

## UI Parte 2 responsive closure — 2026-07-15

The shared module shell now uses a drawer at `max-width:64rem`; never restore ordinal selectors such
as `nth-of-type(n + 6)`. Navigation items remain sourced from the single typed `items` array in
`apps/web/src/app/global-shell.tsx`, also consumed by Command Palette. Evidence and before/after
visual history are in `artifacts/ui-part-2/owner-review`. Authorized Control Plane baselines are
closed at zero diff; POS baseline must remain untouched and currently has identical SHA-256.

Run `tests/e2e/responsive-navigation.spec.ts`, Control Plane visual regression, `pnpm test:ui`,
Unified Experience and `pnpm check` after any shell change. Current verdict is CONDITIONALLY
COMPLETE solely because Inventory and Reports public backend contracts remain intentionally absent.

## Shell consolidation handoff — 2026-07-15

Current architecture classification: **Single Shared Shell**. The only implementation is
`NexoAppShell` in `apps/web/src/app/global-shell.tsx`; `ProductExperience` supplies Home content but
does not mount local shell infrastructure. All administrative route entry points import the same
component. Navigation configuration is `nexoNavigationItems` and is shared by sidebar/drawer and
Command Palette.

Do not update protected snapshots yet. Control Plane differences (4,030 / 4,030 / 4,381 / 4,030
pixels) represent the canonical Home shell replacing its previous chrome and require owner visual
approval. Home differs by 2,753 pixels (≈0.208%), limited to ambient/antialiased edges in review.
POS visual remains protected and passes. Continue from `artifacts/shell-consolidation/index.html`.

Validated commands: `pnpm check` PASS; shell/UI Part 2/Unified E2E 69/69; Storybook 12/12. The
remaining action is owner review of the protected visual differences; do not run snapshot update
until that approval exists.

## Owner review rejection correction handoff — 2026-07-15

Current verdict: **OWNER VISUAL REVIEW REQUIRED**. Do not mark complete or update snapshots before
the owner reviews `artifacts/owner-review-correction/index.html`.

The canonical shell remains unique and its chrome is isolated from module scene variants. Login fits
required desktop heights. Onboarding uses `.onboarding-scroll-container`; actions and progress are
outside it. Sales and Cash consume `NexoEditorialHeader`; Home/Sales/Cash use
`data-editorial-reveal`, disabled under reduced motion.

Validation: `pnpm check` PASS; correction 15/15; evidence 2/2; Unified Experience 55/55; Storybook
12/12. POS passes unchanged. Backend gaps for Inventory and Reports remain.

## Final owner UI correction handoff — 2026-07-16

Verdict: **OWNER VISUAL REVIEW REQUIRED**. Review
`artifacts/final-owner-ui-review/index.html`; do not update snapshots or freeze Design Language V1
until owner approval. Context menus use Floating UI from the canonical shell. LivingScene owns one
authenticated artwork/trail layer; Login and Onboarding are unchanged. Menu options are Profile,
Help and Logout, without Preferences duplication.

Validated: `pnpm check`; final suite/evidence 14/14; correction 15/15; shell 10/10; UI Part 2 4/4;
Storybook/POS 12/12. Protected POS SHA remains
`4632b056e04de2d091c08dd5afd6586a2ac24dd2310e2e77a989eacc323c47c7`. Stateful Onboarding suites
must run independently because combined serial suites share tenant progress. Backend gaps remain.

## Final immersion handoff — 2026-07-16

Verdict: **OWNER VISUAL REVIEW REQUIRED**. The official registry is
`packages/ui/src/artwork-registry.ts`; LivingScene resolves artwork exclusively from scene variants.
Authenticated shell routes use one artwork node and one scene. Home/Sales/Cash map to
`womanpos.png`; Products, Inventory and Reports map to their exact local JPEGs; Profile/Settings are
abstract. Do not reintroduce route-local images or duplicate paths.

`apps/web/src/app/immersion-layout.css` makes only authenticated `.product-shell` routes fixed-shell
applications. Route Content is the sole scroll owner; Login and Onboarding are intentionally
excluded. Review `artifacts/final-immersion/index.html` before any snapshot or Design Language V1
freeze. Validation: 33/33 focused E2E, Storybook 12/12 and production build 16/16. No baseline was
updated. The aggregate `pnpm check` remains interrupted solely by the preexisting formatting of
`docs/manual-acceptance/SCENARIOS.md`; later stages pass independently.

## Final UI freeze hotfix handoff — 2026-07-16

Verdict: **OWNER FINAL REVIEW REQUIRED**. Do not update snapshots or freeze Design Language V1
before reviewing `artifacts/final-ui-freeze/index.html`.

The shared offset fix lives only in `apps/web/src/app/immersion-layout.css`: Route Content already
reserves the Topbar row, `.section-nav` uses `top: 0`, and its normal-flow intrinsic height reserves
the secondary-navigation space. Do not restore the previous 74 px double inset or add route-specific
padding. `packages/ui/src/artwork-registry.ts` now covers all authenticated variants, including
explicit abstract entries for Team, Profile, Settings and Help/minimal. No `MISSING ARTWORK` remains.

## Final artwork render handoff — 2026-07-16

Verdict: **OWNER FINAL REVIEW REQUIRED**. Review
`artifacts/final-artwork-review/index.html` before freezing Design Language V1 or updating any
snapshot.

The registry remains the sole artwork source. The final rendering fix is scoped in
`packages/ui/src/styles.css`: an artwork-enabled LivingScene makes only the canonical shell canvas
transparent, preventing it from occluding negative-z scene layers. Do not restore an opaque route
canvas above artwork or move images into route components. All approved surfaces and shell chrome
remain opaque and unchanged.

The six operational screenshots are manually classified **VISIBLE YES**; administrative variants
remain intentionally abstract. Final immersion 8/8, UI unit 14/14 and Storybook/Axe/visual 12/12
pass. Protected snapshot hashes are unchanged.

## Flutter Design Parity — Part 1 of 5 — 2026-07-16

Status: **COMPLETE** for Part 1. `packages/nexo_flutter_design` is the only Flutter visual foundation. Use Flutter 3.44.6 / Dart 3.12.2 and run `pnpm flutter:check`. Never edit `nexo_tokens.g.dart`; update/version the frozen Design Language first, then regenerate.

## Flutter Design Parity — Part 2 of 5 — 2026-07-16

Status: **COMPLETE** after the recorded final gate. Build future feature UI from the public barrel in `packages/nexo_flutter_design/lib/nexo_flutter_design.dart`; do not fork tokens or put sales/cash/network state into this package. Product tile, table, pagination, toolbar, forms and overlays are domain-independent foundations. Toast has a widget contract, not an application queue service. LivingScene/artwork/editorial route motion remain Part 3 scope. Verify with `pnpm flutter:check`; never run golden update implicitly. Review `docs/flutter/FLUTTER_COMPONENT_PARITY_REPORT.md` and `artifacts/flutter-design-parity/part-2/` before continuing.

Part 2 may implement component parity but no checkout/business flow. Foundation APIs are `NexoTheme`, `NexoColors`, `NexoMetrics`, `NexoMotion`, `NexoAdaptiveInfo`, `NexoDensity`, `NexoVisualPreferences`, `NexoQualityMode` and `NexoAccessibleTarget`. Instrument Sans/Manrope TTFs are OFL-licensed and hash-pinned; future goldens must keep using them.

## Flutter Design Parity — Part 4 of 5 — 2026-07-16

Continue from `apps/nexo_pos`; do not move operational code into the design package and do not create a Web POS. Production is intentionally blocked on enrollment. Before certification, add real backend contracts for terminal enrollment/revocation, payment-intent status and offline reconciliation, then replace only the corresponding boundaries. Preserve stable idempotency and the no-retry rule for unknown payments. Evidence: `artifacts/flutter-design-parity/part-4/`.

# Handoff — Flutter Part 4B

Part 4B remains **INCOMPLETE**. Continue this phase only. Do not run Part 5. Preserve the POS device aggregate, OpenAPI 8.8.0, outcome-query contracts, secure storage adapter and SQLite v1. Next critical work starts with provider/mixed payment state machines and server-side financial reconciliation, followed by PostgreSQL/RLS E2E.

# Handoff — Flutter Part 4C

Parte 5 no está autorizada. Continuar cerrando los gaps enumerados en `artifacts/flutter-design-parity/part-4c/QUALITY_GATE.md`. No reabrir el fix de avatar salvo regresión: el E2E real cubre persistencia, sesión nueva, reemplazo, eliminación, validación binaria y MinIO.

# Active handoff — Flutter Design Parity Part 4D

Status: **INCOMPLETE**. Do not execute Part 5. Continue from the real productive coordinator and OpenAPI-aligned cash payloads. Close external/mixed payments, complete cash, receipts/reprint/printing, suspend/restore, cancellations/refunds, recovery, diagnostics/telemetry, PostgreSQL RLS/cross-tenant and Flutter-driven financial E2E without fixtures.

# Active handoff — Flutter Design Parity Part 4E

Status: **INCOMPLETE**. Do not execute Part 5. Use the frozen V1 matrix. First correct the authenticated avatar-read 404 demonstrated by Part 4E E2E, then close only REQUIRED V1 gaps: Flutter auth/context E2E, cash count/close, minimal external tender, receipt/reprint test adapter, critical recovery, diagnostics, real V1 RLS/cross-tenant and financial E2E.

# UI/API persistence handoff — 2026-07-17

Siguiente actividad autorizada: NEXO Product Certification. Usar `HANDOFF.md`, la matriz final y Owner Test Run. No reabrir Flutter Design Parity ni presentar contratos API-only como UI accesible.

Owner validation supersedes this authorization: **PRODUCT CERTIFICATION NOT AUTHORIZED** until the corrective pass is complete and the owner revalidates it.

# Active prompt handoff

`UI ↔ API Integration, Persistence & Product Flow Certification` is **CORRECTIVE PASS COMPLETE — OWNER REVALIDATION REQUIRED**. NEXO Product Certification is not authorized. The owner must execute `docs/owner-validation/START_HERE.md`; only explicit owner approval may restore COMPLETE and authorize the next phase.

# Boot reliability checkpoint — 2026-07-18

Boot & Environment Reliability is certified. The owner daily command is
`pnpm manual-acceptance:start`; setup/rebuild/reset are explicit exceptional paths. See
`docs/BOOT_CERTIFICATION.md`. Do not start NEXO Product Certification: the existing owner
revalidation gate remains authoritative.

# Premium UX & Product Polish Part 1A checkpoint — 2026-07-18

Status: **PART 1A COMPLETE**. The permanent owner-experience rule and design foundation are in
place with Web/Flutter brand parity and automated audits. Continue only with the authorized next
Premium UX polish scope. NEXO Product Certification remains blocked.

# Owner Final Polish Part 1B checkpoint — 2026-07-18

`OWNER FINAL POLISH PASS — PART 1B BLOCKED`. Smart defaults, commercial copy and predictable feedback are green, but operational routes cannot retain a newly created organization because context remains tenant-canonical. Do not start NEXO Product Certification.

# Owner Final Polish Part 2A checkpoint — 2026-07-18

Active Organization and LAN Chromium are green. The remaining authorized action is physical Mac
validation using `pnpm owner:share`; Product Certification remains blocked.
