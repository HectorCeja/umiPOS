DO $cash$
DECLARE n text;
BEGIN
  FOREACH n IN ARRAY ARRAY['cash_registers','cash_drawers','cash_policies','cash_sessions','cash_ledger_entries','cash_counts','cash_count_denominations','cash_reconciliations','cash_variances','cash_approvals','cash_deposits','cash_transfers','cash_receipts','cash_idempotency_records','cash_events','cash_outbox'] LOOP
    EXECUTE format('CREATE POLICY migration_access ON %I FOR ALL TO nexo_migration USING (tenant_id=app.current_tenant_id()) WITH CHECK (tenant_id=app.current_tenant_id())',n);
  END LOOP;
END $cash$;
