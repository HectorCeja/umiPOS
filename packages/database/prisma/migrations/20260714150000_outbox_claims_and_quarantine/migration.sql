ALTER TABLE cash_outbox
  ADD COLUMN claimed_at timestamptz,
  ADD COLUMN claimed_by uuid,
  ADD COLUMN claim_expires_at timestamptz,
  ADD COLUMN next_attempt_at timestamptz NOT NULL DEFAULT now(),
  ADD COLUMN first_attempt_at timestamptz,
  ADD COLUMN last_attempt_at timestamptz,
  ADD COLUMN quarantined_at timestamptz,
  ADD COLUMN error_code text;

ALTER TABLE sales_outbox
  ADD COLUMN claimed_at timestamptz,
  ADD COLUMN claimed_by uuid,
  ADD COLUMN claim_expires_at timestamptz,
  ADD COLUMN next_attempt_at timestamptz NOT NULL DEFAULT now(),
  ADD COLUMN first_attempt_at timestamptz,
  ADD COLUMN last_attempt_at timestamptz,
  ADD COLUMN quarantined_at timestamptz,
  ADD COLUMN error_code text;

CREATE INDEX cash_outbox_claimable
  ON cash_outbox(next_attempt_at,occurred_at)
  WHERE published_at IS NULL AND quarantined_at IS NULL;
CREATE INDEX sales_outbox_claimable
  ON sales_outbox(next_attempt_at,occurred_at)
  WHERE published_at IS NULL AND quarantined_at IS NULL;

COMMENT ON COLUMN cash_outbox.claim_expires_at IS
  'Expired leases are claimable after worker failure; publishing remains at-least-once.';
COMMENT ON COLUMN cash_outbox.quarantined_at IS
  'Terminal local quarantine after bounded retries; payload is never exposed by admin APIs.';
