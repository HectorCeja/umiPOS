#!/usr/bin/env bash
set -euo pipefail
if [[ "${NODE_ENV:-development}" != "development" && "${NODE_ENV:-}" != "test" ]]; then
  echo 'sales-admin:certify is local/test only' >&2
  exit 1
fi
export PATH="$HOME/.local/opt/node-v24.18.0-linux-x64/bin:$PATH"
ARTIFACTS=artifacts/sales-administration-certification
PLAYWRIGHT_IMAGE=mcr.microsoft.com/playwright:v1.61.1-noble
mkdir -p "$ARTIFACTS"
if [[ "${SALES_CERTIFY_FINALIZE:-0}" == "1" ]]; then
  node scripts/sales-admin-certification-evidence.mjs
  echo 'SALES ADMINISTRATION AUTOMATED CERTIFICATION GREEN'
  exit 0
fi
run_browser() {
  docker run --rm --network host --user "$(id -u):$(id -g)" -e HOME=/tmp \
    -v "$PWD:/workspace" -w /workspace "$PLAYWRIGHT_IMAGE" \
    node_modules/.bin/playwright "$@"
}
if [[ "${SALES_CERTIFY_RESUME:-0}" != "1" ]]; then
  docker compose down -v --remove-orphans
  docker compose up -d postgres redis minio mailpit otel-collector
  docker compose run --rm migrate
  docker compose run --rm migrate pnpm db:seed
  docker compose up -d --build api web worker
  docker compose up -d --scale worker=2
fi
pnpm check
docker run --rm -v "$PWD:/workspace" alpine:3.22 rm -rf /workspace/test-results /workspace/playwright-report
run_browser test tests/e2e/sales.spec.ts --reporter=line
run_browser test tests/e2e/sales-administration-certification.spec.ts --reporter=json > "$ARTIFACTS/playwright.json"
run_browser test tests/e2e/sales-administration-ui.spec.ts --reporter=json > "$ARTIFACTS/accessibility.json"
run_browser test tests/e2e/sales-administration-visual.spec.ts --reporter=json > "$ARTIFACTS/visual-regression.json"
rm -rf test-results playwright-report
pnpm test:ui
pnpm sales-admin:performance > "$ARTIFACTS/performance.log"
cp artifacts/sales-administration/performance.json "$ARTIFACTS/performance.json"
{
  docker compose exec -T postgres psql -v ON_ERROR_STOP=1 -U nexo_admin -d nexo < packages/database/tests/rls.integration.sql
  docker compose exec -T postgres psql -v ON_ERROR_STOP=1 -U nexo_admin -d nexo < packages/database/tests/cash-workflow-rls.integration.sql
} > "$ARTIFACTS/rls.json"
bash scripts/global-regression.sh > "$ARTIFACTS/global-regression.json"
docker compose ps --format json > "$ARTIFACTS/service-health.json"
node scripts/sales-admin-certification-evidence.mjs
echo 'SALES ADMINISTRATION AUTOMATED CERTIFICATION GREEN'
