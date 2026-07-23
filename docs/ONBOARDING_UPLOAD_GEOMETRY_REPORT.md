# Geometría del upload

La regresión mide `scrollTop` de página/panel, alto visible, alto de contenido y cajas de formulario,
heading y uploader antes y después de un archivo real. Tolerancia de desplazamiento: 2 px.

| Viewport | Formulario efectivo | Preview | Delta scroll |
| -------- | ------------------- | ------- | ------------ |
| 1440×900 | PASS                | PASS    | ≤2 px        |
| 1280×720 | PASS                | PASS    | ≤2 px        |
| 1024×768 | PASS                | PASS    | ≤2 px        |
| 390×844  | PASS                | PASS    | ≤2 px        |
| 320×568  | PASS                | PASS    | ≤2 px        |

La suite también completa onboarding real sin volver atrás y permanece limpia de `console.error`,
`pageerror`, requests fallidos y HTTP 500 inesperados.
