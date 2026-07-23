# Handoff — UI ↔ API Integration, Persistence & Product Flow

# Owner Final Acceptance Gate Part 1A — 2026-07-19

Status: **TECHNICAL CORRECTIVE PASS COMPLETE — OWNER CONFIRMATION REQUIRED**. Preserve the canonical `IdentityProvider`, public-only Login help, connected-only Cash form, structural Inventory alignment and real Product/Branch mutations. Evidence: `artifacts/owner-final-acceptance-part-1a/`; resolution: `docs/OWNER_ACCEPTANCE_RESOLUTION.md`. Do not mark owner observations closed and do not start Product Certification until the owner confirms visually.

# Owner Final Polish Pass Part 1A — 2026-07-18

Status: **OWNER FINAL POLISH PASS — PART 1A COMPLETE**. Preserve the viewport-safe contextual help, canonical identity/avatar behavior, editable Cash presets and explicit mutation feedback. Clean onboarding validation starts with `pnpm owner:onboarding:reset`; isolated fixtures use the `new-user` and `new-organization` variants. Evidence: `artifacts/owner-final-polish-part-1a/`. Do not start Product Certification without explicit owner authorization.

# Premium UX Part 4B final handoff — 2026-07-18

Part 4B and the Premium UX & Product Polish program are technically complete. Preserve the final excellence layer in `apps/web/src/app/styles.css`, especially native states, safe areas, forced colors, modal containment and print isolation. Evidence: `artifacts/premium-ux-part-4b/`. The next transition is owner review; NEXO Product Certification remains blocked until explicit owner approval.

# Premium UX Part 4A handoff — 2026-07-18

Part 4A is complete. Preserve the evidence-based benchmark: Apple hierarchy, Linear calm, Stripe trust, Notion disclosure, Arc context, Raycast keyboard speed, Framer responsive components and Vercel precision are principles—not visual templates. The Part 4A CSS layer closes 50 micro-quality findings and must remain tokenized. Evidence: `artifacts/premium-ux-part-4a/`. Do not start NEXO Product Certification.

# Premium UX Part 3B handoff — 2026-07-18

Part 3B is complete. Preserve the confidence pattern: every important success states the confirmed consequence and useful next step; recoverable errors state that work remains; technical data stays behind progressive disclosure. Do not revert the completed Logout transport wait, which prevents an otherwise successful 204 from appearing aborted in Chromium. Evidence: `artifacts/premium-ux-part-3b/`. NEXO Product Certification remains blocked.

# Premium UX Part 3A handoff — 2026-07-18

Part 3A is complete. Preserve the official motion durations/curves, premium focus and interaction states in `packages/ui/src/styles.css`; use shared `Skeleton` presets, contextual loading copy and semantic `Toast` instead of local spinners or abrupt feedback. Reduced motion is a required behavior, not a visual option. Evidence: `artifacts/premium-ux-part-3a/`. Do not start NEXO Product Certification.

# Premium UX Part 2 handoff — 2026-07-18

Part 2 is complete. Preserve the reusable Experience System in `apps/web/src/app/contextual-help.tsx`, its V2 persistence namespace and the searchable Help Center. New visible flows must explain purpose, first action, disabled reasons, success consequence and next step using these shared components. Evidence: `artifacts/premium-ux-part-2/`. Do not start NEXO Product Certification.

# Premium UX Part 1B handoff — 2026-07-18

Part 1B is complete. Preserve `NexoIcon`, the single-close `Dialog`, educational `EmptyState`, canonical upload states and shared layout rhythm. Evidence and test inventory live in `artifacts/premium-ux-part-1b/`. Any future visible component must use the Part 1A tokens and these Part 1B primitives. NEXO Product Certification remains blocked.

Se corrigieron el montaje no autenticado de pantallas mutables, el retorno post-login, la identidad demo incoherente y requests exitosos cancelados por cuerpos no consumidos. Producto y perfil/avatar tienen E2E estricto de Console/Network y persistencia. Identity, Authorization, Product, Inventory, Control Plane, Cash y Sales pasan suites database-backed representativas.

Siguiente acción autorizada: **revalidación manual del owner**, no Product Certification. Ejecutar `docs/owner-validation/START_HERE.md`, registrar resultados en `OWNER_TEST_RUN.md` y usar `artifacts/ui-api-persistence-certification/FLOW_MATRIX.md`. No compartir cookies, Authorization, credenciales ni URLs prefirmadas.

## Owner validation override

**CORRECTIVE PASS 2 COMPLETE — OWNER REVALIDATION REQUIRED.** Ejecutar el recorrido reducido de `docs/owner-validation/START_HERE.md`. El handoff a Product Certification sigue revocado hasta aprobación explícita del owner; no interpretar los gates automáticos como esa aprobación.

# Active handoff — owner corrective pass

Status: **CORRECTIVE PASS COMPLETE — OWNER REVALIDATION REQUIRED**. Do not start NEXO Product Certification. The next authorized transition is owner revalidation using the corrective evidence package.

# Boot reliability handoff — 2026-07-18

Use `pnpm manual-acceptance:start` for daily work and `pnpm manual-acceptance:status` for
immediate diagnosis. Use `setup` once, `rebuild` only after application/image changes and
guarded `reset` only when local data may be destroyed. Eight real probes must read READY.
See `docs/BOOT_CERTIFICATION.md` and `docs/owner-validation/START_HERE.md`. Product
Certification is not started and remains blocked.

# Premium UX Part 1A handoff — 2026-07-18

Part 1A is complete. Future UI changes must apply
`docs/design/PRODUCT_EXPERIENCE_PRINCIPLES.md`, use `NexoBrand`, semantic color/type/spacing tokens
and the shared button taxonomy, then rerun the focused design audits and affected visual journey.
Evidence lives in `artifacts/premium-ux-part-1a/`. Do not start NEXO Product Certification; it
remains blocked.

# Owner Final Polish Pass Part 1B — 2026-07-18

Status: **OWNER FINAL POLISH PASS — PART 1B BLOCKED**. Preserve the shared business presets and pesos/minor-units boundary. The remaining gate is dynamic organization context across operational routes; do not claim the clean-organization walkthrough until that separately authorized change exists. NEXO Product Certification remains blocked.

# Owner Final Polish Pass Part 2A — 2026-07-18

Dynamic context and LAN workflow are implemented. Run `pnpm owner:share` and complete
`docs/MULTI_DEVICE_SETUP.md` on the physical Mac. Do not close Part 2A or start Product Certification
until that walkthrough passes.

# Storage and memory handoff — 2026-07-18

Run `pnpm owner:disk:report` before cleanup. Every cleanup previews unless `--apply` is provided. `owner:clean` covers artifacts, logs and generated caches; Docker remains a separate conservative command. Never remove Docker volumes, `data/`, or `uploads/`. See `docs/STORAGE_RETENTION_POLICY.md`, `docs/OWNER_DISK_REPORT.md`, and `docs/MEMORY_CERTIFICATION.md`. Product Certification remains blocked.
