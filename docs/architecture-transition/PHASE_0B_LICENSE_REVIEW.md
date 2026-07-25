# Phase 0B — License Review

## Scope and limit

This review uses repository-local evidence only.

It does not provide legal advice or prove title ownership.

NEXO has no root `LICENSE`, `COPYING`, or `NOTICE` file.

The reviewed `package.json` files also have no `license` field.

Therefore, repository-authored code is **REVIEW_REQUIRED** until the owner or legal reviewer confirms transfer rights.

## Candidate decisions

| Asset family                                             | Decision                  | Evidence                                                                      | Required action                                                  |
| -------------------------------------------------------- | ------------------------- | ----------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| Flutter source and tests                                 | REVIEW_REQUIRED           | No root repository license                                                    | Confirm owner copyright and transfer scope.                      |
| Money, idempotency, receipt, cash, and inventory vectors | REVIEW_REQUIRED           | Repository-authored code without a license declaration                        | Confirm transfer rights; port behavior, not NEXO implementation. |
| Runtime freshness script                                 | REVIEW_REQUIRED           | Repository-authored script without a license declaration                      | Confirm transfer rights before adapting.                         |
| Playwright scenarios                                     | REVIEW_REQUIRED           | NEXO fixtures, routes, and no root license                                    | Extract behavior only after review.                              |
| Generated Flutter tokens                                 | REPLACE                   | Generated from NEXO visual source                                             | Regenerate from approved UMI tokens.                             |
| NEXO visual goldens                                      | REVIEW_REQUIRED           | Historical NEXO branding                                                      | Use as reference only; do not treat as UMI baseline.             |
| Instrument Sans                                          | CLEAR                     | `assets/manifest.json`, OFL-1.1 text, and source record                       | Confirm typography decision before later copying.                |
| Manrope                                                  | CLEAR                     | `assets/manifest.json`, OFL-1.1 text, and source record                       | Confirm typography decision before later copying.                |
| Artwork images                                           | REVIEW_REQUIRED           | Asset manifest says project-approved; external provenance is not demonstrated | Obtain owner confirmation for each image.                        |
| NEXO API, Prisma, SDK, and generated clients             | DO_NOT_TRANSFER           | Authoritative architecture rejects NEXO authority                             | Reimplement or regenerate under UMI.                             |
| Third-party packages                                     | DO_NOT_TRANSFER AS SOURCE | Dependency metadata does not authorize vendoring                              | Keep them as declared dependencies under UMI review.             |

## Fonts

The repository contains these font files:

| Font                     | License evidence                                         | Status                     |
| ------------------------ | -------------------------------------------------------- | -------------------------- |
| Instrument Sans Variable | `assets/fonts/instrument-sans/OFL.txt`; manifest SHA-256 | CLEAR for the file license |
| Manrope Variable         | `assets/fonts/manrope/OFL.txt`; manifest SHA-256         | CLEAR for the file license |

Phase 0B does not copy or redistribute either font.

The UMI design owner must still approve the typography choice and attribution treatment.

## Artwork and icons

`packages/nexo_flutter_design/assets/artwork/manifest.json` lists four project-approved images.

It does not prove external source ownership or a transfer grant.

Classify every artwork image as REVIEW_REQUIRED.

`nexo_iconography.dart` requires source review because icon provenance is incomplete.

Replace uncertain icons with approved UMI assets.

## Generated material

Do not copy:

- generated Flutter tokens
- generated Prisma client files
- generated TypeScript SDK output
- generated Flutter platform registrants

Regenerate them from UMI-owned sources after the relevant contract or token source exists.

## Attribution requirements

Keep the OFL license texts with any later font distribution.

Record the selected source, license, hash, and approval for every later artwork or icon transfer.

Do not vendor third-party dependency source into UMI.

## Open reviews

1. Owner or legal confirmation for repository-authored NEXO code.
2. Ownership confirmation for each artwork image.
3. Icon source and license confirmation.
4. UMI design approval for fonts, tokens, and rebranded components.
