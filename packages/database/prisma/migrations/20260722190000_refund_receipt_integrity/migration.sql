-- Refund/receipt certification: authoritative amounts, append-only history and
-- idempotent compensation of Sale, Payment, Cash and Inventory.

CREATE OR REPLACE FUNCTION app.protect_refund_line_history() RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
  RAISE EXCEPTION 'REFUND_LINE_IMMUTABLE';
END
$$;

CREATE TRIGGER refund_lines_immutable
  BEFORE UPDATE OR DELETE ON refund_lines
  FOR EACH ROW EXECUTE FUNCTION app.protect_refund_line_history();

CREATE OR REPLACE FUNCTION app.protect_refund_intent_history() RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
  IF OLD.tenant_id<>NEW.tenant_id OR OLD.id<>NEW.id OR OLD.sale_id<>NEW.sale_id
     OR OLD.actor_user_id<>NEW.actor_user_id OR OLD.amount_minor<>NEW.amount_minor
     OR OLD.idempotency_key<>NEW.idempotency_key OR OLD.reason<>NEW.reason
     OR OLD.created_at<>NEW.created_at THEN
    RAISE EXCEPTION 'REFUND_HISTORY_IMMUTABLE';
  END IF;
  IF OLD.status=NEW.status THEN RETURN NEW; END IF;
  IF (OLD.status='REQUESTED' AND NEW.status IN ('APPROVED','REJECTED'))
     OR (OLD.status='APPROVED' AND NEW.status IN ('COMPLETED','FAILED')) THEN
    RETURN NEW;
  END IF;
  RAISE EXCEPTION 'REFUND_INVALID_TRANSITION';
END
$$;

CREATE TRIGGER refund_intents_history_guard
  BEFORE UPDATE ON refund_intents
  FOR EACH ROW EXECUTE FUNCTION app.protect_refund_intent_history();

DROP TRIGGER sale_receipts_no_delete ON sale_receipts;
CREATE TRIGGER sale_receipts_immutable
  BEFORE UPDATE OR DELETE ON sale_receipts
  FOR EACH ROW EXECUTE FUNCTION app.prevent_sales_delete();
REVOKE UPDATE,DELETE ON sale_receipts FROM nexo_runtime;

ALTER TABLE refund_intents
  ADD CONSTRAINT refund_intent_status_valid
  CHECK (status IN ('REQUESTED','APPROVED','REJECTED','COMPLETED','FAILED'));

CREATE OR REPLACE FUNCTION app.validate_refund_line() RETURNS trigger
LANGUAGE plpgsql AS $$
DECLARE
  sold_quantity numeric(20,6);
  sold_total bigint;
  refund_sale_id uuid;
  item_sale_id uuid;
  returned_quantity numeric(20,6);
  authoritative_amount bigint;
BEGIN
  SELECT sale_id INTO STRICT refund_sale_id
  FROM refund_intents WHERE tenant_id=NEW.tenant_id AND id=NEW.refund_intent_id;
  SELECT sale_id,quantity,total_minor INTO STRICT item_sale_id,sold_quantity,sold_total
  FROM sale_items WHERE tenant_id=NEW.tenant_id AND id=NEW.sale_item_id FOR UPDATE;
  IF refund_sale_id<>item_sale_id THEN RAISE EXCEPTION 'REFUND_LINE_SALE_MISMATCH'; END IF;
  SELECT COALESCE(SUM(rl.quantity),0) INTO returned_quantity
  FROM refund_lines rl JOIN refund_intents ri
    ON ri.tenant_id=rl.tenant_id AND ri.id=rl.refund_intent_id
  WHERE rl.tenant_id=NEW.tenant_id AND rl.sale_item_id=NEW.sale_item_id
    AND ri.status<>'REJECTED';
  IF returned_quantity+NEW.quantity>sold_quantity THEN
    RAISE EXCEPTION 'REFUND_QUANTITY_EXCEEDS_SOLD';
  END IF;
  authoritative_amount:=floor((sold_total*NEW.quantity/sold_quantity)+0.5);
  IF NEW.amount_minor<>authoritative_amount THEN RAISE EXCEPTION 'REFUND_AMOUNT_MISMATCH'; END IF;
  RETURN NEW;
