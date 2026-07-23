# Systemic Sweep Final

| Patrón               | Superficies                                                       | Resolución                                                         |
| -------------------- | ----------------------------------------------------------------- | ------------------------------------------------------------------ |
| Upload/remount       | Onboarding, creación/edición de producto, avatar                  | `FileUpload` conserva preview y estado; onboarding sin key/remount |
| Feedback persistente | Onboarding, Productos, Perfil, Equipo, Configuración, Ubicaciones | `SaveStatus` → `PremiumToastPortal`                                |
| Feedback especial    | Caja y Ventas                                                     | Portal global; acción de recibo dentro del toast                   |
| Flutter POS          | Cobro, impresión, cierre de caja                                  | `NexoToast` flotante                                               |
| Select sin aire      | Todos los `select` Web                                            | padding inline autoritativo y chevron único                        |
| Saldo fuera de vista | Inventario                                                        | scroll/focus/highlight tras respuesta real                         |

Login, Dashboard, Inventario y Reportes no exponen mutaciones persistentes equivalentes en sus
pantallas principales. Los errores de validación permanecen locales deliberadamente.
