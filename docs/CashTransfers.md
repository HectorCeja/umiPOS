# Cash Transfers

Local transfer atomically appends equal `TRANSFER_OUT` and `TRANSFER_IN` entries with one shared reference and idempotency key. Tenant, Organization, Branch policy, currency and both session states must match. Cross-Branch physical delivery is future-restricted until pending/acceptance and dual custody are implemented.
