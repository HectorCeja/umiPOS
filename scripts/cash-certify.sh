#!/usr/bin/env bash
set -euo pipefail

export PATH="${HOME}/.local/opt/node-v24.18.0-linux-x64/bin:${PATH}"
export NEXO_ENV=test
export CASH_TEST_TENANTS=10000000-0000-4000-8000-000000000001

if [[ "${1:-}" = "--" ]]; then shift; fi
cycle="${1:-manual}"
root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
evidence="${root}/artifacts/cash-certification/${cycle}"
mkdir -p "${evidence}"
exec > >(tee "${evidence}/certification.log") 2>&1
cd "${root}"

echo "cash certification ${cycle} started $(date --iso-8601=seconds)"
docker compose down -v --remove-orphans
docker compose up -d postgres redis minio otel-collector mailpit
docker compose run --rm migrate
docker compose exec -T redis redis-cli FLUSHDB
pnpm test:cash:cleanup
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
docker compose ps > "${evidence}/compose.txt"

pnpm check
bash scripts/cash-worker-certify.sh
docker compose exec -T postgres psql -v ON_ERROR_STOP=1 -U nexo_admin -d nexo \
  < packages/database/tests/cash-refund-negative.integration.sql | tee "${evidence}/refund-negative.log"
pnpm exec playwright test \
  cash-concurrency.spec.ts \
  cash-concurrency-certification.spec.ts \
  cash-operations.spec.ts \
  cash-refund.spec.ts \
  cash-ui.spec.ts \
  cash.spec.ts \
  cash-performance.spec.ts --workers=1
node scripts/merge-cash-performance.mjs
docker compose exec -T postgres psql -v ON_ERROR_STOP=1 -U nexo_admin -d nexo \
  < packages/database/tests/rls.integration.sql | tee "${evidence}/rls.log"
docker compose exec -T postgres psql -v ON_ERROR_STOP=1 -U nexo_admin -d nexo \
  < packages/database/tests/cash-workflow-rls.integration.sql | tee "${evidence}/cash-workflow-rls.log"
pnpm test:ui
cp artifacts/cash-certification/performance/results.json "${evidence}/performance.json"

docker compose exec -T postgres psql -v ON_ERROR_STOP=1 -U nexo_admin -d nexo -At \
  < packages/database/tests/cash-certification-status.sql | tee "${evidence}/status.txt"
grep -qx 'cash_pending=0' "${evidence}/status.txt"
grep -qx 'sales_pending=0' "${evidence}/status.txt"
grep -qx 'inventory_pending=0' "${evidence}/status.txt"

echo "cash certification ${cycle} completed $(date --iso-8601=seconds)"
