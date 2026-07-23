# Cash Outbox Operations

Operational status exposes pending and quarantined counts for Cash and Sales plus local UMI sink deliveries. Claims are exclusive while their lease is valid. Expired claims are eligible for another worker; transient failures advance `next_attempt_at`, while exhausted or permanent failures set quarantine metadata.

Healthy evidence in Prompt 11.4 reached zero pending Cash and Sales events during the positive refund suite. Inventory was not part of that isolated run, and the final all-module zero-outbox assertion remains pending. Manual replay is intentionally not exposed because authorization, audit and replay policy are not yet complete.
