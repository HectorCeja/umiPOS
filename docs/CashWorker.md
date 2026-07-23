# Cash Worker

## Prompt 11.5 certification status

Two real worker containers are healthy and manual evidence exists for lease expiry recovery, publish-before-mark redelivery and permanent quarantine. The prescribed automated matrix for claiming, crash, restart, retry, starvation and recovery has not been completed; worker certification remains yellow.

The worker uses the least-privilege `nexo_worker` PostgreSQL role. Cash and Sales envelopes are claimed with `FOR UPDATE SKIP LOCKED`, a time-bounded lease, bounded attempts and backoff. A permanent failure is quarantined; it does not block later aggregate events. Delivery is at-least-once, so the Cash consumer and local UMI sink enforce unique idempotency keys.

Prompt 11.4 observed two real worker containers processing the same outbox without duplicate refund postings. Manual recovery evidence covered an expired claim and delivery replay after publish-before-mark. The complete automated crash/restart/starvation matrix is still required, so this document does not declare the worker gate complete.

Local two-worker command:

```bash
docker compose up -d --scale worker=2 worker
docker compose ps worker
```

Neither worker role has `BYPASSRLS` or ledger mutation grants.

# Final worker certification (2026-07-14)

`scripts/cash-worker-certify.sh` launches two real Docker worker processes and uses test/local-only fault injection. It proves exclusive `FOR UPDATE SKIP LOCKED` claim, crash before publish, lease expiry/takeover, crash after publish before mark, idempotent redelivery, transient backoff, permanent and invalid-version quarantine, restart and continued healthy-event processing. Runtime interval is configurable through `WORKER_POLL_INTERVAL_MS` and defaults to 500 ms; normal local claim/publish measured 156–366 ms. Worker/runtime roles have minimum grants and no `BYPASSRLS`.
