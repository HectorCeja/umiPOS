# Flutter local database

Schema version 1 uses SQLite and creates metadata, cart drafts, payment recovery, receipt cache, and durable outbox tables in one immediate transaction. Startup rejects future schema versions. Dependencies prevent a receipt operation from becoming ready before its sale is acknowledged. Financial records are retained across retry states.

The implemented schema is production-capable storage infrastructure, but offline financial operation remains disabled until server reconciliation is implemented and certified.
