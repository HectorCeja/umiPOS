# Global States

Cada estado responde: qué ocurrió, impacto, siguiente acción y seguridad de datos.

| Estado                             | Mensaje/acción                                    |
| ---------------------------------- | ------------------------------------------------- |
| loading                            | acción específica, skeleton sin información falsa |
| empty                              | qué falta + acción inicial                        |
| partial/stale                      | qué puede estar desactualizado + actualizar       |
| offline/sync/retry                 | límites, cola y seguridad de datos                |
| conflict/version                   | otro cambio ocurrió + actualizar/comparar         |
| unauthorized/session expired       | iniciar sesión sin perder intención segura        |
| forbidden                          | acceso denegado sin revelar recurso/tenant        |
| not found                          | volver a una colección autorizada                 |
| unavailable/maintenance            | alcance y retry/soporte                           |
| tenant unavailable/branch archived | cambiar contexto autorizado                       |
| feature disabled                   | capacidad no disponible; sin upsell engañoso      |
| idempotent replay                  | operación previa encontrada y resultado original  |
