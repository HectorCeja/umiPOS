#!/usr/bin/env bash
set -euo pipefail

root=$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)
cd "$root"

ip=${DEV_LAN_HOST:-${NEXO_LAN_IP:-$(ip -4 route get 1.1.1.1 2>/dev/null | awk '{for(i=1;i<=NF;i++) if($i=="src") {print $(i+1); exit}}')}}
if [[ -z "$ip" ]]; then
  echo 'No pudimos detectar una IPv4 local. Define NEXO_LAN_IP y vuelve a ejecutar.' >&2
  exit 1
fi

export DEV_LAN_HOST="$ip"
export DEV_WEB_PORT=${DEV_WEB_PORT:-3000}
export DEV_API_PORT=${DEV_API_PORT:-3001}
export DEV_OBJECT_STORAGE_PORT=${DEV_OBJECT_STORAGE_PORT:-9000}
export NEXO_APP_BASE_URL="http://${ip}:${DEV_WEB_PORT}"
export NEXO_PUBLIC_API_URL="http://${ip}:${DEV_API_PORT}"
export NEXO_PUBLIC_MEDIA_ORIGIN="http://${ip}:${DEV_OBJECT_STORAGE_PORT}"
export NEXO_AUTH_ALLOWED_ORIGINS="http://localhost:${DEV_WEB_PORT},http://127.0.0.1:${DEV_WEB_PORT},http://${ip}:${DEV_WEB_PORT}"

echo "Preparando NEXO para la red local ${ip}…"
current_origins=$(docker inspect nexo-api-1 --format '{{range .Config.Env}}{{println .}}{{end}}' 2>/dev/null | sed -n 's/^AUTH_ALLOWED_ORIGINS=//p' || true)
current_lan=$(docker inspect nexo-web-1 --format '{{range .Config.Env}}{{println .}}{{end}}' 2>/dev/null | sed -n 's/^DEV_LAN_HOST=//p' || true)
if [[ "$current_origins" != "$NEXO_AUTH_ALLOWED_ORIGINS" || "$current_lan" != "$DEV_LAN_HOST" ]]; then
  echo 'Aplicando configuración LAN segura a API, Web y almacenamiento…'
  docker compose up -d --no-build postgres redis minio mailpit otel-collector
  docker compose up -d --no-build --no-deps --force-recreate minio api web
fi
pnpm manual-acceptance:start

echo 'Verificando servicios compartidos…'
for url in "http://${ip}:3000" "http://${ip}:3001/health/ready" "http://${ip}:8025/readyz"; do
  curl -fsS --max-time 5 "$url" >/dev/null
done

cat <<EOF

────────────────────────────────────────
NEXO READY — RED LOCAL

Web      http://${ip}:${DEV_WEB_PORT}
API      http://${ip}:${DEV_API_PORT}
Mailpit  http://${ip}:8025
MinIO    http://${ip}:9001
Health   http://${ip}:${DEV_API_PORT}/health/ready

Abre la URL Web desde tu Mac conectado a la misma red.
────────────────────────────────────────
EOF
