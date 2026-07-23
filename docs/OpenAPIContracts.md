# OpenAPI Contracts

La fuente canónica es `packages/contracts/openapi/openapi.json`, OpenAPI 3.1.1. Swagger UI sirve ese documento sin inferirlo de decoradores. La versión 7.1.0 contiene 82 operaciones e incorpora Identity/Authentication, Authorization, Control Plane, Product, Inventory y Sales. La compatibilidad aditiva se comprueba contra baselines versionados. MFA, Cash Management, Customers, POS UI productivo, Flutter y UMI productivo no se publican.

Cada operación tiene `operationId`, respuestas explícitas y schemas cerrados para comandos. Errores usan `application/problem+json` compatible con RFC 9457. El path tenant es un candidato sujeto a autorización, nunca una prueba de identidad.

`pnpm --filter @nexo/contracts validate` verifica estructura e identificadores; `compatibility` bloquea eliminación de paths/operaciones y cambios incompatibles registrados. El SDK genera un manifiesto method/path/operation y falla si queda obsoleto; contract tests y Playwright cubren los módulos publicados. Prompt 10 no modifica contratos de negocio: los componentes consumen el SDK y nunca se convierten en fuente contractual.
