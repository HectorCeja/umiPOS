# Component parity report

Part 3 preserves the 44-widget public API. Existing interaction motion continues through `NexoMotion`; LivingScene and editorial motion are additive foundations.

La clasificación parte de los 144 exports certificados Web: aliases, shell y componentes de dominio no se copian literalmente. Flutter implementa el núcleo independiente del dominio requerido para POS.

| Grupo                                      | Estado         | Nota                                          |
| ------------------------------------------ | -------------- | --------------------------------------------- |
| Controls/forms/surfaces/feedback           | PARITY         | apariencia semántica, estados, a11y y density |
| Dialog/sheet/menu/tabs                     | ADAPTED        | usa focus/overlay primitives nativos Flutter  |
| Product tile/table/toolbar                 | ADAPTED        | foundation sin datasource ni dominio          |
| Cash/Sales/receipt/cart/payment            | DEFERRED       | feature UI de partes posteriores              |
| Web shell/navigation/Command Palette       | NOT APPLICABLE | no forma parte de esta library                |
| LivingScene/artwork/editorial route motion | DEFERRED       | Parte 3                                       |

No queda componente crítico `GAP` para LivingScene/Motion Parity.
