# Phase 0C — Dependency, Toolchain & Build Baseline

## Executive Summary

El baseline Git remoto es válido y clonable. La instalación inmutable y los generators principales son reproducibles. OpenAPI, SDK, Prisma, Flutter foundation y Web tienen evidencia nueva favorable.

El baseline completo no puede construirse limpiamente. Root, API y Worker fallan desde el clone temporal. El CI remoto del commit baseline también está rojo. Los builds locales Docker produjeron cuatro imágenes usando cache, pero API y Worker fallan en los builds limpios del CI. La evidencia limpia prevalece sobre el cache local.

**Dependency & Build Baseline Gate: BLOCKED.**

Technical Provenance queda **CLOSED WITH OBSERVATIONS**. Legal/Ownership Provenance permanece **OPEN**. No se autoriza portado de código ni Phase 0D.

## Git Baseline Verification

- HEAD: `7f0bddf5c98a5efe1b6c42b7b5ad767207cd82e8`.
- Subject: `chore: initial UmiPOS baseline`.
- Branch: `main`.
- Upstream: `origin/main`.
- Remote: `git@github.com:HectorCeja/umiPOS.git`.
- Tag anotado: `v0.0.0-baseline`.
- Tag target: el mismo commit.
- Commit y tag existen local y remotamente.
- Working tree inicial: limpio.
- Commit count: 1.
- `git fsck`: un dangling tree local. No afecta el commit publicado, pero queda como observación.

## Environment

Host Linux Mint 21.3, x86_64, 12 CPU, 15 GiB RAM y 17 GiB libres antes del build. Node host es v12.22.9. npm, Corepack, pnpm, Flutter, Dart y psql no están disponibles. Docker 29.6.1, Compose v5.3.1 y buildx v0.35.0 sí están disponibles.

## Repository Toolchain

El repositorio fija Node 24.18.0, pnpm 10.13.1 y Prisma 7.8.0. Flutter exige `>=3.44.0`; CI fija 3.44.6. Dart exige `>=3.12.0 <4.0.0`. Android CI usa Java 17. Docker usa Node 24.18.0-alpine.

No se detectó contradicción material entre repositorio, Docker y CI.

## Host Capability

**BLOCKED.** El host no puede ejecutar el workspace Node ni Flutter directamente. Esto es una limitación del host, no una ausencia de capacidad del repositorio.

## Container Capability

**AVAILABLE WITH OBSERVATIONS.** Docker provee Node, pnpm, Prisma y TypeScript. No provee Flutter. Corepack debe habilitar el shim como root en build-stage o invocarse como `corepack pnpm`.

`pnpm deploy` mostró presión I/O severa.

## CI Capability

La configuración CI está versionada. La ejecución remota del commit fue verificada mediante la API pública de GitHub.

Run `30028097057`: **FAIL**.

- Quality: FAIL en lint.
- Migration: FAIL en seed. RLS quedó skipped.
- Design system: FAIL.
- Authentication E2E: FAIL al levantar Compose.
- Docker API y Worker: FAIL.
- Docker Web y Migrate: PASS.
- Flutter foundation: PASS.
- Compose config: PASS.
- CodeQL: PASS.

Los logs completos requieren permisos admin y no fueron accesibles sin credenciales.

## Version Compatibility

Node, pnpm, Prisma y Flutter están alineados entre archivos canónicos, Docker y CI. Los desajustes observados pertenecen al host: Node 12, Java 11 y ausencia de pnpm/Flutter.

`ubuntu-latest` y los major tags de GitHub Actions permanecen flotantes.

## Workspace Dependency Graph

Se inventariaron 19 proyectos workspace. No se detectaron ciclos declarados.

El fallo material está en `config → identity`. `@nexo/identity` exporta `dist/index.*`, pero el build limpio emite `dist/src/index.*`. Bajo el layout del install CI, `@nexo/config` no puede resolver el paquete.

## Lockfile

`pnpm-lock.yaml`:

