-- Ledger evidence is immutable to Runtime. The migration owner alone may
-- perform controlled maintenance used by repeatable seeds and retention jobs.
CREATE OR REPLACE FUNCTION app.prevent_inventory_ledger_mutation() RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
  IF current_user = 'nexo_migration' THEN
    RETURN OLD;
  END IF;
  RAISE EXCEPTION 'inventory ledger is immutable';
END;
$$;
