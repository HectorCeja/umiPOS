# Phase 0B — Repository Baseline

## Executive Summary

Phase 0B construyó el primer baseline técnico lógico del workspace NEXO. El baseline representa el contenido visible del filesystem antes de crear los entregables de esta fase. No representa un commit, tag, branch ni snapshot forense.

La huella cubre 6,674 archivos y 1,657,502,043 bytes. El hash agregado raíz es `003279341fec5d82035d6f11f848bc05acec52963f437bcabe2a3e3f151ec40b`. Se excluyeron `.git`, todos los `node_modules` y los propios entregables de Phase 0B.

Este baseline permite comparar contenido, categorías, dependencias declaradas, documentación, evidencia, herramientas y estructura Docker. No demuestra autoría, licencia suficiente, integridad histórica, identidad Git, producción ni reproducibilidad de builds en el host actual.

El **Repository Baseline Gate queda CLOSED**. El **Provenance Gate permanece OPEN**. Los gates son independientes. Phase 0C deberá partir de este inventario, pero no puede tratarlo como sustituto del baseline Git pendiente.

## Repository Manifest

El workspace contiene cuatro aplicaciones: API NestJS, Web Next.js, Worker Node y POS Flutter. Contiene 15 paquetes bajo `packages/`, más herramientas, scripts, documentación, tests, artefactos, Prisma, OpenAPI y SDK.

El manifiesto identifica autoridades y derivados sin enumerar cada archivo. La ruta estructurada es `artifacts/baseline/repository_manifest.json`.

## SHA256 Inventory

| Categoría     | Archivos |       Bytes | SHA-256 agregado                                                   |
| ------------- | -------: | ----------: | ------------------------------------------------------------------ |
| Source        |      406 |  21,537,885 | `9198b3fdb82c96f113a68f20812fb44eff4ebd81ad4f12e864016140e17b113d` |
| Generated     |    2,963 | 762,159,479 | `005ebdac9029e63ae1017cbb345f2c8be387fcb42fbffb6aa14edcfe038d9f4f` |
| Documentation |      536 |   1,683,223 | `856ceb4cdd7d89f3718099c674ef8643ee1ca32bb6e47f6b8b6a8bd6478b7e85` |
| Artifacts     |    2,003 | 853,148,151 | `cfed747ef8b58ca3ee04228deffd791557ea088c54bf01c6e26b760c6757d089` |
| Tests         |      470 |  16,638,619 | `e888ee71dcb72d3db0122554eb71ff9535938d30fd15dae11b3fd94d3f30c2ba` |
| Flutter       |      231 |   1,888,492 | `2c04d6b8f95c21467d790949f000a2cf81ae04b9ef255e5d41e769f82422d4d4` |
| Docker        |        6 |      10,744 | `4c4e9161a895e3446c1a757e6aa4d698aa4af945b658d80a3c113e72566efc5c` |
| Prisma        |       50 |     261,392 | `bda1e018b6b23de65acd4659812bb24896773cec12abffe3e33ace516cc89edb` |
| OpenAPI       |        4 |     165,745 | `dae8de4dca33ffde1e577ddf8696c928699a689e7b519c32b691a55c21a50669` |
| SDK           |        5 |       8,313 | `795f52dede8b806dd72413b62e7ddc7a64c93c163df2fa1c5a4a7eeeb3e4ad39` |

Cada archivo fue hasheado. Cada categoría hashea líneas ordenadas con hash y ruta relativa. El hash raíz combina los resúmenes ordenados de categorías. No es un Git tree hash.

## Dependency Inventory

El proyecto declara Node `>=24.0.0 <25` y fija pnpm `10.13.1`. Las dependencias principales observables incluyen Prisma 7.8.0, NestJS 11.1.24, Next.js 16.2.11, TypeScript 5.8.3, Vitest 3.2.4, Playwright 1.61.1 y OpenTelemetry SDK Node 0.221.0.

Compose declara PostgreSQL 18.0-alpine, Redis 8.2.1-alpine y MinIO con release fijado. BullMQ no aparece en los manifests NEXO inspeccionados.

El host actual tiene Node v12.22.9, Docker 29.6.1 y Compose v5.3.1. pnpm, Flutter y Dart no están disponibles en `PATH`. Por ello el inventario es reproducible, pero la ejecución de build no lo es en esta shell sin preparar el toolchain declarado.

## Generated Inventory

Se identificaron:

- Prisma Client generado desde `schema.prisma`.
- Mapa de operaciones SDK generado desde OpenAPI.
- Tokens Flutter generados desde definiciones de diseño.
- Evidencia de certificación derivada de ejecuciones.
- Outputs `.next`, `dist`, `build`, Storybook y Playwright.
- OpenAPI design-first. No es un derivado generado.

El cliente Flutter no es un cliente API completamente generado. Los derivados aparecen mezclados con source dentro del workspace no versionado.

## Documentation Inventory

Existen 520 documentos Markdown bajo `docs/`. El catálogo usa una taxonomía superpuesta por ruta y nombre. Por ello sus conteos temáticos no deben sumarse.

Incluye arquitectura, certificación, seguridad, deployment, API, Flutter, Inventory, Payments, Cash, Reports y manuales de owner. Phase 0B catalogó rutas. No hizo una nueva lectura semántica completa de los 520 documentos.

## Certification Inventory

Se catalogaron 20 documentos `PRODUCT_CERTIFICATION_PART_*`: Part 1A, Part 1B, Part 2A, Part 2B, Part 3A y Part 3B. También se registraron la respuesta formal UMI, el assessment de portabilidad y Phase 0A.

Los estados históricos permanecen como evidencia secundaria. No se reejecutaron pruebas. Las fechas no pueden certificarse como procedencia porque no existe historial Git.

