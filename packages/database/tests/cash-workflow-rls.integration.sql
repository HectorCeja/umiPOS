\set ON_ERROR_STOP on
BEGIN;

-- This suite complements the generic RLS suite with every Cash-owned workflow table.
SET LOCAL ROLE nexo_runtime;
CREATE TEMP TABLE cash_rls_results(name text PRIMARY KEY, passed boolean NOT NULL);
INSERT INTO cash_rls_results
SELECT 'no_context_cash_tables', (
  (SELECT count(*) FROM cash_registers) +
  (SELECT count(*) FROM cash_drawers) +
  (SELECT count(*) FROM cash_sessions) +
  (SELECT count(*) FROM cash_ledger_entries) +
  (SELECT count(*) FROM cash_counts) +
  (SELECT count(*) FROM cash_reconciliations) +
  (SELECT count(*) FROM cash_approvals) +
  (SELECT count(*) FROM cash_deposits) +
  (SELECT count(*) FROM cash_transfers) +
  (SELECT count(*) FROM cash_handoffs) +
  (SELECT count(*) FROM cash_outbox) +
  (SELECT count(*) FROM cash_public_event_deliveries)
) = 0;

SELECT set_config('app.current_tenant_id','10000000-0000-4000-8000-000000000001',true);
INSERT INTO cash_rls_results
SELECT 'alpha_cannot_read_beta_workflows', NOT EXISTS (
  SELECT 1 FROM cash_sessions WHERE tenant_id <> '10000000-0000-4000-8000-000000000001'::uuid
) AND NOT EXISTS (
  SELECT 1 FROM cash_approvals WHERE tenant_id <> '10000000-0000-4000-8000-000000000001'::uuid
) AND NOT EXISTS (
  SELECT 1 FROM cash_deposits WHERE tenant_id <> '10000000-0000-4000-8000-000000000001'::uuid
) AND NOT EXISTS (
  SELECT 1 FROM cash_transfers WHERE tenant_id <> '10000000-0000-4000-8000-000000000001'::uuid
) AND NOT EXISTS (
  SELECT 1 FROM cash_handoffs WHERE tenant_id <> '10000000-0000-4000-8000-000000000001'::uuid
) AND NOT EXISTS (
  SELECT 1 FROM cash_outbox WHERE tenant_id <> '10000000-0000-4000-8000-000000000001'::uuid
);

INSERT INTO cash_rls_results
SELECT 'runtime_ledger_grants',
  NOT has_table_privilege('nexo_runtime','cash_ledger_entries','UPDATE')
  AND NOT has_table_privilege('nexo_runtime','cash_ledger_entries','DELETE');

INSERT INTO cash_rls_results
SELECT 'readonly_cash_is_read_only',
  has_table_privilege('nexo_readonly','cash_sessions','SELECT')
  AND NOT has_table_privilege('nexo_readonly','cash_sessions','INSERT')
  AND NOT has_table_privilege('nexo_readonly','cash_approvals','UPDATE')
  AND NOT has_table_privilege('nexo_readonly','cash_deposits','DELETE');

INSERT INTO cash_rls_results
SELECT 'worker_has_no_ledger_mutation',
  NOT has_table_privilege('nexo_worker','cash_ledger_entries','INSERT')
  AND NOT has_table_privilege('nexo_worker','cash_ledger_entries','UPDATE')
  AND NOT has_table_privilege('nexo_worker','cash_ledger_entries','DELETE');

INSERT INTO cash_rls_results
SELECT 'runtime_and_worker_cannot_bypass_rls', NOT EXISTS (
  SELECT 1 FROM pg_roles
  WHERE rolname IN ('nexo_runtime','nexo_readonly','nexo_worker') AND rolbypassrls
);
RESET ROLE;

INSERT INTO cash_rls_results
SELECT 'force_rls_cash_tables', count(*) = 18
FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace
WHERE n.nspname='public' AND c.relname IN (
  'cash_registers','cash_drawers','cash_sessions','cash_ledger_entries','cash_counts',
  'cash_count_denominations','cash_reconciliations','cash_variances','cash_approvals',
  'cash_deposits','cash_transfers','cash_receipts','cash_idempotency_records',
  'cash_events','cash_outbox','cash_public_event_deliveries','cash_handoffs','cash_policies'
) AND c.relrowsecurity AND c.relforcerowsecurity;

INSERT INTO cash_rls_results
SELECT 'worker_claim_scope_is_outbox_only',
  has_table_privilege('nexo_worker','cash_outbox','SELECT')
  AND has_table_privilege('nexo_worker','cash_outbox','UPDATE')
  AND NOT has_table_privilege('nexo_worker','cash_sessions','UPDATE')
  AND NOT has_table_privilege('nexo_worker','cash_approvals','UPDATE')
  AND NOT has_table_privilege('nexo_worker','cash_deposits','UPDATE')
  AND NOT has_table_privilege('nexo_worker','cash_transfers','UPDATE')
  AND NOT has_table_privilege('nexo_worker','cash_handoffs','UPDATE');

SELECT 1 / CASE WHEN bool_and(passed) AND count(*)=8 THEN 1 ELSE 0 END AS cash_workflow_rls_certified
FROM cash_rls_results;
TABLE cash_rls_results;
ROLLBACK;
