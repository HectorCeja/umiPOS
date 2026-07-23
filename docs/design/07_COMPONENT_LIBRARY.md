# 07 — Component Library

## Contrato común

Todo componente oficial usa tokens semánticos, elementos nativos cuando existen, focus visible, estados no dependientes solo de color, tamaños touch y reduced motion. Variantes no autorizan CSS por ruta. Los ejemplos de composición están en [Component Patterns](18_COMPONENT_PATTERNS.md).

## Actions y forms

| Componente                                   | Propósito/anatomía                                     | Variantes y estados                                     | Responsive, motion y accesibilidad                                            |
| -------------------------------------------- | ------------------------------------------------------ | ------------------------------------------------------- | ----------------------------------------------------------------------------- |
| `Button`                                     | container, optional content, label de loading          | primary, secondary, danger; loading, disabled           | press/hover/focus; semántica button; padding óptico                           |
| `IconButton`                                 | icon + accessible name                                 | default, disabled                                       | target touch; `aria-label`/title obligatorios                                 |
| `Link`                                       | navegación textual                                     | default/subtle                                          | focus y destino real                                                          |
| `MutationButton`                             | acción async                                           | idle/loading/success/error                              | evita doble submit; feedback anunciable                                       |
| `Label`, `FormField`, `FieldError`           | label/control/help/error                               | required, invalid, disabled                             | ids y `aria-describedby`                                                      |
| `TextField`, `TextArea`                      | entrada textual                                        | default/focus/filled/invalid/readOnly/disabled/autofill | label persistente, caret/selection visibles                                   |
| `NumberInput`, `MoneyInput`, `QuantityInput` | entrada numérica contextual                            | valid/invalid/disabled                                  | formato no sustituye valor accesible                                          |
| `SearchInput`, `BarcodeInput`                | wrappers de `TextField` con type/inputMode configurado | estados nativos del input                               | label accesible; loading/empty pertenecen al consumidor                       |
| `Select`, `Combobox`, `MultiSelect`          | selección nativa genérica                              | selected/disabled/invalid                               | teclado nativo; no sustituyen ContextSelector flotante                        |
| `Checkbox`, `Switch`, `RadioGroup`           | selección/toggle                                       | checked/disabled; mixed solo si el input lo recibe      | input real, label y focus                                                     |
| `DatePicker`, `TimePicker`                   | fecha/hora nativa                                      | default/invalid/disabled                                | locale y teclado del browser                                                  |
| `FileUpload`                                 | label, help, preview opcional e input file             | empty/preview/file selected                             | acepta PNG/JPEG/WebP; progreso/error/retry son responsabilidad del consumidor |

## Surfaces y feedback

| Componente                                                                             | Contrato                                                         |
| -------------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| `Card`, `CashSurface`, `DetailPanel`                                                   | superficie jerárquica; padding/density; no simula interactividad |
| `Badge`, `StatusBadge`, `NexoStatusDot`, `VarianceBadge`, `InventoryAvailabilityBadge` | estado con texto/forma además de color                           |
| `Alert`, `Banner`, `NexoInlineNotice`                                                  | mensaje contextual; severity y acción; role proporcional         |
| `EmptyState`                                                                           | title, description y action opcional; respiración vertical       |
| `Skeleton`, `Spinner`, `Progress`                                                      | carga sin layout shift; reduced motion                           |
| `Toast`, `SaveStatus`, `ImportStatus`, `ExportStatus`, `OutboxStatus`                  | feedback temporal/persistente sin ocultar resultado              |
| `OfflineIndicator`, `SyncStatus`, `ConnectionStatus`, `SyncQueueIndicator`             | conectividad/sincronización textual y no ambigua                 |
| `PermissionGuard`, `FeatureStatus`                                                     | disponibilidad/permiso; nunca reemplaza enforcement backend      |
| `ErrorBoundarySurface`                                                                 | error recuperable y retry                                        |
| `Avatar`, `ShortcutHint`, `NexoShortcutBadge`                                          | identidad y ayuda; fallback/nombre accesible                     |

## Navigation y overlays

