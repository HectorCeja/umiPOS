# Flutter External Payments

V1 status: **PASS** for the approved minimum manual external tender. Explicit cashier confirmation and a non-sensitive reference create an auditable real Payment Attempt; NEXO never captures PAN, CVV or track data.

The backend contract accepts `CARD_EXTERNAL`, `BANK_TRANSFER` and `OTHER` with an optional non-sensitive provider reference. Flutter has no productive confirmation screen or E2E evidence for this flow. It is unavailable, not simulated.
