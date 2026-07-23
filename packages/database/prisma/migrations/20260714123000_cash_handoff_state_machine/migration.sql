ALTER TABLE cash_handoffs DROP CONSTRAINT IF EXISTS cash_handoffs_status_check;
ALTER TABLE cash_handoffs
  ADD CONSTRAINT cash_handoffs_status_check CHECK (
    status IN (
      'INITIATED', 'COUNT_REQUIRED', 'COUNTED', 'PENDING_ACCEPTANCE',
      'ACCEPTED', 'REJECTED', 'CANCELLED', 'COMPLETED', 'EXPIRED'
    )
  );

ALTER TABLE cash_handoffs
  ADD COLUMN outgoing_membership_id uuid,
  ADD COLUMN incoming_membership_id uuid,
  ADD COLUMN notes text,
  ADD COLUMN version integer NOT NULL DEFAULT 1,
  ADD COLUMN expires_at timestamptz,
  ADD COLUMN counted_by uuid,
  ADD COLUMN counted_at timestamptz,
  ADD COLUMN accepted_at timestamptz,
  ADD COLUMN rejected_at timestamptz,
  ADD COLUMN cancelled_at timestamptz,
  ADD COLUMN receipt jsonb,
  ADD COLUMN denominations jsonb NOT NULL DEFAULT '[]'::jsonb;

CREATE UNIQUE INDEX cash_handoffs_active_session_uidx
  ON cash_handoffs(tenant_id, session_id)
  WHERE status IN ('INITIATED','COUNT_REQUIRED','COUNTED','PENDING_ACCEPTANCE','ACCEPTED');

CREATE INDEX cash_handoffs_incoming_idx
  ON cash_handoffs(tenant_id, incoming_cashier_id, status, expires_at);