| Componente                               | Contrato                                                                                                                                                                        |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Tabs`                                   | tablist/tab/panel, active, teclado y focus                                                                                                                                      |
| `Accordion`                              | disclosure con button y `aria-expanded`                                                                                                                                         |
| `Breadcrumbs`                            | nav etiquetado; ruta actual no falsa                                                                                                                                            |
| `Pagination`, `NexoPagination`           | prev/next/pages con labels y disabled                                                                                                                                           |
| `CommandPalette`                         | Dialog con SearchInput, grupos y buttons con role option; filtrado por label, Tab/Shift+Tab, Enter, Escape y restore focus; no implementa active-descendant ni flechas internas |
| `Dialog`, `AlertDialog`                  | dialog nativo, título, close, focus management                                                                                                                                  |
| `Drawer`, `Sheet`, `BottomSheet`         | scrim, panel, close, Escape, scroll interno y safe area                                                                                                                         |
| `Tooltip`                                | ayuda breve; no contiene información indispensable solo en hover                                                                                                                |
| `Popover`, `DropdownMenu`, `ContextMenu` | primitive genérica basada en disclosure; no es el menú flotante del shell                                                                                                       |

`NexoAppShell`, su Sidebar, Topbar, drawer y ContextSelectors son componentes productivos del web. Los `AppShell`, `Sidebar`, `Topbar`, `MobileNavigation` y selectors nativos exportados por `admin.tsx` son APIs genéricas/legacy y no definen el chrome V1.

## Data y administración

| Componente                                                                                | Propósito y estados                                                                                                  |
| ----------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| `Table`, `DataTable`, `DataGrid`                                                          | wrapper de table nativa; `DataTable`/`DataGrid` son aliases; headers/caption pertenecen al consumidor                |
| `NexoDataTable`                                                                           | caption, columns, rows, rowKey, density comfortable/compact y empty opcional; no incluye sort/loading/error internos |
| `KpiCard`                                                                                 | label, value opcional, detail, icon opcional y tone success/info/warning/accent; skeleton si falta value             |
| `MetricCard`, `SalesMetric`                                                               | label y value; `MetricCard` usa Card y `SalesMetric` article con clase card                                          |
| `List`, `EntityList`, `ActivityFeed`, `AuditTimeline`, `SaleTimelineView`, `CashTimeline` | lista/actividad cronológica semántica                                                                                |
| `PageHeader`                                                                              | title, description y actions                                                                                         |
| `NexoEditorialHeader`                                                                     | eyebrow opcional, title, description, statement, actions y tone `sales`/`cash`; reveal del statement                 |
| `Toolbar`, `NexoToolbar`, `FilterBar`, `SearchToolbar`, `BulkActionBar`                   | búsqueda, filtros y acciones; wrap/adaptación móvil                                                                  |
| `FormSection`, `SettingsSection`                                                          | title/help/fields/actions con dirty/save state                                                                       |
| `PermissionMatrix`, `RolePicker`                                                          | rol/scope/permisos con restricciones visibles                                                                        |
| `BranchSelector`, `OrganizationSelector`                                                  | selección genérica; el shell usa ContextSelector flotante                                                            |
| `ConfirmationFlow`                                                                        | resumen, riesgo, confirm/cancel, resultado                                                                           |

## Experience y operación

- `LivingScene`: escena tipada; consulte [09](09_LIVING_SCENE_ENGINE.md).
- `VisualChoiceCard`, `ProductGalleryPicker`, `ScheduleEditor`: onboarding/catalog/horarios con selección, validación y responsive.
- `NexoSegmentedControl`, `NexoStockLevelIndicator`, `NexoPageTransition`: control, stock semántico y transición de contenido.
- POS: `POSShell`, `ProductGrid`, `ProductCard`, `ProductListItem`, `CategoryRail`, `SaleCart`, `SaleLine`, `QuantityEditor`, `SaleTotals`, `CheckoutSummary`, `PaymentMethodCard`, `CashTenderInput`, `NumericKeypad`, `MixedPaymentAllocation`, `SuspendedSaleCard`, `ReceiptPreview`, `SupervisorApprovalPrompt`, `BarcodeCaptureField`, `TouchActionButton`.
- Cash: `CashSessionStatus`, `DrawerStatus`, `DepositStatus`, `RegisterCard`, `CashOperationalSummary`, `CashMovementForm`, `DenominationCounter`, `ReconciliationSummary`, `ApprovalCard`, `DepositLifecycle`, `TransferSummary`, `HandoffStepper`, `QuarantineTable`, `QuarantineDetail`, `IntegrationSinkStatus`.
- Sales: `SaleStatusBadge`, `SalesPanel`, `DiagnosticBundle`.
- `FoundationStatus`: output textual usado por el gate/historia de foundations.

`NavigationRail` es un alias exacto de la `Sidebar` genérica de `admin.tsx`; no representa un rail
productivo del shell autenticado.

## Errores comunes

- Usar el shell genérico de Storybook como shell productivo.
- Hacer clickable una Card no interactiva.
- Ocultar label y depender del placeholder.
- Aplicar el mismo glow/blur a toda superficie.
- Crear aliases nuevos con nombres diferentes para el mismo patrón.
- Resolver responsive ocultando items por posición.
