# Cash Ledger

Each entry records tenant/Organization/Branch/Session/Register/Drawer, currency, direction, registered movement type, positive amount, authoritative source, actor/Membership, business date, idempotency/correlation/causation and allowlisted metadata. Balance is `Σ IN − Σ OUT` using exact integers. SQL triggers and privilege revocation prohibit update/delete; correction uses a compensating entry.
