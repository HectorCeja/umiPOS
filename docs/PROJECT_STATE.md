# NEXO Project State

## 2026-07-19 — Owner Final Acceptance Gate Part 1A

**TECHNICAL CORRECTIVE PASS COMPLETE — OWNER CONFIRMATION REQUIRED.** Los P0 de ayuda pública, avatar, botones, feedback/scroll, Caja, edición de producto, alineación de Inventario, CRUD de sucursales y viewport tienen corrección sistémica, pruebas conectadas y evidencia Chromium. Conforme a la regla absoluta, siguen abiertos hasta confirmación visual del owner. NEXO Product Certification continúa bloqueada.

## 2026-07-18 — Storage, Memory & Disk Footprint Certification

**PASS.** NEXO now measures its repository, generated outputs, Docker footprint and runtime memory; safe owner cleanup commands preview by default and never touch PostgreSQL, MinIO, uploads, organizations or owner data. Artifact retention preserves the latest run, latest failure and latest certification. No known lifecycle leak remains. NEXO Product Certification continues blocked.

## 2026-07-18 — Owner Final Polish Pass Part 1A

**OWNER FINAL POLISH PASS — PART 1A COMPLETE.** Las diez observaciones del owner se reprodujeron y corrigieron: onboarding aislable, ayuda contenida, Login equilibrado, avatar persistente, cero botones verdes de acción, presets editables de Caja, feedback explícito, scroll inteligente, iconografía única y enlaces principales sin subrayado. La cuarta autocrítica implementa 30 mejoras adicionales. NEXO Product Certification continúa bloqueada.

## 2026-07-18 — Premium UX & Product Polish Part 4B

**PREMIUM UX & PRODUCT POLISH — PART 4B COMPLETE. PREMIUM UX & PRODUCT POLISH is technically certified.** The final launch walkthrough covers Login, Onboarding, Dashboard, Products, Inventory, Sales, Cash, Team, Settings, Profile, Help and Reports plus mobile, dark theme and overlay evidence. Final Red Team implements 75 additional refinements; eight requested gates and the unedited evidence run pass with clean Console/Network. Product Certification remains blocked until explicit owner approval.

## 2026-07-18 — Premium UX & Product Polish Part 4A

**PREMIUM UX & PRODUCT POLISH — PART 4A COMPLETE.** Fourteen product surfaces were benchmarked against official principles from Apple, Linear, Stripe, Notion, Arc, Raycast, Framer and Vercel. The objective scorecard is 9.5 overall, with explicit limits for Clients and native Flutter evidence. Ten design decisions compare three alternatives; Red Team found and corrected 50 additional details. Nine browser certification/evidence cases pass with clean Console/Network. Product Certification remains blocked.

## 2026-07-18 — Premium UX & Product Polish Part 3B

**PREMIUM UX & PRODUCT POLISH — PART 3B COMPLETE.** Success moments now explain what changed and what to do next; important failures reassure that work is preserved; technical detail uses progressive disclosure; loading, scrolling and continuation feedback retain one premium personality. A real Login → Onboarding → operational modules → Logout walkthrough is clean in Console and Network. Round-two self-critique implements 31 additional refinements. Product Certification remains blocked.

## 2026-07-18 — Premium UX & Product Polish Part 3A

**PREMIUM UX & PRODUCT POLISH — PART 3A COMPLETE.** NEXO now uses one tokenized Motion System for interaction, overlays, navigation and feedback; shared premium toasts, contextual loaders and eleven skeleton families replace generic loading states. Reduced-motion behavior, keyboard focus, hover/press depth and explicit emotion targets are automated. The self-critique records and resolves 30 concrete improvements. Product Certification remains blocked.

## 2026-07-18 — Premium UX & Product Polish Part 2

**PREMIUM UX & PRODUCT POLISH — PART 2 COMPLETE.** NEXO now has a reusable Experience System, continuous contextual onboarding, searchable Help Center, glossary, FAQ, checklist, viewed-help history, persistence/reset, educational empty states, success education and next-step recommendations. Fourteen focused/transversal browser cases pass, `pnpm check` passes, and 15 visual files demonstrate guidance from Login through authenticated modules and Flutter POS. Product Certification remains blocked.

## 2026-07-18 — Premium UX & Product Polish Part 1B

**PREMIUM UX & PRODUCT POLISH — PART 1B COMPLETE.** The visible component library, layouts, semantic SVG iconography, responsive behavior, modals, uploads, empty states, sidebar and topbar are certified against the Part 1A foundation. `pnpm check` passes, 16 focused Part 1B cases pass, and 24 visual files cover desktop, tablet, mobile, dark theme and a docked-DevTools-equivalent viewport. Flutter token/component contracts pass; runtime execution remains an external SDK limitation. NEXO Product Certification remains blocked.

## 2026-07-18 — Premium UX & Product Polish Part 1A

