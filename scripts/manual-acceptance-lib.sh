#!/usr/bin/env bash
set -euo pipefail

NEXO_ROOT=$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)
NEXO_RUN="$NEXO_ROOT/artifacts/manual-acceptance/current-run"
NEXO_BOOT="$NEXO_ROOT/artifacts/boot-certification"
NEXO_SERVICES=(postgres redis minio mailpit otel-collector api worker web)

color() { [[ -t 1 ]] && printf '\033[%sm' "$1" || true; }
reset_color() { [[ -t 1 ]] && printf '\033[0m' || true; }
stage() { printf '\n%s▶ %s%s\n' "$(color '1;36')" "$*" "$(reset_color)"; }
ok() { printf '%s✓ %s%s\n' "$(color '1;32')" "$*" "$(reset_color)"; }
warn() { printf '%s! %s%s\n' "$(color '1;33')" "$*" "$(reset_color)"; }
fail() { printf '%s✗ %s%s\n' "$(color '1;31')" "$*" "$(reset_color)" >&2; }
elapsed() { printf '%ss' "$(( $(date +%s) - $1 ))"; }

run_with_heartbeat() {
  local description=$1
  shift
  local began pid rc
  began=$(date +%s)
  "$@" &
  pid=$!
  while kill -0 "$pid" 2>/dev/null; do
    sleep 10
    kill -0 "$pid" 2>/dev/null || break
    printf '  %s; transcurrido %s. Siguiente: verificar resultado.\n' "$description" "$(elapsed "$began")"
  done
  wait "$pid" || rc=$?
  rc=${rc:-0}
  ((rc == 0)) || { fail "$description falló (exit $rc). Revisa: pnpm manual-acceptance:logs"; return "$rc"; }
}

ensure_dirs() {
  mkdir -p "$NEXO_RUN/screenshots" "$NEXO_RUN/diagnostics" "$NEXO_BOOT/logs"
}

container_id() { docker compose -f "$NEXO_ROOT/compose.yaml" ps --all -q "$1" 2>/dev/null | head -1; }
container_state() {
  local id
  id=$(container_id "$1")
  [[ -n "$id" ]] || { printf 'MISSING'; return; }
  docker inspect --format '{{if .State.Running}}{{if .State.Health}}{{.State.Health.Status}}{{else}}running{{end}}{{else}}{{.State.Status}}{{end}}' "$id" 2>/dev/null || printf 'FAILED'
}
container_pid() {
  local id
  id=$(container_id "$1")
  [[ -n "$id" ]] && docker inspect --format '{{.State.Pid}}' "$id" 2>/dev/null || printf '-'
}

service_ready() {
  case "$1" in
    postgres) [[ "$(container_state postgres)" == 'healthy' ]] && docker compose -f "$NEXO_ROOT/compose.yaml" exec -T postgres pg_isready -U nexo_admin -d nexo >/dev/null 2>&1;;
    redis) [[ "$(container_state redis)" == 'healthy' ]] && [[ "$(docker compose -f "$NEXO_ROOT/compose.yaml" exec -T redis redis-cli ping 2>/dev/null)" == 'PONG' ]];;
    minio) [[ "$(container_state minio)" == 'healthy' ]] && curl -fsS --max-time 2 http://localhost:9000/minio/health/ready >/dev/null 2>&1;;
    mailpit) [[ "$(container_state mailpit)" == 'healthy' ]] && curl -fsS --max-time 2 http://localhost:8025/readyz >/dev/null 2>&1;;
    otel-collector) [[ "$(container_state otel-collector)" == 'healthy' ]] && curl -fsS --max-time 2 http://localhost:13133/ >/dev/null 2>&1;;
    api) [[ "$(container_state api)" == 'healthy' ]] && curl -fsS --max-time 2 http://localhost:3001/health/ready >/dev/null 2>&1;;
    web) [[ "$(container_state web)" == 'healthy' ]] && curl -fsS --max-time 2 http://localhost:3000/ >/dev/null 2>&1;;
    worker)
      [[ "$(container_state worker)" == 'healthy' ]]
      ;;
  esac
}

