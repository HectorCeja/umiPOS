# NEXO Storage & Artifact Retention Policy

## Safety boundary

Generated outputs are disposable; business data is not. No owner cleanup command deletes PostgreSQL volumes, Redis volumes, MinIO uploads, Mailpit data, `data/`, `uploads/`, organizations, memberships, or owner records. Destructive cleanup is opt-in with `--apply`; without it every command is a preview.

## Lifecycle by class

| Class                                        | Created by            | Updated by         | Retention                                                                                    | Safe cleanup                             |
| -------------------------------------------- | --------------------- | ------------------ | -------------------------------------------------------------------------------------------- | ---------------------------------------- |
| `.turbo`, `.next`, coverage, Storybook       | build/test            | every build        | until space is needed                                                                        | `pnpm owner:cache:clean -- --apply`      |
| Flutter `build` and `.dart_tool`             | Flutter build/analyze | Flutter tooling    | until space is needed                                                                        | `pnpm owner:cache:clean -- --apply`      |
| Playwright report/test-results               | E2E                   | every run          | last useful run                                                                              | cache cleanup                            |
| `artifacts/*`                                | certification runs    | each phase/run     | newest run, newest failed run, newest certification, and items younger than retention window | `pnpm owner:artifacts:clean -- --apply`  |
| Logs                                         | local services/tests  | runtime            | active troubleshooting window                                                                | `pnpm owner:logs:clean -- --apply`       |
| `node_modules`                               | `pnpm install`        | dependency changes | current lockfile                                                                             | remove manually only when reinstalling   |
| pnpm store                                   | pnpm                  | installs           | shared across projects                                                                       | `pnpm store prune` manually after review |
| Docker build cache/dangling images           | Docker builds         | rebuilds           | 7 days minimum                                                                               | `pnpm owner:docker:clean -- --apply`     |
| PostgreSQL / MinIO / Redis / Mailpit volumes | runtime               | business activity  | persistent                                                                                   | never by owner cleanup                   |

Defaults are configurable with `NEXO_RETENTION_RUNS` (default `1`) and `NEXO_RETENTION_DAYS` (default `30`). The three protected artifact roles are additive: latest run, latest failed run, and latest certification.

## Commands

```bash
pnpm owner:disk:report
pnpm owner:clean
pnpm owner:clean -- --apply
pnpm owner:artifacts:clean -- --apply
pnpm owner:logs:clean -- --apply
pnpm owner:cache:clean -- --apply
pnpm owner:docker:clean
pnpm owner:docker:clean -- --apply
```

Docker cleanup is intentionally narrow: build cache and dangling images older than seven days. It never runs `docker system prune`, `docker volume prune`, or volume removal.
