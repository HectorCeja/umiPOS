#!/usr/bin/env bash
set -euo pipefail

export PATH="${HOME}/.local/opt/node-v24.18.0-linux-x64/bin:${PATH}"
export NEXO_ENV=test
export CASH_TEST_TENANTS=10000000-0000-4000-8000-000000000001
root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
evidence="${root}/artifacts/cash-certification/global-regression"
mkdir -p "${evidence}"
cd "${root}"

docker compose down -v --remove-orphans
docker compose up -d postgres redis minio otel-collector mailpit
docker compose run --rm migrate
docker compose up -d --scale worker=2 api web worker
for attempt in $(seq 1 60); do
  unhealthy=""
  while IFS= read -r container; do
    [[ -z "${container}" ]] && continue
    state="$(docker inspect --format '{{.State.Status}} {{if .State.Health}}{{.State.Health.Status}}{{end}}' "${container}")"
    [[ "${state}" =~ ^running([[:space:]]healthy)?$ ]] || unhealthy+="${container}:${state} "
  done < <(docker compose ps -q)
  [[ -z "${unhealthy}" ]] && break
  [[ "${attempt}" = 60 ]] && { echo "Unhealthy services: ${unhealthy}"; exit 1; }
  sleep 1
done

run_spec() {
  local name="$1"
  shift
  docker compose exec -T redis redis-cli FLUSHDB >/dev/null
  pnpm exec playwright test "$@" --workers=1 --reporter=list 2>&1 | tee "${evidence}/${name}.log"
}

run_spec authorization authorization.spec.ts
run_spec control-plane control-plane.spec.ts
run_spec product product.spec.ts
run_spec inventory inventory.spec.ts

pnpm test:cash:cleanup | tee "${evidence}/cash-cleanup.log"
run_spec cash \
  cash-concurrency.spec.ts \
  cash-concurrency-certification.spec.ts \
  cash-operations.spec.ts \
  cash-refund.spec.ts \
  cash-ui.spec.ts \
  cash.spec.ts \
  cash-performance.spec.ts

run_spec sales sales.spec.ts
# Sales regression deliberately exercises CASH completion without an operational drawer.
# Accelerate only those already-failed test events to their documented quarantine boundary.
docker compose exec -T postgres psql -U nexo_admin -d nexo -c \
  "UPDATE sales_outbox SET attempts=9,next_attempt_at=now() WHERE published_at IS NULL AND quarantined_at IS NULL"
for attempt in $(seq 1 30); do
  pending="$(docker compose exec -T postgres psql -U nexo_admin -d nexo -Atc \
    "SELECT count(*) FROM sales_outbox WHERE published_at IS NULL AND quarantined_at IS NULL")"
  [[ "${pending}" = 0 ]] && break
  [[ "${attempt}" = 30 ]] && { echo "Sales outbox did not reach quarantine boundary"; exit 1; }
  sleep 1
done

# Identity mutates password/session fixtures, therefore it intentionally runs last.
run_spec identity identity.spec.ts
pnpm test:ui 2>&1 | tee "${evidence}/ui.log"

docker compose exec -T postgres psql -v ON_ERROR_STOP=1 -U nexo_admin -d nexo -At \
  < packages/database/tests/cash-certification-status.sql | tee "${evidence}/status.txt"
grep -qx 'cash_pending=0' "${evidence}/status.txt"
grep -qx 'sales_pending=0' "${evidence}/status.txt"
grep -qx 'inventory_pending=0' "${evidence}/status.txt"
echo "global regression passed"
