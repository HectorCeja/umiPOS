#!/usr/bin/env bash
set -euo pipefail
if [[ "${NODE_ENV:-development}" != "development" && "${NODE_ENV:-}" != "test" ]]; then echo 'manual acceptance is local/test only' >&2; exit 1; fi
export PATH="$HOME/.local/opt/node-v24.18.0-linux-x64/bin:$PATH"
RUN=artifacts/manual-acceptance/current-run
rm -rf "$RUN"
mkdir -p "$RUN/screenshots" "$RUN/diagnostics"
docker compose up -d postgres redis minio mailpit otel-collector
# The migrate image contains the Prisma schema and seed; it does not bind-mount
# the workspace. Rebuild it so preparation always executes the current commit
# instead of a stale seed image left by an earlier validation run.
docker compose build migrate
# The migrate service command deploys migrations and seeds exactly once.
docker compose run --rm migrate
# Owner validation must exercise the current workspace, never stale application
# images. An explicit opt-out remains available only for repeat runs on an
# unchanged commit.
if [[ "${MANUAL_ACCEPTANCE_SKIP_REBUILD:-0}" == "1" ]]; then
  docker compose up -d api web worker
else
  docker compose up -d --build api web worker
fi
docker compose up -d --scale worker=2
node scripts/generate-manual-acceptance.mjs
docker compose ps --format json > "$RUN/service-health.json"
curl -fsS http://localhost:3001/health/ready > "$RUN/api-health.json"
curl -fsS http://localhost:3000/ > /dev/null

# The recommended owner must experience the real persisted onboarding on first entry.
# This uses the public Authentication and Control Plane APIs; it never edits onboarding
# state directly. The cookie jar is ephemeral and remains inside the local artifact run.
COOKIE_JAR="$RUN/.owner-session.cookies"
LOGIN_BODY=$(node -e "process.stdout.write(JSON.stringify({email:'alpha.owner@nexo.local',password:process.env.TEST_PERSONA_PASSWORD||'Nexo Test Persona 2026!',deviceFingerprint:'manual-acceptance-prepare',deviceName:'Preparación de aceptación'}))")
curl -fsS -c "$COOKIE_JAR" \
  -H 'origin: http://localhost:3000' \
  -H 'content-type: application/json' \
  --data "$LOGIN_BODY" \
  http://localhost:3001/v1/auth/login > /dev/null
ONBOARDING_STATE=$(curl -fsS -b "$COOKIE_JAR" \
  http://localhost:3001/v1/organizations/10000000-0000-4000-8000-000000000001/onboarding)
ONBOARDING_VERSION=$(printf '%s' "$ONBOARDING_STATE" | node -e "let s='';process.stdin.on('data',d=>s+=d).on('end',()=>process.stdout.write(String(JSON.parse(s).version)))")
CSRF_TOKEN=$(awk '$6 == "nexo_csrf" { print $7 }' "$COOKIE_JAR" | tail -1)
curl -fsS -b "$COOKIE_JAR" \
  -H "x-csrf-token: $CSRF_TOKEN" \
  -H 'content-type: application/json' \
  --data "{\"version\":$ONBOARDING_VERSION}" \
  http://localhost:3001/v1/organizations/10000000-0000-4000-8000-000000000001/onboarding/restart > /dev/null
rm -f "$COOKIE_JAR"

cp docs/manual-acceptance/10-results-template.md "$RUN/results.md"
cp docs/manual-acceptance/SCENARIOS.md "$RUN/checklist.md"
cp docs/manual-acceptance/START_HERE.md "$RUN/START_HERE.md"
cp docs/OWNER_TESTING_TOUR_V2.md "$RUN/OWNER_TESTING_TOUR.md"
cp docs/OwnerScreenReadiness.md "$RUN/SCREEN_READINESS.md"
cp docs/manual-acceptance/demo-credentials.md "$RUN/demo-credentials.md"
cp docs/manual-acceptance/reset-instructions.md "$RUN/reset-instructions.md"
: > "$RUN/issues.md"
printf '{"generatedAt":"%s","environment":"local","organization":"Café Horizonte","branches":["Centro","Norte"]}\n' "$(date -Iseconds)" > "$RUN/environment.json"
node scripts/generate-owner-acceptance-package.mjs
echo
echo 'NEXO UI V1 ESTÁ LISTA PARA REVISIÓN'
echo
echo 'Abre una sola dirección:'
echo 'http://localhost:3000'
echo
echo 'Cuenta recomendada:'
echo 'alpha.owner@nexo.local'
echo 'Contraseña demo: Nexo Test Persona 2026!'
echo
echo 'Esta primera revisión es visual: identidad, color, tipografía, composición, movimiento y coherencia.'
echo 'Sigue el recorrido dentro de la aplicación: inicia sesión, revisa el onboarding y explora Inicio.'
echo 'Recorrido recomendado: artifacts/manual-acceptance/current-run/OWNER_TESTING_TOUR.md'
echo 'Pantallas listas y parciales: artifacts/manual-acceptance/current-run/SCREEN_READINESS.md'
echo 'Tema: Oscuro es la referencia única del Design Freeze; Claro y Sistema están temporalmente deshabilitados.'
echo 'Para reiniciar el onboarding, vuelve a ejecutar este comando.'
echo 'Para registrar resultados: pnpm manual-acceptance:record'
echo
echo 'Herramientas técnicas opcionales para diagnóstico — no necesarias para probar el producto:'
echo 'Correo local: http://localhost:8025'
echo 'Otros usuarios demo: alpha.admin/supervisor/cashier/employee/readonly@nexo.local'
echo
echo 'MANUAL ACCEPTANCE READY'
echo "Empieza aquí: $RUN/START_HERE.md"
