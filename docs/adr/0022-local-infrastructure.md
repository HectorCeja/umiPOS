# ADR-022 — Docker Compose for local parity services

**Status:** Accepted — 2026-07-11

Compose provides PostgreSQL, Redis, S3-compatible MinIO, Mailpit, OpenTelemetry Collector and application containers with health/dependency ordering. It is reproducible local/integration infrastructure, not the production topology. Exact production services, region, IaC and secret/KMS controls remain blocked on ADR-015/cloud evaluation. Named volumes preserve developer state; disposable CI data remains synthetic.
