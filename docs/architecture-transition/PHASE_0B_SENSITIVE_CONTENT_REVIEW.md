# Phase 0B — Sensitive Content Review

## Scope

The scan used tracked repository-local files.

It excluded dependency directories, build output, artifacts, and generated runtime caches.

No secret value appears in this document.

## Findings

| Category                                             | Location                                           | Tracked | Extraction effect                     | Required remediation                           |
| ---------------------------------------------------- | -------------------------------------------------- | ------- | ------------------------------------- | ---------------------------------------------- |
| Environment variable names                           | `.env.example`                                     | Yes     | No candidate transfer                 | Keep as template only.                         |
| Local database and object-storage sample credentials | `compose.yaml`, CI local service configuration     | Yes     | Blocks direct infrastructure transfer | Replace with UMI infrastructure; do not reuse. |
| Test-only database URLs                              | CI, Prisma configuration, and tests                | Yes     | Blocks direct configuration transfer  | Recreate test configuration in UMI.            |
| Authentication secret variable names                 | `.env.example`                                     | Yes     | No candidate transfer                 | Use UMI secret management later.               |
| Sample CSRF token use                                | `scripts/manual-acceptance-prepare.sh`             | Yes     | Not a candidate                       | Keep outside extraction scope.                 |
| Local hostname and URL configuration                 | `.env.example`, Compose, application configuration | Yes     | Blocks direct runtime transfer        | Rebuild UMI configuration.                     |
| Synthetic customer and financial examples            | Manual acceptance and test fixtures                | Yes     | No candidate transfer                 | Use fresh UMI-owned fixtures.                  |

## Candidate result

The selected candidate records contain no detected secret value.

Some selected test scenarios contain credential-related words because they test device, session, or failure behavior.

They remain behavior-only candidates.

No selected candidate includes:

- a private key
- a certificate file
- a Supabase credential
- a production database credential
- a payment secret
- a customer record for production use

## Controls

- Do not copy `.env.example` values into UMI.
- Do not copy Compose credentials or local URLs.
- Do not copy NEXO device-secret handling.
- Do not use NEXO test fixtures as UMI user, tenant, or customer data.
- Re-scan each selected asset immediately before a later extraction.

## Status

No remediation occurs in Phase 0B.

The discovered local-only credentials and URLs are excluded from candidate extraction.
