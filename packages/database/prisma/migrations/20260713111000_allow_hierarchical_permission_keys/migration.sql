-- Permission namespaces may contain multiple stable segments, for example
-- authorization.context.read. Preserve the original migration and correct the
-- overly restrictive one-dot validation forward-only.

ALTER TABLE "authorization_permission_definitions"
  DROP CONSTRAINT "authorization_permission_key_format",
  ADD CONSTRAINT "authorization_permission_key_format"
    CHECK ("key" ~ '^[a-z][a-z0-9_]*(\.[a-z][a-z0-9_]*)+$');
