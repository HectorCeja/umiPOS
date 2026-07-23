# Security Architecture — Core Domain

La plataforma aplica controles preventivos en cuatro fronteras: principal autenticado, resolución DB-backed de Membership/AuthorizationContext, autorización central RBAC+ABAC y RLS default-deny. Fallar cualquiera detiene la operación.

Credenciales PostgreSQL separadas: Migration para DDL; Runtime para DML sujeto a RLS; Read-only para consultas sujetas a RLS; Maintenance para monitorización/mantenimiento sin BYPASSRLS. Secretos de Compose son solo desarrollo y deben reemplazarse en despliegue.

Se siguen OWASP Top 10 2025 A01, ASVS 5.0 V8/V11/V13/V14 y Cheat Sheets de Authorization y Multi-Tenant Security. Logging no registra tokens, cookies, PII ni payloads de membresía; debe incluir requestId y, tras resolución, identificadores tenant/principal seudonimizables. Tokens nunca contienen autoridad tenant. Las decisiones detalladas están en ADR-0023 a ADR-0029.
