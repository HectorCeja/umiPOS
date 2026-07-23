# Component API

## Catálogo público

| Familia  | APIs                                                                                                                                                |
| -------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| Control  | `NexoButton`, `NexoIconButton`, `NexoTextField`, `NexoSearchField`, `NexoSelect`, `NexoCheckbox`, `NexoRadio`, `NexoSwitch`, `NexoSegmentedControl` |
| State    | `NexoChip`, `NexoBadge`, `NexoStatusIndicator`                                                                                                      |
| Surface  | `NexoSurface`, `NexoCard`, `NexoKpiCard`, `NexoProductTile`, `NexoListTile`                                                                         |
| Feedback | `NexoSpinner`, `NexoProgress`, `NexoSkeleton`, `NexoEmptyState`, `NexoInlineNotice`, `NexoToast`, `NexoBlockingLoading`                             |
| Overlay  | `NexoDialog`, `NexoSheet`, `NexoPopoverMenu`, `NexoTooltip`                                                                                         |
| Data     | `NexoNumericDisplay`, `NexoTable`, `NexoPagination`, `NexoAvatar`                                                                                   |
| Pattern  | `NexoTabs`, `NexoToolbar`, `NexoPageHeader`, `NexoFormSection`, `NexoFieldGroup`                                                                    |

Tamaños: `NexoControlSize.compact/small/medium/large`. Tonos: `NexoTone`. Las APIs no aceptan colores físicos; el consumidor elige intención semántica. Icon-only exige `label`. Currency/quantity reciben texto ya formateado y valor semántico: este package no usa `double` como dinero.
