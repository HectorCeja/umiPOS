# Authorization Scopes

| Scope        | Meaning                                   | v1 behavior                                       |
| ------------ | ----------------------------------------- | ------------------------------------------------- |
| GLOBAL       | platform-wide capability                  | engine supports it; no tenant persona receives it |
| ORGANIZATION | active tenant and its permitted resources | Owner/Admin/ReadOnly defaults                     |
| BRANCH       | one authorized resource branch            | Supervisor/Cashier/Employee defaults              |
| SELF         | resource owned by current User            | Cashier own cash-close grant                      |
| CUSTOM       | future constrained expression             | reserved and always denied                        |

The decision returns the granting scope. Organization grants may be narrowed to Branch when Membership access is branch-limited. Assignment branch, selected branch and Membership branch list all intersect; none expands another. Organization is the tenant, while Branch is only an authorization scope.
