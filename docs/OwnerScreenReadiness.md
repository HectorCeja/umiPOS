# Owner Screen Readiness

## 2026-07-15 — correction audit

`Patterns/POS/OperationalShell` is READY and matches its baseline exactly. Control Plane desktop is
approved in principle, but Control Plane remains NOT READY for baseline acceptance because Reportes
and subsequent entries are hidden at tablet/mobile breakpoints. No Control Plane snapshot was updated.

## UI Implementation Parte 2 evidence matrix

| Pantalla            | Ruta                         | Estado              | Backend/UI/permissions                                   | RLS/outbox                          | Responsive/a11y/visual            | Evidencia o bloqueo                                                                               |
| ------------------- | ---------------------------- | ------------------- | -------------------------------------------------------- | ----------------------------------- | --------------------------------- | ------------------------------------------------------------------------------------------------- |
| Login               | `/login`                     | READY               | Authentication real; UI Parte 1                          | Existing auth isolation; N/A outbox | READY                             | `ui-part1.spec.ts`                                                                                |
| Onboarding 11 pasos | `/` incompleto               | CONDITIONALLY READY | Versioned persistence and complete service; 11-screen UI | Existing tenant context/outbox      | Responsive/reduced motion covered | Initial Inventory ledger initialization is not exposed as a complete public orchestration service |
| Home                | `/` completo                 | READY               | Real overview                                            | Existing RLS; read-only             | READY                             | `ui-part1.spec.ts`                                                                                |
| Productos           | `/products`                  | READY               | Create/list/media/price/barcode connected                | Product RLS/outbox                  | Parte 2 visual/browser            | `ui-part2.spec.ts`, Product E2E                                                                   |
| Inventario          | `/inventory`                 | CONDITIONALLY READY | Availability/movement reads connected                    | Inventory RLS/outbox                | Parte 2 visual/browser            | Public location discovery and full transfer/count UI are not available; no fake controls shown    |
| Ventas              | `/sales` y subrutas          | READY               | Administration services connected                        | Sales RLS/outbox                    | Existing 27 visual baselines      | Sales certification suites                                                                        |
| Caja                | `/cash`                      | READY               | Cash lifecycle administration connected                  | Cash RLS/outbox                     | Existing UI/visual/a11y           | Cash certification suites                                                                         |
| Reportes            | `/reports`                   | CONDITIONALLY READY | Confirmed Sales aggregate only                           | Read-only tenant context            | Parte 2 responsive/a11y           | No authoritative temporal/customer/payment series; honest empty states replace fake charts        |
| Equipo              | `/control-plane/invitations` | READY               | Invitation and allowlisted roles connected               | Configuration RLS/outbox            | Parte 2 browser                   | Custom roles remain unavailable by architecture                                                   |
| Perfil              | `/settings/profile`          | READY               | Profile/avatar services connected                        | Identity isolation; N/A outbox      | Parte 2 browser                   | Critical changes remain governed by existing auth                                                 |
| Configuración       | `/control-plane/settings`    | READY               | Organization versioned update                            | Configuration RLS/outbox            | Parte 2 browser                   | Only existing settings are shown                                                                  |
| Command Palette     | Global                       | READY               | Authorized navigation only                               | No cross-tenant index               | Keyboard/axe/reduced motion       | `ui-part2.spec.ts`                                                                                |
| POS web             | N/A                          | NOT APPLICABLE      | Deliberately not built                                   | N/A                                 | N/A                               | `pos.png` used only as density/pattern reference                                                  |

## UI V1 visual-review scope

Login, onboarding, Inicio, Ventas, Caja, Productos, Inventario, Equipo, Configuración, Perfil, Command Palette and responsive shell are **READY FOR VISUAL REVIEW** only. This status does not replace the capability readiness matrix below and does not mean owner approval. Review `artifacts/nexo-ui-v1/IMPLEMENTATION_MAP.md` and open `http://localhost:3000` as the single entry.

> Design freeze 12.6: all READY surfaces use the selected dark Enterprise Modern
> reference. Claro/Sistema are intentionally unavailable for this visual approval. Human
> status remains FAIL until the owner reviews the new captures and connected product.

