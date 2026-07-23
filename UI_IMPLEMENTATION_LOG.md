# NEXO UI implementation log

## 2026-07-16 — Flutter Design Parity Part 3

Added the domain-free Flutter LivingScene engine, 16 typed variants, four hash-validated artwork assets, focal crops, masks, auroras, halos, ambient motion, quality/accessibility policies, lifecycle ownership, deterministic goldens and showcase evidence. Web UI and frozen Design Language were not modified.

## 2026-07-15 — corrección POS y auditoría condicional

- Renombrada exclusivamente la primitive Parte 2 a `.nexo-operational-toolbar`; sin overrides,
  `!important`, compensaciones ni cambio de baseline.
- POS: 4.261117 % antes; 0 px después. Baseline y captura posterior comparten SHA-256
  `4632b056e04de2d091c08dd5afd6586a2ac24dd2310e2e77a989eacc323c47c7`.
- Auditadas `nexo-data-table`, `nexo-segmented`, `nexo-status-dot`, `nexo-inline-notice`,
  `nexo-pagination` y `nexo-page-transition`: sin colisiones. Las primitives genéricas restantes son
  contratos preexistentes y no se renombraron.
- Control Plane desktop validado; responsive rechazado porque Reportes y enlaces posteriores están
  ocultos desde 768 px. No se actualizaron snapshots.
- Storybook 12/12, regresión compartida 64/64 y `pnpm check` PASS.

## 2026-07-15 — Parte 2 foundation and module pass

- Audited Parte 1 tokens, motion, `LivingScene`, shell, mockups and connected routes.
- Registered NX-ONB-01, NX-HOME-01, NX-INV-01, NX-REP-01 and NX-POS-01.
- Expanded `LivingSceneVariant` without introducing a second scene engine.
- Added semantic module variants and kept one ambient instance per shell.
- Added reusable operational primitives: typed data table, toolbar, segmented control,
  status/stock indicators, inline notice, pagination, shortcut and page transition.
- Consolidated onboarding from twelve presentation screens to eleven by combining review and
  launch; authoritative versioned persistence and completion service remain unchanged.
- Added `/reports` using authoritative Sales totals and explicit unavailable-series states; no
  analytics were fabricated.
- Certified UI Parte 2 4/4, Unified Experience 55/55, Product 3/3, Inventory 5/5, Sales 6/6,
  Identity 7/7, Authorization 5/5, Control Plane functional 3/3 and Cash 40/40.
- Recorded thirteen WebM interaction tours and deterministic desktop/mobile/reduced-motion images.
- Compared Inventory and Reports at 1600×900 with side-by-side, overlay and pixel diff.
- Global regression correctly stopped on four unapproved Control Plane baseline changes. UI visual
  regression also retained one POS-reference failure; no snapshot was updated automatically.
- Measured warmed Chromium p95: Login 251.49 ms, Home 791.92 ms, navigation 180.51 ms and Command
  Palette 20.37 ms.
- Verified healthy runtime and zero pending operational Cash, Sales and Inventory outboxes.
- Added `/reports` using real Sales administration aggregates. Temporal series and AI insights
  remain honest empty states because no authoritative source exists.
- Rebuilt Inventory presentation to remove raw JSON from the primary interface while keeping
  Inventory as authority.
- Extended visual product administration without changing Product contracts or uploads.
- Added deterministic connected browser coverage and artifact capture for all shared modules.

Known differences: no dedicated mockups exist for several secondary routes; POS imagery is not
implemented as a web POS; Inventory location discovery is limited by the current public read
surface; Reports does not manufacture analytics.

## 2026-07-15 — cierre de navegación responsive

- Eliminada la regla `.product-nav a:nth-of-type(n + 6)` de `apps/web/src/app/styles.css`.
- `GlobalShell` usa el drawer compartido a `<=64rem`: trigger, scrim, Escape, trap, restore focus,
  body lock, scroll interno, safe areas y reduced motion.
- No se tocaron POSShell, `.nexo-operational-toolbar` ni su baseline.
- Evidencia responsive generada para 1280×720, 768×1024, 1024×768, 1024×600, 390×844 y 568×320.
- Cuatro baselines Control Plane actualizados uno por uno tras validar que la captura actual era
  idéntica a la evidencia previamente aprobada; diff final 0 en cada uno.