- SHA-256: `2b1026810330e45b50477ffa518936c8b60a3e33e959972aea6f9f3543c4da56`.
- Lockfile 9.0.
- 19 importers.
- Aproximadamente 1,109 packages y 1,112 snapshots.
- Sin merge markers.
- Sin URLs privadas ni dependencias Git flotantes detectadas.
- Sin drift después de install.

## Install Reproducibility

`pnpm install --frozen-lockfile` pasó en el clone temporal con Node 24.18.0 y pnpm 10.13.1.

- 984 paquetes.
- 42.6 segundos reportados por pnpm.
- 137 segundos incluyendo arranque y cleanup Docker.
- Red requerida.
- Lockfile sin cambios.

Postinstall ejecutó Prisma engines, esbuild, NestJS y nestjs-pino. Husky no encontró Git dentro de la imagen mínima.

## Script Inventory

Los comandos canónicos son:

- Install: `pnpm install --frozen-lockfile`.
- Generate: `pnpm db:generate`.
- Build: `pnpm build`.
- Full gate: `pnpm check`.
- Flutter: `pnpm flutter:check`.
- Docker: `docker compose build`.

Los scripts de migración, reset, seed, limpieza y aceptación manual son stateful y no forman parte de una reproducción read-only.

## Generation Pipeline

Prisma generate, OpenAPI validation/compatibility, SDK drift check y Flutter token/assets checks pasaron. No hubo drift tracked.

Dart codegen completo no está implementado.

## Prisma

Prisma y `@prisma/client` están alineados en 7.8.0. Schema PostgreSQL válido. Generación exitosa para `linux-musl-openssl-3.0.x`. Existen 47 migraciones.

Migration status no se ejecutó contra una base. No se aplicaron migraciones.

## OpenAPI

OpenAPI design-first vive en `packages/contracts/openapi/openapi.json`. Validación PASS con 145 operaciones y `operationId` únicos. Compatibility 3.0.0 PASS.

## SDK

Generate check PASS. Tests 2/2 PASS. Build PASS. Sin drift.

## TypeScript

**FAIL.** Typecheck y root build fallan en `@nexo/config#build` con TS2307 para `@nexo/identity`.

La causa reproducida es el desacuerdo entre exports `dist/index.*` y output real `dist/src/index.*`.

## API Build

**FAIL limpio.** El build Node del clone falla por la dependencia anterior. Docker local incremental produjo imagen, pero el Docker limpio remoto de API falló.

## Web Build

**PASS.** Next.js 16.2.11 compiló, verificó TypeScript y generó standalone. Docker local y remoto PASS.

## Worker Build

**FAIL limpio.** Mismo fallo `config → identity`. Docker local incremental produjo imagen, pero el Docker limpio remoto falló.

## Flutter

- Repository capability: VERIFIED.
- Host capability: BLOCKED.
- CI Flutter foundation: PASS con Flutter 3.44.6.
- Native Linux/Windows/macOS/Android: workflow declarado, no ejecutado para este commit.
- iOS: NOT EXECUTED.

## Docker Toolchain

Cuatro Dockerfiles multi-stage usan Node 24.18.0-alpine y runtime `nexo`, UID 100. No se ejecutó prune ni se borraron volúmenes.

## Docker Builds

Local incremental/cache:

- API PASS, 223 s.
- Migrate PASS, 242 s.
- Web PASS, 16 s.
- Worker PASS, 135 s.

CI limpio:

- API FAIL.
- Worker FAIL.
- Web PASS.
- Migrate PASS.

API, Worker y Migrate incluyen source/tests o metadata innecesaria en runtime. API/Worker tienen árboles desplegados grandes. No ejecutan install o Prisma generate al arrancar.

## Clean Clone

Clone PASS desde el remote. HEAD y tag coinciden. Árbol limpio con 1,601 archivos, sin `node_modules`, `.env`, caches, artifacts ni outputs locales.

