# ADR-0039 — Cash boundary, ledger and Sales integration

**Status:** accepted · **Date:** 2026-07-14

## Decision

`@nexo/cash` is the sole authority for physical cash. A Register is configuration, a Drawer is physical custody and a CashSession is the operational aggregate. Monetary history is an append-only ledger of signed-direction entries stored as integer minor units; cached expected balances are rebuildable projections. Sales remains the sale/payment authority and Cash consumes allowlisted, authoritative cash allocations idempotently through a public port/event adapter. It never recalculates a sale.

## Consequences

One active session is enforced by partial unique constraints for Register, Drawer and cashier/Branch. Corrections are counter-entries. Runtime has no ledger `UPDATE`/`DELETE`. Missing sessions quarantine/retry a Sales event rather than inventing a session. This introduces eventual coordination at the Sales/Cash boundary and requires observable retries.

## Alternatives rejected

Mutable drawer balance cannot provide immutable reconstruction. Embedding cash in Sales couples tender custody to commerce. Register-as-session loses device configuration history. Direct cross-module table reads violate module ownership.
