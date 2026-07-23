# Playwright E2E Guide

## Propósito

Playwright ejecuta E2E HTTP contra la API y dependencias reales. En 4.1B no existe UI de autenticación, por lo que `APIRequestContext` es el límite E2E correcto; no hay mocks de PostgreSQL, Redis, SMTP ni Mailpit.

## Ejecución

```sh
docker compose up --build --wait
docker compose run --rm -e DATABASE_URL="$MIGRATION_DATABASE_URL" migrate pnpm db:seed
pnpm test:e2e
```

En Compose normal, el contenedor `migrate` ya usa el rol de migración para deploy/seed. Una ejecución manual debe preservar esa separación. Las pruebas borran únicamente mensajes locales de Mailpit y usan exclusivamente las personas oficiales documentadas.

## Cobertura 4.1B

1. login, identidad, listado, refresh y logout;
2. rechazo CSRF sin token;
3. replay refresh y revocación de familia;
4. carrera concurrente con un ganador y familia cerrada;
5. listado y revocación de sesión remota propia;
6. reset por Mailpit, cambio, revocación y token de un uso;
7. verificación por Mailpit y token de un uso.

El archivo es `tests/e2e/identity.spec.ts`; la suite es serial porque modifica personas oficiales y el seed restablece su estado antes de cada corrida completa. Un fallo conserva trace/reporte en los directorios estándar de Playwright.
