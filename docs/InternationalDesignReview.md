# International Design Review

Date: 2026-07-15. Human baseline: **FAIL — VISUAL EXPERIENCE**. Automated conformance is evidence, never owner approval.

## Research method

The review compared official product guidance, public product surfaces and a broad Behance POS search. References were evaluated for hierarchy, density, task clarity, feedback, responsive behavior and brand character. No layout, palette, asset, illustration or component was copied.

| Product             | Navigation                     | Dashboard                                | Forms                      | Cards                          | Motion                      | Typography                   | Command palette                | Catalog                     | POS                          | Observations                                                                                                 |
| ------------------- | ------------------------------ | ---------------------------------------- | -------------------------- | ------------------------------ | --------------------------- | ---------------------------- | ------------------------------ | --------------------------- | ---------------------------- | ------------------------------------------------------------------------------------------------------------ |
| Shopify Admin / POS | Persistent merchant IA         | Operational summary before configuration | Progressive, contextual    | Task-grouped                   | Quiet state feedback        | Practical hierarchy          | Search within merchant context | Visual product recognition  | Fast category/product access | Adapt: merchant vocabulary and stable context. Do not copy Polaris styling.                                  |
| Square              | Stable business sections       | Daily snapshot and next action           | Guided setup               | Mixed summary/action hierarchy | Immediate confirmation      | Neutral, high-legibility     | Search is secondary            | Product-first recognition   | Large, direct actions        | Adapt: one glance business health. Do not reproduce its grid or hardware UI.                                 |
| Toast               | Hospitality workflows          | Shift and exception emphasis             | Operational steps          | Contextual alerts              | Status-driven               | Dense but readable           | Not a defining pattern         | Menu imagery and grouping   | Role/task optimized          | Adapt: hospitality language. Do not turn the web dashboard into a terminal.                                  |
| Lightspeed          | Retail/hospitality modules     | Inventory and operation balance          | Structured detail          | Information-rich               | Restrained                  | Compact                      | Global discovery               | Strong catalog organization | Specialized by vertical      | Adapt: depth without exposing technical architecture.                                                        |
| Stripe Dashboard    | Object and workflow navigation | Money/state first                        | Precise validation         | Few, purposeful surfaces       | Subtle causality            | Compact, numeric             | Fast type-ahead                | Not primary                 | Not a POS reference          | Adapt: precision, progressive diagnostics and aligned numerics.                                              |
| Linear              | Extremely stable IA            | Issue/state hierarchy                    | Minimal interruption       | Sparse                         | Fast and spatially coherent | Compact, confident           | Defining interaction           | Not primary                 | Not POS                      | Adapt: keyboard speed and focus. Avoid excessive density for new owners.                                     |
| Vercel              | Clear project context          | Status and activity                      | Minimal                    | Strong contrast                | Lightweight                 | Editorial headings           | Search/actions                 | Not primary                 | Not POS                      | Adapt: calm hierarchy. Avoid developer language.                                                             |
| Framer              | Visual creation emphasis       | Preview-led                              | Direct manipulation        | Expressive                     | Rich but controlled         | Editorial                    | Action discovery               | Asset-centric               | Not POS                      | Adapt: live preview in onboarding. Avoid tool-canvas complexity.                                             |
| Raycast             | Command-first                  | Compact modules                          | Keyboard optimized         | Dense rows                     | Immediate                   | High contrast                | Defining interaction           | Not primary                 | Not POS                      | Adapt: grouped commands, recent actions and preview. Do not copy its window.                                 |
| Arc                 | Contextual spaces              | Calm, reduced chrome                     | Progressive                | Layered surfaces               | Spatial continuity          | Friendly/compact             | Search/navigation blend        | Not primary                 | Not POS                      | Adapt: context continuity. Avoid unfamiliar browser metaphors.                                               |
| Apple HIG           | Stable/adaptive navigation     | Content priority                         | Familiar controls          | Depth follows importance       | Purposeful, brief, optional | Few styles, strong hierarchy | Platform-consistent            | Visual selection clarity    | Platform-specific            | Adapt: brevity, focus and reduced motion. Do not use Apple assets or SF fonts on web.                        |
| Material Design 3   | Adaptive destinations          | Clear containers                         | Explicit states            | Tonal hierarchy                | State/relationship motion   | Scalable roles               | Search patterns                | Responsive grids            | General-purpose              | Adapt: semantic tokens and state layers. Do not adopt Material visual identity.                              |
| Fluent 2            | Persistent work context        | Layered enterprise information           | Predictable                | Elevation by purpose           | Natural and accessible      | Legible enterprise scale     | Search/action support          | Flexible                    | Not POS                      | Adapt: depth and accessibility. Do not copy Fluent components.                                               |
| Behance POS corpus  | Often category-led             | Strong visual hero                       | Frequently under-specified | Image-heavy                    | Presentation-forward        | Highly branded               | Rarely complete                | Excellent visual selection  | Highly visual                | Adapt composition, rhythm and product imagery only; reject untested novelty and portfolio-only interactions. |

