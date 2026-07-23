# Owner Disk Report

Measured on 2026-07-18 in the owner workstation. Values are filesystem measurements, not estimates unless explicitly labeled.

## Footprint before cleanup

| Area                                                  |     Size | Policy                              |
| ----------------------------------------------------- | -------: | ----------------------------------- |
| Repository, compiled                                  | 12.75 GB | measurable with `owner:disk:report` |
| Source checkout excluding generated/cache directories |  ~126 MB | keep                                |
| Turbo cache                                           |  9.96 GB | safely regenerable                  |
| Root `node_modules`                                   |  1.11 GB | keep for fast startup               |
| Certification artifacts                               |   699 MB | retention-managed                   |
| Next.js output/cache                                  |   479 MB | safely regenerable                  |
| Flutter outputs/tool cache                            |   372 MB | safely regenerable                  |
| Playwright report/results                             |   540 KB | retention-managed                   |
| User pnpm store                                       |   628 MB | shared; prune manually              |
| Browser binaries (`ms-playwright`)                    |   675 MB | keep while browser QA is used       |
| Docker images                                         |  9.93 GB | 7.24 GB reported reclaimable        |
| Docker build cache                                    | 18.71 GB | 9.93 GB reported reclaimable        |
| Persistent Docker volumes                             | 73.21 MB | never auto-delete                   |
| Container writable layers                             |   119 KB | healthy                             |

The root filesystem had 17 GB free (84% used). The largest avoidable item inside the project was Turbo cache; the largest external item was Docker build cache.

## Recoverable space

- Immediate project cache: approximately 10.8 GB.
- Docker-reported reclaimable images and build cache: up to 17.2 GB. Actual conservative cleanup is lower because NEXO retains recent layers and active images.
- Artifacts: determined by the configurable retention window; protected runs are never candidates.

## Result after certified cleanup

The safe cleanup recovered **10.83 GB** from the repository (12.75 GB → 1.92 GB measured by `du`; the owner report rounds this to 1.81 GiB). Root free space increased from 17 GB to 27 GB and filesystem utilization fell from 84% to 75%. All eight runtime containers remained healthy and the four persistent volumes remained active at 73.21 MB.

The conservative Docker command reclaimed 0 B because no candidate was older than its seven-day safety window. Docker still reports 17.2 GB potentially reclaimable, but deleting recent active build lineage would trade owner disk space for slower near-term rebuilds. The command reports this transparently and never widens its policy automatically.

## Owner guidance

Use `pnpm owner:disk:report` first. Run any cleanup without `--apply` to preview. Add `--apply` only after reviewing the paths. Cache cleanup makes the next build slower once; it does not affect data. Docker cleanup never touches volumes. Never manually delete Docker volumes, `data/`, or `uploads/` unless performing an explicitly approved destructive reset with a verified backup.

## Risk

Cache/build removal: low, rebuild cost only. Artifact removal: low after retention review. `node_modules` or pnpm store removal: medium, reinstall required. Database/MinIO volume removal: critical and intentionally unsupported.
