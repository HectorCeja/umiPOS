# Known visual limitations after UI stabilization

Prompt 12.8 deliberately stabilizes behavior and layout without redesigning NEXO. The
current human result remains **FAIL — VISUAL EXPERIENCE**. Automated checks do not
replace the next mockup-led owner review.

## Deliberately unchanged

- The current palette, visual identity, typography, ambient backgrounds and motion.
- The global shell composition and principal page layouts.
- The art direction of Login, onboarding, Home, Sales, Cash, Products, Inventory, Team,
  Settings and Profile.
- Card language, illustration strategy, density choices and information composition.
- Existing approved dark-first theme policy.

These areas belong to the forthcoming final, pixel-perfect implementation based on
owner-approved mockups. Changing them in this sprint would create throwaway visual work
and undermine comparison with those mockups.

## Stabilized foundation

- Avatar media now persists through the authoritative profile command, is returned by
  session identity and is rendered consistently after refresh, navigation and login.
- Product administration accepts real media plus icon, commercial name, description,
  category, price, SKU and barcode through public services.
- Onboarding inventory copy has stable label/help separation; schedule labels meet the
  current contrast baseline.
- Team cards wrap instead of overlapping; Inventory and Settings forms use bounded,
  responsive grids; long email values cannot expand their containers.
- Logout alignment and hover foreground preservation are component-level rules.
- Structure, state, data access and presentation hooks remain separable so the next
  sprint can replace appearance without reworking persistence.

The Team visual baseline changed intentionally because the previous capture encoded the
reported overlap, clipped words and stretched email input. The corrected baseline was
inspected at full-page size and then passed a non-updating comparison.

## Acceptance boundary

No claim is made that the current UI is finished, visually approved or produces a
particular perception. No POS web, checkout web or UMI-derived architecture work was
introduced.
