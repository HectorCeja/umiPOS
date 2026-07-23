# POS bootstrap

`PosBootstrapPolicy` resolves enrollment, authentication, organization, branch, recovery, cash-session and operational states in a deterministic order. Revoked/outdated devices take priority. Production currently stops at `enrollmentRequired` because OpenAPI publishes no enrollment exchange.
