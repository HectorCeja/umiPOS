# Cash Management Platform

Cash Management is the sole NEXO authority for physical tender. `@nexo/cash` owns Register, Drawer, Session, ledger, counts, reconciliation and receipts; API infrastructure owns PostgreSQL and authorization adapters. Sales supplies authoritative allocations through a public integration boundary and is never modified or recalculated.

The trust chain is `session cookie → User → database Membership → TenantContext → AuthorizationContext → Application Service → transactional authorization → RLS`. All money is integer minor units. Ledger, events and receipts are append-only.

Deliberate exclusions: bank reconciliation, hardware drivers, PCI processing, accounting, Flutter and productive UMI.