**PREMIUM UX & PRODUCT POLISH — PART 1A COMPLETE.** Owner Experience First is now a permanent product rule. Web and Flutter share an authoritative NEXO brand component; color, typography, spacing, layout and button contracts are explicit and automated. A clean Chromium walkthrough covers Login, Onboarding and nine authenticated modules at desktop, tablet and mobile viewports with before/after evidence. Product Certification remains blocked.

## 2026-07-18 — Boot & Environment Reliability Certification

**BOOT & ENVIRONMENT RELIABILITY CERTIFIED.** Manual acceptance now has separate one-time setup, daily start, status, logs, stop, restart, rebuild and guarded reset commands. Daily warm start reaches eight probed READY services in 27.84 seconds without rebuild, install, migration, seed or SDK generation; all long operations emit 10-second progress. Product Certification remains blocked and no product behavior or business rule changed.

## 2026-07-17 — UI ↔ API owner corrective pass

**CORRECTIVE PASS 2 COMPLETE — OWNER REVALIDATION REQUIRED.** Los estados reales de Ventas, feedback de recibo/Clipboard, ayuda transversal Web/Flutter, layouts, logo, iconografía, Console/Network y 39 capturas están cerrados. `pnpm check`, Flutter POS, Flutter real API E2E y 23 E2E Web correctivos pasan sin suite crítica omitida. Product Certification permanece bloqueada hasta aprobación explícita del owner.

## 2026-07-17 — Flutter Design Parity Part 5 of 5 (COMPLETED)

**Flutter POS V1: CERTIFIED.** Design parity, behavior, security, financial integrity, accessibility, PostgreSQL RLS/cross-tenant isolation and real-service E2E pass. Version is frozen at 1.0. Financial offline remains disabled by design. Native execution is pending on platform runners and is conditionally verified by scaffolding, CI configuration, analyze and tests; no native code error is open. The next roadmap block is NEXO Product Certification, not started here.

## 2026-07-17 — NEXO POS V1 Productive Completion (CONDITIONALLY COMPLETE)

All REQUIRED FOR V1 product behavior and financial/security gates are green. Flutter real API E2E passes 1/1; connected PostgreSQL/Redis/MinIO/API/worker/Web tests pass 25/25; Design tests pass 53/53; POS tests pass 36/36 and goldens 7/7; root `pnpm check` passes. Avatar GET/render is fixed, cash close now blocks pending financial postings, and exact database verification proves one payment/receipt/completion event per sale and one cash movement per cash sale. RLS/FORCE RLS and runtime-role cross-tenant probes pass. Offline finance remains disabled by design. The only condition is unavailable native runner toolchains; Part 5 certification is authorized but not started.

## 2026-07-16 — Flutter Design Parity Part 4E (INCOMPLETE)

The POS V1 scope is frozen in `docs/flutter/FLUTTER_POS_V1_SCOPE.md`; post-V1, Web Admin, disabled and runner-only capabilities no longer block the gate. The Web CSP now admits only the configured public API/media origins and its deployed header allows the local API without wildcard or internal MinIO. `pnpm check` and Flutter 74/74 pass. Real avatar E2E exposed a remaining 404 from the authenticated avatar read after successful upload completion. Productive Flutter cash close, external tender MVP, receipt/reprint, critical recovery, diagnostics, RLS/cross-tenant V1 and financial E2E remain REQUIRED V1 gaps. Part 5 is not authorized.

## 2026-07-16 — Flutter Design Parity Part 4D (INCOMPLETE)

Production startup now uses the real OpenAPI client, platform secure storage, SQLite, full cookie/CSRF persistence, device/session/context/permission/cash guards and single-flight refresh. Cash checkout payloads were corrected to OpenAPI 8.9.0. Flutter POS checks pass 21/21 and design checks pass 53/53. Productive external/mixed payments, cash lifecycle UI, receipt/reprint/printing, suspend/restore, refunds, recovery, diagnostics/telemetry and real financial RLS/E2E remain absent. Offline finance is DISABLED BY DESIGN FOR V1. Part 5 is not authorized.

## Flutter Design Parity

Part 3 of 5 — LivingScene and Motion Parity implemented and under final Quality Gate. POS remains unimplemented.

Technical readiness: PASS. Part 4 has not started. Notification delivery status is resolved by the final audited delivery record.

## 2026-07-15 — UI implementation Parte 2 (INCOMPLETE)

Parte 2 extends the Parte 1 Design Language, shell, motion and single `LivingScene` engine to
Onboarding, Products, Inventory, Sales, Cash, Reports, Team, Profile, Settings and the Command
Palette. Onboarding now has eleven presentation steps with authoritative versioned persistence;
Reports is a new real-data route and refuses to invent unavailable series. Functional regression
is green (Unified Experience 55/55; domain/RLS suites; Cash 40/40; UI Parte 2 4/4), runtime is
healthy and operational outboxes are 0/0/0. The strict phase remains INCOMPLETE because four
Control Plane and one Storybook visual baselines intentionally fail after the shared scene change,
and Inventory/Reports lack public contracts needed to reproduce all mockup data density. No POS
web or UMI-derived change was introduced.

