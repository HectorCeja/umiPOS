# UI changelog

## 2026-07-17 — Flutter POS V1 certification and freeze

- Certified Design Parity Parts 1–5 and froze Flutter POS V1 at `1.0.0+1`.
- Certified real auth/context/cash/cash-and-external sales/recovery/receipt behavior, exact financial persistence, RLS/cross-tenant isolation, accessibility and deterministic visual baselines.
- Corrected native release configuration discovered by certification: Android network permission and non-debug release signing policy, iOS Keychain Sharing, macOS client-network/Keychain entitlements, and Linux CI `libsecret` dependencies.
- Preserved financial offline as disabled by design and deferred platform executable runs to runners with their native toolchains.

## 2026-07-17 — NEXO POS V1 productive completion

- Closed private avatar GET/render after rebuilding the stale API runtime image; CSP stays restrictive and MinIO private.
- Completed productive Flutter auth/session/context/cash/catalog/scanner/cash and external tender/unknown recovery/receipt/reprint/recovery/diagnostics flows.
- Prevented cash-session close while captured cash-sale postings remain pending in the Sales outbox.
- Added exact real-service Flutter E2E, RLS/cross-tenant probes, financial count evidence and seven deterministic POS goldens.

## Flutter parity · Part 3

- Added canonical Flutter LivingScene, artwork registry and editorial motion foundation.
- Added executable quality modes, Reduced Motion, Reduced Transparency and lifecycle pause.
- Added 16 deterministic scene goldens and real showcase videos.

## 2026-07-15 — POS collision correction

### Fixed

- Isolated the Parte 2 toolbar as `.nexo-operational-toolbar`, restoring the approved POS composition
  without changing its snapshot.

### Testing

- POS visual diff is zero; Storybook passes 12/12 and shared browser regression passes 64/64.

### Known Issues

- Control Plane snapshots remain unchanged: responsive navigation hides Reportes and subsequent links.

## Unreleased — UI Implementation Parte 2

### Added

- Module-specific `LivingScene` variants and `/reports`.
- Operational data primitives with comfortable/compact density.
- Deterministic Parte 2 browser and screenshot suite.
- Thirteen WebM implementation tours and Inventory/Reports side-by-side, overlay and diff artifacts.

### Changed

- Onboarding now presents eleven screens by combining review and authoritative launch.
- The shared shell now applies one module-aware `LivingScene` to all administrative routes.
- Products and Inventory use the editorial hierarchy and operational primitives from Parte 1.

### Accessibility

- Added an invariant accessible name to the compact global-search trigger.
- Certified Parte 2 desktop/mobile/reduced-motion surfaces with axe and keyboard interaction.

### Known Issues

- Four Control Plane and one Storybook visual baseline remain red pending explicit review.
- Full Inventory mockup density requires public location/read contracts.
- Full Reports charts require authoritative temporal/customer/payment series.

- Onboarding presentation now has eleven steps with combined review and launch.
- Inventory and Products use the Parte 1 editorial shell and surface hierarchy.
- Global navigation includes Reportes.

### Fixed

- Raw Inventory JSON is no longer primary user-facing content.
- Secondary modules no longer render over a flat canvas.

### Accessibility

- Semantic table/caption primitives, explicit status labels, retry states and reduced-motion-safe page transitions.

### Motion

- One scene per shell; data-dense modules reduce particles and aurora intensity.

### Performance

- No new runtime dependency; ambient animation remains CSS/compositor based and pauses when hidden.

### Visual

- Reports follows the approved editorial hierarchy without fabricated charts.

### Testing

- Storybook operations stories and connected Parte 2 Playwright coverage.

### Documentation

- Mockup inventory, implementation log, readiness, phase/gate and handoff updates.

### Known issues

- Cross-engine Firefox/WebKit certification is not part of the current Playwright project.
- Some requested operational capabilities have no public read/action service and remain conditionally ready rather than simulated.

## 2026-07-15 — Responsive navigation correction