- Pruebas: responsive 9/9, Control Plane visual 5/5, Storybook 12/12, Unified 55/55 y `pnpm check`.

## 2026-07-15 — UI Polish cinematic y UX

- Se produjo primero `docs/UI_POLISH_INVENTORY.md`; no se modificó UI antes de completar la matriz.
- Login: retirado el review/testimonio de cliente sin sustituirlo por otro widget.
- Onboarding: el viewport queda estable y el scroll pertenece al panel funcional; escena, rail,
  header y continuidad visual permanecen anclados. Copy actualizado a `Empezar`, `Continuar` y
  `Entrar a NEXO` sin alterar persistencia.
- Menú de sucursales de Home: posición calculada desde el trigger activo, contenida por viewport y
  recalculada ante resize/scroll; eliminada la dependencia de coordenadas CSS fijas.
- Añadido reveal editorial no bloqueante (1000 ms) y reveal funcional (300 ms), ambos desactivados
  por reduced motion.
- Evidencia nueva en `artifacts/ui-polish`; ningún snapshot fue actualizado.
- Validación: polish 4/4, regresión focal 22/22, cinematic 2/2, Control Plane protegido 5/5,
  Storybook/POS protegido 12/12 y `pnpm check` PASS.

## 2026-07-15 — Home Shell Consolidation

- Convertido `apps/web/src/app/global-shell.tsx` en el único `NexoAppShell` canónico.
- Migradas `/`, Products, Inventory, Reports, Help, Profile, Sales, Cash y Control Plane.
- Eliminados del Home nav local, shell markup, cinco estados de overlay/navegación, listeners,
  AccountMenu/Avatar y helper de posicionamiento duplicados.
- Añadida configuración tipada de escena, branch state y content slot; una fuente tipada de nav.
- Añadido `tests/e2e/shell-consolidation.spec.ts` con estructura, overlays, responsive, axe,
  capturas, videos y timing de cinco muestras.
- No se actualizaron snapshots. Control Plane queda en revisión visual explícita.
- Regresión final: 69/69 E2E, 12/12 Storybook y `pnpm check` PASS; paquete de 46 artefactos listo.

## 2026-07-15 — Owner review rejected / focused correction

- Recalibrado Login para 100dvh desktop sin scroll exterior.
- Añadido scroll interno real en Onboarding; acciones y progreso permanecen visibles.
- Compactado el mapa sin eliminar fases; 11 pasos recorridos y capturados.
- Estabilizado el chrome compartido frente a variantes LivingScene.
- Creado `NexoEditorialHeader` e integrado en Ventas y Caja.
- Home usa reveal de 950 ms y alineación centrada; reduced motion es inmediato.
- Añadidas pruebas focales, axe, responsive, timing y diez videos.
- Snapshots intactos. Estado: OWNER VISUAL REVIEW REQUIRED.

## 2026-07-16 — Final owner UI correction

- Expanded canonical Topbar context selectors and added long-name containment.
- Replaced manual coordinates with Floating UI flip/shift/size/autoUpdate.
- Removed duplicate Preferences/frozen theme rows; retained Profile, Help and Logout.
- Added safe initials fallback for unavailable avatar media.
- Added one authenticated artwork/trails layer with route families, desktop parallax and static
  touch/reduced-motion/hidden-page behavior.
- Added 14 focused checks, twelve videos, route captures and before/overlay/diffs.
- `pnpm check`, isolated regressions and Storybook/POS pass; snapshots remain untouched.

## 2026-07-16 — Final optical layout pass

- Audited Home, Products, Inventory, Reports, Sales, Cash, Profile and Settings for edge proximity,
  internal padding, empty-state rhythm and icon/text alignment.
- Added an isolated, post-theme optical stylesheet; no layout, breakpoint, behavior, Motion,
  LivingScene, Login, Onboarding, shell or navigation contract changed.
- Increased only local breathing in catalog/workspace/report cards, Home empty states, operational
  KPI surfaces, settings forms and logout alignment.
- Browser geometry verifies 20–21 px minimum target padding, 10.4 px logout gap and no horizontal
  overflow; focal Axe reports zero serious/critical violations.