## 2026-07-15 — UI implementation Parte 1

Login and Home now implement the owner-provided `login.png` and `home.png` direction on a shared semantic token, motion and Living Scene foundation. `LivingScene` supports typed variants/quality, deterministic screenshots, reduced motion and Page Visibility pause. Home uses the real Sales overview and honest unavailable states; it does not invent analytics. Authentication, domain, contracts, RLS and workers are unchanged. Owner visual approval remains pending.

## 2026-07-15 — Prompt 12.8 UI stabilization

The visual rebuild is intentionally paused pending owner-approved mockups. The stable
foundation now persists and restores avatar media, exposes the avatar in authenticated
identity, supports complete approved product administration media/commercial fields,
and corrects onboarding, schedule, Team, Inventory, Settings, logout, hover, contrast
and responsive defects without changing NEXO's visual identity.

The current human result remains **FAIL — VISUAL EXPERIENCE**. Known deliberate visual
limitations are recorded in `UI_KNOWN_VISUAL_LIMITATIONS.md`; the existing contrast
baseline is recorded in `UIContrastMatrix.md`. No POS web or UMI alignment was added.

Executed evidence: repository `pnpm check`; connected Unified Experience `55/55`;
Storybook/UI/axe/keyboard/visual `12/12`; clean global regression (Authorization `5/5`,
Control Plane `8/8`, Product `3/3`, Inventory `5/5`, Cash `40/40`, Sales `6/6`, Identity
`7/7`, UI `12/12`); general and Cash workflow RLS; healthy Docker services and two
workers; operational pending outboxes Cash/Sales/Inventory `0/0/0`.

## 2026-07-15 — NEXO UI V1 implementation checkpoint

Design Bible V1 is implemented for owner visual review. Enterprise Luxury is the structural direction, warmed by Hospitality; Future Retail remains limited to catalog/onboarding selection. Dark uses the approved violet/blue palette, Instrument Sans headings and Manrope operational text. Ambient backgrounds, route/component motion and reduced-motion behavior are active. The human result remains **FAIL — VISUAL EXPERIENCE** until a new owner review; automation does not supersede it.

No domain, OpenAPI, SDK, Authorization, RLS, ledger, worker, outbox or UMI boundary changed. No POS web or checkout was created.

## Prompt 12.6 international design freeze — 2026-07-15

Human acceptance remains **FAIL — VISUAL EXPERIENCE**. The implementation followed a
research-first freeze: fifteen product/design references were compared, three distinct
directions were built and captured, and a weighted matrix selected Enterprise Modern
with restrained hospitality warmth. The selected system uses Manrope Variable, graphite
surfaces, emerald action color, one shell, normalized spacing/controls, functional motion,
visual onboarding/catalog/product creation, expanded schedules and consistent Sales/Cash
presentation. Dark is the sole approval reference until a light theme can meet the same
standard. Evidence and captures live under `artifacts/design-freeze/`.

This sprint changes presentation only. No POS/checkout web, domain, boundary, contract,
RLS, worker, ledger, outbox or UMI alignment change was introduced. Automated evidence
does not replace the required owner visual decision.

## Prompt 12.5 international experience — 2026-07-15

Human acceptance remains **FAIL — PRODUCT EXPERIENCE, CONSISTENCY AND USABILITY** until the owner completes a new review. The automated international-experience gate is green: semantic dark-first tokens, reusable mutation feedback, modern visual choices, per-day/multi-interval schedules, a visual catalog, honest role cards, consistent overlays, a contextual command palette, persistent theme/branch context and real private avatar upload are implemented. Custom Roles remain deliberately unavailable because Authorization accepts only versioned allowlisted definitions.

Executed evidence: root `pnpm check`; International Experience Playwright `50/50`; clean global regression Authorization `5/5`, Control Plane `8/8`, Product `3/3`, Inventory `5/5`, Cash `40/40`, Sales `6/6`, Identity `7/7`, Storybook/UI/axe/keyboard/visual `12/12`; both RLS suites; OpenAPI `8.7.0` with 128 operations and synchronized SDK; two healthy workers; and pending Cash/Sales/Inventory outboxes `0/0/0`. A real light-canvas/dark-text regression in Team/Settings was found and corrected before four reviewed baselines were intentionally replaced. No POS web, checkout web or UMI alignment was introduced; owner perception remains pending.

## Prompt 12.4 unified experience — 2026-07-15

Human acceptance remains **FAIL — INCONSISTENT PRODUCT EXPERIENCE AND OWNER CONTROL** until a new owner review. The automated unified-experience gate is green: onboarding decisions are editable and persisted, journey progress resumes at the exact visual step, one premium shell wraps Sales, Cash, Product, Inventory, Team, Settings and Help, profile presentation has an authenticated CSRF-protected command, themes are visible, scrollspy/back-to-top work and raw Cash/Sales states are localized.

