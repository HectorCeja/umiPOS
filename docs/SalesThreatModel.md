# Sales Threat Model

| Amenaza                              | Control                                                                   | Evidencia                     | Residual                                                |
| ------------------------------------ | ------------------------------------------------------------------------- | ----------------------------- | ------------------------------------------------------- |
| Precio/cantidad/descuento manipulado | backend recalcula, schemas closed, Product port, permiso/policy           | domain/contract tests         | dispositivo puede mostrar dato falso antes de respuesta |
| Replay/doble venta/race              | idempotencia persistida, fingerprint, optimistic lock, unique constraints | concurrency/idempotency tests | retry externo requiere reconciliación                   |
| Refund fraud/MFA bypass              | permiso, scope, motivo, transaction authorization future step-up          | authorization tests           | MFA transaccional pendiente                             |
| Cross-tenant/branch, IDOR            | Membership DB, AuthorizationContext, FORCE RLS, composite keys            | Alpha/Beta RLS tests          | error de mapping externo se audita                      |
| Mass assignment                      | DTO/OpenAPI `additionalProperties:false`, allowlists                      | contract tests                | metadata requiere cuotas                                |
| Payment/receipt tampering            | server totals, no PAN/CVV, receipt hash                                   | monetary/receipt tests        | terminal externa no es criptográficamente atestada      |
| Event forgery/replay                 | transactional outbox, version envelope, consumer dedupe                   | outbox tests                  | firma pública futura                                    |
| Snapshot/delete tampering            | append-preserving triggers, completed records no delete                   | SQL runtime test              | maintenance role requiere procedimiento auditado        |
| Inventory desync                     | public port, reservation compensation, correlation                        | real integration tests        | caída tras pago requiere reconciliación                 |
| Idempotency abuse                    | tenant+operation namespace, TTL, size/rate limit                          | API tests                     | storage pressure monitoreado                            |
| POS comprometido/offline conflict    | least privilege, no claim authority, online critical ops                  | future device tests           | riesgo aceptado hasta device platform                   |

Mapeo: OWASP Top 10 2025 Broken Access Control, Injection, Insecure Design, Security Logging; ASVS 5 V4 Access Control, V5 Validation, V8 Data Protection, V9 Communications, V10 Malicious Code, V11 Business Logic, V13 API; OWASP Transaction Authorization (server-side, WYSIWYS, estado/credencial únicos) y REST Security (authorization por endpoint y state machine).
