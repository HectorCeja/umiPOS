# Security Events

## Registro

`security_events` es el registro estructurado de autenticación. El rol runtime puede `INSERT` y `SELECT`, pero no `UPDATE` ni `DELETE`; la migración/retención administrativa pertenece al rol de mantenimiento/migración. Los eventos no sustituyen un backend SIEM ni el audit log inmutable externo futuro.

Eventos vigentes:

| Evento                         | Momento                                                  |
| ------------------------------ | -------------------------------------------------------- |
| `LOGIN_SUCCEEDED`              | sesión creada                                            |
| `LOGIN_FAILED`                 | credencial/lifecycle/verificación inválidos              |
| `ACCOUNT_LOCKED`               | umbral durable alcanzado                                 |
| `LOGOUT`                       | cierre de sesión por usuario                             |
| `SESSION_REFRESHED`            | generación rotada                                        |
| `SESSION_REVOKED`              | cierre remoto/global/administrativo                      |
| `REFRESH_REUSE_DETECTED`       | replay o carrera de generación consumida                 |
| `PASSWORD_RESET_REQUESTED`     | token emitido para cuenta elegible                       |
| `PASSWORD_RESET_COMPLETED`     | token consumido y sesiones revocadas                     |
| `PASSWORD_CHANGED`             | verificador sustituido                                   |
| `EMAIL_VERIFICATION_REQUESTED` | token emitido                                            |
| `EMAIL_VERIFIED`               | mailbox confirmada                                       |
| `SECURITY_WARNING`             | entrega fallida o acción administrativa con actor/motivo |

Cada evento incluye resultado, instante, User cuando se conoce, IP, User-Agent y metadata acotada. Nunca contiene contraseña, cookie, token crudo, hash de credencial, cuerpo de solicitud ni email arbitrario de una cuenta inexistente.

## Observación y alertas futuras

Se deben alertar picos de `LOGIN_FAILED`, `ACCOUNT_LOCKED`, `REFRESH_REUSE_DETECTED`, fallos de correo y revocaciones administrativas. User/tenant no se usan como labels métricos de alta cardinalidad. La retención, exportación a SIEM, firma/WORM y acceso de soporte se resuelven con la plataforma de producción; no se simulan en local.
