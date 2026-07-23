# Context selection

V1 status: **PASS**. Organization, branch, membership, branch scope, device assignment and effective permissions are backend-validated before operational routing; forged or revoked context is rejected.

Organization and branch identifiers enter the client only after backend-authorized selection. They are carried as request context and cannot be edited through route parameters. The operational harness uses visibly labeled fixture identifiers.
