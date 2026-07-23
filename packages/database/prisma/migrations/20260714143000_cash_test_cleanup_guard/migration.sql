CREATE OR REPLACE FUNCTION app.prevent_cash_history_mutation()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF current_user = 'nexo_admin'
     AND current_setting('app.cash_test_cleanup', true) = 'on' THEN
    RETURN OLD;
  END IF;
  RAISE EXCEPTION 'CASH_LEDGER_IMMUTABLE';
END
$$;

COMMENT ON FUNCTION app.prevent_cash_history_mutation() IS
  'Append-only guard. Only the migration owner may delete scoped fixtures after explicitly enabling app.cash_test_cleanup in a local/test transaction.';