wait_for_services() {
  local started=$1 timeout=${2:-180} now service state
  shift 2
  local services=("$@") pending=("$@")
  declare -A ready_at=()
  stage "Esperando health checks en paralelo"
  while ((${#pending[@]})); do
    now=$(date +%s)
    if ((now - started >= timeout)); then
      fail "Timeout después de ${timeout}s. Servicios pendientes: ${pending[*]}"
      docker compose -f "$NEXO_ROOT/compose.yaml" ps
      printf 'Acción: pnpm manual-acceptance:logs\nComando sugerido: pnpm manual-acceptance:restart\n' >&2
      return 1
    fi
    local next=()
    for service in "${pending[@]}"; do
      if service_ready "$service"; then
        ready_at[$service]=$((now - started))
        ok "$service listo (${ready_at[$service]} s)"
      else
        next+=("$service")
      fi
    done
    pending=("${next[@]}")
    ((${#pending[@]})) || break
    if (((now - started) % 10 < 2)); then
      printf '  Esperando: '
      for service in "${pending[@]}"; do
        state=$(container_state "$service")
        printf '%s=%s ' "$service" "$state"
      done
      printf '(transcurrido %s)\n' "$(elapsed "$started")"
    fi
    sleep 2
  done
  ensure_dirs
  {
    printf 'service,ready_seconds\n'
    for service in "${services[@]}"; do printf '%s,%s\n' "$service" "${ready_at[$service]:-0}"; done
  } > "$NEXO_BOOT/latest-timeline.csv"
}

preflight() {
  stage 'Preflight'
  command -v docker >/dev/null || { fail 'Docker no está instalado. Instala Docker Engine y Compose.'; return 1; }
  docker info >/dev/null 2>&1 || { fail 'Docker no responde. Inicia Docker y ejecuta: pnpm manual-acceptance:start'; return 1; }
  docker compose version >/dev/null || { fail 'Docker Compose no está disponible. Instala el plugin compose.'; return 1; }
  command -v node >/dev/null || { fail 'Node no está disponible. Usa Node 24 según .node-version.'; return 1; }
  command -v pnpm >/dev/null || { fail 'pnpm no está disponible. Ejecuta: corepack enable'; return 1; }
  local available_kb
  available_kb=$(df -Pk "$NEXO_ROOT" | awk 'NR==2 {print $4}')
  if ((available_kb < 2097152)); then
    fail 'Espacio libre inferior a 2 GiB. Libera espacio antes de construir imágenes.'
    return 1
  fi
  local used_percent
  used_percent=$(df -Pk "$NEXO_ROOT" | awk 'NR==2 {gsub(/%/,"",$5); print $5}')
  if ((used_percent >= 85)); then
    warn "Disco al ${used_percent}%. Los builds fríos pueden degradarse. Diagnóstico: docker system df"
  fi
  if ! pnpm install --lockfile-only --offline --ignore-scripts >/dev/null 2>&1; then
    fail 'Lockfile o store pnpm inválido. Ejecuta: pnpm manual-acceptance:setup'
    return 1
  fi
  ok 'Docker, Compose, Node, pnpm, lockfile y espacio disponibles.'
}

deep_preflight() {
  stage 'Validando contratos, SDK, dependencias y Flutter'
  [[ -w "$NEXO_ROOT" ]] || { fail 'Workspace sin permiso de escritura. Corrige propietario/permisos del repositorio.'; return 1; }
  pnpm install --frozen-lockfile --offline --ignore-scripts >/dev/null || {
    fail 'Dependencias ausentes o store corrupto. Ejecuta pnpm install --frozen-lockfile.'
    return 1
  }
  pnpm --filter @nexo/contracts validate
  pnpm --filter @nexo/sdk generate:check
  if command -v flutter >/dev/null; then
    flutter --version | head -1
  else
    warn 'Flutter no está en PATH. Web manual puede iniciar; para QA Flutter configura Flutter 3.44.6.'
  fi
  local port owner
  declare -A port_owner=([3000]=web [3001]=api [5432]=postgres [6379]=redis [8025]=mailpit [9000]=minio [9001]=minio [13133]=otel-collector)
  for port in 3000 3001 5432 6379 8025 9000 9001 13133; do
    if command -v ss >/dev/null && ss -H -ltn "sport = :$port" 2>/dev/null | grep -q .; then
      owner=${port_owner[$port]}
      [[ -n "$(container_id "$owner")" ]] || { fail "Puerto $port ocupado fuera de NEXO. Libéralo y repite setup."; return 1; }
    fi
  done
  ok 'OpenAPI, SDK, dependencias, permisos y puertos validados.'
}

status_table() {
  printf '\n%-18s %-10s %-8s %s\n' SERVICE STATUS PID URL
  printf '%-18s %-10s %-8s %s\n' '------------------' '----------' '--------' '---'
  local service state label url
  for service in "${NEXO_SERVICES[@]}"; do
    state=$(container_state "$service")
    if service_ready "$service"; then label=READY
    else
      case "$state" in starting|created|restarting) label=STARTING;; exited|dead|FAILED) label=FAILED;; MISSING) label=BLOCKED;; *) label=DEGRADED;; esac
    fi
    case "$service" in
      web) url='http://localhost:3000';;
      api) url='http://localhost:3001/health/ready';;
      mailpit) url='http://localhost:8025';;
      minio) url='http://localhost:9001';;
      otel-collector) url='http://localhost:13133';;
      postgres) url='localhost:5432';;
      redis) url='localhost:6379';;
      *) url='-';;
    esac
    printf '%-18s %-10s %-8s %s\n' "$service" "$label" "$(container_pid "$service")" "$url"
  done
}

