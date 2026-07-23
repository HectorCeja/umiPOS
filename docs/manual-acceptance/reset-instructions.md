# Restablecer el entorno

Ejecuta nuevamente `pnpm manual-acceptance:prepare`. El comando está limitado a development/test, reconstruye el dataset demo y reemplaza únicamente `artifacts/manual-acceptance/current-run`. Para detener servicios usa `docker compose down`; no ejecutes estos comandos contra producción.
