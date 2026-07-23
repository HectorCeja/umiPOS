#!/usr/bin/env bash
set -euo pipefail

case "${NEXO_ENV:-}" in
  local|test) ;;
  *) echo "Refusing Cash cleanup: NEXO_ENV must be local or test." >&2; exit 64 ;;
esac

if [[ -z "${CASH_TEST_TENANTS:-}" ]]; then
  echo "Refusing Cash cleanup: CASH_TEST_TENANTS is required." >&2
  exit 64
fi

IFS=',' read -r -a tenants <<<"${CASH_TEST_TENANTS}"
for tenant in "${tenants[@]}"; do
  if [[ ! "$tenant" =~ ^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$ ]]; then
    echo "Refusing Cash cleanup: invalid test tenant UUID '$tenant'." >&2
    exit 64
  fi
  docker compose exec -T postgres psql -v ON_ERROR_STOP=1 -U nexo_admin -d nexo \
    -v tenant="$tenant" <<'SQL'
BEGIN;
SELECT set_config('app.current_tenant_id', :'tenant', true);
SELECT set_config('app.cash_test_cleanup', 'on', true);
DELETE FROM cash_public_event_deliveries WHERE tenant_id = :'tenant'::uuid;
DELETE FROM cash_outbox WHERE tenant_id = :'tenant'::uuid;
DELETE FROM cash_events WHERE tenant_id = :'tenant'::uuid;
DELETE FROM cash_count_denominations WHERE tenant_id = :'tenant'::uuid;
DELETE FROM cash_counts WHERE tenant_id = :'tenant'::uuid;
DELETE FROM cash_variances WHERE tenant_id = :'tenant'::uuid;
DELETE FROM cash_reconciliations WHERE tenant_id = :'tenant'::uuid;
DELETE FROM cash_receipts WHERE tenant_id = :'tenant'::uuid;
DELETE FROM cash_handoffs WHERE tenant_id = :'tenant'::uuid;
DELETE FROM cash_transfers WHERE tenant_id = :'tenant'::uuid;
DELETE FROM cash_deposits WHERE tenant_id = :'tenant'::uuid;
DELETE FROM cash_approvals WHERE tenant_id = :'tenant'::uuid;
DELETE FROM cash_ledger_entries WHERE tenant_id = :'tenant'::uuid;
DELETE FROM cash_idempotency_records WHERE tenant_id = :'tenant'::uuid;
DELETE FROM cash_sessions WHERE tenant_id = :'tenant'::uuid;
DELETE FROM cash_drawers WHERE tenant_id = :'tenant'::uuid;
DELETE FROM cash_registers WHERE tenant_id = :'tenant'::uuid;
DELETE FROM cash_policies WHERE tenant_id = :'tenant'::uuid;
COMMIT;
SQL
done
