# Cash Session

CashSession is the aggregate root binding tenant, Organization, Branch, Register, optional Drawer, cashier/Membership, currency, business date, timestamps, opening/expected/counted/variance projections, status and optimistic version. Membership comes from PostgreSQL, never token claims. Expected balance is subordinate to the ledger and must be rebuildable.
