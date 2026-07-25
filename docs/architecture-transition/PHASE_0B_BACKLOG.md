# Phase 0B — Proposed Backlog

## Context

- NEXO HEAD: `b6ef871de195484314b78c015ecfde9a5c8697f4`
- UMI HEAD: `d5f399c8528fa3dda752aa37281d1b7a2c174348`

This backlog does not authorize implementation.

## Batch A — Provenance and archive

| ID     | Title                               | Source             | Decision | Target            | Prerequisites                | Acceptance                                   | Validation               | Size | Risk   | Model       | UMI access |
| ------ | ----------------------------------- | ------------------ | -------- | ----------------- | ---------------------------- | -------------------------------------------- | ------------------------ | ---- | ------ | ----------- | ---------- |
| 0B-A01 | Freeze source checksum ledger       | Repository         | ARCHIVE  | NEXO archive      | Owner confirms license scope | Tracked source and lock checksums exist      | Parse and sample hashes  | S    | Low    | luna        | No         |
| 0B-A02 | Create license inventory            | Flutter and assets | ARCHIVE  | UMI review record | Source ownership evidence    | Every salvage candidate has a license state  | Manual and script review | M    | High   | gpt-5.6-sol | Yes        |
| 0B-A03 | Mark federated proposals superseded | NEXO docs          | RETIRE   | UMI ADR           | Owner decision               | No active document recommends dual authority | Link scan                | S    | Medium | luna        | Yes        |
| 0B-A04 | Define tombstone contents           | NEXO repository    | ARCHIVE  | NEXO root later   | Retirement gate map          | Draft contains archive and UMI links         | Document review          | S    | Low    | luna        | No         |

## Batch B — Contract and invariant extraction

| ID     | Title                                 | Source               | Decision    | Target                | Prerequisites               | Acceptance                                            | Validation                 | Size | Risk     | Model       | UMI access |
| ------ | ------------------------------------- | -------------------- | ----------- | --------------------- | --------------------------- | ----------------------------------------------------- | -------------------------- | ---- | -------- | ----------- | ---------- |
| 0B-B01 | Normalize money vectors               | `packages/sales`     | KEEP        | UMI POS tests         | License review              | Vectors use minor units and explicit currency         | Deterministic unit tests   | M    | High     | gpt-5.6-sol | Yes        |
| 0B-B02 | Extract idempotency vectors           | Sales and cash       | KEEP        | Runtime command tests | Stable command schema draft | Replay and conflict cases are complete                | Unit and integration tests | M    | High     | gpt-5.6-sol | Yes        |
| 0B-B03 | Extract payment ambiguity vectors     | Sales docs and tests | KEEP        | UMI payments          | Payment state draft         | Unknown outcome remains query-only                    | State-machine tests        | M    | Critical | gpt-5.6-sol | Yes        |
| 0B-B04 | Map stable errors                     | API and docs         | ADAPT       | `packages/contract`   | UMI error envelope          | Each invariant maps to one stable code                | Contract tests             | M    | High     | gpt-5.6-sol | Yes        |
| 0B-B05 | Define contract emitter acceptance    | OpenAPI and SDK      | REIMPLEMENT | `packages/contract`   | UMI contract owner          | Deterministic JSON and drift rules specified          | Hash and diff test plan    | M    | Medium   | terra       | Yes        |
| 0B-B06 | Extract cash state matrix             | `packages/cash`      | REIMPLEMENT | UMI physical cash     | Domain owner review         | All commands, states, approvals, and conflicts mapped | Matrix completeness review | L    | Critical | gpt-5.6-sol | Yes        |
| 0B-B07 | Extract inventory movement vocabulary | Inventory            | REIMPLEMENT | UMI inventory         | Domain owner review         | Movement and balance semantics are unambiguous        | Scenario review            | M    | High     | gpt-5.6-sol | Yes        |
| 0B-B08 | Extract receipt snapshots             | Sales and cash       | KEEP        | UMI receipts          | Receipt policy              | Deterministic receipt vectors exist                   | Snapshot semantic tests    | M    | High     | terra       | Yes        |

## Batch C — Flutter extraction

| ID     | Title                          | Source                     | Decision    | Target            | Prerequisites         | Acceptance                                                     | Validation              | Size | Risk   | Model       | UMI access |
| ------ | ------------------------------ | -------------------------- | ----------- | ----------------- | --------------------- | -------------------------------------------------------------- | ----------------------- | ---- | ------ | ----------- | ---------- |
| 0B-C01 | Inventory Flutter widgets      | Flutter design             | ADAPT       | `apps/umi-pos`    | License inventory     | Every widget has reuse and coupling status                     | Path validation         | M    | Medium | terra       | Yes        |
| 0B-C02 | Compare design tokens          | Generated NEXO tokens      | ADAPT       | `packages/tokens` | UMI design owner      | Token differences and decisions are explicit                   | Token diff              | M    | Medium | terra       | Yes        |
| 0B-C03 | Select accessibility utilities | Flutter design             | KEEP/ADAPT  | Umi POS           | Widget inventory      | Selected utilities have no NEXO domain imports                 | Static dependency check | S    | Low    | luna        | Yes        |
| 0B-C04 | Map Flutter state machines     | POS controller and core    | REIMPLEMENT | `apps/umi-pos`    | Contract draft        | Bootstrap, cart, payment, shift, sync, and recovery maps exist | Architecture review     | L    | High   | gpt-5.6-sol | Yes        |
| 0B-C05 | Inventory hardware ports       | Printing and test adapters | ADAPT       | `apps/umi-pos`    | Hardware requirements | Interfaces and fake adapters are separated                     | Release-boundary review | M    | High   | terra       | Yes        |
| 0B-C06 | Map goldens and fixtures       | Flutter tests              | PORT        | Umi POS tests     | UMI design review     | Each golden has target viewport and approval state             | Golden index parse      | M    | Medium | luna        | Yes        |

