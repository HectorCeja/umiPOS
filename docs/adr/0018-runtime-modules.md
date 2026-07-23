# ADR-018 — Node 24 LTS, ESM and exact versions

**Status:** Accepted — 2026-07-11

Node 24 is LTS at the decision date; Node 20 is EOL and Node 26 is Current. Prisma 7 requires ESM and supports Node 24. The workspace pins Node 24 and pnpm 10, sets `type: module`, uses NodeNext/bundler resolution as appropriate and saves exact dependency versions. Upgrades occur in reviewed lockfile PRs after compatibility, tests and container build. Current/EOL runtimes are forbidden in production.
