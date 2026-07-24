# Red Team Product Review

Revisión deliberadamente hostil: 50 oportunidades nuevas, posteriores a Parts 3A/3B, todas corregidas mediante la capa benchmark Part 4A.

| # | Área | Hallazgo | Corrección | Justificación |
|---:|---|---|---|---|
| 1 | Títulos | Líneas podían quedar huérfanas | `text-wrap: balance` | Jerarquía editorial estable |
| 2 | Párrafos | Cortes poco naturales | `text-wrap: pretty` | Lectura más serena |
| 3 | Métricas | Dígitos saltaban por ancho | Números tabulares | Comparación financiera precisa |
| 4 | Tablas | Cifras no compartían ritmo | Tabular nums global | Escaneo vertical fiable |
| 5 | Placeholders | Contraste dependía del navegador | Color semántico explícito | Legibilidad consistente |
| 6 | Inputs disabled | No indicaban indisponibilidad física | Cursor y opacidad coherentes | Estado inequívoco |
| 7 | Botones disabled | Conservaban saturación excesiva | Saturación contenida | Reduce falsa llamada a acción |
| 8 | Links | Subrayado tocaba glifos | Offset explícito | Refinamiento tipográfico |
| 9 | Links | Grosor variaba por navegador | Thickness explícito | Consistencia |
| 10 | Cards | El foco interior no reforzaba contexto | Borde `focus-within` | Orientación de teclado |
| 11 | Cards | Primer hijo podía duplicar margen | Normalización superior | Ritmo estable |
| 12 | Cards | Último hijo podía dejar vacío residual | Normalización inferior | Cierre limpio |
| 13 | Headers | Controles podían centrarse con copy multilínea | Alineación superior | Jerarquía predecible |
| 14 | Descripciones | Líneas demasiado largas | Límite de 68ch | Comprensión rápida |
| 15 | Overlines | Tracking irregular | Escala oficial | Identidad editorial |
| 16 | Overlines | Altura apretada | Line-height explícito | Legibilidad |
| 17 | Contexto | Nombres largos empujaban controles | Ellipsis seguro | Shell estable |
| 18 | Atajo | `⌘ K` parecía texto | Keycap visual | Reconocimiento instantáneo |
| 19 | Atajo | El keycap no tenía profundidad | Borde inferior y sombra | Affordance táctil |
| 20 | Sidebar | Activo dependía principalmente del fondo | Indicador lateral | No depende solo del color |
| 21 | Iconos nav | Podían comprimirse | `flex: 0 0 auto` | Silueta estable |
| 22 | Quick actions | Texto podía forzar icono | Contenido `min-width:0` | Responsive fiable |
| 23 | Botones | Labels podían partirse | `white-space: nowrap` | Acción legible |
| 24 | Labels | Altura variaba | Line-height semántico | Formularios uniformes |
| 25 | Helper | Bloques se sentían apretados | 1.5 line-height | Copy educativo respirable |
| 26 | Errors | Mensajes densos | 1.45 line-height | Calma ante error |
| 27 | Badges | Conteos cambiaban ancho | Tabular nums | Estado estable |
| 28 | Badges | Estado podía partirse | No wrapping | Lectura inmediata |
| 29 | Table headers | Competían con contenido | Tamaño menor | Datos dominan |
| 30 | Table headers | Jerarquía ambigua | Uppercase y tracking | Columnas reconocibles |
| 31 | Tables | Alineación vertical irregular | Centrado semántico | Escaneo limpio |
| 32 | Rows | Hover brusco | Transición tokenizada | Feedback sereno |
| 33 | Rows | Hover demasiado fuerte | Tinte al 4% | Menos ruido |
| 34 | Empty states | Podían extenderse demasiado | Ancho máximo | Foco |
| 35 | Empty states | Copy demasiado ancho | 56ch | Acción comprensible |
| 36 | Help | Copy podía invadir la pantalla | 64ch | Ayuda editorial |
| 37 | Help lists | Pasos demasiado juntos | Gap vertical | Secuencia clara |
| 38 | Checklist | Fila no respondía al hover | Cambio semántico | Interactividad perceptible |
| 39 | Product names | Podían romperse agresivamente | `word-break: normal` | Producto legible |
| 40 | Product names | Guiones automáticos deformaban marca | `hyphens: none` | Integridad de nombres |
| 41 | Product media | Fondo de carga inconsistente | Surface tokenizada | Evita flash accidental |
| 42 | Timeline | Horas se partían | No wrapping | Historia estable |
| 43 | Timeline | Dígitos de horas saltaban | Tabular nums | Escaneo cronológico |
| 44 | Timeline | Scroll escondía el evento bajo header | `scroll-margin-top` | Destino visible |
| 45 | Dialog header | Perdía separación al hacer scroll | Blur persistente | Contexto preservado |
| 46 | Dialog body | Scroll escapaba al fondo | `overscroll-behavior` | Control modal |
| 47 | Alerts | Títulos podían quedar huérfanos | Balance | Mensaje coherente |
| 48 | Feedback | Copy podía ser demasiado ancho | 58ch | Lectura rápida |
| 49 | Mobile next step | CTA quedaba pequeño | Touch target y centrado | Uso con pulgar |
| 50 | Context mobile | Carrusel perdía orientación | Scroll snap | Cambio de contexto controlado |