Executed evidence: `pnpm check`; Unified Experience Playwright `40/40`; clean global regression Authorization `5/5`, configuration `8/8`, Product `3/3`, Inventory `5/5`, Cash `40/40`, Sales `6/6`, Identity `7/7` and UI/Storybook/axe/keyboard/visual `12/12`; both RLS suites; OpenAPI 8.6.0/125 and synchronized SDK; real profile PATCH; two healthy workers; and pending Cash/Sales/Inventory outboxes `0/0/0`. `manual-acceptance:prepare` completed and generated the one-URL owner package with 156 scenarios. Product and Inventory surfaces call their public Application Services. Owner Screen Readiness deliberately labels Inventory, Team and post-onboarding business settings PARTIAL where the web surface does not expose every existing backend capability. No POS web or UMI alignment exists.

## Prompt 12.3 product polish — 2026-07-15

Human acceptance remains **FAIL — PRODUCT EXPERIENCE** until a new owner review occurs. The automated product-polish implementation now provides one root entry, real Authentication login/logout, authoritative Control Plane onboarding routing and persistence, active-branch selection from Control Plane, business-first Home/activation, explicit identity and logout, es-MX primary vocabulary, task-oriented Cash/Sales presentation, collapsed diagnostics and a project-owned visual narrative.

Automated evidence is green: root `pnpm check`; Product Experience Playwright `4/4`; Storybook/Design System `12/12`; general and Cash RLS; API/web/two workers and dependencies healthy; operational pending outboxes Cash/Sales/Inventory `0/0/0`; 10-sample warmed product performance; and 15 comparable captures under `artifacts/product-polish`. `manual-acceptance:prepare` now prints only `http://localhost:3000` as the product entry and separates Mailpit as optional development diagnostics. No POS web, backend/domain/contract change or UMI alignment was introduced.

## Prompt 12.2 product experience — 2026-07-14

The first owner acceptance was recorded as a product-experience failure, not a functional failure. NEXO now has an intentional login/session-restoration journey, a business-first Home, persistent premium navigation, command palette, friendly organization/branch/user/role identity, profile/help/logout, refined visual tokens and humanized Sales/Cash administration. Visible UUID controls and developer-facing copy were removed; server identifiers remain internal.

This was a frontend-only change. Authentication endpoints and CSRF remain authoritative; no backend, domain, OpenAPI, SDK, RLS, Authorization, Cash, Sales, Inventory, Product, worker, outbox or UMI boundary changed. No operational web POS exists. Executed evidence is tracked in `QUALITY_GATE.md`; owner re-acceptance is recommended after the automated visual gate.

## Prompt 12.1 certification — 2026-07-14

Phase 12 automated quality gate is **green; owner acceptance is pending**. The phase is not formally closed until the owner supplies real results. Executed evidence: Sales fixture E2E `6/6`; explicit Sales Administration Playwright `44/44`; deterministic Sales visual regression `27/27`; connected accessibility/keyboard/reflow `8/8`; Design System/Storybook `12/12`; OpenAPI 8.5.0/124 and SDK checks; warmed performance; both RLS suites; global regression; two healthy workers and Cash/Sales/Inventory pending outboxes `0/0/0`.

The clean run exposed and corrected one production defect: non-UUID search terms were incorrectly sent to PostgreSQL as UUID equality predicates. `pnpm manual-acceptance:prepare` completed and generated `artifacts/manual-acceptance/current-run/`; `manual-acceptance:record` is implemented but deliberately not run with invented owner results. No web POS or UMI-derived architecture change exists; no critical debt is accepted.

## Prompt 12 checkpoint — 2026-07-14

Phase 11 remains closed green. Phase 12 is **yellow**. Implemented: eight design-first Sales Administration reads (OpenAPI 8.5.0/124), synchronized SDK, dedicated permissions, connected `/sales` console and stable routes, authoritative overview/history/detail/timeline/refund/receipt/exception/diagnostic projections, Sales/Cash/Inventory traceability, sanitized diagnostics, UI components/Storybook, local-only acceptance preparer, Owner Quickstart and 156 manual scenarios. Manual sale remains disabled; no web POS or UMI-derived architecture change exists.

Executed evidence: `pnpm check`; Sales E2E `6/6`; connected Sales UI/axe/keyboard/tablet/dark/reduced-motion `1/1`; Storybook/UI `12/12`; nine warmed performance operations, 20 samples each, worst p95 35.01 ms; general and Cash workflow RLS; clean global regression Authorization `5/5`, Control Plane `8/8`, Product `3/3`, Inventory `5/5`, Cash `40/40`, Sales `6/6`, Identity `7/7`, UI `12/12`. API/web/two workers and infrastructure are healthy; pending Cash/Sales/Inventory outboxes are zero.

