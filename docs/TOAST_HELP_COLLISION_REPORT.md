# Certificación toast + ayuda

Con ambos overlays abiertos en 1280×720, sus bounding boxes no intersectan y permanecen dentro del
viewport. La misma política responde en 390 px. El toast no modifica `scrollY` ni el scroll interno.

Pruebas: `onboarding-toast-help-collision.spec.ts`, `overlay-placement-policy.spec.ts` y
`last-two-blockers-evidence.spec.ts`.
