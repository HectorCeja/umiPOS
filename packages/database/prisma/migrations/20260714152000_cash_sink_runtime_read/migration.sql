-- The operational status query is served by the API runtime role. RLS remains
-- authoritative: runtime_access already restricts rows to app.current_tenant_id().
GRANT SELECT ON cash_public_event_deliveries TO nexo_runtime;
