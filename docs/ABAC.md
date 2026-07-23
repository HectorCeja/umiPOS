# ABAC

RBAC answers which actions are provisionally granted; ABAC decides whether the specific request/resource satisfies those grants. Current attributes are User status, Membership status/type, Organization status, tenant, selected/authorized Branch, resource owner, resource state, grant validity window and product feature state.

Rules are deterministic: tenant mismatch always denies; a branch-scoped grant requires a resource branch within Membership scope; Self requires `resource.ownerUserId === actor.userId`; deleted resources deny and archived resources are read-only; disabled required features deny before grant evaluation.

Time is captured once as `evaluatedAt`. Resource attributes for enforcement must come from PostgreSQL, not request bodies. Future business-hour rules require a clock port, branch time zone, daylight-saving tests and a dedicated policy change; no local-time rule is implicit today.
