# Overlay system

`showNexoDialog` monta `NexoDialog` con barrier etiquetado, contenido scrolleable, Escape/back y restauración de foco del Navigator. `showNexoSheet` elige bottom sheet bajo 768 y side sheet desde 768, respeta safe areas y reduce motion. `NexoPopoverMenu` usa `MenuAnchor`: anclaje, collision handling, arrows, Enter, Escape y primer item autofocus provienen del sistema Flutter, sin coordenadas mágicas.

El widget `NexoToast` define apariencia/semantics; una cola productiva se difiere a la arquitectura de app. Ningún overlay contiene llamadas de dominio.