| Pantalla         | Ruta                         | Qué permite                                                              | Estado                  | Qué probar                                              | Limitaciones                                                                    |
| ---------------- | ---------------------------- | ------------------------------------------------------------------------ | ----------------------- | ------------------------------------------------------- | ------------------------------------------------------------------------------- |
| Entrada e Inicio | `/`                          | Login, onboarding, contexto y resumen                                    | READY FOR OWNER TESTING | Completar recorrido, cambiar sucursal y cerrar sesión   | Requiere datos demo                                                             |
| Onboarding       | `/`                          | Editar giro, región, horarios, caja, catálogo, inventario, equipo y logo | READY FOR OWNER TESTING | Cambiar cada decisión y regresar desde Revisión         | Logo se conserva en el registro de onboarding; no existe biblioteca de archivos |
| Ventas           | `/sales`                     | Consultar y ejecutar acciones administrativas existentes                 | READY FOR OWNER TESTING | Actualizar, buscar, abrir detalle y recorrer scrollspy  | No crea ventas ni checkout web                                                  |
| Caja             | `/cash`                      | Operar comandos Cash autorizados                                         | READY FOR OWNER TESTING | Abrir sesión, movimientos, aprobaciones y volver arriba | Requiere caja configurada                                                       |
| Productos        | `/products`                  | Listar, buscar y crear                                                   | READY FOR OWNER TESTING | Crear un producto y volver a buscarlo                   | Edición avanzada se prueba por API hasta completar detalle web                  |
| Inventario       | `/inventory`                 | Consultar disponibilidad y movimientos                                   | PARTIAL                 | Probar con IDs provistos por soporte                    | Falta selector público producto–variante–ubicación                              |
| Equipo           | `/control-plane/invitations` | Invitar con selección visual de rol y feedback                           | READY FOR OWNER TESTING | Elegir rol, invitar y comprobar confirmación            | Roles personalizados no disponibles: Authorization usa definiciones allowlist   |
| Configuración    | `/control-plane/settings`    | Editar preferencias regionales con feedback                              | READY FOR OWNER TESTING | Cambiar un valor, guardar y comprobar confirmación      | Branding avanzado permanece future-ready                                        |
| Perfil           | `/settings/profile`          | Editar perfil y subir avatar privado desde archivo                       | READY FOR OWNER TESTING | Subir avatar, cambiar nombre y guardar                  | PNG/JPEG/WebP; máximo 5 MB                                                      |
| Ayuda            | `/help`                      | Encontrar recorridos por tarea                                           | READY FOR OWNER TESTING | Abrir cada guía                                         | Base extensa corresponde a Fase 13                                              |

`INTERNAL ONLY`: diagnóstico de eventos, Mailpit, Swagger, MinIO y Storybook. `NOT AVAILABLE`: POS web, checkout, Flutter y operación offline.

## Cierre responsive Parte 2 — 2026-07-15

| Superficie           | Visual | Responsive                | Funcional/backend                                               | Evidencia                                    |
| -------------------- | ------ | ------------------------- | --------------------------------------------------------------- | -------------------------------------------- |
| Control Plane        | READY  | READY                     | READY para capacidades existentes                               | `owner-review/navigation`, Control Plane 5/5 |
| Inventario           | READY  | READY                     | CONDITIONALLY READY: faltan discovery/transfer/count públicos   | `BACKEND_READINESS_GAPS.md`                  |
| Reportes             | READY  | READY                     | CONDITIONALLY READY: faltan series/clientes/pagos autoritativos | `BACKEND_READINESS_GAPS.md`                  |
| POS OperationalShell | READY  | N/A (primitive Storybook) | NOT APPLICABLE al Web Admin                                     | diff 0, SHA-256 preservado                   |

La navegación completa y logout son alcanzables en desktop, tablet, móvil y viewport bajo. Este
estado técnico no constituye aprobación visual del propietario.

## UI Polish — readiness para revisión

| Área                    | Estado                   | Evidencia                                | Decisión pendiente               |
| ----------------------- | ------------------------ | ---------------------------------------- | -------------------------------- |
| Login sin review        | REQUIRES VISUAL APPROVAL | `ui-polish/screens/login-desktop.png`    | Aprobar composición simplificada |
| Onboarding scroll/copy  | REQUIRES VISUAL APPROVAL | welcome, catalog scroll, review y video  | Aprobar continuidad del frame    |
| Reveal editorial        | REQUIRES VISUAL APPROVAL | capturas tras 1800 ms y video            | Aprobar timing/intensidad        |
| Menú de sucursal        | READY                    | prueba de ancla + `home-branch-menu.png` | Revisión visual únicamente       |
| Módulos administrativos | REQUIRES VISUAL APPROVAL | diez capturas y comparaciones            | No actualizar baselines aún      |

Inventario y Reportes conservan exactamente sus estados `CONDITIONALLY READY` por backend. POS y
los cuatro baselines protegidos no cambiaron.

## Shell consolidation readiness — 2026-07-15

