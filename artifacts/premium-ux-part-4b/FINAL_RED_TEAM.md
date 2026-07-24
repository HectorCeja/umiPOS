# Final Red Team

Tercera crítica: 75 oportunidades nuevas, distintas a Parts 3A, 3B y 4A. Todas fueron corregidas sin modificar funcionalidad, contratos, reglas o arquitectura.

| # | Superficie | Hallazgo nuevo | Corrección aplicada |
|---:|---|---|---|
| 1 | Tipografía | El navegador podía sintetizar pesos inexistentes | `font-synthesis: none` |
| 2 | Tipografía | Ligaduras y kerning dependían del motor | `text-rendering: optimizeLegibility` |
| 3 | Tipografía | Antialiasing variaba en Chromium/Linux | Font smoothing explícito |
| 4 | Viewport | No existía límite inferior operativo | `min-width: 20rem` |
| 5 | Touch | El flash de tap era ajeno a la marca | Tap highlight neutralizado |
| 6 | Controles | Texto de botones podía seleccionarse accidentalmente | `user-select: none` en acciones |
| 7 | Inputs | El caret heredaba un color accidental | Caret con acento oficial |
| 8 | Autofill | Chromium imponía texto de otro tono | Text fill semántico |
| 9 | Autofill | Fondo amarillo rompía dark theme | Surface interna controlada |
| 10 | Validación | Invalid state solo aparecía tras submit custom | `:user-invalid` visual |
| 11 | Check/radio | Acento dependía del sistema | `accent-color` oficial |
| 12 | Progress | Barra nativa divergía del sistema | Acento oficial |
| 13 | H1 | Tracking genérico reducía carácter editorial | Tracking -0.035em |
| 14 | H1 | Line-height dejaba aire excesivo | Line-height 1.02 |
| 15 | H2 | Tracking no escalaba con jerarquía | Tracking -0.022em |
| 16 | H2 | Ritmo vertical inconsistente | Line-height 1.12 |
| 17 | H3 | Subtítulos se sentían genéricos | Tracking -0.012em |
| 18 | H3 | Bloques densos perdían lectura | Line-height 1.22 |
| 19 | Strong | Peso variaba entre fuentes | Peso 720 explícito |
| 20 | Small | Texto auxiliar demasiado compacto | Line-height 1.45 |
| 21 | Listas | Markers parecían del navegador | Color semántico |
| 22 | Divisores | `hr` conservaba relieve nativo | Divisor de un píxel tokenizado |
| 23 | Scroll | Anclas podían quedar bajo el header | `scroll-padding-top` |
| 24 | Links | URLs largas podían romper layouts | `overflow-wrap:anywhere` |
| 25 | Botones | Icono y label no tenían gap canónico | Gap de 0.5rem |
| 26 | Iconos | Tamaño dependía del SVG | Caja de 1em |
| 27 | Iconos | Hover no respondía con el control | Microdesplazamiento tokenizado |
| 28 | Search | Apariencia nativa añadía decoración | Appearance neutralizada |
| 29 | Search | Query larga invadía shortcut | Ellipsis seguro |
| 30 | Fields | Contenedores podían impedir shrink | `min-width:0` |
| 31 | Textarea | Resize horizontal rompía grids | Solo resize vertical |
| 32 | Select | Cursor no comunicaba selección | Pointer solo si está habilitado |
| 33 | Upload | Dropzone no respondía al hover | Borde con acento contenido |
| 34 | Upload | Preview cambiaba proporción por archivo | Aspect ratio 16:9 |
| 35 | Upload | Imagen podía deformarse | `object-fit:cover` |
| 36 | Tabs | Espacio dependía de cada módulo | Gap canónico |
| 37 | Tabs | Activo dependía del fondo | Indicador inferior adicional |
| 38 | Breadcrumb | Separación irregular | Gap 0.4rem |
| 39 | Breadcrumb | Contexto largo desbordaba | Truncamiento seguro |
| 40 | Sidebar | Estado de servicios flotaba sin cierre | Divisor superior sutil |
| 41 | Status | Punto online parecía decorativo plano | Halo semántico |
| 42 | Avatar | Contorno dependía del fondo | Ring de un píxel |
| 43 | Avatar | Fotografía podía deformarse | Object-fit cover |
| 44 | Topbar | No separaba contenido durante scroll | Borde inferior sutil |
| 45 | Topbar | Fondo perdía profundidad | Blur y saturación contenidos |
| 46 | Métricas | Caption competía con valor | Tono y line-height controlados |
| 47 | Métricas | Valores no tenían precisión editorial | Tracking negativo leve |
| 48 | Quick actions | Icono/texto no centraban igual | Alineación central |
| 49 | Quick actions | Altura cambiaba por copy | Min-height 3.25rem |
| 50 | Chips | Selected dependía demasiado del fill | Ring semántico |
| 51 | Chips | Hover no mejoraba affordance | Borde con acento |
| 52 | Alerts | Icono y copy estaban demasiado próximos | Gap 0.75rem |
| 53 | Alerts | SVG podía comprimirse | Flex fijo |
| 54 | Toast | Ancho podía exceder móvil | Clamp a viewport |
| 55 | Toast | Overlay podía perder interacción | Pointer events explícitos |
| 56 | Tooltip | Copy larga carecía de límite | Máximo 18rem |
| 57 | Tooltip | Lectura demasiado compacta | Line-height 1.4 |
| 58 | Dialog | Contenido largo excedía viewport | Max-height con `dvh` |
| 59 | Dialog actions | Footer se confundía con contenido | Divisor superior |
| 60 | Dialog close | X tenía target variable | Touch target canónico |
| 61 | Popover | Podía salir de viewport | Max-width fluido |
| 62 | Dropdown | Elevación no distinguía capa | Sombra profunda controlada |
| 63 | Skeleton | Preset podía perder clipping | Overflow hidden |
| 64 | Skeleton | Radio dependía del consumidor | Radius canónico |
| 65 | Tables | Scroll horizontal escapaba al body | Overscroll inline contenido |
| 66 | Tables | Caption carecía de estilo | Padding, tono y alineación |
| 67 | Tables | Última fila cerraba con doble línea | Borde final transparente |
| 68 | Timeline | Marker no seguía la marca | Primary semántico |
| 69 | Timeline | Conector tenía contraste excesivo | Border mezclado |
| 70 | Empty state | Icono se sentía plano | Acento y sombra suave |
| 71 | Help | Trigger podía ser menor que touch target | Altura mínima oficial |
| 72 | Help | Footer se mezclaba con guía | Divisor superior |
| 73 | Mobile | Contenido ignoraba safe area inferior | Padding con `env()` |
| 74 | High contrast | Surfaces podían perder límites | Bordes `forced-colors` |
| 75 | Print | Shell contaminaba recibos/documentos | Ocultamiento de navegación y fondo blanco |