## Batch D — Test replacement

| ID     | Title                                    | Source           | Decision | Target                       | Prerequisites          | Acceptance                                | Validation              | Size | Risk     | Model       | UMI access |
| ------ | ---------------------------------------- | ---------------- | -------- | ---------------------------- | ---------------------- | ----------------------------------------- | ----------------------- | ---- | -------- | ----------- | ---------- |
| 0B-D01 | Build suite-level Playwright map         | `tests/e2e`      | REWRITE  | UMI gates                    | Capability map         | Every spec has a disposition              | Coverage query          | XL   | Medium   | terra       | Yes        |
| 0B-D02 | Port RLS scenarios                       | Database tests   | REWRITE  | Build-v3 security gate       | Final role model       | Cross-scope and shortcut cases mapped     | SQL test review         | L    | Critical | gpt-5.6-sol | Yes        |
| 0B-D03 | Define atomic checkout integration suite | Sales and cash   | REWRITE  | UMI API tests                | POS transaction design | Every committed effect reconciles         | Integration plan review | L    | Critical | gpt-5.6-sol | Yes        |
| 0B-D04 | Define offline failure suite             | Flutter recovery | REWRITE  | Umi POS and API              | Command contract       | Every boundary has response-loss coverage | Scenario completeness   | L    | Critical | gpt-5.6-sol | Yes        |
| 0B-D05 | Define KDS parity fixtures               | KDS rules        | PORT     | Swift and future Flutter KDS | Neutral schema draft   | Both clients consume the same stream      | Fixture parser          | M    | High     | terra       | Yes        |

## Batch E — Build-v3 blocked preparation

| ID     | Title                                  | Source                 | Decision    | Target                  | Prerequisites          | Acceptance                                  | Validation          | Size | Risk     | Model       | UMI access |
| ------ | -------------------------------------- | ---------------------- | ----------- | ----------------------- | ---------------------- | ------------------------------------------- | ------------------- | ---- | -------- | ----------- | ---------- |
| 0B-E01 | Map POS tables to final schemas        | Domain packages        | REIMPLEMENT | root `supabase` later   | Gate 1 design evidence | No table conflicts with existing authority  | Architecture review | L    | Critical | gpt-5.6-sol | Yes        |
| 0B-E02 | Map permission and approval vocabulary | Authorization and cash | REIMPLEMENT | UMI auth and contract   | Role convergence       | Permissions include device and branch scope | Security review     | L    | Critical | gpt-5.6-sol | Yes        |
| 0B-E03 | Map dashboard route gaps               | NEXO web               | ADAPT       | UMI dashboard           | Route convergence      | Every required screen has an API owner      | Route diff          | M    | High     | terra       | Yes        |
| 0B-E04 | Define Umi Assistant tool safety       | Errors and runbooks    | ADAPT       | UMI conversations tools | Permission map         | Read and mutation rules are complete        | Threat review       | M    | Critical | gpt-5.6-sol | Yes        |

## Batch F — Safe early retirement

| ID     | Title                              | Source            | Decision | Target       | Prerequisites    | Acceptance                           | Validation   | Size | Risk   | Model | UMI access |
| ------ | ---------------------------------- | ----------------- | -------- | ------------ | ---------------- | ------------------------------------ | ------------ | ---- | ------ | ----- | ---------- |
| 0B-F01 | Archive evidence media index       | Evidence suites   | ARCHIVE  | NEXO archive | Checksums        | Every retained artifact has a reason | Index parse  | S    | Low    | luna  | No         |
| 0B-F02 | Archive legacy CI recovery reports | Reports           | ARCHIVE  | NEXO archive | None             | Reports are reference-only           | Link check   | S    | Low    | luna  | No         |
| 0B-F03 | Record fake sink retirement        | Fake UMI adapters | RETIRE   | Tombstone    | Caller inventory | No future task depends on fake sinks | Search check | S    | Medium | luna  | No         |

## Recommended order

1. Batch A
2. Batch B
3. Batch C
4. Batch D
5. Batch E after Gate 1 evidence
6. Batch F when archive policy is approved

Do not start backend implementation in Phase 0B without a separate authorization.