END
$$;

CREATE TRIGGER refund_lines_validate
  BEFORE INSERT ON refund_lines
  FOR EACH ROW EXECUTE FUNCTION app.validate_refund_line();

CREATE OR REPLACE FUNCTION app.validate_refund_intent_total() RETURNS trigger
LANGUAGE plpgsql AS $$
DECLARE line_total bigint;
BEGIN
  SELECT COALESCE(SUM(amount_minor),0) INTO line_total
  FROM refund_lines WHERE tenant_id=NEW.tenant_id AND refund_intent_id=NEW.refund_intent_id;
  IF line_total<>(SELECT amount_minor FROM refund_intents
                  WHERE tenant_id=NEW.tenant_id AND id=NEW.refund_intent_id) THEN
    RAISE EXCEPTION 'REFUND_TOTAL_MISMATCH';
  END IF;
  RETURN NULL;
END
$$;

CREATE CONSTRAINT TRIGGER refund_intent_total_matches_lines
  AFTER INSERT ON refund_lines DEFERRABLE INITIALLY DEFERRED
  FOR EACH ROW EXECUTE FUNCTION app.validate_refund_intent_total();

ALTER TABLE inventory_movements DROP CONSTRAINT inventory_movement_semantics;
ALTER TABLE inventory_movements ADD CONSTRAINT inventory_movement_semantics CHECK (
  (type IN ('PURCHASE','IMPORT') AND state='ON_HAND' AND quantity>0)
  OR (type='RETURN' AND state IN ('ON_HAND','DAMAGED','QUARANTINE') AND quantity>0)
  OR (type IN ('SALE','WASTE','CONSUMPTION') AND state='ON_HAND' AND quantity<0)
  OR (type IN ('ADJUSTMENT','CORRECTION','COUNT') AND state='ON_HAND')
  OR (type='RESERVATION' AND state='RESERVED' AND quantity>0)
  OR (type='RESERVATION_RELEASE' AND state='RESERVED' AND quantity<0)
  OR (type='TRANSFER' AND state IN ('ON_HAND','IN_TRANSIT'))
);

CREATE OR REPLACE FUNCTION app.complete_approved_refund_worker(
  p_tenant_id uuid,
  p_refund_id uuid,
  p_event_id uuid
) RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path=pg_catalog,public,app
AS $$
DECLARE
  refund_row record;
  sale_row record;
  line_row record;
  movement_id uuid;
  v_location_id uuid;
  stock_state "InventoryStockState";
  paid_amount bigint;
  completed_amount bigint;
  cash_paid bigint;
  prior_cash_refunded bigint;
  expected_cash bigint;
  posted_cash bigint;
  final_status text;
  balances jsonb;
