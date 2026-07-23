# Control Plane

The Control Plane is the independent administration boundary for Organization, Branch, Membership, invitations, onboarding, templates, settings and product availability. It contains no catalog, POS, inventory, cash, customer, report or appointment behavior.

```text
HTTP / responsive administration UI
              ↓
Application Services + CSRF + Authorization Engine
              ↓
Repository ports + transaction-local authorization recheck
              ↓
PostgreSQL forced RLS + append-only evidence
```

Controllers never import Prisma. The bootstrap exception creates Organization + primary Branch + OWNER Membership + onboarding draft atomically for a verified User. All subsequent writes have optimistic versions, explicit tenant candidates, default-deny authorization and tenant-local transactions. OpenTelemetry spans and structured logs use opaque actor/tenant IDs; invitation secrets, email content and RFC/address data are not logged.

Canonical operations are in OpenAPI 4.0.0. ADR-0030 is the controlling decision.
