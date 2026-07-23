# Cash Drawer

A Drawer models physical custody independently from Register and CashSession. States are `AVAILABLE`, `ASSIGNED`, `IN_USE`, `OUT_OF_SERVICE`, `ARCHIVED`. Hardware references are opaque/future-ready; no driver exists. Assignment never grants authorization and active-session exclusivity is database-enforced.
