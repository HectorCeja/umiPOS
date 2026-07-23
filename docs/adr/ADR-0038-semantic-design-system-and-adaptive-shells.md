# ADR-0038 — Semantic Design System and Adaptive Shells

**Status:** Accepted  
**Date:** 2026-07-14

## Context

NEXO must serve administrative web, high-frequency POS, future Flutter clients and UMI entry points without moving business authority into UI or creating per-client design forks.

## Decision

`@nexo/ui` is the canonical web presentation boundary. It uses semantic CSS custom-property aliases, native HTML first, accessible typed React composition and separate adaptive admin/POS shells. Light/dark, comfortable/compact/touch density, reduced motion and forced-colors readiness are one contract. Components display server results and emit intentions; they do not calculate commercial truth or authorize.

Layout decisions use available content constraints and input modality, not device detection. Flutter will map semantic tokens and behavior to native widgets; UMI integration remains a blueprint until its contracts exist.

## Alternatives

- Adopt a complete third-party component system: faster breadth but imposes visual/runtime contracts and weakens Flutter/UMI parity.
- Copy a POS design: fast familiarity but legal/product fit and extensibility risks.
- Per-client UI systems: native freedom but vocabulary, accessibility and state drift.
- Shared microfrontend/shell now: premature without UMI ownership and security contracts.

## Consequences

New web primitives belong in `@nexo/ui` with story, interaction/a11y test and justified baseline. Semantic tokens cannot be bypassed with arbitrary visual values. Complex custom widgets require WAI-ARIA APG evidence; native controls remain preferred. User research and hardware testing remain necessary before freezing the final POS experience.

## Review triggers

Definitive UMI shell/token contract; Flutter prototype evidence; inability of native controls to meet measured workflows; validated need for an external primitive library; WCAG target change.
