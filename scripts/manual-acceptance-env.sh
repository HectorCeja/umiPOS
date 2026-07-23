#!/usr/bin/env bash
set -euo pipefail
source "$(dirname "$0")/manual-acceptance-lib.sh"
cd "$NEXO_ROOT"
export PATH="$HOME/.local/opt/node-v24.18.0-linux-x64/bin:$PATH"

if [[ -n "${DEV_LAN_HOST:-}" ]]; then
  if [[ "$DEV_LAN_HOST" == *://* || "$DEV_LAN_HOST" == */* || "$DEV_LAN_HOST" == *:* ]]; then
    fail 'DEV_LAN_HOST debe ser solo un hostname o IPv4, sin esquema, puerto ni ruta.'
    exit 2
  fi
  export DEV_WEB_PORT=${DEV_WEB_PORT:-3000}
  export DEV_API_PORT=${DEV_API_PORT:-3001}
  export DEV_OBJECT_STORAGE_PORT=${DEV_OBJECT_STORAGE_PORT:-9000}
  export NEXO_APP_BASE_URL="http://${DEV_LAN_HOST}:${DEV_WEB_PORT}"
  export NEXO_PUBLIC_API_URL="http://${DEV_LAN_HOST}:${DEV_API_PORT}"
  export NEXO_PUBLIC_MEDIA_ORIGIN="http://${DEV_LAN_HOST}:${DEV_OBJECT_STORAGE_PORT}"
  export NEXO_AUTH_ALLOWED_ORIGINS="http://localhost:${DEV_WEB_PORT},http://127.0.0.1:${DEV_WEB_PORT},http://${DEV_LAN_HOST}:${DEV_WEB_PORT}"
fi

action=${1:-status}
shift || true
started=$(date +%s)

case "$action" in
  setup)
    preflight
    deep_preflight
    stage 'Instalando dependencias del workspace (solo setup)'
    run_with_heartbeat 'Instalando dependencias' pnpm install --frozen-lockfile
    stage 'Descargando imágenes base'
    run_with_heartbeat 'Descargando imágenes base' docker compose pull postgres redis minio minio-init mailpit otel-collector
    stage 'Construyendo migrate, API, Worker y Web'
    for image in migrate api worker web; do
      run_with_heartbeat "Construyendo imagen ${image}" docker compose build --provenance=false "$image"
    done
    stage 'Iniciando infraestructura y aplicando migraciones/seed'
    run_with_heartbeat 'Iniciando infraestructura' docker compose up -d postgres redis minio mailpit otel-collector
    run_with_heartbeat 'Preparando bucket privado de MinIO' docker compose run --rm minio-init
    run_with_heartbeat 'Ejecutando migraciones y seed' docker compose run --rm migrate
    stage 'Iniciando aplicaciones'
    docker compose up -d --no-build --no-deps api worker web
    health_started=$(date +%s)
    wait_for_services "$health_started" 240 "${NEXO_SERVICES[@]}"
    prepare_owner_package
    ready_summary "$started"
    ;;
  start)
    preflight
    stage 'Inicio cotidiano: reutilizando imágenes, dependencias y volúmenes'
    configured_lan=$(docker inspect nexo-web-1 --format '{{range .Config.Env}}{{println .}}{{end}}' 2>/dev/null | sed -n 's/^DEV_LAN_HOST=//p' || true)
    if [[ -n "${DEV_LAN_HOST:-}" && "$configured_lan" != "$DEV_LAN_HOST" ]]; then
      stage 'La red LAN cambió; recreando únicamente API, Web y MinIO con la configuración nueva'
      docker compose up -d --no-build postgres redis minio mailpit otel-collector
      docker compose up -d --no-build --no-deps --force-recreate minio api web
    elif [[ -n "$(container_id postgres)" && -n "$(container_id web)" ]]; then
      # docker compose start follows depends_on and would rerun the one-shot
      # migration/seed containers. Direct starts preserve the prepared data and
      # make the daily path genuinely rebuild- and seed-free.
      run_with_heartbeat 'Iniciando contenedores de infraestructura' docker start \
        "$(container_id postgres)" "$(container_id redis)" "$(container_id minio)" \
        "$(container_id mailpit)" "$(container_id otel-collector)"
      health_started=$(date +%s)
      wait_for_services "$health_started" 120 postgres redis minio mailpit otel-collector
      stage 'Infraestructura iniciada; arrancando API, Worker y Web'
      run_with_heartbeat 'Iniciando aplicaciones' docker start "$(container_id api)" "$(container_id worker)" "$(container_id web)"
    else
      warn 'Faltan contenedores preparados; se crearán sin rebuild. Si falla, usa manual-acceptance:setup.'
      docker compose up -d --no-build postgres redis minio mailpit otel-collector api worker web
    fi
    health_started=$(date +%s)
    wait_for_services "$health_started" 180 "${NEXO_SERVICES[@]}"
    prepare_owner_package
    ready_summary "$started"
    ;;
  status)
    preflight
    status_table
    ;;
  logs)
    services=("$@")
    ((${#services[@]})) || services=(api web worker postgres redis minio mailpit otel-collector)
    printf 'Mostrando logs (Ctrl+C para salir): %s\n' "${services[*]}"
    docker compose logs --tail="${NEXO_LOG_TAIL:-100}" -f "${services[@]}"
    ;;
  stop)
    stage 'Deteniendo NEXO sin eliminar datos ni imágenes'
    docker compose stop
    ok "Entorno detenido ($(elapsed "$started"))."
    ;;
  restart)
    preflight
    stage 'Reiniciando contenedores sin rebuild'
    run_with_heartbeat 'Reiniciando servicios' docker compose restart postgres redis minio mailpit otel-collector api worker web
    health_started=$(date +%s)
    wait_for_services "$health_started" 180 "${NEXO_SERVICES[@]}"
    ready_summary "$started"
    ;;
  rebuild)
    preflight
    deep_preflight
    stage 'Reconstrucción explícita de imágenes de aplicación'
    for image in migrate api worker web; do
      run_with_heartbeat "Reconstruyendo imagen ${image}" docker compose build --provenance=false "$image"
    done
    stage 'Aplicando migraciones/seed y recreando aplicaciones'
    run_with_heartbeat 'Iniciando infraestructura' docker compose up -d postgres redis minio mailpit otel-collector
    run_with_heartbeat 'Preparando bucket privado de MinIO' docker compose run --rm minio-init
    run_with_heartbeat 'Ejecutando migraciones y seed' docker compose run --rm migrate
    docker compose up -d --no-build --no-deps --force-recreate api worker web
    health_started=$(date +%s)
    wait_for_services "$health_started" 300 "${NEXO_SERVICES[@]}"
    prepare_owner_package
    ready_summary "$started"
    ;;
  reset)
    preflight
    warn 'RESET elimina los volúmenes locales de PostgreSQL, Redis, MinIO y Mailpit.'
    if [[ "${NEXO_CONFIRM_RESET:-}" != 'RESET' ]]; then
      fail 'Confirmación requerida. Ejecuta: NEXO_CONFIRM_RESET=RESET pnpm manual-acceptance:reset'
      exit 2
    fi
    run_with_heartbeat 'Eliminando contenedores y volúmenes locales' docker compose down -v --remove-orphans
    run_with_heartbeat 'Limpiando cache BuildKit no utilizada' docker builder prune --all --force
    rm -rf "$NEXO_RUN" "$NEXO_BOOT/logs"
    exec bash "$0" setup
    ;;
  *)
    fail "Acción desconocida: $action"
    printf 'Usa: setup | start | status | logs [servicios] | stop | restart | rebuild | reset\n' >&2
    exit 2
    ;;
esac