| Superficie                                | Arquitectura                | Funcional                            | Visual                   | Evidencia                   | Decisión                             |
| ----------------------------------------- | --------------------------- | ------------------------------------ | ------------------------ | --------------------------- | ------------------------------------ |
| Home                                      | READY — Single Shared Shell | READY                                | REQUIRES VISUAL APPROVAL | Home overlay/diff, 2,753 px | Aprobar o rechazar diferencia mínima |
| Productos/Inventario/Reportes/Ventas/Caja | READY                       | READY dentro de contratos existentes | REQUIRES VISUAL APPROVAL | capturas + videos           | Aprobar shell canónico compartido    |
| Control Plane                             | READY                       | READY                                | REQUIRES VISUAL APPROVAL | 4 comparaciones protegidas  | No actualizar baselines aún          |
| POS OperationalShell                      | NOT APPLICABLE al shell web | READY                                | READY                    | Storybook visual PASS       | Mantener baseline intacto            |

Inventario (ubicaciones/transferencias/conteos) y Reportes (series/clientes/métodos de pago)
continúan `CONDITIONALLY READY`; la consolidación no añadió contratos ni datos simulados.

## Owner review correction readiness — 2026-07-15

| Superficie      | Técnica | Visual                   | Evidencia                       | Decisión            |
| --------------- | ------- | ------------------------ | ------------------------------- | ------------------- |
| Login           | READY   | REQUIRES VISUAL APPROVAL | 8 viewports, before/after/video | Revisar escala      |
| Onboarding 1–11 | READY   | REQUIRES VISUAL APPROVAL | 11 pasos, 5 tamaños, videos     | Revisar mapa/panel  |
| Home            | READY   | REQUIRES VISUAL APPROVAL | reveal y reduced motion         | Revisar timing      |
| Sales / Cash    | READY   | REQUIRES VISUAL APPROVAL | headers y videos                | Revisar composición |
| Shell chrome    | READY   | REQUIRES VISUAL APPROVAL | 8 rutas idénticas               | Confirmar paridad   |

Inventario y Reportes no cambian su readiness backend. POS y snapshots permanecen intactos.

## Final owner UI correction readiness — 2026-07-16

| Surface                     | Visual                   | Functional                         | Evidence                                 | Owner decision               |
| --------------------------- | ------------------------ | ---------------------------------- | ---------------------------------------- | ---------------------------- |
| Context selectors/dropdowns | REQUIRES VISUAL APPROVAL | READY                              | 8 routes, 8 viewports, flip/shift videos | Review spacing and placement |
| User menu                   | REQUIRES VISUAL APPROVAL | READY                              | keyboard/axe and simplified capture      | Confirm options              |
| Authenticated artwork       | REQUIRES VISUAL APPROVAL | READY                              | route/parallax/reduced/mobile evidence   | Approve intensity/motion     |
| POS                         | READY                    | READY                              | 12/12 UI; protected SHA unchanged        | No action                    |
| Inventory advanced gaps     | CONDITIONALLY READY      | NOT READY without public contracts | backend gap report                       | Defer backend                |
| Reports advanced gaps       | CONDITIONALLY READY      | NOT READY without public contracts | backend gap report                       | Defer backend                |

Snapshots remain frozen; these visual changes are not owner-approved yet.

## Flutter foundation readiness — 2026-07-16

| Surface                      | UI readiness                         | Backend/RLS/outbox                 | Evidence                              | Status    |
| ---------------------------- | ------------------------------------ | ---------------------------------- | ------------------------------------- | --------- |
| Flutter visual foundation    | tokens/theme/adaptive/goldens ready  | NOT APPLICABLE                     | `docs/flutter`, 7/7 tests             | READY     |
| Flutter component foundation | Part 2 library, showcase and goldens | no domain contracts used           | ready for LivingScene/POS composition | READY     |
| Flutter POS screens          | not implemented in Parts 1–2         | client-neutral contracts unchanged | explicit boundary                     | NOT READY |

Official font assets are licensed, hashed and rendered. This row does not claim POS completion.

## Flutter POS — Part 4

| Surface                          | Readiness            | Reason                                             |
| -------------------------------- | -------------------- | -------------------------------------------------- |
| Operational catalog/cart harness | TECHNICALLY VERIFIED | adaptive rendering and tests pass; fixture-labeled |
| Production online cash flow      | CONDITIONALLY READY  | requires real enrolled-device bootstrap            |
| Enrollment                       | BLOCKED              | no backend contract                                |
| Offline financial operation      | BLOCKED              | no reconciliation contract                         |
| External/mixed provider payment  | BLOCKED              | no provider intent/recovery contract               |

Part 5 certification must not promote these blocked rows without real contracts and device evidence.
