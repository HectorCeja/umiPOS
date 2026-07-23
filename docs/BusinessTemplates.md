# Business Templates

Templates are versioned rows, not code branches. Initial definitions are Retail Store, Restaurant, Coffee Shop, Barber Shop, Beauty Salon, Tattoo Studio, Service Business and Other. Each row defines enabled feature keys, schema-versioned initial settings, category suggestions and suggested role permissions.

Runtime can only `SELECT` global template definitions. Adding or updating a template is an administrative data migration/seed change with validation, version increment, review and rollback data; no switch statement or application deployment logic is required. Existing Organizations retain the applied `templateVersion` and are never silently changed.

Unknown features, duplicate features, invalid keys/versions or non-object settings fail validation/default deny. Suggested permissions are guidance for the fixed role registry; templates cannot grant authority directly.
