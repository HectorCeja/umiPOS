# Flutter accessibility foundation

- `NexoVisualPreferences.of(context)` es la API única para reduced motion, reduced transparency y high contrast.
- `NexoAccessibleTarget` garantiza 44×44 logical px sin bloquear text scaling.
- `NexoVisualLifecycleObserver` permite pausar renderers en inactive/background.
- Widgets futuros deben proporcionar Semantics, traversal explícito, shortcuts, error/loading announcements y estado textual.
- Nunca se fija `textScaler`; tests cubren 200%.
- Focus permanece visible y keyboard/touch tienen el mismo conjunto autorizado.
- Reduced motion usa `NexoMotion.reduced`: cero delays/ambient; feedback de estado permanece inmediato.

High contrast y reduce transparency se exponen como preferencias, pero no se fabrica una paleta no certificada en Parte 1.
