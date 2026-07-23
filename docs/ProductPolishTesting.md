# Product Polish Testing

The product suite validates root routing, real login, authoritative onboarding routing, visible identity/context/logout, branch selection, Spanish command palette, absence of UUIDs/Mailpit and hidden Cash diagnostics. It also covers axe, keyboard, tablet/mobile, reduced motion, Storybook directions and deterministic screenshots under `artifacts/product-polish/`.

Automated evidence does not replace the next owner perception review.

`pnpm manual-acceptance:prepare` autentica temporalmente a la persona demo y reinicia su onboarding mediante las APIs públicas de Authentication y Control Plane. La ejecución del 2026-07-15 confirmó `status=DRAFT`, `currentStep=1`; no se simula la finalización en el frontend.