Not closed: the complete 44-scenario Sales Administration browser matrix, dedicated requested Sales visual baselines, complete page-by-page command coverage and an owner-executed `manual-acceptance:prepare` run remain unevidenced. These are explicit acceptance gaps, not hidden critical debt.

## Prompt 11.6 final certification — 2026-07-14

Phase 11 is **green and closed**. No POS was started and no UMI boundary was changed. The final implementation remains Cash-authoritative, Sales-authoritative for commercial refunds, append-only, tenant/branch aware and client neutral.

Executed evidence: two consecutive `pnpm cash:certify` cycles from deleted Docker volumes; 35 migrations and repeatable seed; root format/lint/TypeScript/unit/domain/contract/build gates; Cash Playwright `40/40`; UI/Storybook/axe/keyboard/tablet/dark/reduced-motion/visual `12/12`; refund positive/negative matrix; 30 mapped PostgreSQL race scenarios; automated two-process claim/crash/lease/replay/retry/quarantine certification; generic and Cash workflow RLS; and 34-operation performance reports. Both cycles ended with Cash, Sales and Inventory pending outboxes at zero. Final global regression passed Authorization `5/5`, Control Plane `8/8`, Product `3/3`, Inventory `5/5`, Cash `40/40`, Sales `5/5`, Identity `7/7` and UI `12/12` from a new database.

OpenAPI remains `8.4.0` with 116 operations and the generated SDK/compatibility gate is synchronized. Runtime and worker have no `BYPASSRLS`; runtime cannot UPDATE or DELETE the Cash ledger. There is no critical technical debt. Historical yellow checkpoints below remain as an audit trail and are superseded by this certification.

## Prompt 11.5 certification checkpoint — 2026-07-14

Fase 11 remains **yellow**. The mandatory audit found no missing Cash architecture/domain and no accepted critical debt; certification, not feature development, is the only active scope. A regression attempt exposed test isolation defects: the connected UI fixture left an active session and a previous Identity password-reset journey changed seeded credentials. The UI fixture now force-closes its own session, and the certified Cash order includes seed before tenant-scoped cleanup. With that correction, the current Cash group passed `20/20` against real services. The root `pnpm check` remains green, and the existing RLS SQL suite again returned `1` for every assertion.

The certification is not complete: refund negatives are not exhaustive, concurrency remains `6/30`, the automated two-worker matrix is incomplete, functional Cash Playwright is `20/40`, performance is not fully measured, two clean integral cycles have not run, and the global browser/RLS workflow matrix has not completed. `CashRequirementCoverage.md` maps every Prompt 11 area without converting partial evidence into green.

## Prompt 11.4 checkpoint — 2026-07-14

Cash remains **yellow** and no operational web POS was introduced. OpenAPI is now 8.4.0 with 116 operations and the generated SDK is synchronized. Migration `20260714153000_cash_refund_allocation_distribution` is the 34th applied migration and distributes an authoritative Sales refund across captured CASH allocations without posting card allocations. Register and Drawer updates, branch-aware transactional authorization, a connected administrative Cash console and request-scoped CSP nonces were added.

Executed evidence: partial, total, mixed and multi-CASH allocation refunds passed `5/5`; the current PostgreSQL race subset passed `6/6`; sanitized quarantine authorization passed `3/3`; the connected console passed `2/2`. After fixing fixture isolation, all four suites passed together `16/16` from tenant-scoped cleanup. The UI gate passed `12/12` with Storybook, axe, keyboard, tablet, dark and visual checks. The complete root `pnpm check` passed format, zero-warning lint, TypeScript, unit/contract tests and every production build. Two real worker containers processed the positive refund suite, lease recovery was observed after a simulated crashed claimant, redelivery after publish-before-mark remained idempotent, and a permanent event reached quarantine. All runtime services, including both workers, were healthy and Cash, Sales and Inventory pending outboxes were queried again at zero. Runtime still has no ledger UPDATE/DELETE grants and neither runtime nor worker has `BYPASSRLS`.

Important defects corrected during this checkpoint: the opening float projection was double-counted and now derives from the append-only `OPENING_FLOAT` entry; the static Next shell blocked hydration under CSP and now renders per request with a nonce; deposit approval IDs are now checked for approved status, `DEPOSIT` action and matching session, and the deciding actor is persisted instead of the approval ID.

The phase is **not closed**. The demanded negative refund matrix, all 30 individually evidenced PostgreSQL races, codified two-process crash/restart/starvation evidence, the complete 40-flow Cash browser suite, full accessibility/visual regression after the connected console, the complete performance matrix, two consecutive integral cycles, global regression and comprehensive Cash RLS rerun remain incomplete. No one may start POS or report the integral gate green.

## Prompt 11.3 checkpoint — 2026-07-14

Cash remains **yellow** and POS has not started. This iteration added leased PostgreSQL outbox claims (`FOR UPDATE SKIP LOCKED`), bounded retries/quarantine metadata, sanitized tenant-scoped quarantine/status queries, OpenAPI 8.3.0 (114 operations), generated SDK synchronization, a presentational Cash console and reusable Cash UI stories. The API runtime can read local UMI delivery counts through FORCE-RLS after migration `20260714152000_cash_sink_runtime_read`; it still cannot mutate the ledger.

