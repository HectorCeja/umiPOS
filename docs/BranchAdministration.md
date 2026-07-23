# Branch Administration

Branches support list, create, update, archive and restore. Settings include code/name, optional locale/currency/time-zone overrides, versioned business hours and bounded extension settings. Null regional fields inherit Organization.

Every row and relation uses composite tenant-safe keys and forced RLS. Create/archive/restore are Organization-scoped administrative grants; update also validates the authoritative Branch state/scope inside the transaction. `ARCHIVED` is read-only except for the explicit `branch.restore` permission. Future POS, inventory, cash and employee tables must reference `(tenant_id, branch_id)`.
