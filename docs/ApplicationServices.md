# Application Services

Prompt 6 cases are `Create/Update/ArchiveOrganization`, `Create/Update/Archive/RestoreBranch`, `Save/Complete/RestartOnboarding`, `Create/Resend/Revoke/AcceptInvitation`, `UpdateMembership` and `UpdateFeature`.

Controllers perform transport validation, session/Origin/CSRF handling and delegate once. Services orchestrate authorization, secrets/mail and telemetry through ports. Repositories own atomic persistence, revalidate database-backed authorization inside every protected write transaction, enforce optimistic concurrency and append evidence. UI/controllers never access repositories or Prisma.

Acceptance is capability-based: its single-use tenant/email-bound secret authorizes only creation of the predeclared Membership; it cannot select a different role, Branch or Organization.