Verified evidence: partial CASH refund from Sales posts exactly once after replay (`2/2` from clean Cash state); Cash lifecycle/deposit/reopen suite `4/4`; PostgreSQL race subset `5/5`; UI components `9/9`; UI browser/axe/keyboard/tablet/dark/visual `12/12`; contracts and SDK green; 33 migrations apply repeatably. The worker is healthy and observed Sales refund/outbox processing succeeds.

The phase is **not closed**. Blocking evidence remains for total/mixed refund cases, the complete 30-scenario PostgreSQL concurrency matrix, two-worker crash/lease recovery, fully wired operational Cash UI and application E2E, full performance matrix, two complete clean quality cycles, RLS/full-regression reruns and final zero-outbox proof. No critical debt is hidden or accepted; these are explicit incomplete gates.

## Prompt 11.2 checkpoint — 2026-07-14

Cash remains **yellow**. The handoff now has persisted multi-step states and explicit initiate/count/accept-or-reject-or-cancel/complete/query Application Services. Incoming Membership and Branch scope are resolved from PostgreSQL; denomination totals are recalculated server-side; completion is versioned, idempotent and changes custody without replacing the ledger. The real Cash E2E suite is 3/3 after exercising the accepted flow.

Deposit cancellation now appends a compensating `CORRECTION` rather than rewriting its original `DEPOSIT` entry. A guarded, tenant-allowlisted local/test cleanup was executed twice consecutively, while the runtime role remained unable to delete ledger rows. OpenAPI is 8.2.0/112 operations, contracts and SDK checks pass, and the rebuilt worker is healthy and drained the observed Cash outbox into the idempotent local UMI sink.

The phase is not closed. Missing final evidence remains: refund/reopen/deposit lifecycle E2E, the complete PostgreSQL race matrix, Cash administrative UI and Storybook/axe/keyboard/tablet/visual coverage, full performance measurements, safe administrative quarantine queries/claim concurrency, full suite repetition and the final integral gate. Do not begin POS.

**Current phase:** Prompt 11 — Cash Management Platform  
**Date:** 2026-07-14  
**Status:** in progress; Quality Gate yellow

## Prompt 11 state

Implemented and verified: framework-free `@nexo/cash` domain, explicit Session lifecycle, exact ledger/reconciliation/denomination logic, Movement Registry v1, neutral receipts/ports; Authorization registry v5; 16 tenant-owned FORCE-RLS cash tables; runtime ledger immutability; 11 Cash OpenAPI operations/SDK; API Application Services for Register/Drawer/open/movement/count/reconcile/close/read models; and a least-privilege worker function that posts authoritative Sales CASH allocations exactly once. OpenAPI is 8.0.0/93 operations and 25 migrations are applied.

Real evidence currently green: `pnpm check`; Cash domain 5/5; OpenAPI/SDK compatibility; cash Sales posting/replay SQL; RLS default deny and Alpha/Beta isolation over 57 tables; real Compose rebuild with all services healthy/jobs 0; product E2E 33/33; Storybook/UI/axe/visual suite 8/8.

Prompt 11 remains open. Still required before green: operational API/services for suspend/resume, approvals, deposits, atomic transfers, controlled reopen and handoff; cash refund event posting; persisted policy resolution instead of the current domain default in reconciliation; full idempotency response store/fingerprints on every command; PostgreSQL race suite; worker publishing for Cash outbox/public UMI local sink; minimal Cash UI/Storybook/Playwright/visual/axe; and measured performance budgets. These are functional gaps, not accepted debt.

## Prompt 10 state

NEXO now has a documented information architecture, adaptive navigation, persona/context model, complete flow catalogue, low-fidelity wireframes, POS blueprint, Mexican-Spanish writing contract, security UX, Flutter parity and an UMI experience decision framework. ADR-0038 establishes `@nexo/ui` as the semantic presentational boundary.

`@nexo/ui` now exposes tokenized primitives, overlays, navigation/data patterns, admin shell and neutral POS components. It supports light/dark, comfortable/compact/touch density, reduced motion and forced-colors readiness. Components display backend-authoritative results and emit intentions; no business service, fake commercial backend or total calculation was introduced.

Final evidence: `pnpm check`, Storybook production build, six component tests, eight dedicated UI browser checks with five axe scans and four new visual baselines, 33/33 product E2E, OpenAPI 7.1.0/82 operations and healthy real Compose services. No critical debt is accepted.

## Runtime truth