BEGIN
  PERFORM set_config('app.current_tenant_id',p_tenant_id::text,true);
  SELECT * INTO STRICT refund_row FROM refund_intents
    WHERE tenant_id=p_tenant_id AND id=p_refund_id FOR UPDATE;
  IF refund_row.status='COMPLETED' THEN RETURN 0; END IF;
  IF refund_row.status<>'APPROVED' THEN RAISE EXCEPTION 'REFUND_NOT_APPROVED'; END IF;
  SELECT * INTO STRICT sale_row FROM sales
    WHERE tenant_id=p_tenant_id AND id=refund_row.sale_id FOR UPDATE;

  SELECT COALESCE(SUM(amount_minor),0) INTO paid_amount FROM sale_payments
    WHERE tenant_id=p_tenant_id AND sale_id=sale_row.id AND status IN ('CAPTURED','REFUNDED');
  SELECT COALESCE(SUM(amount_minor),0) INTO completed_amount FROM refund_intents
    WHERE tenant_id=p_tenant_id AND sale_id=sale_row.id AND status='COMPLETED';
  IF completed_amount+refund_row.amount_minor>paid_amount THEN
    RAISE EXCEPTION 'REFUND_EXCEEDS_PAID';
  END IF;

  SELECT COALESCE(SUM(amount_minor),0) INTO cash_paid FROM sale_payments
    WHERE tenant_id=p_tenant_id AND sale_id=sale_row.id AND method='CASH'
      AND status IN ('CAPTURED','REFUNDED');
  SELECT COALESCE(SUM(amount_minor),0) INTO prior_cash_refunded FROM cash_ledger_entries
    WHERE tenant_id=p_tenant_id AND sale_id=sale_row.id AND movement_type='CASH_REFUND'
      AND source_id NOT LIKE p_refund_id::text||':%';
  expected_cash:=LEAST(refund_row.amount_minor,GREATEST(0,cash_paid-prior_cash_refunded));
  SELECT COALESCE(SUM(amount_minor),0) INTO posted_cash FROM cash_ledger_entries
    WHERE tenant_id=p_tenant_id AND movement_type='CASH_REFUND'
      AND source_id LIKE p_refund_id::text||':%';
  IF posted_cash<>expected_cash THEN RAISE EXCEPTION 'REFUND_CASH_COMPENSATION_INCOMPLETE'; END IF;

  FOR line_row IN
    SELECT rl.*,si.product_variant_id,p.type AS product_type
    FROM refund_lines rl
    JOIN sale_items si ON si.tenant_id=rl.tenant_id AND si.id=rl.sale_item_id
    JOIN product_variants pv ON pv.tenant_id=si.tenant_id AND pv.id=si.product_variant_id
    JOIN products p ON p.tenant_id=pv.tenant_id AND p.id=pv.product_id
    WHERE rl.tenant_id=p_tenant_id AND rl.refund_intent_id=p_refund_id
    ORDER BY rl.id
  LOOP
    CONTINUE WHEN line_row.product_type<>'PHYSICAL' OR line_row.destination='DISCARDED';
    SELECT im.location_id INTO v_location_id FROM inventory_movements im
      WHERE im.tenant_id=p_tenant_id AND im.reference_type='SALE'
        AND im.reference_id=sale_row.id::text AND im.variant_id=line_row.product_variant_id
        AND im.type='SALE'
      ORDER BY im.recorded_at,im.id LIMIT 1;
    IF v_location_id IS NULL THEN RAISE EXCEPTION 'REFUND_ORIGINAL_LOCATION_NOT_FOUND'; END IF;
    stock_state:=CASE line_row.destination
      WHEN 'AVAILABLE' THEN 'ON_HAND'::"InventoryStockState"
      WHEN 'DAMAGED' THEN 'DAMAGED'::"InventoryStockState"
      WHEN 'QUARANTINE' THEN 'QUARANTINE'::"InventoryStockState"
    END;
    movement_id:=gen_random_uuid();
    INSERT INTO inventory_movements(
      tenant_id,id,variant_id,location_id,type,state,quantity,correlation_id,causation_id,
      idempotency_key,reference_type,reference_id,reason,occurred_at,actor_user_id,metadata
    ) VALUES (
      p_tenant_id,movement_id,line_row.product_variant_id,v_location_id,'RETURN',stock_state,
      line_row.quantity,sale_row.correlation_id,p_event_id,'refund:'||p_refund_id||':'||line_row.id,
      'REFUND',p_refund_id::text,line_row.reason,now(),refund_row.actor_user_id,
      jsonb_build_object('saleId',sale_row.id,'refundId',p_refund_id,'saleItemId',line_row.sale_item_id,
        'destination',line_row.destination)
    ) ON CONFLICT (tenant_id,idempotency_key) DO NOTHING;
    IF FOUND THEN
      SELECT jsonb_build_object(
        'onHand',COALESCE(SUM(quantity) FILTER(WHERE state='ON_HAND'),0)::text,
        'reserved',COALESCE(SUM(quantity) FILTER(WHERE state='RESERVED'),0)::text,
        'committed',COALESCE(SUM(quantity) FILTER(WHERE state='COMMITTED'),0)::text,
        'inTransit',COALESCE(SUM(quantity) FILTER(WHERE state='IN_TRANSIT'),0)::text,
        'damaged',COALESCE(SUM(quantity) FILTER(WHERE state='DAMAGED'),0)::text,
        'quarantine',COALESCE(SUM(quantity) FILTER(WHERE state='QUARANTINE'),0)::text
      ) INTO balances FROM inventory_movements
        WHERE tenant_id=p_tenant_id AND variant_id=line_row.product_variant_id
          AND inventory_movements.location_id=v_location_id;
      INSERT INTO inventory_snapshots(tenant_id,variant_id,location_id,through_movement_id,balances)
        VALUES(p_tenant_id,line_row.product_variant_id,v_location_id,movement_id,balances);
      INSERT INTO inventory_events(tenant_id,actor_user_id,aggregate_type,aggregate_id,event_type,payload)
        VALUES(p_tenant_id,refund_row.actor_user_id,'REFUND',movement_id,'InventoryRestored',
          jsonb_build_object('refundId',p_refund_id,'saleId',sale_row.id));
      INSERT INTO inventory_outbox(tenant_id,aggregate_type,aggregate_id,event_type,payload)
        VALUES(p_tenant_id,'REFUND',movement_id,'InventoryRestored',
          jsonb_build_object('refundId',p_refund_id,'saleId',sale_row.id));
    END IF;
  END LOOP;

  completed_amount:=completed_amount+refund_row.amount_minor;
  final_status:=CASE WHEN completed_amount=paid_amount THEN 'REFUNDED' ELSE 'PARTIALLY_REFUNDED' END;
  UPDATE refund_intents SET status='COMPLETED',updated_at=now()
    WHERE tenant_id=p_tenant_id AND id=p_refund_id AND status='APPROVED';
  UPDATE sales SET status=final_status,version=version+1,updated_at=now()
    WHERE tenant_id=p_tenant_id AND id=sale_row.id;
  IF final_status='REFUNDED' THEN
    UPDATE sale_payments SET status='REFUNDED',updated_at=now()
      WHERE tenant_id=p_tenant_id AND sale_id=sale_row.id AND status='CAPTURED';
  END IF;
  INSERT INTO sales_events(tenant_id,aggregate_id,aggregate_version,event_type,actor_user_id,
    correlation_id,payload)
  VALUES(p_tenant_id,sale_row.id,sale_row.version+1,'RefundCompleted',refund_row.actor_user_id,
    sale_row.correlation_id,jsonb_build_object('refundIntentId',p_refund_id,
      'amountMinor',refund_row.amount_minor::text,'saleStatus',final_status));
  INSERT INTO sales_outbox(tenant_id,aggregate_id,aggregate_version,event_type,event_version,
    correlation_id,causation_id,payload)
  VALUES(p_tenant_id,sale_row.id,sale_row.version+1,'RefundCompleted',1,sale_row.correlation_id,p_event_id,
    jsonb_build_object('refundIntentId',p_refund_id,'amountMinor',refund_row.amount_minor::text,
      'saleStatus',final_status));
  RETURN 1;
EXCEPTION WHEN no_data_found THEN
  RAISE EXCEPTION 'REFUND_NOT_FOUND';
END
$$;

REVOKE ALL ON FUNCTION app.complete_approved_refund_worker(uuid,uuid,uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION app.complete_approved_refund_worker(uuid,uuid,uuid) TO nexo_worker;
