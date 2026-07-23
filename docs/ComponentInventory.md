# Component Inventory

## Prompt 12.7 V1 visual authority

- Instrument/Manrope two-family typography contract.
- Ambient canvas implemented with layered CSS halos/noise and reduced-motion fallback.
- Route/layer transition tokens for 80/140/220/320/480 ms families.
- Visual custom-product builder inside onboarding: icon picker, identity, category, price suggestion and description.
- V1 shell/surface/input/button/menu variants derived from Design Bible semantic tokens.
- Deterministic owner-review capture runner: `scripts/capture-nexo-ui-v1.mjs`.

## Prompt 12.6 design-freeze additions

- Three non-production Storybook comparison surfaces: Hospitality Premium, Enterprise
  Modern and Tech Luxury.
- Selected Enterprise Modern semantic token layer shared by the official App Shell and
  business modules.
- Expandable per-day `ScheduleEditor` disclosure with localized interval summary.
- Visual Product type choices and mutation feedback on the connected Product creation
  surface.
- Original optimized business still-life used by Home/onboarding; no third-party brand
  asset.

## Prompt 12.3 additions

- `ProductExperience`: single-root session/onboarding/Home router.
- `GuidedOnboarding`: persisted Control Plane owner journey.
- `OnboardingFacts`: non-technical confirmation list.
- `NoAccess`: recoverable membership state.
- Product-level business/sucursal switcher, activation checklist, explicit logout and local-demo login states.
- Storybook visual-direction prototypes: Warm Hospitality and Refined Technology.

Sales Administration adds `SalesMetric`, `SaleStatusBadge`, `SalesPanel`, `SaleTimelineView` and `DiagnosticBundle` to `@nexo/ui`. They are presentational and contain no totals, permissions or lifecycle rules.

| Familia             | Componentes disponibles                                                                                                                                                                                                                                                                                             |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Acción/campos       | Button, IconButton, Link, TextField, TextArea, NumberInput, MoneyInput, QuantityInput, SearchInput, BarcodeInput, Select/Combobox/MultiSelect, Checkbox, RadioGroup, Switch, DatePicker, TimePicker, FormField, Label, FieldError                                                                                   |
| Overlay/navegación  | Tooltip, Popover, DropdownMenu, ContextMenu, Dialog, AlertDialog, Drawer, Sheet, BottomSheet, Tabs, Accordion, Breadcrumbs, Pagination, CommandPalette                                                                                                                                                              |
| Datos/feedback      | Card, Badge, StatusBadge, Avatar, Table/DataTable, List, EmptyState, Skeleton, Spinner, Progress, Alert, Toast, Banner, OfflineIndicator, SyncStatus, PermissionGuard, ErrorBoundarySurface                                                                                                                         |
| Admin               | AppShell, Sidebar, Topbar, MobileNavigation, NavigationRail, PageHeader, Toolbar/FilterBar/SearchToolbar, DataGrid, EntityList, DetailPanel, FormSection/SettingsSection, MetricCard, ActivityFeed/AuditTimeline, selectors, FeatureStatus, PermissionMatrix, ConfirmationFlow, BulkActionBar, import/export status |
| POS presentacional  | POSShell, ProductGrid/Card/ListItem, CategoryRail, SaleCart/Line, QuantityEditor, SaleTotals/CheckoutSummary, PaymentMethodCard, CashTenderInput, NumericKeypad, MixedPaymentAllocation, SuspendedSaleCard, availability/receipt/connectivity/sync/approval/barcode/touch action                                    |
| Cash administrativo | CashSessionStatus, RegisterCard, DrawerStatus, CashOperationalSummary, CashMovementForm, DenominationCounter, ReconciliationSummary, VarianceBadge, ApprovalCard, DepositLifecycle, TransferSummary, HandoffStepper, CashTimeline, OutboxStatus, QuarantineTable, IntegrationSinkStatus                             |

`Combobox` usa select nativo en esta iteración; búsqueda asincrónica se implementará solo con WAI-ARIA completo. Date/time usan controles nativos. Import/export y sync son future-ready, no servicios simulados.

# UI Parte 1 additions

| Component         | Package    | Purpose                            | States/evidence                                                                         |
| ----------------- | ---------- | ---------------------------------- | --------------------------------------------------------------------------------------- |
| `LivingScene`     | `@nexo/ui` | Typed ambient scene infrastructure | login/home/dashboard/minimal; high/balanced/reduced/static; deterministic; hidden pause |
| `KpiCard`         | `@nexo/ui` | Semantic KPI presentation          | loading/value; success/info/warning/accent; accessible value context                    |
| Home shell/drawer | `apps/web` | Owner dashboard navigation         | desktop active sidebar; mobile scrim/Escape; branch/account context                     |
