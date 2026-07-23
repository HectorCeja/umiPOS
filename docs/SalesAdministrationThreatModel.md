# Sales Administration Threat Model

| Amenaza                                | Control                                                 | Evidencia             |
| -------------------------------------- | ------------------------------------------------------- | --------------------- |
| IDOR/cross-tenant o branch             | FORCE RLS + Authorization transaccional                 | Sales E2E/RLS         |
| fraude refund/cancel                   | estado, policy, permiso, approval, idempotencia, motivo | Sales/Cash suites     |
| receipt/diagnostic tampering o leakage | modelo inmutable + allowlist sanitizada                 | contract/E2E          |
| bypass UI/mass assignment              | DTO + backend default deny                              | API tests             |
| outbox/quarantine disclosure           | permisos dedicados, payload oculto                      | Cash certification    |
| dashboard convertido en POS            | manual sale deshabilitada y ausencia de checkout UI     | UI test/documentación |

Riesgo residual: confianza de dispositivo remoto se definirá con Flutter/UMI en fases futuras; no se compensa habilitando cobro web.
