# Duración oficial de Premium Toast

- Éxito e información simples dentro de onboarding: máximo 2000 ms.
- Loading: permanece mientras la operación continúa.
- Error, advertencia crítica o toast con acción: puede permanecer para permitir lectura/recuperación.
- Todos conservan cierre manual, pausa en hover, `aria-live` y reduced motion.

La decisión se aplica en `PremiumToastPortal`; no hay valores dispersos por pantalla.
