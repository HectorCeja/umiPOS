# Onboarding validation matrix

| Paso                           | Obligatorio                              | Mensaje y recuperación                                                     |
| ------------------------------ | ---------------------------------------- | -------------------------------------------------------------------------- |
| Negocio                        | Nombre comercial                         | “Escribe el nombre de tu negocio para continuar.” Focus y scroll al campo. |
| Región                         | País, moneda, idioma, zona horaria       | Mensaje específico por selector.                                           |
| Sucursal                       | Nombre principal                         | Mensaje específico y focus.                                                |
| Catálogo vacío/producto propio | Nombre, categoría, precio > 0            | Mensaje por campo, valores restantes preservados.                          |
| Sugerencias                    | Al menos una selección o producto propio | Lleva al builder.                                                          |

La UI valida antes de persistir y el repositorio vuelve a validar por `journeyStep` y al completar.