### Fixed

- Removed ordinal hiding of navigation links on tablet/mobile.
- Added the existing approved drawer behavior to the shared module shell with complete navigation,
  low-height scrolling, focus containment, Escape and focus restoration.
- Added an accessible name to the compact user trigger.

### Testing

- Added responsive navigation coverage across six viewport classes, Axe, keyboard, reduced motion
  and Command Palette continuity.
- Updated only the four owner-authorized Control Plane baselines; all final diffs are zero.
- Preserved POS OperationalShell baseline and exact SHA-256.

## 2026-07-15 — Cinematic UI polish

### Changed

- Onboarding now scrolls inside its functional panel while the cinematic frame stays stable.
- Onboarding actions now read `Empezar`, `Continuar` and `Entrar a NEXO`.
- Editorial content reveals after functional content and becomes immediate under reduced motion.

### Fixed

- Home branch menu now anchors to the invoking control and adapts to resize/scroll.
- Removed the Login customer-review block without adding replacement UI.

### Testing

- Added owner-review-only screenshots, overlays, diffs and motion recording under
  `artifacts/ui-polish`.
- No approved snapshot or baseline was updated.

## 2026-07-15 — Shell consolidation

### Changed

- Home and every administrative route now use the single canonical `NexoAppShell`.
- Home's approved sidebar/topbar/context treatment is owned by the shared shell.

### Fixed

- Removed duplicate Command Palette, scene, navigation, account and branch-menu listeners from Home.

### Testing

- Added structural, responsive, axe, continuity-video and interaction-timing evidence.
- Preserved all baselines; Control Plane shell differences await owner approval.

## 2026-07-15 — Owner review correction

### Fixed

- Login desktop scale and exterior page scrolling.
- Onboarding inaccessible content, missing internal scroll and overflowing phase map.
- Route-dependent perceived sidebar/topbar treatment.
- Missing editorial reveal and composition in Sales, Cash and Home.

### Accessibility and testing

- Added keyboard-focusable panel scrolling and zero serious/critical axe findings.
- Added responsive tests, timings, ten videos and owner-review diffs.
- Did not update snapshots or accept baselines.

## 2026-07-16 — Final owner UI correction

### Changed

- Expanded organization/branch selectors, collision-aware menus and simplified user menu.
- Added module-aware authenticated LivingScene artwork with bounded ambient depth.

### Accessibility, motion and performance

- Added keyboard entry/focus return, safe avatar fallback, mobile containment and axe coverage.
- Disabled artwork motion for touch, reduced motion, deterministic mode and hidden pages.
- Kept one scene layer, zero React frame state and two optimized assets totaling 76,968 bytes.

### Testing

- Added focused evidence, twelve videos and measured route/control timings.
- No snapshot or protected POS baseline was updated.

## 2026-07-16 — Final optical layout pass

### Changed

- Balanced internal padding and block spacing in premium module surfaces without changing layout.
- Added breathing to Home empty states, catalog controls, inventory workspaces, report summaries,
  operational KPIs and settings forms.
- Corrected optical icon/text spacing and lateral padding for logout controls.

### Accessibility and testing

- Verified desktop/mobile overflow, computed geometry and zero serious/critical Axe findings across
  eight administrative routes.
- Passed lint, typecheck, unit tests, production build, Storybook 12/12 and global E2E 84/84.
- Preserved all protected visual snapshots byte-for-byte; generated review-only evidence under
  `artifacts/optical-layout-pass/`.

## 2026-07-16 — Final immersion pass

### Added

- Official LivingScene Artwork Registry for Home, Products, Inventory, Reports, Sales and Cash.
- Responsive smart crops, duotone/mask pipeline and cached one-time asset preloading.

### Motion and performance

- Added one-layer crossfade, subtle artwork Ken Burns/drift, restrained trails and bounded
  desktop-only pointer parallax without React frame state.
- Static behavior for reduced motion, touch, deterministic tests and hidden tabs.

