# Cash Deposits

## Approval binding correction

`PrepareDeposit` now validates an optional approval as `APPROVED`, unexpired, action `DEPOSIT`, resource equal to the Cash Session, and requires a real deciding actor. When policy requires approval, absence or mismatch fails. The deposit persists the deciding actor rather than treating the Approval Request ID as an actor ID. Cancellation continues to use a compensating entry.

A deposit is operational removal of physical cash, not bank confirmation. States are `PREPARED`, `HANDED_OVER`, `CONFIRMED_MANUALLY`, `CANCELLED`; destination, reference, amount/currency, custody actors, receipt and audit are retained. Cancellation uses a corrective movement where money has already moved.
