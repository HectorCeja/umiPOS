# UI Parte 2 — Mockup inventory

Inspected 2026-07-15 from the repository root.

| ID         | File             | Resolution | Route/purpose                                         | Authority                              |
| ---------- | ---------------- | ---------- | ----------------------------------------------------- | -------------------------------------- |
| NX-ONB-01  | `onboarding.png` | 1672×941   | `/`, incomplete onboarding                            | Direct composition authority           |
| NX-HOME-01 | `home.png`       | 1600×900   | shared authenticated shell                            | Shell authority from Parte 1           |
| NX-INV-01  | `inventory.png`  | 1600×900   | `/inventory`                                          | Direct Inventory composition authority |
| NX-REP-01  | `reports.png`    | 1600×900   | `/reports`                                            | Direct Reports composition authority   |
| NX-POS-01  | `pos.png`        | 1600×900   | Pattern reference for Cash/Sales/Product density only | No operational web POS is authorized   |

No dedicated approved bitmap exists for Products, Team, Profile, Settings, Sales administration,
Cash administration or Command Palette. Those screens derive only from NX-HOME-01 shell,
NX-INV-01 data hierarchy, NX-REP-01 editorial hierarchy and existing shared primitives. The
absence of a mockup is not permission to add a new visual direction.

All visual tests use `?scene=static`, es-MX, America/Mazatlan and deterministic data. Production
never embeds these mockups.
