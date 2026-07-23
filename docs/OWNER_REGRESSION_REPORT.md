# Owner Regression Report

Las incidencias repetidas se rigen por [OWNER_REGRESSION_POLICY.md](./OWNER_REGRESSION_POLICY.md): una reaparición invalida la corrección localizada y exige auditoría sistémica.

| Observación repetida  | Alcance sistémico auditado                                                | Guard permanente                                  |
| --------------------- | ------------------------------------------------------------------------- | ------------------------------------------------- |
| Avatar                | provider, shell, navegación, caché, decodificación, evento, menú y perfil | fuente canónica + recorrido de ocho rutas         |
| Consultar existencias | cascada CSS completa, estructura label/control/helper y responsive        | tolerancia geométrica de 3 px                     |
| Iconografía           | selector de tipo, picker y cards                                          | solo `NexoIcon` semántico en el selector superior |
| Botones verdes        | variantes compartidas y cascada global                                    | inspección de la variante y walkthrough visual    |
| Scroll de feedback    | primitive compartido y excepción de Caja                                  | destino enfocable, scroll y highlight             |

Una prueba verde no cierra la observación: falta siempre la confirmación visual del owner.
