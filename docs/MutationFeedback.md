# Mutation Feedback

Required states are `idle`, `dirty`, `saving`, `success`, `error` and `conflict`. Authorization and validation failures map to localized error summaries rather than internal codes. Idempotent replay is reported as an already-applied success, not as a duplicate failure.

Profile editing and avatar upload use this contract. The avatar flow prepares a user-scoped private object key, uploads directly through a short-lived URL, validates ownership and size on completion, then exposes bytes only through an authenticated API route. The bucket remains private.
