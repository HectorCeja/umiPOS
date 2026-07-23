# Authorization Testing

The evidence pyramid uses pure engine tests, API/OpenAPI contract tests, SDK generation checks, real PostgreSQL RLS SQL and Playwright API E2E with real API, Redis, PostgreSQL and Mailpit. Mocks are not used for tenant-isolation or persona scenarios.

Official scenarios prove: Alpha cannot resolve Beta and vice versa; Cashier can create sales but cannot delete products; Employee cannot close cash; ReadOnly can query but cannot update; Supervisor can close branch cash; Owner can revoke Membership; Self scope cannot be forged. All decisions go through `AuthorizationEngine`.

Reproduce with:

```sh
pnpm check
docker compose up --build --wait
docker compose exec -T postgres psql -v ON_ERROR_STOP=1 -U nexo_admin -d nexo \
  < packages/database/tests/rls.integration.sql
pnpm test:e2e
```

Required regression checks include unknown permission, inactive actor, disabled feature, tenant mismatch, branch mismatch, Self mismatch, archived/deleted state and expired grants. New business modules must add object-level negative tests before exposing an endpoint.
