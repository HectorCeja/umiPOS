# 17 — Do and Don’t

| Área          | Do                                               | Don’t                                                 |
| ------------- | ------------------------------------------------ | ----------------------------------------------------- |
| Canvas        | use canvas/surfaces/auroras para profundidad     | negro plano como experiencia normal                   |
| Color         | use violeta/azul/cian de forma localizada        | convertir toda la UI en morado o neón                 |
| Surface       | jerarquice blur, border, shadow y glow           | aplicar todos los efectos a toda card                 |
| Spacing       | preserve respiración y alineación óptica         | pegar texto/iconos al borde o usar offsets mágicos    |
| Typography    | Instrument para editorial, Manrope para UI       | inventar otra familia/escala o uppercase decorativo   |
| Buttons       | icon-label-gap y padding premium                 | centrar texto sin aire lateral                        |
| Forms         | labels persistentes y errores asociados          | usar placeholder como label                           |
| Tables        | separación tonal, headers y densidad             | bordear cada celda o comprimir 20 columnas en móvil   |
| Navigation    | una fuente tipada y drawer completo              | ocultar items por `nth-child` o duplicar Sidebar      |
| Motion        | use feedback rápido y ambiente lento             | rebotes, delays que bloquean o state React por frame  |
| Artwork       | registry, masks y crops por módulo               | wallpaper, foto detrás de formularios o asset externo |
| Responsive    | adapte composición preservando capacidades       | esconder información crítica para que quepa           |
| Status        | texto/forma/color con semántica de dominio       | inferir significado solo por signo o color            |
| Empty         | explique estado y próxima acción real            | inventar datos o CTA sin destino                      |
| Accessibility | focus, teclado, reduced motion desde el inicio   | retirar outlines o depender de hover                  |
| QA            | compare determinísticamente y conserve evidencia | actualizar snapshots globalmente                      |

## Errores específicos prohibidos

- Crear otro App Shell o LivingScene.
- Usar el `AppShell` genérico de Storybook como chrome de producción.
- Reintroducir MobileNavigation de cinco items.
- Usar la paleta histórica verde `freeze` previa al alias V1.
- Tratar Profile/Settings/Help abstractos como artwork faltante.
- Llamar “IA” a una heurística o estado sin capacidad real.
- Simular contratos backend ausentes para completar una pantalla.