Foundation through Inventory are operational. Sales adds the framework-free `@nexo/sales` boundary, authoritative checkout/totals, immutable commercial snapshots, payment intents/attempts/allocations, suspended/cancel/refund foundations, receipts, branch folios, business dates, idempotency, optimistic concurrency, transactional audit/outbox and a disabled-by-default local UMI integration sink. OpenAPI 3.1.1 contract 7.1.0 publishes 82 operations and the SDK/compatibility gate remain synchronized. Nineteen forward-only migrations are applied.

Prompt 6 adds `@nexo/control-plane`, Organization/Branch administration, restartable smart onboarding, eight data-driven templates, invitation lifecycle, Membership role/state/Branch administration, feature administration, append-only evidence, OTel spans and five responsive visual baselines. Protected writes re-resolve database authority inside the write transaction; RLS remains forced/default deny.

Product remains purely descriptive and Inventory remains ledger-authoritative. Sales consumes both only through public ports. POS UI, Cash Management, Customers, productive payment providers, CFDI, Flutter and productive UMI connectivity remain deliberately absent.

## Open risks and controlled debt

- Organization archive uses `OFFBOARDING`; restore awaits retention/billing policy.
- Template authoring has no public runtime endpoint; data migration/administrative tooling owns it.
- Email production provider, KMS/secrets, SIEM, object upload validation, independent pentest and formal ASVS evidence remain production gates.
- Visual baselines are Linux/Chromium specific; CI pins browser installation.
- Workspace remains entirely untracked; establish a reviewed baseline commit.

No critical debt is accepted.

## Prompt 9 state

Sales uses exact scaled integers in-domain and PostgreSQL numeric/bigint persistence; client totals are never authoritative. Critical writes lock the Sale row, revalidate database authorization, enforce version/idempotency constraints and atomically append events/outbox. Inventory reservation/consume/release uses the Inventory public coordinator. Public UMI events are whitelisted projections rather than internal aggregates.

Final evidence: `pnpm check`, 33/33 real E2E, 19 migrations, 41 FORCE-RLS tables, every SQL isolation assertion `1`, 82 OpenAPI operations, drained outboxes and healthy Compose services. The concurrent-completion test proves one winner and one stable 409 conflict. Local warmed p95 was 28.9 ms for Create Sale and 23.6 ms for List Sales over 200 samples each.

## Prompt 8 state

`@nexo/inventory` is framework-free. Nine inventory tables use default-deny/FORCE RLS and immutable ledger/audit triggers. Balances derive from Decimal ledger movements; snapshots are subordinate. FIFO, weighted-average and standard cost policies are separate; LIFO is disabled. Final evidence: `pnpm check`, 27/27 E2E, 27 FORCE-RLS tables, all SQL assertions `1`, eight movements/eight snapshots and zero unpublished Inventory envelopes.

## Recommended next phase

## Login + Onboarding cinematic — 2026-07-15

Los mockups raíz `login.png` y `onboarding.png` son la autoridad visual. Login y los 12 pasos del Smart Onboarding comparten ahora una escena hospitality nocturna, motor ambiental reusable, paneles de vidrio, narrativa editorial y progreso accesible. Authentication, Membership, Control Plane y persistencia permanecen autoritativos; catálogo vacío sigue permitiendo crear un producto personalizado. La aprobación visual humana está pendiente.

Finish Prompt 11 before starting POS. After Cash is green, connected POS web remains the evidence-backed next phase. Customers may proceed independently; Flutter/productive UMI still await hardware/offline and definitive UMI contracts.

## Prompt 11.1 recovery checkpoint — 2026-07-14

Cash completion remains **yellow**. Open/suspend/resume, persisted scoped policies, approval request/decision with policy-controlled self-approval, deposit preparation, atomic same-branch transfers and completed handoff evidence now execute against real PostgreSQL. The uniform idempotency store now covers open, movement, count, reconcile, close and completion commands with SHA-256 payload fingerprints and safe JSON replay. A real three-scenario Playwright API suite passes, including concurrent suspend replay and exact transfer replay.

Open blockers are the multi-step handoff lifecycle, administrative Cash UI and its axe/keyboard/visual coverage, complete PostgreSQL race matrix, measured performance matrix, refund E2E evidence, repeatable Cash test cleanup, and final worker/outbox validation. The worker was stopped after finding historical SaleCompleted events retrying without backoff; code now quarantines after ten attempts, but the rebuilt worker has not yet received final end-to-end validation.

## UI shell consolidation — 2026-07-15

Architecture is now **Single Shared Shell**: `/` and every administrative route consume the sole
`NexoAppShell` implementation in `apps/web/src/app/global-shell.tsx`. Home no longer declares a
sidebar, topbar, LivingScene, Command Palette, account menu or responsive navigation. Functional,
type, lint, unit, production-build, responsive and axe checks pass. The phase remains **OWNER VISUAL
REVIEW REQUIRED** because the protected Control Plane baselines differ after adopting Home's
canonical shell; no snapshot was updated. Inventory and Reports backend gaps remain unchanged.

## Flutter Design Parity — Part 1 of 5 — 2026-07-16

