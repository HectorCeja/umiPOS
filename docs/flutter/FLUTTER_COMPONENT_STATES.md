# Component states

Los estados universales disponibles son default, hover, focus, pressed, selected, disabled y loading. Success, warning, danger, restricted, offline, syncing y stale se expresan mediante `NexoTone`, `NexoStatus` o `NexoSemanticState` cuando el componente los admite.

| Componente          | Estados explícitos                                           |
| ------------------- | ------------------------------------------------------------ |
| Button              | hover, focus, pressed, loading, disabled, success            |
| Field               | hover, focus, filled, invalid, readonly, disabled, loading   |
| Selection           | selected/checked/indeterminate, disabled, error donde aplica |
| Surface/Card/Tile   | interactive, selected, disabled, loading                     |
| Notice/Badge/Status | semantic tones; icon/copy además de color                    |
| Table               | loading, empty, error, selected row, sort direction          |
| Overlay             | open, focus-contained, disabled items, destructive item      |

Reduced motion conserva feedback esencial y desactiva pulse/skeleton animado. Ningún estado operativo depende sólo del color.
