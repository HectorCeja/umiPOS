# ADR-0054 — Private profile media commit

Status: Accepted · 2026-07-16

## Context

The avatar upload returned a derived URL before the user record was updated. A second request performed persistence, allowing orphan objects and false local success. Long encoded object keys also exceeded Fastify's default parameter limit.

## Decision

Profile media remains private in MinIO. Confirmation verifies the uploaded binary and atomically writes an ACTIVE media record plus `users.avatar_url` under user-scoped transaction context. Replaced media is marked SUPERSEDED before best-effort object cleanup. Removal clears the user association transactionally and marks the media DELETED. PostgreSQL uses FORCE RLS keyed by `app.current_user_id`. The existing opaque URL representation is retained and the router accepts parameters up to 512 bytes.

## Consequences

Upload preview is never authoritative. Clients trust only confirmation and refreshed identity. Object cleanup may be retried independently without losing the new avatar. A future token redesign may shorten URLs but must preserve private authenticated reads.