`packages/nexo_flutter_design` is now the canonical visual foundation. Before this phase the repository contained no Flutter/Dart implementation. It provides generated frozen V1 colors, dark ThemeData, typed colors/metrics/motion extensions, typography roles, adaptive window classes, density profiles, accessibility/reduced-motion preferences, quality/lifecycle contracts, a foundation showcase and deterministic goldens.

Web and the frozen Design Language were not changed. Flutter 3.44.6 / Dart 3.12.2 validation passes 7/7 tests. Official Instrument Sans/Manrope variable TTFs are versioned under OFL-1.1 with hashes. POS screens, business behavior, platform runners and LivingScene rendering remain explicitly unimplemented. Status: **COMPLETE** for Part 1 foundation.

## Flutter Design Parity — Part 2 of 5 — 2026-07-16

`packages/nexo_flutter_design` now exposes the canonical domain-independent Component Library: controls, semantic surfaces/cards, feedback, overlays, forms, product/data display foundations and adaptive patterns. Interaction tests cover keyboard, focus, Escape, restore focus, validation and selection. Eight new deterministic component goldens cover required viewports, 200 % text, reduced motion and high contrast; the executable showcase has real captures/videos.

Cart, checkout, payments, cash session, receipts, offline sync, enrolment, LivingScene and productive navigation remain unimplemented by design. Web Admin and `docs/design/` are unchanged. Status: **COMPLETE** for Part 2 Component Library Foundation, subject to the clean final command evidence recorded in the gate.

## Flutter Design Parity — Part 4 of 5 — 2026-07-16

`apps/nexo_pos` is the canonical Flutter POS application boundary and consumes `packages/nexo_flutter_design`. It implements a typed OpenAPI client boundary, deterministic bootstrap guards, integer-money cart, adaptive catalog/cart shell, online idempotent cash checkout, explicit unknown-payment blocking, conservative offline policy and ordered local outbox foundation. POS tests pass 19/19; design regression passes 53/53.

Status: **INCOMPLETE**. OpenAPI does not publish terminal enrollment/revocation, financial offline reconciliation or payment-intent recovery. Secure production persistence, authentication/context UI, full cash lifecycle, external/mixed payments, refunds and hardware printing also remain unfinished. No Web POS or backend rule duplication was introduced.

# Update 2026-07-16 — Flutter Design Parity Part 4B

Status: **INCOMPLETE**. Authorization registry v6, POS terminal enrollment/revocation, OpenAPI 8.8.0, authoritative payment-outcome lookup, platform secure storage and SQLite schema v1 are implemented. Financial offline reconciliation, external/mixed payment closure, full Flutter operational UI and real E2E remain critical blockers. Part 5 is not authorized.

# Flutter Design Parity — Part 4C of 5 (2026-07-16)

Estado: **INCOMPLETE**. Se cerró el defecto real de avatar con PostgreSQL, MinIO, persistencia transaccional, RLS y E2E. El POS Flutter no está listo para certificación: permanecen gaps productivos de contexto, caja, pagos externos/mixtos, receipts, refunds, recovery, diagnostics y E2E completo. Parte 5 no autorizada. Offline financiero: **DISABLED BY DESIGN FOR V1**.

## UI ↔ API Integration, Persistence & Product Flow — 2026-07-17

El guard de sesión Web, retorno post-login, identidad/avatar y consumo de respuestas fueron corregidos. Producto y Perfil pasan E2E real con Console/Network limpios y persistencia tras recarga. Las suites PostgreSQL/RLS representativas pasan. Estado: **COMPLETE WITH OWNER VALIDATION ITEMS**; contratos sin controles UI quedan `Not implemented`.

### Owner validation corrective pass

Estado temporal: **OWNER VALIDATION FAILED — CORRECTIVE PASS REQUIRED**. Product Certification no está autorizada. La validación manual detectó defectos en selectores, onboarding/media, avatar reactivo, Caja, Producto, Inventario, Equipo, contexto organizacional y sesión que requieren corrección y nueva evidencia.

## Owner Final Polish Pass — Part 1B (2026-07-18)

Status: **OWNER FINAL POLISH PASS — PART 1B BLOCKED**.

Productos, onboarding y Caja comparten presets comerciales editables; los gates técnicos pasan. El walkthrough integral sobre una organización recién creada no puede certificarse porque las rutas operativas conservan un tenant canónico fijo. Resolverlo requiere autorización para cambiar la resolución transversal de contexto. Evidencia: `artifacts/owner-final-polish-part-1b/`. NEXO Product Certification permanece bloqueada.

## Owner Final Polish Pass — Part 2A (2026-07-18)

Status: **BLOCKED — PHYSICAL MAC VALIDATION REQUIRED**. Contexto dinámico, recorrido con negocio
nuevo y acceso LAN Chromium pasan, incluido upload/avatar. El runner no puede controlar un Mac
físico; no se declara `PART 2A COMPLETE` sin esa evidencia. Product Certification sigue bloqueada.
