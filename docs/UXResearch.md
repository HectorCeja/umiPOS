# UX Research

## Alcance y método

Investigación secundaria realizada el 2026-07-14 sobre fuentes oficiales. NEXO adopta principios, no apariencias ni implementaciones. Las decisiones se validarán después con investigación primaria en comercios mexicanos; esa validación no se sustituye con este documento.

| Fuente oficial                                                                                                    | Principio extraído                                                                                     | Aplicación NEXO                                                           |
| ----------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------- |
| [WCAG 2.2](https://www.w3.org/TR/WCAG22/)                                                                         | Foco no oculto, autenticación accesible, alternativa al arrastre y targets AA de al menos 24×24 CSS px | Target NEXO de 44×44 px; focus visible; ninguna tarea depende de arrastre |
| [WAI-ARIA APG](https://www.w3.org/WAI/ARIA/apg/)                                                                  | Semántica nativa, patrones de teclado y restauración de foco                                           | HTML nativo primero; contratos explícitos para dialog, tabs y combobox    |
| [Apple HIG Accessibility](https://developer.apple.com/design/human-interface-guidelines/accessibility)            | Accesibilidad desde el diseño, múltiples entradas y reducción de carga cognitiva                       | Touch, teclado, lector y escáner son entradas de primera clase            |
| [Flutter adaptive design](https://docs.flutter.dev/ui/adaptive-responsive)                                        | Responsive hace caber; adaptive hace usable; decidir por espacio disponible                            | Breakpoints semánticos por contenido, no por modelo de dispositivo        |
| [Android adaptive layouts](https://developer.android.com/design/ui/mobile/guides/layout-and-content/adapt-layout) | Reflow, reveal y pane layouts; no bloquear orientación                                                 | El carrito cambia de panel a hoja; administración cambia tabla por lista  |
| [Fluent 2 tokens](https://fluent2.microsoft.design/design-tokens)                                                 | Tokens globales y alias semánticos permiten temas coherentes                                           | Componentes consumen aliases `--nexo-*`, no colores crudos                |
| [Shopify POS UI extensions](https://shopify.dev/docs/api/pos-ui-extensions/latest)                                | Puntos de extensión consistentes y componentes adaptativos                                             | Futuras extensiones se integran en zonas explícitas; no dominan el shell  |
| [Toast Orders](https://doc.toasttab.com/openapi/orders/overview/)                                                 | Estado comercial explícito y servidor como fuente confiable                                            | La UI representa estados; Sales calcula y confirma importes               |
| [Square POS API](https://developer.squareup.com/docs/pos-api/what-it-does)                                        | Separación entre aplicación, POS y procesamiento de pago                                               | NEXO UI emite intenciones; Sales y Payment Abstraction son autoridad      |

## Patrones adoptados

- Jerarquía estable, acciones frecuentes visibles y disclosure progresivo.
- Un layout operativo POS dedicado, separado del shell administrativo.
- Contexto Organización → Sucursal visible antes de una acción comercial.
- Feedback perceptible en menos de 100 ms y estados de red claros.
- Confirmación proporcional: inmediata para cambios reversibles; razón y confirmación para cancelación, refund o archivo.
- Diseño adaptable por ancho disponible, modalidad de entrada y tarea.
- Atajos descubribles; el escáner escribe en un campo enfocable, no en listeners globales opacos.

## Patrones descartados

| Patrón                                         | Razón                                                                                                    |
| ---------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| Copiar el grid o identidad de otro POS         | Riesgo legal, dependencia conceptual y falta de ajuste al mercado mexicano                               |
| Sidebar completa en POS                        | Distrae y aumenta errores durante una operación frecuente                                                |
| Iconos sin texto para acciones críticas        | Ambigüedad y menor accesibilidad/aprendizaje                                                             |
| Tablas comprimidas en móvil                    | Reflow pobre; se transforman en listas o tareas por pasos                                                |
| Optimistic UI para totales, pagos o inventario | Puede mostrar un estado comercial falso; se requiere confirmación del backend                            |
| Iframe UMI por defecto                         | Riesgos de sesiones, navegación, accesibilidad y políticas de origen; queda sujeto a evaluación conjunta |
| Offline invisible                              | Produce dobles acciones; conectividad, cola e incertidumbre siempre se muestran                          |

## Riesgos y evidencia pendiente

- Falta investigación primaria con cajeros, dueños y personas con discapacidad en México.
- Los presupuestos táctiles deben probarse en hardware de 10–15 pulgadas y Windows con escalado.
- UMI aún no aporta shell, tokens, SSO ni política de embedding definitivos.
- Flutter requiere prototipo nativo antes de congelar equivalencias.
