# Accesibilidad de NexoSelect

La implementación sigue el patrón ARIA combobox/listbox:

- trigger con `role="combobox"`, `aria-expanded`, `aria-controls`, `aria-activedescendant`, `aria-invalid`, `aria-describedby` y label asociado;
- contenido con región nombrada, listbox y opciones con `aria-selected`, `aria-disabled`, posición y tamaño del conjunto;
- buscador con `role="searchbox"` y anuncio `aria-live` de resultados;
- Arrow Up/Down, Home, End, Enter y Escape; el foco vuelve al trigger sin provocar scroll;
- foco visible, contraste semántico, targets táctiles y animación anulable con reduced motion.

Las opciones deshabilitadas se omiten durante la navegación. La prueba Axe se ejecuta sobre el componente abierto y la suite E2E certifica teclado y restauración de foco.
