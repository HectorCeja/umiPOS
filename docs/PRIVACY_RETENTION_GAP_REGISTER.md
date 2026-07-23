# Privacy and Retention Gap Register

Este inventario es técnico y no constituye asesoría legal.

| Dato                           | Propósito/sistema          | Control actual                          | Gap                                                         |
| ------------------------------ | -------------------------- | --------------------------------------- | ----------------------------------------------------------- |
| Sesiones                       | Autenticación/PostgreSQL   | Usuario y expiración; revocables        | Política de purga no demostrada                             |
| IP/User-Agent                  | Seguridad, sesiones y logs | Acceso técnico; redacción de secretos   | Retención/minimización formal pendiente                     |
| Invitations/action tokens      | Acceso y recuperación      | Hash, expiración, uso único             | Purga histórica documentada pendiente                       |
| Devices                        | Reconocimiento/enrollment  | User/tenant scope y revocación          | Retención y administración comercial pendientes             |
| Audit/Security events          | Trazabilidad               | Separación tenant y timestamps          | Retención/SIEM/export formal pendientes                     |
| Media/avatar                   | Perfil/MinIO               | Ownership, tamaño, magic bytes, borrado | Backup, lifecycle de objetos y purge verificable pendientes |
| Usuarios/memberships revocados | Integridad/auditoría       | Estados autoritativos                   | Anonimización y solicitudes del titular pendientes          |
| Logs/traces                    | Diagnóstico/OTEL           | Redacción conocida                      | Retención por backend y acceso operativo pendientes         |

Acciones requieren owner real, plazos y revisión legal/operativa para SaaS en México. Estado: **OWNER ACTION REQUIRED**.
