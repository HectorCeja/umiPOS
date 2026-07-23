# Cash test cleanup

Cash fixtures are removed only by an explicit local/test maintenance command. The command is tenant-scoped, repeatable, transactional and refuses to run unless both an allowed environment and an explicit UUID allowlist are present.

```sh
NEXO_ENV=test \
CASH_TEST_TENANTS=10000000-0000-4000-8000-000000000001 \
pnpm test:cash:cleanup
```

The script connects as the local migration owner, sets `app.current_tenant_id`, and deletes dependent Cash rows in a safe order. Migration `20260714143000_cash_test_cleanup_guard` provides a narrow trigger exception only when `current_user = nexo_admin` and the transaction-local `app.cash_test_cleanup` flag is `on`. The runtime role cannot use the exception and still lacks `UPDATE`/`DELETE` on the ledger. Production credentials and an unrestricted all-tenant cleanup are intentionally unsupported.

Evidence on 2026-07-14: the command completed twice consecutively for the Alpha test tenant; the second execution deleted zero rows. A runtime-role deletion attempt remained denied even after setting the custom flag.
