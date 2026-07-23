# Phase 0A — Repository Provenance

Fecha de corte: 2026-07-23.

## Executive Summary

Este repositorio representa un workspace técnico NEXO completo en el filesystem. Contiene aplicaciones, packages, SQL, tests, documentación y evidencia.

No es una línea base Git. Es un snapshot de workspace sin versión.

No hay evidencia para clasificarlo como fork, mirror o dump. Tampoco hay evidencia de un remote de origen.

Puede demostrarse:

- El contenido actual del filesystem.
- La estructura del monorepo.
- Los manifests actuales.
- Las fuentes y carpetas generadas actuales.
- La evidencia de certificación disponible.

No puede demostrarse:

- Quién creó el código.
- Cuándo se creó.
- Cómo evolucionó.
- De qué upstream provino.
- Qué versión exacta representa.
- Cómo volver a un estado anterior.

## Repository Identity

| Campo           | Hecho                                                   |
| --------------- | ------------------------------------------------------- |
| Nombre manifest | `nexo`                                                  |
| Root            | `/home/hceja/Documents/nexo`                            |
| Tipo            | Monorepo pnpm/Turborepo                                 |
| Apps            | API, Web, Worker, Flutter POS                           |
| Packages        | 15 workspace packages                                   |
| Lenguajes       | TypeScript, JavaScript, Dart, SQL, CSS, Markdown, Shell |
| Backend         | NestJS 11                                               |
| Web             | Next.js 16                                              |
| Data            | Prisma 7.8 y PostgreSQL                                 |
| Mobile/POS      | Flutter                                                 |
| Build           | pnpm 10.13.1, Turborepo 2.5.5, TypeScript 5.8.3, Docker |

Clasificación formal: `UNVERSIONED WORKSPACE SNAPSHOT`.

No hay evidencia para llamarlo fork, mirror o dump.

## Git Status

| Verificación                 | Resultado                        | Clasificación |
| ---------------------------- | -------------------------------- | ------------- |
| `git status`                 | `No commits yet`; todo untracked | BLOCKED       |
| `git rev-parse HEAD`         | exit 128                         | BLOCKED       |
| `git symbolic-ref HEAD`      | `refs/heads/main`                | VERIFIED      |
| `git remote -v`              | vacío                            | BLOCKED       |
| `git branch -a`              | vacío                            | BLOCKED       |
| `git fsck`                   | unborn branch; no refs           | VERIFIED      |
| `git rev-list --all --count` | 0                                | VERIFIED      |
| `git log -1`                 | no commits                       | BLOCKED       |
| `git log --reverse -1`       | no commits                       | BLOCKED       |
| Tags                         | 0                                | VERIFIED      |
| Stash                        | 0                                | VERIFIED      |
| Submodules                   | 0                                | VERIFIED      |

HEAD simbólico apunta a `main`. HEAD no resuelve a un commit.

El working tree no está limpio. Todo el contenido aparece sin rastrear.

## Repository Structure

```text
nexo/
├── apps/          API, Web, Worker y Flutter POS
├── packages/      dominio, database, contract, SDK, UI y shared code
├── docs/          arquitectura, producto y certificación
├── scripts/       operaciones, generación y certificación
├── infra/         Docker, PostgreSQL y OpenTelemetry
├── artifacts/     evidencia derivada
└── tests/         Playwright E2E y performance
```

No existen carpetas root `tools/`, `docker/` o `flutter/`. Docker vive en `infra/`. Flutter vive en `apps/nexo_pos` y `packages/nexo_flutter_design`.

Se observaron 7,817 archivos fuera de `.git` y `node_modules`. El conteo incluye derivados y evidencia.

## Generated Content

| Contenido                               | Fuente                  | Comando              | Regenerable | Preservar          |
| --------------------------------------- | ----------------------- | -------------------- | ----------- | ------------------ |
| Prisma Client, 70 archivos              | Prisma schema           | `pnpm db:generate`   | YES         | Sí, como generated |
| SDK operations, 1 archivo               | OpenAPI                 | SDK `generate`       | YES         | Sí                 |
| Flutter tokens, 1 archivo               | tokens/generator inputs | `tokens:generate`    | YES         | Sí                 |
| Certification artifacts, 1,992 archivos | ejecuciones             | múltiples            | PARTIAL     | Sí, como evidencia |
| Coverage                                | tests                   | `pnpm test:coverage` | YES         | No existe ahora    |

OpenAPI es una fuente design-first mantenida por personas. No es un derivado generado.

No se encontró un cliente Dart completamente generado. Flutter mantiene transportes y mappings manuales.

## Source Ownership

Clasificación física:

- Human maintained: apps, domain packages, Prisma schema, migrations, OpenAPI, tests, scripts y docs.
- Generated: Prisma Client, SDK operation map y Flutter tokens.
- Derived: build outputs, reports y screenshots de test.
- Evidence: `artifacts/`, certification reports y test output.
- Temporary: `node_modules`, `.turbo`, caches y build folders.
- Unknown: autoría por archivo, uso de IA y origen de imágenes root.

No se encontró `LICENSE`, `COPYING` o `NOTICE`. La licencia y la propiedad intelectual están bloqueadas.

## Source of Truth

