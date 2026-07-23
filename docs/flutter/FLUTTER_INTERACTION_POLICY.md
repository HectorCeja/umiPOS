# Interaction policy

- Pointer: hover, cursor click y superficie interactiva sólo cuando existe callback.
- Keyboard: Tab/Shift+Tab global; Enter/Space en buttons; arrows en Material menu, tabs, selection y radio group; Escape/back en overlays.
- Touch: mínimo 44×44 lógico aun con tamaño visual compacto.
- Focus: ring azul tokenizado; traps sólo dentro de overlays modales; el route restaura foco al cerrar.
- Motion: usa `NexoMotion`; reduced motion vuelve inmediatas las transiciones no esenciales.

Las pruebas observables están en `component_interaction_test.dart` y `overlay_interaction_test.dart`; no se limitan a `pump`.
