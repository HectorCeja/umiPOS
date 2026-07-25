# Phase 0A — Flutter Salvage

## Context

- NEXO HEAD: `b6ef871de195484314b78c015ecfde9a5c8697f4`
- UMI HEAD: `d5f399c8528fa3dda752aa37281d1b7a2c174348`
- Planned target: `apps/umi-pos`
- Observed target status: missing

## Direct review candidates

| Source                                               | Decision       | Required change                    | Test value          |
| ---------------------------------------------------- | -------------- | ---------------------------------- | ------------------- |
| `packages/nexo_flutter_design/lib/src/accessibility` | KEEP/ADAPT     | Rename and review semantics        | Accessibility tests |
| `packages/nexo_flutter_design/lib/src/adaptive`      | ADAPT          | Align UMI breakpoints              | Adaptive goldens    |
| `packages/nexo_flutter_design/lib/src/components`    | ADAPT          | Rebrand and remove domain coupling | Interaction tests   |
| `packages/nexo_flutter_design/lib/src/foundation`    | ADAPT          | Map UMI tokens                     | Foundation goldens  |
| `packages/nexo_flutter_design/lib/src/iconography`   | ADAPT          | License and brand review           | Icon tests          |
| `packages/nexo_flutter_design/lib/src/localization`  | ADAPT          | Use UMI localization               | Text-scale tests    |
| `packages/nexo_flutter_design/lib/src/states`        | ADAPT          | Bind UMI errors                    | State tests         |
| `packages/nexo_flutter_design/lib/src/theme`         | ADAPT          | Map `packages/tokens`              | Theme tests         |
| `apps/nexo_pos/lib/core/printing.dart`               | ADAPT boundary | Replace fake adapter               | Failure vectors     |
| `apps/nexo_pos/lib/core/diagnostics.dart`            | ADAPT          | Apply UMI redaction                | Diagnostic tests    |

## State-machine rebuilds

| Source                                              | Decision    | Reason                                        |
| --------------------------------------------------- | ----------- | --------------------------------------------- |
| `apps/nexo_pos/lib/app/pos_controller.dart`         | REIMPLEMENT | Sequential sale lifecycle is defective.       |
| `apps/nexo_pos/lib/app/productive_coordinator.dart` | REIMPLEMENT | It binds NEXO domain and runtime assumptions. |
| `apps/nexo_pos/lib/core/api.dart`                   | RETIRE      | It uses handwritten maps and guessed routes.  |
| `apps/nexo_pos/lib/core/models.dart`                | RETIRE      | Generated UMI models must replace it.         |
| `apps/nexo_pos/lib/core/local_database.dart`        | REIMPLEMENT | Financial recovery needs SQLCipher.           |
| `apps/nexo_pos/lib/core/offline.dart`               | REIMPLEMENT | Offline support is incomplete.                |
| `apps/nexo_pos/lib/core/recovery.dart`              | REIMPLEMENT | Recovery must use the UMI command store.      |
| `apps/nexo_pos/lib/core/security.dart`              | REIMPLEMENT | Device proof must use non-exportable keys.    |

## Assets that cannot survive

Do not transfer:

- handwritten `Map<String, dynamic>` contracts
- guessed NEXO routes
- NEXO cookies
- plaintext financial recovery
- placeholder URLs
- NEXO storage names
- NEXO credentials
- branch choice outside enrolled-device scope
- fake production printer, scanner, drawer, or terminal adapters
- test services in release targets

## Required client boundaries

The new client needs these explicit modules:

1. Bootstrap and device enrollment
2. Operator session
3. Catalog snapshot and delta
4. Cart and checkout
5. Quote and price confirmation
6. Payment intent
7. Receipt and printing
8. Shift and cash
9. Offline journal and sync
10. Recovery and conflict handling
11. Hardware ports
12. Redacted telemetry

## Generated contract migration

`packages/contract` must emit a deterministic JSON artifact.

The Flutter generator must create:

- immutable models
- typed requests and responses
- stable error types
- contract version and hash
- idempotency metadata
- offline eligibility
- approval requirements

CI must fail when generation changes committed output.

## Security review

The target client must prove:

- no Supabase credentials
- no direct database route
- P-256 device key protection
- signed command proof
- SQLCipher local storage
- sensitive-data purge
- branch and device binding
- release configuration signing
- no fake adapter in a release

## Golden and test reuse

Adapt these assets after brand review:

- phone, tablet, terminal, and desktop goldens
- high-contrast goldens
- reduced-motion goldens
- text-scale goldens
- touch-density goldens
- catalog, cash, and receipt interaction tests
- accessibility tests
- performance budgets

Do not copy a golden as UMI approval.

Rebaseline it after the UMI design owner reviews the screen.

## KDS sharing rule

POS and future Flutter KDS can share:

- generated contract models
- device proof
- secure storage
- telemetry vocabulary
- design tokens
- LAN envelope codecs

They cannot share:

- cart state
- payment state
- cash state
- checkout state
