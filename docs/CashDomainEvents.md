# Cash Domain Events

Internal v1 events cover Register/Drawer creation, Session opened/suspended/resumed/closed/force-closed/reopened/handoff, Sales/refund posting, movements, withdrawals/deposits/transfers, counts/variance and approvals. Envelope fields include event/version/time, tenant/Organization/Branch, aggregate/version, Register/Session, correlation/causation/actor and allowlisted payload. The transactional outbox provides at-least-once delivery; consumers deduplicate by event/source.