- Evidence: `artifacts/optical-layout-pass/` with 11 after captures, eight before/overlay/diff sets
  and three videos. Seven protected snapshot hashes are unchanged.
- Validation: lint/typecheck/test/build PASS, Storybook 12/12, global E2E 84/84. The aggregate
  `pnpm check` is classified blocked only by preexisting formatting in
  `docs/manual-acceptance/SCENARIOS.md`; every later stage passed independently.

## 2026-07-16 — Final immersion pass

- Added the official typed Artwork Registry to `LivingScene`; authenticated routes no longer
  declare image paths or mount route-local artwork.
- Registered the exact owner-provided assets: `womanpos.png` (Home, Sales, Cash), `products.jpeg`,
  `inventory.jpeg` and `analytics.jpeg`; Profile and Settings remain abstract.
- Added module-specific desktop/tablet/mobile crops, NEXO duotone/masks, one crossfading artwork
  layer, subtle Ken Burns/drift, light trails and bounded desktop-only parallax.
- Fixed the authenticated App Shell viewport so Sidebar, Topbar and LivingScene remain fixed while
  the keyboard-focusable Route Content owns scrolling. Login and Onboarding are excluded.
- Reduced motion, touch, deterministic mode and hidden-page state freeze all artwork motion.
- Evidence: `artifacts/final-immersion/`; no visual snapshot was accepted or updated.
- Validation: final immersion 8/8, shell consolidation 10/10, owner correction 15/15, Storybook
  12/12, lint/typecheck/tests/build PASS. `pnpm check` still stops only at the preexisting formatting
  issue in `docs/manual-acceptance/SCENARIOS.md`.

## 2026-07-16 — Final UI freeze hotfix

- Removed the duplicated Topbar inset from sticky `.section-nav`; Route Content already owns the
  Topbar offset and normal flow now reserves SubNavigation height automatically.
- Completed the registry for every authenticated LivingScene variant. Team, Profile, Settings,
  Help/minimal, dashboard, command and focused variants now use the explicit abstract pipeline.
- Added registry coverage tests plus desktop/tablet/mobile title, overflow and artwork assertions.
- Preserved Login, Onboarding, navigation, Motion, backend and all protected snapshots.
- Evidence: `artifacts/final-ui-freeze/`. Verdict: OWNER FINAL REVIEW REQUIRED.

## 2026-07-16 — Final artwork render pass

- Diagnosed the invisible artwork as canvas occlusion: the authenticated `.product-shell`
  background covered LivingScene layers despite correct registry resolution and image loading.
- Made only that shell canvas transparent inside official artwork-enabled LivingScene instances;
  no chrome, component surface, layout, route or interaction was changed.
- Balanced registry intensity/crops and artwork mask, blur and luminance for recognizable module
  context while preserving the approved NEXO duotone and contrast scrim.
- Inspected six 1440×900 captures: Home, Products, Inventory, Reports, Sales and Cash are all
  classified **VISIBLE YES**. Desktop/tablet/mobile evidence and six new videos are in
  `artifacts/final-artwork-review/`.
- Validation: final immersion 8/8, UI unit 14/14, Storybook/Axe/visual 12/12, UI lint/typecheck PASS.
  Protected snapshots remain byte-identical; none was updated.

# 2026-07-16 — Flutter Design Parity Part 2

- Audited the certified Web component inventory and classified Flutter scope as required, POS foundation, adapted, deferred or not applicable.
- Added typed `Nexo*` controls, surfaces, cards, feedback, overlays, forms, data-display and operational patterns without domain logic.
- Corrected two test-discovered optical/runtime defects: icon-only button overflow and badge reflow at text scale 200 %.
- Added interaction/focus tests, eight component goldens, measured performance tests, a release showcase, eight screenshots and eight real WebM recordings.
- Evidence: `artifacts/flutter-design-parity/part-2/`; Web and frozen Design Language were not edited.

## 2026-07-16 — Flutter POS Part 4

Implemented `apps/nexo_pos` as a separate operational client using the frozen Flutter Design package. Added deterministic bootstrap, typed API/error/security boundaries, integer-money cart, adaptive catalog/cart, online idempotent cash checkout, safe unknown-payment state, conservative offline policy, outbox foundation, tests, goldens and evidence. No Web UI or Design Language file changed.
