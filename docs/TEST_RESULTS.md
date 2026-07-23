# Test results — Master Pass 2A

Resultado final, 2026-07-19:

- Suite focal Part 2A: 23 PASS, 0 FAIL funcional.
- CRUD real de ubicaciones: 2 PASS contra API y PostgreSQL reales.
- Walkthrough/evidencia Chromium: 1 PASS; Console, pageerror, requestfailed y HTTP inesperado en cero.
- Responsive móvil: 5/5 viewports llegan al último contenido.
- `pnpm manual-acceptance:prepare`: PASS; migraciones, seed y ocho servicios READY.
- `pnpm check`: PASS; format, lint, types, unit tests y builds.
- OpenAPI: 144 operaciones; SDK sincronizado.
- Flutter runtime: 1 SKIPPED porque Flutter 3.44.6 no está en PATH; no se simuló ejecución nativa.

El barrido descubrió y corrigió además una ayuda contextual que interceptaba acciones y un duplicado de ubicación que escapaba como HTTP 500.
