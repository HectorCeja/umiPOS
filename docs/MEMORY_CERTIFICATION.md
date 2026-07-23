# Runtime Memory & Leak Certification

Five consecutive Docker samples were taken on 2026-07-18 with all eight services healthy.

| Service                 |        Observed range | Assessment                      |
| ----------------------- | --------------------: | ------------------------------- |
| Web                     |       60.49–60.56 MiB | stable                          |
| API                     |       248.2–248.9 MiB | stable after warmup             |
| Worker                  |       89.64–89.79 MiB | stable                          |
| PostgreSQL              |       62.24–62.58 MiB | stable                          |
| Redis                   |       12.81–12.89 MiB | stable                          |
| MinIO                   |             261.3 MiB | stable                          |
| Mailpit                 |       24.18–24.31 MiB | stable                          |
| OpenTelemetry Collector |             101.7 MiB | stable                          |
| Total                   | approximately 861 MiB | within the 15.56 GiB host limit |

No monotonic growth appeared in the sample. Static lifecycle review confirmed cleanup for React timers, event listeners, IntersectionObserver, animation frames, Blob preview URLs, and worker polling. No application-owned WebSocket or browser Worker allocation was found. Query/session caches are bounded by route lifecycle and existing server policies.

This certification establishes no known leak, not a mathematical guarantee that a multi-year leak cannot exist. Repeat the sample after large feature changes and use Chromium heap snapshots for any route whose retained heap grows over repeated mount/unmount cycles.

## Regression controls

`memory-certification.spec.ts` fails if the known long-lived resources lose their cleanup. Runtime inspection uses `docker stats --no-stream`; browser investigations should compare heap after at least ten navigation/upload cycles, force GC in DevTools, and inspect detached DOM nodes and retained Blob objects.
