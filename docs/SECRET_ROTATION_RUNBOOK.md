# Runbook de rotación de secretos Identity/Security

Estado: procedimiento manual. Owner operativo: **OWNER REQUIRED**.

## Regla general

Rotar primero en un entorno controlado, conservar el valor anterior solo durante el rollback autorizado, desplegar por configuración segura y validar health, login, refresh, logout, action tokens y Device Enrollment. Nunca registrar valores.

| Secreto                       | Efecto esperado                          | Procedimiento y validación                                                                    | Rollback                                             |
| ----------------------------- | ---------------------------------------- | --------------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| Token HMAC                    | Invalida sesiones/action tokens vigentes | Ventana de mantenimiento, logout global, reemplazar, desplegar, probar login/reset/invitación | Restaurar valor previo únicamente durante la ventana |
| Rate-limit HMAC               | Reinicia identidad de buckets            | Reemplazar por valor distinto al token HMAC; probar 429 y `Retry-After`                       | Restaurar valor previo                               |
| Invitation/reset/verification | Comparten autoridad HMAC actual          | Revocar tokens pendientes antes de rotar; reenviar después                                    | Restaurar HMAC o regenerar tokens                    |
| Device credentials            | Revocación/re-enrollment por dispositivo | Revocar credential, confirmar 401, enrolar nuevamente                                         | Reactivar solo mediante procedimiento auditado       |
| Database/Redis/MinIO/SMTP     | Reinicio coordinado de clientes          | Crear credencial nueva, actualizar secreto, health/smoke, retirar anterior                    | Rehabilitar credencial anterior durante ventana      |
| Webhook/integraciones         | Depende del proveedor                    | Dual-secret si el proveedor lo permite; validar firma y replay                                | Restaurar versión anterior                           |

La ausencia de key-ring para token HMAC hace esta rotación disruptiva. No se clasifica como automática ni zero-downtime.
