# Cash Timeline

The tenant-aware paginated read model orders ledger, counts, approvals, reconciliation, close/reopen and security events by occurred time plus stable ID. UI consumes this projection; it never joins internal Sales tables. Payloads are allowlisted and permission-filtered.
