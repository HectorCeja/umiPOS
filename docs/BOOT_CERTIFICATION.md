# NEXO Boot & Environment Reliability Certification

Status: **BOOT & ENVIRONMENT RELIABILITY CERTIFIED**  
Date: 2026-07-18  
Scope: development, manual acceptance and QA boot only. Product behavior was not changed.

## Architecture and readiness

`manual-acceptance-env.sh` is the single operational entry point and delegates probes,
progress reporting and diagnostics to `manual-acceptance-lib.sh`. PostgreSQL, Redis,
MinIO, Mailpit and OTel start in parallel. API, Worker and Web start after infrastructure
is ready. Readiness is based on service-specific probes, not container existence.

| Service       | Probe                              | Ready state |
| ------------- | ---------------------------------- | ----------- |
| PostgreSQL    | `pg_isready` plus container health | READY       |
| Redis         | `redis-cli ping` = PONG            | READY       |
| MinIO         | `/minio/health/ready`              | READY       |
| Mailpit       | `/readyz`                          | READY       |
| OpenTelemetry | collector health endpoint          | READY       |
| API           | `/health/ready`                    | READY       |
| Worker        | container health                   | READY       |
| Web           | `/` plus container health          | READY       |

Every potentially long operation emits a heartbeat every 10 seconds. States shown to
the owner are READY, STARTING, DEGRADED, FAILED or BLOCKED. Failures include a cause,
recommended action and command.

## Commands

| Command                                                 | Purpose                                                           |
| ------------------------------------------------------- | ----------------------------------------------------------------- |
| `pnpm manual-acceptance:setup`                          | One-time cold install, pull, build, migration, seed and start     |
| `pnpm manual-acceptance:start`                          | Daily start; no build, install, migration, seed or SDK generation |
| `pnpm manual-acceptance:status`                         | Service probes, PID and URLs                                      |
| `pnpm manual-acceptance:logs [service]`                 | Follow clear service logs                                         |
| `pnpm manual-acceptance:stop`                           | Stop while preserving images and data                             |
| `pnpm manual-acceptance:restart`                        | Restart containers without rebuild                                |
| `pnpm manual-acceptance:rebuild`                        | Explicit application image rebuild and migration/seed             |
| `NEXO_CONFIRM_RESET=RESET pnpm manual-acceptance:reset` | Destructive volumes/cache reset followed by setup                 |

`manual-acceptance:prepare` remains a compatibility alias for `setup`; daily use must use
`start`.

## Measured timeline

Environment: Linux Mint runner, Docker BuildKit, warm local image/store cache, workspace
on the owner filesystem. Measurements are observed wall clock values, not estimates.

| Scenario                        |                    Before |                                     After / certified | Result                        |
| ------------------------------- | ------------------------: | ----------------------------------------------------: | ----------------------------- |
| Status                          |             not separated |                                                 2.2 s | PASS                          |
| Stop                            |        coupled to prepare |                                               14.43 s | PASS                          |
| Warm daily start                | rebuilt/reseeded, minutes |                                               27.84 s | PASS                          |
| Restart                         |             not separated |                                               19.02 s | PASS                          |
| Explicit rebuild                |   10+ min apparent freeze |                           665.75 s, visible heartbeat | PASS with performance warning |
| Cold setup after cache reset    |   previously unobservable | 694.68 s build/start; all services subsequently READY | PASS with performance warning |
| Reset teardown/cache cleanup    |               not guarded |                               76.11 s plus cold setup | PASS                          |
| Web login available after READY |                   unknown |                                                 23 ms | PASS                          |
| API health after READY          |                   unknown |                                                 16 ms | PASS                          |

The first cold setup exposed a false health timeout because its 240-second readiness
budget started before the image build. The budget now begins immediately before probes;
the same running services were independently verified READY. All Compose create/start,
build, migration, seed and cleanup paths now have visible heartbeat output.

## Bottleneck ranking

1. API/Worker standalone dependency export and Docker layer unpack on this filesystem
   (dominates explicit cold rebuild).
2. Initial image export/unpack after BuildKit cache removal.
3. MinIO one-shot initialization and fresh PostgreSQL migration/seed.
4. Owner acceptance package generation.
5. Health probes (typically 0–11 seconds; not a bottleneck).

An attempted hard-link deploy was measured for 377.52 seconds without completing and was
reverted; it did not provide a defensible improvement. The safe, high-value optimization
is therefore the daily path: it bypasses all rebuild/export/migration work and reaches
READY in under 30 seconds.

## Optimizations applied

- Docker context excludes Flutter build output, `.dart_tool`, ephemeral output and
  TypeScript build info; context fell from about 488 MB to under 1 MB on the final run.
- Daily start directly starts prepared containers, avoiding Compose one-shot dependency
  replay.
- SDK/OpenAPI/dependency checks run in setup/rebuild, never in daily start.
- Infrastructure and readiness probes run concurrently.
- BuildKit provenance is disabled for local QA builds.
- Reset is destructive only with explicit `NEXO_CONFIRM_RESET=RESET`.
- Disk pressure, occupied ports, Docker availability, lockfile/store, permissions,
  OpenAPI/SDK drift and Flutter availability receive actionable diagnostics.

## Troubleshooting

- `BLOCKED` or missing container: run `pnpm manual-acceptance:setup` once.
- `DEGRADED`: run `pnpm manual-acceptance:status`, then
  `pnpm manual-acceptance:logs <service>`.
- Port occupied: stop the external process named by the preflight and retry.
- Disk at 85% or more: inspect `docker system df`; use reset only when local data may be
  destroyed.
- OpenAPI/SDK drift: regenerate through the repository command reported by preflight.
- Flutter unavailable: configure Flutter 3.44.6; Web manual acceptance remains usable.

The normal owner loop is `start` → `status` → work → `stop`. Rebuild and reset are explicit,
exceptional operations and are never hidden inside the daily path.