Phase 0B midió el workspace lógico, incluidos derivados ignorados. Phase 0C mide el Git tracked baseline. No son hashes intercambiables.

## Repository Size

1,601 archivos tracked y 33,162,752 bytes. Ningún archivo supera 10 MiB. Tests ocupan 16.6 MB. Hay screenshots, goldens y failure images tracked que requieren política futura, pero no constituyen un bloqueo de build.

## Gitignore & Gitattributes

`.gitignore` cubre secretos locales, Node, Turbo, Next, dist, coverage, Prisma generated, Flutter, Playwright, datos, volúmenes y artifacts.

`.gitattributes` implementa LF para texto y marca formatos de imagen/PDF como binarios.

## Pre-Commit & Lint-Staged

**FAIL — CONFIGURATION AND REAL LINT DEFECT.**

- Un `.mjs` Node produjo 19 errores: globals `process`/`console` ausentes y un import no usado real.
- Playwright config y test fallaron porque TypeScript project service no los incluye.
- Un source API normal pasó.

La corrección mínima requiere overrides de globals por entorno, cobertura TypeScript limitada para Playwright/tests y corregir el import real. No debe desactivarse ESLint ni normalizarse `--no-verify`.

## CI Matrix

CI cubre format, lint, typecheck, compatibility, coverage, build, Storybook, migration/RLS, Flutter foundation, Compose, cuatro Docker images y authentication E2E. Su configuración es amplia. La ejecución baseline está roja.

## Build Drift

No hubo drift tracked. Lockfile, source, OpenAPI y SDK quedaron sin cambios. Prisma, dist, `.next` y Turbo generaron únicamente outputs ignorados.

## Build Matrix

| Componente | Resultado |
|---|---|
| Root | FAIL |
| API | FAIL limpio |
| Web | PASS |
| Worker | FAIL limpio |
| Prisma | PASS |
| OpenAPI | PASS |
| SDK | PASS |
| Flutter foundation | PASS CI |
| Docker API | FAIL CI limpio |
| Docker Web | PASS |
| Docker Worker | FAIL CI limpio |
| Docker Migrate | PASS |

## Risks

Cinco blockers: build limpio backend, CI roja, hook roto, seed/RLS incompleto y Legal/Ownership abierto. También existen riesgos de red para install/engines, I/O Docker, runtime images grandes y host incompatible.

## Dependency & Build Gate

**BLOCKED.**

El clone y install pasan. Los generators no presentan drift. Sin embargo, los builds principales API/Worker/root y sus Docker clean targets no pasan.

## Provenance Reassessment

Technical Provenance: **CLOSED WITH OBSERVATIONS**.

Legal/Ownership Provenance: **OPEN**.

El análisis técnico puede continuar. El portado de código no está autorizado.

## Remediation Plan

1. P0: alinear output/exports de `@nexo/identity`; revalidar root, API, Worker y Docker clean.
2. P0: reproducir y corregir el seed CI; ejecutar después RLS.
3. P1: corregir ESLint/lint-staged con scopes exactos y el import real.
4. P1: reducir contenido runtime de `pnpm deploy`.
5. P0 legal: resolver licencia, autoría, IA, contribución e IP.
6. Exigir un CI completo verde antes de reabrir el gate.

Cada corrección debe ser un commit posterior separado. El tag baseline no debe moverse.

## Limitations

- Host sin toolchains Node/Flutter compatibles.
- GitHub job logs bloqueados por permisos admin.
- No se ejecutó migration status ni seed local.
- Docker local usó cache. CI fue la evidencia limpia.
- No se ejecutaron Flutter POS native builds.
- No hubo startup funcional de API/Worker.
- No se ejecutó Phase 0D.

## Evidence

Evidencia sanitizada en `artifacts/dependency-build-baseline/`.

## Files Created

Este reporte y la evidencia estructurada de Phase 0C.

## Modified Files

No se modificó código, baseline commit, tag, remote, UMI, migraciones ni volúmenes. Se crearon cuatro imágenes locales `:phase0c`.
