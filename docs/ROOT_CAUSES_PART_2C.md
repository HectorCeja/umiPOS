# Root causes — Part 2C

| Regresión                    | Causa raíz real                                                                                                         |
| ---------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| Catálogo aparentemente vacío | El contenedor flex desplazable podía colapsar a altura cero al recalcular el preview; el footer sobrevivía fuera de él. |
| Toast fuera de vista         | `position: fixed` vivía bajo un ancestro del shell que establece un containing block; no existía portal al body.        |
| FK durante seed              | El seed borraba datos en tenants establecidos y Alpha2 borraba `products` sin borrar antes `product_variants`.          |
| Obligatorios omitibles       | `next()` persistía sin validación por paso; servidor solo comprobaba versión/estado al completar.                       |
| Chevron en mosaico           | Un shorthand más específico restablecía `background-repeat` después del indicador base.                                 |
| Iconos descentrados          | El botón conservaba layout inline y baseline de texto, sin geometría oficial para el SVG.                               |
