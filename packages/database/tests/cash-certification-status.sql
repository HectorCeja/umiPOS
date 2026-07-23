SELECT 'cash_pending='||count(*) FROM cash_outbox
WHERE published_at IS NULL AND quarantined_at IS NULL;
SELECT 'sales_pending='||count(*) FROM sales_outbox
WHERE published_at IS NULL AND quarantined_at IS NULL;
SELECT 'inventory_pending='||count(*) FROM inventory_outbox
WHERE published_at IS NULL;
SELECT 'cash_quarantined='||count(*) FROM cash_outbox WHERE quarantined_at IS NOT NULL;
SELECT 'sales_quarantined='||count(*) FROM sales_outbox WHERE quarantined_at IS NOT NULL;
