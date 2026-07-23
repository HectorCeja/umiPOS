-- A catalog may expose at most one current price for a product variant/currency.
CREATE UNIQUE INDEX product_prices_one_active_per_variant_currency
  ON product_prices (tenant_id, product_id, variant_id, currency)
  WHERE active;

-- Selection of the primary image is an invariant, not a UI convention.
CREATE UNIQUE INDEX product_media_one_primary_per_product
  ON product_media (tenant_id, product_id)
  WHERE is_primary AND status = 'ACTIVE' AND deleted_at IS NULL;
