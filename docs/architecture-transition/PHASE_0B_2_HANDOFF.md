# Phase 0B-2 Handoff

## Completed in Phase 0B-1

- Verified NEXO provenance and frozen baseline recovery.
- Verified UMI branch and build-v3 ancestry.
- Created a checksum-bound candidate inventory.
- Reviewed repository-local license evidence.
- Reviewed sensitive-content boundaries without exposing values.
- Prepared an archival tag procedure without creating a tag.
- Identified Umi Assistant-relevant asset classes.

## Approved or conditional candidates

| Batch            | Asset classes                          | Action                                             |
| ---------------- | -------------------------------------- | -------------------------------------------------- |
| 0B-B01           | Money and deterministic sales vectors  | PORT_BEHAVIOR after ownership review               |
| 0B-B02           | Idempotency and response-loss behavior | PORT_BEHAVIOR after ownership review               |
| 0B-B03           | Payment ambiguity and refund behavior  | PORT_BEHAVIOR after ownership review               |
| 0B-B06           | Cash rules and tests                   | PORT_BEHAVIOR after ownership review               |
| 0B-B07           | Inventory rules and tests              | PORT_BEHAVIOR after ownership review               |
| 0B-C01 to 0B-C06 | Flutter components and tests           | COPY_REVIEWED or PORT_BEHAVIOR after design review |
| 0B-E04           | Telemetry and runbook concepts         | PORT_BEHAVIOR or REFERENCE_ONLY                    |

## Prerequisites

1. Owner or legal confirmation for repository-authored code.
2. Artwork ownership confirmation.
3. Icon source confirmation or replacement decision.
4. UMI design approval for typography and token direction.
5. Build-v3 Gate 1 before backend or database work.
6. A separate authorization before extraction or implementation.

## Repository status at handoff

| Repository | Branch                            | HEAD                                       | State                                                   |
| ---------- | --------------------------------- | ------------------------------------------ | ------------------------------------------------------- |
| NEXO       | `architecture/umi-pos-transition` | `6436918fd5e543b16b54850409c75aa99602324b` | Phase 0B-1 deliverables pending commit during execution |
| UMI        | `architectureUMIposIntegration`   | `d5f399c8528fa3dda752aa37281d1b7a2c174348` | Read-only and clean                                     |

## Recommended order

1. Approve ownership and license decisions.
2. Extract pure money and idempotency vectors into a neutral review package.
3. Extract payment ambiguity, receipt, cash, and inventory behavior.
4. Review Flutter design assets and test portability.
5. Map behavior to UMI contract and permission requirements.
6. Wait for build-v3 Gate 1 before backend, database, or contract implementation.

## Expected risks

- No root license means code transfer lacks documented permission.
- Artwork and icon provenance remain incomplete.
- NEXO tests include NEXO routes, fixtures, and authority assumptions.
- Generated code must be regenerated, not copied.
- UMI POS implementation remains blocked by build-v3 completion.
- Assistant use remains blocked by missing POS-safe contracts and permissions.
