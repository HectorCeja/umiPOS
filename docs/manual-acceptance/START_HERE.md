# Empieza aquí

1. Ejecuta `pnpm manual-acceptance:prepare` desde la raíz. El tiempo depende de si Docker debe reconstruir imágenes; espera el mensaje `NEXO ESTÁ LISTO PARA PROBARSE`.
2. Abre una sola dirección: `http://localhost:3000`. El preparador reinicia el progreso real de la cuenta recomendada; después de iniciar sesión verás el onboarding desde el primer paso.
3. Inicia sesión con `alpha.owner@nexo.local` y la contraseña demo indicada por el preparador.
4. Abre `OWNER_TESTING_TOUR.md` y consulta `SCREEN_READINESS.md` antes de calificar una pantalla parcial.
5. Sigue el recorrido dentro del producto: entrada, onboarding, Inicio, Productos, Ventas, Caja, Perfil y cierre de sesión. Oscuro es la referencia única de este Design Freeze; las variantes Claro y Sistema están temporalmente deshabilitadas.
6. Vuelve a iniciar sesión y prueba después los perfiles Supervisor y Solo lectura.

No necesitas abrir Mailpit, rutas internas, Swagger, Storybook ni herramientas de infraestructura para evaluar NEXO. Si soporte solicita una herramienta técnica, aparecerá en una sección separada de diagnóstico.

6. Sigue [checklist.md](checklist.md). En [results.md](results.md) marca cada caso `PASS`, `FAIL`, `BLOCKED` o `NOT_RUN`; no dejes vacíos los casos críticos.
7. Guarda capturas en `screenshots/` y bundles sanitizados en `diagnostics/`. Nunca copies cookies, tokens, contraseñas, payloads completos ni datos reales.
8. Ante un fallo, registra pasos, hora, rol, sucursal, correlation ID y severidad en [issues.md](issues.md).
9. Para volver al inicio, sigue [reset-instructions.md](reset-instructions.md).
10. Al terminar ejecuta `pnpm manual-acceptance:record`. Comparte `summary.json`, `defects.json`, los bundles sanitizados y las capturas pertinentes con ChatGPT o Codex.

La aceptación pertenece al propietario. Preparar este paquete no equivale a aprobarla.