## License Inventory

No se encontró `LICENSE`, `NOTICE` ni `COPYING` del repositorio fuera de dependencias y outputs. Tampoco se observó un campo de licencia en los manifests workspace inspeccionados.

La licencia del repositorio, de los workspaces y del código generado queda **UNKNOWN**. Los lockfiles y `NOTICES.Z` derivados permiten un inventario parcial de terceros, pero no constituyen una auditoría de licencias. La autorización de uso y autoría sigue bloqueada por Provenance.

## Secret Scan

Se ejecutó un inventario regex seguro sobre archivos de texto de hasta 2 MB. Se excluyeron dependencias, outputs y artefactos. No se imprimieron ni copiaron valores.

Se registraron 95 ubicaciones: 49 credenciales de test, 30 referencias de entorno o defaults locales, 2 ejemplos/local-development y 14 ubicaciones que requieren revisión manual. No se detectaron firmas de claves privadas, tokens GitHub ni access keys AWS.

Este resultado no demuestra ausencia absoluta de secretos. `compose.yaml` y `.env.example` contienen credenciales explícitamente locales. No se encontró un archivo `.env` real en el alcance inspeccionado.

## Build Baseline

No se ejecutó ningún build. Se inventariaron `pnpm check`, el build TypeScript/Turbo, Prisma generate, validación OpenAPI, generación SDK, Flutter build y Docker Compose build.

La evidencia secundaria de Part 3B registra cierres exitosos previos. Phase 0B no los revalidó. El toolchain actual es incompatible o incompleto para Node/pnpm/Flutter.

## Test Baseline

No se ejecutaron suites. Se contaron 394 archivos de test con patrones estrictos. La categoría hash contiene 470 archivos porque incluye helpers y harnesses dentro de carpetas de pruebas.

Se catalogaron Vitest, Playwright, SQL/RLS, Flutter, performance manual, OpenAPI, SDK y Docker. Los resultados previos solo se preservan como evidencia secundaria. Los tiempos de una ejecución limpia actual son UNKNOWN.

## Docker Baseline

Existe un `compose.yaml` y cuatro Dockerfiles: API, Migrate, Web y Worker. Los cuatro usan builds multi-stage sobre `node:24.18.0-alpine` y usuario runtime `nexo`.

Compose declara diez servicios, cuatro volúmenes nombrados, healthchecks y la red default. El archivo es local-development oriented. Incluye credenciales marcadas como locales y bind mounts de configuración. No prueba deployment productivo.

No se reconstruyeron imágenes ni se iniciaron contenedores.

## Workspace Statistics

| Métrica                        | Conteo |
| ------------------------------ | -----: |
| Apps                           |      4 |
| Packages                       |     15 |
| Manifests Node                 |     18 |
| Documentos Markdown en `docs/` |    520 |
| Tests por patrón estricto      |    394 |
| Artefactos preexistentes       |  2,003 |
| Dockerfiles                    |      4 |
| Compose files                  |      1 |
| Archivos Dart                  |     53 |
| Modelos Prisma                 |     62 |
| Migraciones Prisma             |     47 |
| Operaciones OpenAPI            |    145 |

Estas cifras describen el snapshot. No miden calidad.

## Repository Baseline Gate

| Control                 | Estado                |
| ----------------------- | --------------------- |
| Repository Manifest     | PASS                  |
| SHA256 Inventory        | PASS WITH OBSERVATION |
| Dependency Inventory    | PASS WITH OBSERVATION |
| Generated Inventory     | PASS                  |
| Documentation Inventory | PASS                  |
| Certification Inventory | PASS WITH OBSERVATION |
| License Inventory       | PASS WITH OBSERVATION |
| Secret Scan             | PASS WITH OBSERVATION |
| Build Baseline          | PASS WITH OBSERVATION |
| Test Baseline           | PASS WITH OBSERVATION |
| Docker Baseline         | PASS WITH OBSERVATION |
| Workspace Statistics    | PASS                  |

**Repository Baseline Gate: CLOSED**

El gate cierra porque los doce inventarios existen y tienen alcance y limitaciones explícitos. No afirma que builds o tests hayan sido ejecutados. El Provenance Gate permanece **OPEN** por HEAD no resoluble, cero commits, ausencia de remote, autoría y licencia no certificadas.

Phase 0C deberá consumir el manifiesto y la huella, resolver el siguiente objetivo formal del roadmap y mantener separadas la reproducibilidad de contenido y la procedencia Git. Phase 0B no inicia Phase 0C.

## Limitations

- No existe commit, tag o tree Git que ancle el snapshot.
- Las fechas de filesystem no son evidencia de procedencia.
- No se ejecutaron builds, tests, Prisma, Flutter ni Docker.
- El host no tiene el toolchain Node/pnpm/Flutter requerido.
- El secret scan es heurístico.
- La licencia y autoría siguen UNKNOWN.
- Los outputs grandes hacen que el baseline lógico ocupe 1.66 GB.
- Los resultados de certificaciones previas son evidencia secundaria no ligada a commit.

## Evidence

La evidencia estructurada vive en `artifacts/baseline/`. Incluye manifiesto, hashes, dependencias, generados, documentación, certificaciones, licencias, secretos, builds, tests, Docker y estadísticas.

## Files Created

Se creó este reporte y los archivos nuevos bajo `artifacts/baseline/`. El detalle completo está en `modified_files.json`.

## Read-Only Confirmation

No se modificó código, Git, Flutter, Prisma, Docker, OpenAPI, SDK, configuración ni documentación preexistente. No se ejecutaron migraciones, builds ni suites. Los únicos cambios de filesystem son el reporte y los artefactos nuevos autorizados de Phase 0B.