Primary references: [Apple HIG](https://developer.apple.com/design/human-interface-guidelines/), [Apple motion](https://developer.apple.com/design/human-interface-guidelines/motion), [Shopify Polaris foundations](https://polaris-react.shopify.com/foundations), [Shopify visual design](https://shopify.dev/docs/apps/design/visual-design), [Square Dashboard](https://developer.squareup.com/docs/devtools/seller-dashboard), [Material Design 3](https://m3.material.io/), [Fluent 2](https://fluent2.microsoft.design/) and the [Behance POS search](https://www.behance.net/search/projects/pos%20ui%20user%20interface?locale=en_US).

## Direction A — Hospitality Premium

- **Palette:** roasted espresso, warm paper, clay, sage and champagne highlights.
- **Typography:** editorial display paired with a calm grotesk body.
- **Composition:** generous narrative opening, tactile product imagery, asymmetric operational clusters.
- **Iconography:** softly rounded, recognizable business objects.
- **Spacing:** breathable 8-point rhythm with 24–32 px section cadence.
- **Personality:** welcoming, crafted and merchant-centered.
- **Example screens:** cinematic onboarding, visual catalog, warm daily overview.
- **Risk:** can look café-specific and reduce perceived technical scale.

## Direction B — Enterprise Modern

- **Palette:** graphite, mineral blue, cool neutral surfaces and restrained emerald status.
- **Typography:** Manrope as the preferred interface family; medium/semibold hierarchy and tabular numerics. It is OFL-licensed; NEXO references the family through the deployment font policy and does not commit font binaries.
- **Composition:** stable global shell, strong page header, one primary operational plane, compact secondary panels.
- **Iconography:** geometric 1.75 px line icons with filled state accents.
- **Spacing:** strict 4/8 token system; 12 px compact controls, 20 px cards, 32 px section cadence.
- **Personality:** assured, scalable, precise and internationally neutral.
- **Example screens:** operational Home, Sales history, Cash session and settings.
- **Risk:** requires deliberate brand moments to avoid generic enterprise software.

## Direction C — Tech Luxury

- **Palette:** midnight black, ink violet, electric iris, soft copper and luminous data states.
- **Typography:** narrow display contrast with compact neutral body.
- **Composition:** deep layered surfaces, spotlight summaries, cinematic command palette.
- **Iconography:** sharp geometric symbols and high-contrast active states.
- **Spacing:** dense central work area with generous perimeter framing.
- **Personality:** memorable, ambitious and technology-forward.
- **Example screens:** command center Home, rich command palette, illuminated Sales/Cash dashboards.
- **Risk:** visual effects can compete with business information and age quickly.

## Decision matrix

Scores are 1–5; accessibility and task clarity have double weight.

| Criterion                 | Weight | A Hospitality | B Enterprise | C Tech Luxury |
| ------------------------- | -----: | ------------: | -----------: | ------------: |
| Owner task clarity        |      2 |             4 |            5 |             3 |
| Accessibility             |      2 |             4 |            5 |             3 |
| Cross-industry fit        |      1 |             3 |            5 |             4 |
| Brand differentiation     |      1 |             5 |            4 |             5 |
| Information density       |      1 |             3 |            5 |             4 |
| Responsive resilience     |      1 |             4 |            5 |             3 |
| Flutter continuity        |      1 |             4 |            5 |             4 |
| Long-term maintainability |      1 |             4 |            5 |             3 |
| **Weighted total / 50**   |        |        **39** |       **50** |        **35** |

**Selected for implementation V1: B — Enterprise Luxury**, enriched with restrained Hospitality Premium warmth in illustration and writing, according to the later Design Bible decision matrix (44/45). It provides the clearest hierarchy and responsive behavior without making NEXO café-specific or visually theatrical. Future Retail is used only for visual selection in catalog/onboarding. Storybook must retain all three comparable directions as decision evidence.

## Non-negotiable adaptation rules

1. Every surface states current context, primary information and next action above the fold.
2. Primary navigation never disappears; technical diagnostics never dominate.
3. One primary action per decision region; secondary actions remain visually quieter.
4. Motion lasts only long enough to explain relationship or state and disappears under reduced motion.
5. Spacing, radii, control heights and elevation come only from semantic tokens.
6. Empty states explain meaning and next action; no isolated dashes, raw enums or internal identifiers.
7. Dark is the reference theme. Light remains available only while its visual and accessibility gates pass.
