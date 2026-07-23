# Barrido sistémico — últimos bloqueadores

| Patrón                                      | Superficies                                                                    | Resultado                                        |
| ------------------------------------------- | ------------------------------------------------------------------------------ | ------------------------------------------------ |
| Upload altera scroll/posición               | Onboarding, Productos, editor, Perfil, branding                                | FileUpload compartido corregido; PASS            |
| Toast colisiona o está dentro del documento | Onboarding, Caja, Ventas, Productos, Inventario, Equipo, Configuración, Perfil | Portal global y zonas coordinadas; PASS          |
| Cierres visualmente distintos               | Ayuda, toast, dialogs/drawers                                                  | `NexoIconButton` compartido; PASS                |
| Éxito duplicado                             | Productos, mutaciones con SaveStatus, formularios                              | Toast único; inline reservado a errores; PASS    |
| Reset conserva validación                   | Productos y formularios auditados                                              | Instancia neutral y errors/touched limpios; PASS |
| `scrollIntoView` por mutación no relevante  | Superficies anteriores                                                         | Solo reveal/validación intencionales; PASS       |

Flutter POS no expone el diálogo de catálogo web ni la ayuda contextual flotante equivalente; conserva
su implementación certificada de `NexoToast` sin cambio contractual.
