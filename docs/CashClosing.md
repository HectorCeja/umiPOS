# Cash Closing

Normal close moves to `COUNTING`, blocks ordinary movement, records count, derives expected from ledger, reconciles, obtains reason/approval when required, records disposition/receipt/event and then reaches `CLOSED`. Pending Sales cash events block close by default. Version and idempotency prevent double close.