| Categoría     | Autoridad                                     | Derivado                       |
| ------------- | --------------------------------------------- | ------------------------------ |
| Código        | `apps/*/src`, `packages/*/src`, Flutter `lib` | builds                         |
| OpenAPI       | `packages/contracts/openapi/openapi.json`     | SDK operation map              |
| SDK           | generator + OpenAPI                           | `packages/sdk/src/generated`   |
| Flutter       | `apps/nexo_pos/lib`                           | platform/generated build files |
| SQL           | Prisma migrations                             | database state                 |
| Prisma        | `schema.prisma`                               | generated client               |
| Documentation | `docs/` y Markdown root                       | rendered copies                |
| Tests         | app/package/E2E/Flutter/SQL tests             | reports                        |
| Certification | report plus matching artifacts                | summaries                      |

Estas autoridades describen el filesystem actual. Git no las vincula a una versión.

## Repository Risks

Se registraron 14 riesgos.

| ID  | Prioridad | Riesgo                         | Impacto                      | Probabilidad |
| --- | --------- | ------------------------------ | ---------------------------- | ------------ |
| R1  | P0        | HEAD inexistente               | Sin versión identificable    | Cierta       |
| R2  | P0        | Sin historial                  | Sin autoría o evolución      | Cierta       |
| R3  | P0        | Sin remote                     | Sin upstream                 | Cierta       |
| R4  | P0        | Sin baseline/tag               | No prueba el port source     | Cierta       |
| R5  | P0        | Workspace untracked            | Sin diff o rollback          | Cierta       |
| R6  | P0        | Licencia ausente               | Derechos no demostrados      | Alta         |
| R7  | P0        | Autoría desconocida            | Atribución bloqueada         | Alta         |
| R8  | P1        | Generated mezclado             | Copia accidental             | Alta         |
| R9  | P1        | Artifacts mezclados            | Ambigüedad y tamaño          | Alta         |
| R10 | P1        | Docs sin versión               | Decisión no ligada al código | Cierta       |
| R11 | P1        | Certificación sin hash         | Evidencia no ligada al árbol | Alta         |
| R12 | P2        | Imágenes de origen desconocido | Riesgo de licencia           | Media        |
| R13 | P2        | Lockfile sin baseline          | Reproducción no vinculada    | Media        |
| R14 | P3        | Coverage ausente               | Sin baseline de coverage     | Media        |

Phase 0A no aplicó mitigaciones.

## Provenance Gate

Estado final: `OPEN`.

| Condición              | Estado                |
| ---------------------- | --------------------- |
| Git                    | BLOCKED               |
| HEAD                   | BLOCKED               |
| Commit history         | BLOCKED               |
| Remote                 | BLOCKED               |
| Branch                 | PASS WITH OBSERVATION |
| Baseline               | BLOCKED               |
| Generated content      | PASS WITH OBSERVATION |
| Ownership              | UNKNOWN               |
| Documentation          | PASS WITH OBSERVATION |
| Certification evidence | PASS WITH OBSERVATION |
| Build reproducibility  | UNKNOWN               |

El repositorio no está listo para comenzar el portado.

## Baseline Requirements

Phase 0B deberá producir:

1. Git baseline.
2. Repository snapshot.
3. SHA-256 inventory.
4. Dependency inventory.
5. Generated-artifact inventory.
6. Documentation inventory.
7. Certification inventory.
8. Secret scan.
9. License inventory.
10. Repository manifest.
11. Build and test baseline.
12. Authoría y política de IA.

Phase 0A no ejecutó estas acciones.

## Repository Classification

| Pregunta                       | Respuesta | Evidencia                               |
| ------------------------------ | --------- | --------------------------------------- |
| ¿Apto como fuente de portado?  | BLOCKED   | Sin baseline/HEAD/licencia              |
| ¿Apto como referencia técnica? | YES       | Código y tests inspeccionables          |
| ¿Apto como evidencia?          | PARTIAL   | Evidencia no ligada a commit            |
| ¿Apto como baseline?           | NO        | 0 commits y todo untracked              |
| ¿Apto como origen Git?         | NO        | Sin history/remote                      |
| ¿Apto para rollback?           | NO        | Sin commits/tags                        |
| ¿Apto para auditoría?          | PARTIAL   | Estado actual visible; historia ausente |

## Limitations

- `UMIPOS_RESOLUCION_ARQUITECTURA.md` no estaba disponible.
- Hay 20 documentos `PRODUCT_CERTIFICATION_PART_*.md`.
- El filesystem no contiene metadatos fiables de autoría.
- Git no puede demostrar que esta auditoría no cambió archivos preexistentes.
- No se ejecutó hash inventory, secret scan total, license scan o build baseline. Pertenecen a Phase 0B.

## Evidence

Directorio: `artifacts/provenance/`.

Incluye identidad, estado, estructura, procedencia, ownership, autoridades, generados, riesgos, gate y comandos.

## Files Created

Solo se crearon:

- `docs/PHASE_0A_REPOSITORY_PROVENANCE.md`.
- `artifacts/provenance/*`.

## Read-Only Confirmation

No se modificó código, Git, configuración, Docker, Flutter, Prisma o documentación existente.

No se creó un baseline. No se inició Phase 0B.
