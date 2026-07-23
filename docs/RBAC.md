# RBAC

Six stable system roles exist: `OWNER`, `ADMINISTRATOR`, `SUPERVISOR`, `CASHIER`, `EMPLOYEE`, `READ_ONLY`. Roles aggregate versioned permission grants; they are not evaluated by name in application code.

- Owner: all registry permissions at Organization scope.
- Administrator: all except membership revocation, at Organization scope.
- Supervisor: operational administration at Branch scope.
- Cashier: POS/read operations at Branch scope; own cash close at Self scope.
- Employee: limited sales/customer/appointment operations at Branch scope.
- ReadOnly: selected reads at Organization scope.

Membership role assignments carry tenant, optional branch/custom scope and validity interval. Multiple assignments combine additively, but ABAC, feature and tenant checks may still deny. There is no explicit deny grant in v1; default deny is authoritative. Customer-authored roles are postponed until governance, conflict and migration semantics are defined.
