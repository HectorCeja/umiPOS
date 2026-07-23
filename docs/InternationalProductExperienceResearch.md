# International Product Experience Research

Date: 2026-07-15. Human baseline: **FAIL — PRODUCT EXPERIENCE, CONSISTENCY AND USABILITY**.

## Principles adopted

- Put the current state and next useful action before configuration. Dense operational views use one dominant summary, contextual actions and progressive disclosure instead of equal cards.
- Every mutation has a visible lifecycle: dirty, saving, success, validation failure, conflict and retry. Feedback remains near the action and is also announced through a live region.
- Selection is proportional to the decision. Native controls remain for simple choices; business type, roles and starter products use visual, keyboard-operable choices.
- Motion explains causality and hierarchy. It is brief, interruptible and removed under `prefers-reduced-motion`.
- Menus and dialogs follow one predictable contract: Escape and outside click close, modal focus is contained by the platform dialog, and focus returns to the invoking control.
- Responsive design is content-driven. Tables become readable collections, galleries reduce columns, and schedules stack without horizontal overflow.

The research used current primary guidance from [Apple HIG](https://developer.apple.com/design/human-interface-guidelines/), [Material Design 3](https://m3.material.io/), [Microsoft Fluent 2](https://fluent2.microsoft.design/) and [Shopify Polaris](https://polaris.shopify.com/). Product references such as Stripe, Linear, Square and Toast were used only for comparative product critique; no layout, brand asset or component was copied.

## NEXO direction

NEXO keeps a warm hospitality foundation but adds restrained technological precision: dark-first canvas, warm mineral surfaces, lavender/amber focus lighting, compact tabular numerics and editorial spacing. The brand is differentiated by proportion, language and interaction—not by excessive gradients or decoration.

System UI fonts are used; no font files are redistributed. Product imagery uses project-controlled abstract/product placeholders and deterministic fallbacks. No third-party screenshots or Behance assets enter the repository.

## Rejected patterns

- Generic equal-weight card grids, unexplained dashes, raw enums and technical codes as primary copy.
- White generic modals embedded in dark surfaces.
- Custom roles represented as arbitrary permission strings.
- Animation that delays input or continues indefinitely.
- Hidden writes, optimistic success without server confirmation, and controls that only look functional.

## Flutter continuity

Tokens, hierarchy, localized state vocabulary and mutation states are platform-neutral. Flutter can reproduce them without copying web layout or turning this dashboard into a POS terminal.
