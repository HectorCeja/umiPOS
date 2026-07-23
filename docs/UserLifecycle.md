# User lifecycle

The pure state machine in `@nexo/identity` is default-deny. A same-state write is not a transition; profile updates do not change status.

| From                   | Valid targets                                 | Intent                                                      |
| ---------------------- | --------------------------------------------- | ----------------------------------------------------------- |
| `PENDING_VERIFICATION` | ACTIVE, SUSPENDED, DISABLED, DELETED, EXPIRED | new account awaits primary mailbox control                  |
| `ACTIVE`               | LOCKED, SUSPENDED, DISABLED, DELETED, EXPIRED | normal usable account                                       |
| `LOCKED`               | ACTIVE, SUSPENDED, DISABLED, DELETED, EXPIRED | temporary security lock with `lockedUntil`                  |
| `SUSPENDED`            | ACTIVE, DISABLED, DELETED, EXPIRED            | administrative/risk suspension                              |
| `DISABLED`             | ACTIVE, DELETED                               | deliberate platform disablement; reactivation is privileged |
| `EXPIRED`              | ACTIVE, DISABLED, DELETED                     | policy/contract lifecycle expiration, not password expiry   |
| `DELETED`              | none                                          | terminal logical deletion                                   |

Every transition records `statusChangedAt`, reason and actor when applicable. `LOCKED` requires an expiry. `DELETED` requires `deletedAt`; all other states require it to be null. Prompt 4.1B implements `PENDING_VERIFICATION → ACTIVE` after a bound email-verification token and temporary `ACTIVE ↔ LOCKED` behavior for authentication failures; the pure transition matrix remains authoritative for broader lifecycle use cases.

State and Membership are orthogonal: an ACTIVE user can have no memberships, while suspension of one Membership does not necessarily suspend the global User.
