# Web → Flutter parity matrix

## Part 3 systems

| System                | Flutter                         | Evidence           | Status   | Adaptation             |
| --------------------- | ------------------------------- | ------------------ | -------- | ---------------------- |
| 16 scene variants     | typed enum + registry           | 16 goldens + test  | PARITY   | none                   |
| Artwork/crop          | package assets + focal points   | hashes + videos    | PARITY   | image cache            |
| Masks/auroras/halos   | gradients and painters          | goldens            | ADAPTED  | no required shader     |
| Ambient motion        | pooled deterministic clock      | tests + videos     | PARITY   | one ticker             |
| Pointer/crossfade     | bounded transform + generations | tests              | PARITY   | touch disabled         |
| Accessibility/quality | central executable policies     | tests              | PARITY   | platform media inputs  |
| GPU p95               | device profile protocol         | performance report | DEFERRED | not inferable headless |

| Categoría       | Fuente Web              | Design Language | Flutter                              | Estado   |
| --------------- | ----------------------- | --------------- | ------------------------------------ | -------- |
| colors          | `--v1-*`                | 03              | generated colors + scheme            | PARITY   |
| typography      | font vars/component CSS | 04              | licensed variable fonts + roles      | ADAPTED  |
| spacing/radius  | public tokens           | 05              | typed metrics                        | PARITY   |
| shadows/blur    | public tokens           | 05              | typed depth                          | PARITY   |
| motion          | public tokens           | 08              | typed motion/reduced                 | PARITY   |
| layout          | shell CSS               | 06/12           | metrics + constraints                | ADAPTED  |
| responsive      | media queries           | 12              | certified thresholds                 | PARITY   |
| semantic states | public colors           | 03/13           | scheme + extension contract          | ADAPTED  |
| iconography     | per-component glyphs    | 07              | Material Symbols policy + metrics    | ADAPTED  |
| accessibility   | Web behavior            | 13              | preferences/target/semantics helpers | ADAPTED  |
| LivingScene     | engine                  | 09/10           | quality/lifecycle contracts          | DEFERRED |
| goldens         | Playwright snapshots    | 16              | Flutter golden foundation            | ADAPTED  |
| component core  | certified UI exports    | 07/18           | typed Nexo component library         | PARITY   |
| overlays        | dialogs/drawers/menus   | 07/18           | native anchored/adaptive primitives  | ADAPTED  |
| product/data    | cards/tables/toolbars   | 18              | domain-independent foundations       | ADAPTED  |
| POS domain UI   | Storybook patterns      | 18/19           | no domain logic in Part 2            | DEFERRED |

No GAP bloquea Component Parity. Platform-specific component goldens expand in later parts; Part 1 certifies the shared foundation.

# Part 4/5 operational parity

| Area                           | Backend/Design source  | Flutter                      | State              | Adaptation                  |
| ------------------------------ | ---------------------- | ---------------------------- | ------------------ | --------------------------- |
| Operational shell/catalog/cart | OpenAPI + Design V1    | `apps/nexo_pos`              | PARITY             | POS-adaptive shell          |
| Online cash sale               | Sales commands         | typed client/controller      | PARITY             | integer money + idempotency |
| Device enrollment/revocation   | OpenAPI 8.9.0          | productive secure flow       | PARITY             | device credential context   |
| Financial offline/sync         | V1 safety policy       | blocked with clear UX        | DISABLED BY DESIGN | drafts/cache only           |
| Unknown provider outcome       | authoritative lookup   | persistent safe recovery     | PARITY             | no dangerous retry          |
| External tender                | manual approved record | explicit secure confirmation | PARITY             | no card data/provider API   |
| Mixed payments                 | post-V1 roadmap        | absent by frozen scope       | DEFERRED           | not a V1 gap                |

# Part 4E V1 scope checkpoint — 2026-07-16

The parity gate follows `FLUTTER_POS_V1_SCOPE.md`. Part 5 closes every REQUIRED FOR V1 row. Design, behavior, accessibility, security, RLS and financial verification are CERTIFIED; native execution remains conditionally verified by CI configuration.
