# Cash Opening

Open validates active Register/available Drawer, database Membership, `cash.session.open`, currency/policy and exclusivity. In one transaction it creates the session, appends `OPENING_FLOAT`, emits event/outbox and produces a receipt model. The idempotency key replays the same response; partial unique indexes arbitrate races.
