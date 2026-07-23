-- Product/category references are tenant-bound and cannot become orphans.
ALTER TABLE products
  ADD CONSTRAINT products_tenant_category_fk
  FOREIGN KEY (tenant_id, category_id)
  REFERENCES product_categories (tenant_id, id)
  ON DELETE RESTRICT;

ALTER TABLE product_categories
  ADD CONSTRAINT product_categories_tenant_parent_fk
  FOREIGN KEY (tenant_id, parent_id)
  REFERENCES product_categories (tenant_id, id)
  ON DELETE RESTRICT;

-- A child record that names both a product and variant must use a variant of that product.
CREATE UNIQUE INDEX product_variants_tenant_product_id_id_key
  ON product_variants (tenant_id, product_id, id);

ALTER TABLE product_barcodes
  ADD CONSTRAINT product_barcodes_product_variant_fk
  FOREIGN KEY (tenant_id, product_id, variant_id)
  REFERENCES product_variants (tenant_id, product_id, id)
  ON DELETE RESTRICT;

ALTER TABLE product_prices
  ADD CONSTRAINT product_prices_product_variant_fk
  FOREIGN KEY (tenant_id, product_id, variant_id)
  REFERENCES product_variants (tenant_id, product_id, id)
  ON DELETE RESTRICT;

ALTER TABLE product_media
  ADD CONSTRAINT product_media_product_variant_fk
  FOREIGN KEY (tenant_id, product_id, variant_id)
  REFERENCES product_variants (tenant_id, product_id, id)
  ON DELETE RESTRICT;
