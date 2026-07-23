# Cash Approvals

Approval requests are expiring, versioned resources with action/resource, requester, required permission, threshold, reason, status, decision actor/reason and correlation ID. The approver’s Membership and AuthorizationContext are resolved from PostgreSQL. Self-approval is denied when policy requires segregation. Concurrent decisions have one winner.