ready_summary() {
  local total=$1
  printf '\n══════════════════════════════════════\nNEXO READY\n'
  status_table
  printf '\nTiempo total: %s\nWeb: http://localhost:3000\nAPI: http://localhost:3001\nMailpit: http://localhost:8025\n' "$(elapsed "$total")"
  if [[ -n "${DEV_LAN_HOST:-}" ]]; then
    printf 'Web LAN: http://%s:%s\nAPI LAN: http://%s:%s\nObject storage LAN: http://%s:%s\n' \
      "$DEV_LAN_HOST" "${DEV_WEB_PORT:-3000}" \
      "$DEV_LAN_HOST" "${DEV_API_PORT:-3001}" \
      "$DEV_LAN_HOST" "${DEV_OBJECT_STORAGE_PORT:-9000}"
  fi
  printf 'Inicio owner: docs/owner-validation/START_HERE.md\n══════════════════════════════════════\n'
}

prepare_owner_package() {
  stage 'Preparando paquete de validación manual'
  ensure_dirs
  node "$NEXO_ROOT/scripts/generate-manual-acceptance.mjs"
  cp "$NEXO_ROOT/docs/manual-acceptance/10-results-template.md" "$NEXO_RUN/results.md"
  cp "$NEXO_ROOT/docs/manual-acceptance/SCENARIOS.md" "$NEXO_RUN/checklist.md"
  cp "$NEXO_ROOT/docs/owner-validation/START_HERE.md" "$NEXO_RUN/START_HERE.md"
  cp "$NEXO_ROOT/docs/OWNER_TESTING_TOUR_V2.md" "$NEXO_RUN/OWNER_TESTING_TOUR.md"
  cp "$NEXO_ROOT/docs/OwnerScreenReadiness.md" "$NEXO_RUN/SCREEN_READINESS.md"
  cp "$NEXO_ROOT/docs/manual-acceptance/demo-credentials.md" "$NEXO_RUN/demo-credentials.md"
  cp "$NEXO_ROOT/docs/manual-acceptance/reset-instructions.md" "$NEXO_RUN/reset-instructions.md"
  : > "$NEXO_RUN/issues.md"
  node "$NEXO_ROOT/scripts/generate-owner-acceptance-package.mjs"
  ok "Paquete listo: $NEXO_RUN/START_HERE.md"
}