### Fixed

- Authenticated shell now keeps chrome and scene fixed while Route Content owns scroll.
- Route Content is keyboard-focusable and labelled for accessible scrolling.

### Testing

- Passed final immersion 8/8, combined shell/owner regression 33/33, Storybook/Axe/POS 12/12 and
  production build. No snapshot was updated.

## 2026-07-16 — Final UI freeze hotfix

### Fixed

- Corrected the shared sticky SubNavigation inset without per-screen offsets.
- Added explicit abstract artwork entries for every authenticated support scene variant.

### Testing

- Passed desktop/tablet/mobile layout coverage, complete artwork matrix, Storybook/Axe/POS and
  global lint/typecheck/test/build. Protected snapshots remain unchanged.

## 2026-07-16 — Final artwork render pass

### Fixed

- Removed authenticated shell-canvas occlusion that made registered LivingScene artwork visually
  imperceptible.
- Rebalanced operational artwork masks, blur, luminance, intensity and smart crops without changing
  shell structure or functional surfaces.

### Visual and testing

- Verified owner-level recognizability for all six operational routes and preserved intentional
  abstract artwork for administrative routes.
- Added desktop/tablet/mobile captures, before/after overlays and six motion videos under
  `artifacts/final-artwork-review/`.
- Passed focused E2E 8/8, UI unit 14/14 and Storybook/Axe/visual 12/12. No snapshot was updated.

## 2026-07-16 — Flutter Design Parity foundation

### Added

- Canonical Flutter visual package, generated V1 tokens, dark theme extensions, adaptive/density and accessibility foundations.
- Deterministic golden/showcase, pinned Flutter CI, ADR-0045–0047, Flutter docs and traceability evidence.

### Scope

- No Web UI, frozen Design Language, POS flow, backend, RLS or outbox change.
- Instrument Sans/Manrope variable TTFs are OFL-licensed, hash-pinned and covered by the foundation golden.

## 2026-07-16 — Flutter Component Library Foundation

### Added

- Canonical Flutter controls, surfaces, cards, feedback, overlays, forms, data display and adaptive patterns.
- Component showcase, 15 interaction tests, eight deterministic goldens and Part 2 evidence package.

### Accessibility

- Keyboard activation, overlay Escape/focus restoration, semantic labels, 44×44 targets and text scale 200 % coverage.

### Performance

- Measured 100-tile/list/table and overlay-open baselines; no device metrics inferred.

### Scope

- No Web, Design Language, backend, domain, POS flow, RLS or outbox change.

## 2026-07-16 — Flutter POS Application boundary

- Added canonical `apps/nexo_pos`, adaptive operational shell, catalog/cart and contract-backed online cash checkout.
- Added integer money, stable idempotency, typed failures, bootstrap guards, conservative offline policy and dependency-aware outbox.
- Added 19 POS tests and three new deterministic goldens; fixed the blocking transparent-Material boundary in `NexoListTile` without API/visual redesign.
- Productive enrollment, financial offline, external/mixed provider recovery and hardware printing remain explicitly blocked/deferred.

# 2026-07-16 — Flutter POS Part 4B (incomplete)

- Added POS terminal enrollment/revocation contracts and Flutter secure persistence foundations.
- Added authoritative payment outcome recovery by attempt or idempotency key.
- No Web Admin or Design Language changes.

# 2026-07-16 — Flutter Part 4C

- Corregida persistencia real de avatar y lectura de tokens largos.
- Añadida eliminación/reemplazo seguro y estados de media.
- Sin rediseño de Web Admin ni cambios al Design Language.

# 2026-07-16 — Flutter POS Part 4E

- Froze the normative POS V1 scope and post-V1 backlog.
- Replaced the fixed avatar image CSP with a validated server-owned API/media origin allowlist.
- Preserved restrictive CSP directives and rejected wildcard, credentialed and non-HTTP origins.
- Real avatar E2E currently exposes an authenticated media-read 404; no success is claimed.
