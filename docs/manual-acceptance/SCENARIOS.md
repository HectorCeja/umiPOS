# Escenarios de aceptación manual — Fase 12

156 escenarios útiles (6 por categoría). Todos usan datos ficticios y servicios locales reales.

## A. Entorno y acceso

### A-01 — consultar el estado autorizado

- **Objetivo:** consultar el estado autorizado en Entorno y acceso y confirmar que la respuesta sea autoritativa.
- **Rol:** Owner.
- **Precondiciones:** entorno preparado; Organization Alpha (dataset Café Horizonte); sucursal Centro, salvo el caso cross-branch.
- **Pasos:** 1) iniciar sesión; 2) abrir Entorno y acceso; 3) consultar el estado autorizado; 4) actualizar la vista; 5) copiar el correlation ID si aparece.
- **Resultado esperado:** la vista refleja el resultado persistido por el backend y el timeline conserva trazabilidad.
- **Evidencia:** captura, hora, usuario, URL, request/correlation ID y resultado observado.
- **Severidad si falla:** Media.
- **Módulo responsable:** Entorno y acceso.
- **Diagnóstico:** usar el bundle sanitizado; nunca adjuntar cookies, tokens, contraseñas, PAN/CVV o payloads completos.

### A-02 — ejecutar el flujo principal

- **Objetivo:** ejecutar el flujo principal en Entorno y acceso y confirmar que la respuesta sea autoritativa.
- **Rol:** Administrator.
- **Precondiciones:** entorno preparado; Organization Alpha (dataset Café Horizonte); sucursal Centro, salvo el caso cross-branch.
- **Pasos:** 1) iniciar sesión; 2) abrir Entorno y acceso; 3) ejecutar el flujo principal; 4) actualizar la vista; 5) copiar el correlation ID si aparece.
- **Resultado esperado:** la vista refleja el resultado persistido por el backend y el timeline conserva trazabilidad.
- **Evidencia:** captura, hora, usuario, URL, request/correlation ID y resultado observado.
- **Severidad si falla:** Media.
- **Módulo responsable:** Entorno y acceso.
- **Diagnóstico:** usar el bundle sanitizado; nunca adjuntar cookies, tokens, contraseñas, PAN/CVV o payloads completos.

### A-03 — validar un dato inválido

- **Objetivo:** validar un dato inválido en Entorno y acceso y confirmar que la respuesta sea autoritativa.
- **Rol:** Supervisor.
- **Precondiciones:** entorno preparado; Organization Alpha (dataset Café Horizonte); sucursal Centro, salvo el caso cross-branch.
- **Pasos:** 1) iniciar sesión; 2) abrir Entorno y acceso; 3) validar un dato inválido; 4) actualizar la vista; 5) copiar el correlation ID si aparece.
- **Resultado esperado:** la operación se bloquea con un código estable y no cambia datos.
- **Evidencia:** captura, hora, usuario, URL, request/correlation ID y resultado observado.
- **Severidad si falla:** Alta.
- **Módulo responsable:** Entorno y acceso.
- **Diagnóstico:** usar el bundle sanitizado; nunca adjuntar cookies, tokens, contraseñas, PAN/CVV o payloads completos.

### A-04 — repetir la intención idempotente

- **Objetivo:** repetir la intención idempotente en Entorno y acceso y confirmar que la respuesta sea autoritativa.
- **Rol:** Cashier.
- **Precondiciones:** entorno preparado; Organization Alpha (dataset Café Horizonte); sucursal Centro, salvo el caso cross-branch.
- **Pasos:** 1) iniciar sesión; 2) abrir Entorno y acceso; 3) repetir la intención idempotente; 4) actualizar la vista; 5) copiar el correlation ID si aparece.
- **Resultado esperado:** la operación se bloquea con un código estable y no cambia datos.
- **Evidencia:** captura, hora, usuario, URL, request/correlation ID y resultado observado.
- **Severidad si falla:** Alta.
- **Módulo responsable:** Entorno y acceso.
- **Diagnóstico:** usar el bundle sanitizado; nunca adjuntar cookies, tokens, contraseñas, PAN/CVV o payloads completos.

### A-05 — cambiar de sucursal

- **Objetivo:** cambiar de sucursal en Entorno y acceso y confirmar que la respuesta sea autoritativa.
- **Rol:** Employee.
- **Precondiciones:** entorno preparado; Organization Alpha (dataset Café Horizonte); sucursal Centro, salvo el caso cross-branch.
- **Pasos:** 1) iniciar sesión; 2) abrir Entorno y acceso; 3) cambiar de sucursal; 4) actualizar la vista; 5) copiar el correlation ID si aparece.
- **Resultado esperado:** la operación se bloquea con un código estable y no cambia datos.
- **Evidencia:** captura, hora, usuario, URL, request/correlation ID y resultado observado.
- **Severidad si falla:** Alta.
- **Módulo responsable:** Entorno y acceso.
- **Diagnóstico:** usar el bundle sanitizado; nunca adjuntar cookies, tokens, contraseñas, PAN/CVV o payloads completos.

### A-06 — intentar sin permiso

- **Objetivo:** intentar sin permiso en Entorno y acceso y confirmar que la respuesta sea autoritativa.
- **Rol:** ReadOnly.
- **Precondiciones:** entorno preparado; Organization Alpha (dataset Café Horizonte); sucursal Centro, salvo el caso cross-branch.
- **Pasos:** 1) iniciar sesión; 2) abrir Entorno y acceso; 3) intentar sin permiso; 4) actualizar la vista; 5) copiar el correlation ID si aparece.
- **Resultado esperado:** la operación se bloquea con un código estable y no cambia datos.
- **Evidencia:** captura, hora, usuario, URL, request/correlation ID y resultado observado.
- **Severidad si falla:** Crítica.
- **Módulo responsable:** Entorno y acceso.
- **Diagnóstico:** usar el bundle sanitizado; nunca adjuntar cookies, tokens, contraseñas, PAN/CVV o payloads completos.

## B. Identity

### B-01 — consultar el estado autorizado

- **Objetivo:** consultar el estado autorizado en Identity y confirmar que la respuesta sea autoritativa.
- **Rol:** Owner.
- **Precondiciones:** entorno preparado; Organization Alpha (dataset Café Horizonte); sucursal Centro, salvo el caso cross-branch.
- **Pasos:** 1) iniciar sesión; 2) abrir Identity; 3) consultar el estado autorizado; 4) actualizar la vista; 5) copiar el correlation ID si aparece.
- **Resultado esperado:** la vista refleja el resultado persistido por el backend y el timeline conserva trazabilidad.
- **Evidencia:** captura, hora, usuario, URL, request/correlation ID y resultado observado.
- **Severidad si falla:** Media.
- **Módulo responsable:** Identity.
- **Diagnóstico:** usar el bundle sanitizado; nunca adjuntar cookies, tokens, contraseñas, PAN/CVV o payloads completos.

### B-02 — ejecutar el flujo principal

- **Objetivo:** ejecutar el flujo principal en Identity y confirmar que la respuesta sea autoritativa.
- **Rol:** Administrator.
- **Precondiciones:** entorno preparado; Organization Alpha (dataset Café Horizonte); sucursal Centro, salvo el caso cross-branch.
- **Pasos:** 1) iniciar sesión; 2) abrir Identity; 3) ejecutar el flujo principal; 4) actualizar la vista; 5) copiar el correlation ID si aparece.
- **Resultado esperado:** la vista refleja el resultado persistido por el backend y el timeline conserva trazabilidad.
- **Evidencia:** captura, hora, usuario, URL, request/correlation ID y resultado observado.
- **Severidad si falla:** Media.
- **Módulo responsable:** Identity.
- **Diagnóstico:** usar el bundle sanitizado; nunca adjuntar cookies, tokens, contraseñas, PAN/CVV o payloads completos.

### B-03 — validar un dato inválido

- **Objetivo:** validar un dato inválido en Identity y confirmar que la respuesta sea autoritativa.
- **Rol:** Supervisor.
- **Precondiciones:** entorno preparado; Organization Alpha (dataset Café Horizonte); sucursal Centro, salvo el caso cross-branch.
- **Pasos:** 1) iniciar sesión; 2) abrir Identity; 3) validar un dato inválido; 4) actualizar la vista; 5) copiar el correlation ID si aparece.
- **Resultado esperado:** la operación se bloquea con un código estable y no cambia datos.
- **Evidencia:** captura, hora, usuario, URL, request/correlation ID y resultado observado.
- **Severidad si falla:** Alta.
- **Módulo responsable:** Identity.
- **Diagnóstico:** usar el bundle sanitizado; nunca adjuntar cookies, tokens, contraseñas, PAN/CVV o payloads completos.

### B-04 — repetir la intención idempotente

- **Objetivo:** repetir la intención idempotente en Identity y confirmar que la respuesta sea autoritativa.
- **Rol:** Cashier.
- **Precondiciones:** entorno preparado; Organization Alpha (dataset Café Horizonte); sucursal Centro, salvo el caso cross-branch.
- **Pasos:** 1) iniciar sesión; 2) abrir Identity; 3) repetir la intención idempotente; 4) actualizar la vista; 5) copiar el correlation ID si aparece.
- **Resultado esperado:** la operación se bloquea con un código estable y no cambia datos.
- **Evidencia:** captura, hora, usuario, URL, request/correlation ID y resultado observado.
- **Severidad si falla:** Alta.
- **Módulo responsable:** Identity.
- **Diagnóstico:** usar el bundle sanitizado; nunca adjuntar cookies, tokens, contraseñas, PAN/CVV o payloads completos.

### B-05 — cambiar de sucursal

- **Objetivo:** cambiar de sucursal en Identity y confirmar que la respuesta sea autoritativa.
- **Rol:** Employee.
- **Precondiciones:** entorno preparado; Organization Alpha (dataset Café Horizonte); sucursal Centro, salvo el caso cross-branch.
- **Pasos:** 1) iniciar sesión; 2) abrir Identity; 3) cambiar de sucursal; 4) actualizar la vista; 5) copiar el correlation ID si aparece.
- **Resultado esperado:** la operación se bloquea con un código estable y no cambia datos.
- **Evidencia:** captura, hora, usuario, URL, request/correlation ID y resultado observado.
- **Severidad si falla:** Alta.
- **Módulo responsable:** Identity.
- **Diagnóstico:** usar el bundle sanitizado; nunca adjuntar cookies, tokens, contraseñas, PAN/CVV o payloads completos.

### B-06 — intentar sin permiso

- **Objetivo:** intentar sin permiso en Identity y confirmar que la respuesta sea autoritativa.
- **Rol:** ReadOnly.
- **Precondiciones:** entorno preparado; Organization Alpha (dataset Café Horizonte); sucursal Centro, salvo el caso cross-branch.
- **Pasos:** 1) iniciar sesión; 2) abrir Identity; 3) intentar sin permiso; 4) actualizar la vista; 5) copiar el correlation ID si aparece.
- **Resultado esperado:** la operación se bloquea con un código estable y no cambia datos.
- **Evidencia:** captura, hora, usuario, URL, request/correlation ID y resultado observado.
- **Severidad si falla:** Crítica.
- **Módulo responsable:** Identity.
- **Diagnóstico:** usar el bundle sanitizado; nunca adjuntar cookies, tokens, contraseñas, PAN/CVV o payloads completos.

## C. Authorization

### C-01 — consultar el estado autorizado

- **Objetivo:** consultar el estado autorizado en Authorization y confirmar que la respuesta sea autoritativa.
- **Rol:** Owner.
- **Precondiciones:** entorno preparado; Organization Alpha (dataset Café Horizonte); sucursal Centro, salvo el caso cross-branch.
- **Pasos:** 1) iniciar sesión; 2) abrir Authorization; 3) consultar el estado autorizado; 4) actualizar la vista; 5) copiar el correlation ID si aparece.
- **Resultado esperado:** la vista refleja el resultado persistido por el backend y el timeline conserva trazabilidad.
- **Evidencia:** captura, hora, usuario, URL, request/correlation ID y resultado observado.
- **Severidad si falla:** Media.
- **Módulo responsable:** Authorization.
- **Diagnóstico:** usar el bundle sanitizado; nunca adjuntar cookies, tokens, contraseñas, PAN/CVV o payloads completos.

### C-02 — ejecutar el flujo principal

- **Objetivo:** ejecutar el flujo principal en Authorization y confirmar que la respuesta sea autoritativa.
- **Rol:** Administrator.
- **Precondiciones:** entorno preparado; Organization Alpha (dataset Café Horizonte); sucursal Centro, salvo el caso cross-branch.
- **Pasos:** 1) iniciar sesión; 2) abrir Authorization; 3) ejecutar el flujo principal; 4) actualizar la vista; 5) copiar el correlation ID si aparece.
- **Resultado esperado:** la vista refleja el resultado persistido por el backend y el timeline conserva trazabilidad.
- **Evidencia:** captura, hora, usuario, URL, request/correlation ID y resultado observado.
- **Severidad si falla:** Media.
- **Módulo responsable:** Authorization.
- **Diagnóstico:** usar el bundle sanitizado; nunca adjuntar cookies, tokens, contraseñas, PAN/CVV o payloads completos.

### C-03 — validar un dato inválido

- **Objetivo:** validar un dato inválido en Authorization y confirmar que la respuesta sea autoritativa.
- **Rol:** Supervisor.
- **Precondiciones:** entorno preparado; Organization Alpha (dataset Café Horizonte); sucursal Centro, salvo el caso cross-branch.
- **Pasos:** 1) iniciar sesión; 2) abrir Authorization; 3) validar un dato inválido; 4) actualizar la vista; 5) copiar el correlation ID si aparece.
- **Resultado esperado:** la operación se bloquea con un código estable y no cambia datos.
- **Evidencia:** captura, hora, usuario, URL, request/correlation ID y resultado observado.
- **Severidad si falla:** Alta.
- **Módulo responsable:** Authorization.
- **Diagnóstico:** usar el bundle sanitizado; nunca adjuntar cookies, tokens, contraseñas, PAN/CVV o payloads completos.

### C-04 — repetir la intención idempotente

- **Objetivo:** repetir la intención idempotente en Authorization y confirmar que la respuesta sea autoritativa.
- **Rol:** Cashier.
- **Precondiciones:** entorno preparado; Organization Alpha (dataset Café Horizonte); sucursal Centro, salvo el caso cross-branch.
- **Pasos:** 1) iniciar sesión; 2) abrir Authorization; 3) repetir la intención idempotente; 4) actualizar la vista; 5) copiar el correlation ID si aparece.
- **Resultado esperado:** la operación se bloquea con un código estable y no cambia datos.
- **Evidencia:** captura, hora, usuario, URL, request/correlation ID y resultado observado.
- **Severidad si falla:** Alta.
- **Módulo responsable:** Authorization.
- **Diagnóstico:** usar el bundle sanitizado; nunca adjuntar cookies, tokens, contraseñas, PAN/CVV o payloads completos.

### C-05 — cambiar de sucursal

- **Objetivo:** cambiar de sucursal en Authorization y confirmar que la respuesta sea autoritativa.
- **Rol:** Employee.
- **Precondiciones:** entorno preparado; Organization Alpha (dataset Café Horizonte); sucursal Centro, salvo el caso cross-branch.
- **Pasos:** 1) iniciar sesión; 2) abrir Authorization; 3) cambiar de sucursal; 4) actualizar la vista; 5) copiar el correlation ID si aparece.
- **Resultado esperado:** la operación se bloquea con un código estable y no cambia datos.
- **Evidencia:** captura, hora, usuario, URL, request/correlation ID y resultado observado.
- **Severidad si falla:** Alta.
- **Módulo responsable:** Authorization.
- **Diagnóstico:** usar el bundle sanitizado; nunca adjuntar cookies, tokens, contraseñas, PAN/CVV o payloads completos.

### C-06 — intentar sin permiso

- **Objetivo:** intentar sin permiso en Authorization y confirmar que la respuesta sea autoritativa.
- **Rol:** ReadOnly.
- **Precondiciones:** entorno preparado; Organization Alpha (dataset Café Horizonte); sucursal Centro, salvo el caso cross-branch.
- **Pasos:** 1) iniciar sesión; 2) abrir Authorization; 3) intentar sin permiso; 4) actualizar la vista; 5) copiar el correlation ID si aparece.
- **Resultado esperado:** la operación se bloquea con un código estable y no cambia datos.
- **Evidencia:** captura, hora, usuario, URL, request/correlation ID y resultado observado.
- **Severidad si falla:** Crítica.
- **Módulo responsable:** Authorization.
- **Diagnóstico:** usar el bundle sanitizado; nunca adjuntar cookies, tokens, contraseñas, PAN/CVV o payloads completos.

## D. Organizations

### D-01 — consultar el estado autorizado

- **Objetivo:** consultar el estado autorizado en Organizations y confirmar que la respuesta sea autoritativa.
- **Rol:** Owner.
- **Precondiciones:** entorno preparado; Organization Alpha (dataset Café Horizonte); sucursal Centro, salvo el caso cross-branch.
- **Pasos:** 1) iniciar sesión; 2) abrir Organizations; 3) consultar el estado autorizado; 4) actualizar la vista; 5) copiar el correlation ID si aparece.
- **Resultado esperado:** la vista refleja el resultado persistido por el backend y el timeline conserva trazabilidad.
- **Evidencia:** captura, hora, usuario, URL, request/correlation ID y resultado observado.
- **Severidad si falla:** Media.
- **Módulo responsable:** Organizations.
- **Diagnóstico:** usar el bundle sanitizado; nunca adjuntar cookies, tokens, contraseñas, PAN/CVV o payloads completos.

### D-02 — ejecutar el flujo principal

- **Objetivo:** ejecutar el flujo principal en Organizations y confirmar que la respuesta sea autoritativa.
- **Rol:** Administrator.
- **Precondiciones:** entorno preparado; Organization Alpha (dataset Café Horizonte); sucursal Centro, salvo el caso cross-branch.
- **Pasos:** 1) iniciar sesión; 2) abrir Organizations; 3) ejecutar el flujo principal; 4) actualizar la vista; 5) copiar el correlation ID si aparece.
- **Resultado esperado:** la vista refleja el resultado persistido por el backend y el timeline conserva trazabilidad.
- **Evidencia:** captura, hora, usuario, URL, request/correlation ID y resultado observado.
- **Severidad si falla:** Media.
- **Módulo responsable:** Organizations.
- **Diagnóstico:** usar el bundle sanitizado; nunca adjuntar cookies, tokens, contraseñas, PAN/CVV o payloads completos.

### D-03 — validar un dato inválido

- **Objetivo:** validar un dato inválido en Organizations y confirmar que la respuesta sea autoritativa.
- **Rol:** Supervisor.
- **Precondiciones:** entorno preparado; Organization Alpha (dataset Café Horizonte); sucursal Centro, salvo el caso cross-branch.
- **Pasos:** 1) iniciar sesión; 2) abrir Organizations; 3) validar un dato inválido; 4) actualizar la vista; 5) copiar el correlation ID si aparece.
- **Resultado esperado:** la operación se bloquea con un código estable y no cambia datos.
- **Evidencia:** captura, hora, usuario, URL, request/correlation ID y resultado observado.
- **Severidad si falla:** Alta.
- **Módulo responsable:** Organizations.
- **Diagnóstico:** usar el bundle sanitizado; nunca adjuntar cookies, tokens, contraseñas, PAN/CVV o payloads completos.

### D-04 — repetir la intención idempotente

- **Objetivo:** repetir la intención idempotente en Organizations y confirmar que la respuesta sea autoritativa.
- **Rol:** Cashier.
- **Precondiciones:** entorno preparado; Organization Alpha (dataset Café Horizonte); sucursal Centro, salvo el caso cross-branch.
- **Pasos:** 1) iniciar sesión; 2) abrir Organizations; 3) repetir la intención idempotente; 4) actualizar la vista; 5) copiar el correlation ID si aparece.
- **Resultado esperado:** la operación se bloquea con un código estable y no cambia datos.
- **Evidencia:** captura, hora, usuario, URL, request/correlation ID y resultado observado.
- **Severidad si falla:** Alta.
- **Módulo responsable:** Organizations.
- **Diagnóstico:** usar el bundle sanitizado; nunca adjuntar cookies, tokens, contraseñas, PAN/CVV o payloads completos.

### D-05 — cambiar de sucursal

- **Objetivo:** cambiar de sucursal en Organizations y confirmar que la respuesta sea autoritativa.
- **Rol:** Employee.
- **Precondiciones:** entorno preparado; Organization Alpha (dataset Café Horizonte); sucursal Centro, salvo el caso cross-branch.
- **Pasos:** 1) iniciar sesión; 2) abrir Organizations; 3) cambiar de sucursal; 4) actualizar la vista; 5) copiar el correlation ID si aparece.
- **Resultado esperado:** la operación se bloquea con un código estable y no cambia datos.
- **Evidencia:** captura, hora, usuario, URL, request/correlation ID y resultado observado.
- **Severidad si falla:** Alta.
- **Módulo responsable:** Organizations.
- **Diagnóstico:** usar el bundle sanitizado; nunca adjuntar cookies, tokens, contraseñas, PAN/CVV o payloads completos.

### D-06 — intentar sin permiso

- **Objetivo:** intentar sin permiso en Organizations y confirmar que la respuesta sea autoritativa.
- **Rol:** ReadOnly.
- **Precondiciones:** entorno preparado; Organization Alpha (dataset Café Horizonte); sucursal Centro, salvo el caso cross-branch.
- **Pasos:** 1) iniciar sesión; 2) abrir Organizations; 3) intentar sin permiso; 4) actualizar la vista; 5) copiar el correlation ID si aparece.
- **Resultado esperado:** la operación se bloquea con un código estable y no cambia datos.
- **Evidencia:** captura, hora, usuario, URL, request/correlation ID y resultado observado.
- **Severidad si falla:** Crítica.
- **Módulo responsable:** Organizations.
- **Diagnóstico:** usar el bundle sanitizado; nunca adjuntar cookies, tokens, contraseñas, PAN/CVV o payloads completos.

## E. Branches

### E-01 — consultar el estado autorizado

- **Objetivo:** consultar el estado autorizado en Branches y confirmar que la respuesta sea autoritativa.
- **Rol:** Owner.
- **Precondiciones:** entorno preparado; Organization Alpha (dataset Café Horizonte); sucursal Centro, salvo el caso cross-branch.
- **Pasos:** 1) iniciar sesión; 2) abrir Branches; 3) consultar el estado autorizado; 4) actualizar la vista; 5) copiar el correlation ID si aparece.
- **Resultado esperado:** la vista refleja el resultado persistido por el backend y el timeline conserva trazabilidad.
- **Evidencia:** captura, hora, usuario, URL, request/correlation ID y resultado observado.
- **Severidad si falla:** Media.
- **Módulo responsable:** Branches.
- **Diagnóstico:** usar el bundle sanitizado; nunca adjuntar cookies, tokens, contraseñas, PAN/CVV o payloads completos.

### E-02 — ejecutar el flujo principal

- **Objetivo:** ejecutar el flujo principal en Branches y confirmar que la respuesta sea autoritativa.
- **Rol:** Administrator.
- **Precondiciones:** entorno preparado; Organization Alpha (dataset Café Horizonte); sucursal Centro, salvo el caso cross-branch.
- **Pasos:** 1) iniciar sesión; 2) abrir Branches; 3) ejecutar el flujo principal; 4) actualizar la vista; 5) copiar el correlation ID si aparece.
- **Resultado esperado:** la vista refleja el resultado persistido por el backend y el timeline conserva trazabilidad.
- **Evidencia:** captura, hora, usuario, URL, request/correlation ID y resultado observado.
- **Severidad si falla:** Media.
- **Módulo responsable:** Branches.
- **Diagnóstico:** usar el bundle sanitizado; nunca adjuntar cookies, tokens, contraseñas, PAN/CVV o payloads completos.

### E-03 — validar un dato inválido

- **Objetivo:** validar un dato inválido en Branches y confirmar que la respuesta sea autoritativa.
- **Rol:** Supervisor.
- **Precondiciones:** entorno preparado; Organization Alpha (dataset Café Horizonte); sucursal Centro, salvo el caso cross-branch.
- **Pasos:** 1) iniciar sesión; 2) abrir Branches; 3) validar un dato inválido; 4) actualizar la vista; 5) copiar el correlation ID si aparece.
- **Resultado esperado:** la operación se bloquea con un código estable y no cambia datos.
- **Evidencia:** captura, hora, usuario, URL, request/correlation ID y resultado observado.
- **Severidad si falla:** Alta.
- **Módulo responsable:** Branches.
- **Diagnóstico:** usar el bundle sanitizado; nunca adjuntar cookies, tokens, contraseñas, PAN/CVV o payloads completos.

### E-04 — repetir la intención idempotente

- **Objetivo:** repetir la intención idempotente en Branches y confirmar que la respuesta sea autoritativa.
- **Rol:** Cashier.
- **Precondiciones:** entorno preparado; Organization Alpha (dataset Café Horizonte); sucursal Centro, salvo el caso cross-branch.
- **Pasos:** 1) iniciar sesión; 2) abrir Branches; 3) repetir la intención idempotente; 4) actualizar la vista; 5) copiar el correlation ID si aparece.
- **Resultado esperado:** la operación se bloquea con un código estable y no cambia datos.
- **Evidencia:** captura, hora, usuario, URL, request/correlation ID y resultado observado.
- **Severidad si falla:** Alta.
- **Módulo responsable:** Branches.
- **Diagnóstico:** usar el bundle sanitizado; nunca adjuntar cookies, tokens, contraseñas, PAN/CVV o payloads completos.

### E-05 — cambiar de sucursal

- **Objetivo:** cambiar de sucursal en Branches y confirmar que la respuesta sea autoritativa.
- **Rol:** Employee.
- **Precondiciones:** entorno preparado; Organization Alpha (dataset Café Horizonte); sucursal Centro, salvo el caso cross-branch.
- **Pasos:** 1) iniciar sesión; 2) abrir Branches; 3) cambiar de sucursal; 4) actualizar la vista; 5) copiar el correlation ID si aparece.
- **Resultado esperado:** la operación se bloquea con un código estable y no cambia datos.
- **Evidencia:** captura, hora, usuario, URL, request/correlation ID y resultado observado.
- **Severidad si falla:** Alta.
- **Módulo responsable:** Branches.
- **Diagnóstico:** usar el bundle sanitizado; nunca adjuntar cookies, tokens, contraseñas, PAN/CVV o payloads completos.

### E-06 — intentar sin permiso

- **Objetivo:** intentar sin permiso en Branches y confirmar que la respuesta sea autoritativa.
- **Rol:** ReadOnly.
- **Precondiciones:** entorno preparado; Organization Alpha (dataset Café Horizonte); sucursal Centro, salvo el caso cross-branch.
- **Pasos:** 1) iniciar sesión; 2) abrir Branches; 3) intentar sin permiso; 4) actualizar la vista; 5) copiar el correlation ID si aparece.
- **Resultado esperado:** la operación se bloquea con un código estable y no cambia datos.
- **Evidencia:** captura, hora, usuario, URL, request/correlation ID y resultado observado.
- **Severidad si falla:** Crítica.
- **Módulo responsable:** Branches.
- **Diagnóstico:** usar el bundle sanitizado; nunca adjuntar cookies, tokens, contraseñas, PAN/CVV o payloads completos.

## F. Products

### F-01 — consultar el estado autorizado

- **Objetivo:** consultar el estado autorizado en Products y confirmar que la respuesta sea autoritativa.
- **Rol:** Owner.
- **Precondiciones:** entorno preparado; Organization Alpha (dataset Café Horizonte); sucursal Centro, salvo el caso cross-branch.
- **Pasos:** 1) iniciar sesión; 2) abrir Products; 3) consultar el estado autorizado; 4) actualizar la vista; 5) copiar el correlation ID si aparece.
- **Resultado esperado:** la vista refleja el resultado persistido por el backend y el timeline conserva trazabilidad.
- **Evidencia:** captura, hora, usuario, URL, request/correlation ID y resultado observado.
- **Severidad si falla:** Media.
- **Módulo responsable:** Products.
- **Diagnóstico:** usar el bundle sanitizado; nunca adjuntar cookies, tokens, contraseñas, PAN/CVV o payloads completos.

### F-02 — ejecutar el flujo principal

- **Objetivo:** ejecutar el flujo principal en Products y confirmar que la respuesta sea autoritativa.
- **Rol:** Administrator.
- **Precondiciones:** entorno preparado; Organization Alpha (dataset Café Horizonte); sucursal Centro, salvo el caso cross-branch.
- **Pasos:** 1) iniciar sesión; 2) abrir Products; 3) ejecutar el flujo principal; 4) actualizar la vista; 5) copiar el correlation ID si aparece.
- **Resultado esperado:** la vista refleja el resultado persistido por el backend y el timeline conserva trazabilidad.
- **Evidencia:** captura, hora, usuario, URL, request/correlation ID y resultado observado.
- **Severidad si falla:** Media.
- **Módulo responsable:** Products.
- **Diagnóstico:** usar el bundle sanitizado; nunca adjuntar cookies, tokens, contraseñas, PAN/CVV o payloads completos.

### F-03 — validar un dato inválido

- **Objetivo:** validar un dato inválido en Products y confirmar que la respuesta sea autoritativa.
- **Rol:** Supervisor.
- **Precondiciones:** entorno preparado; Organization Alpha (dataset Café Horizonte); sucursal Centro, salvo el caso cross-branch.
- **Pasos:** 1) iniciar sesión; 2) abrir Products; 3) validar un dato inválido; 4) actualizar la vista; 5) copiar el correlation ID si aparece.
- **Resultado esperado:** la operación se bloquea con un código estable y no cambia datos.
- **Evidencia:** captura, hora, usuario, URL, request/correlation ID y resultado observado.
- **Severidad si falla:** Alta.
- **Módulo responsable:** Products.
- **Diagnóstico:** usar el bundle sanitizado; nunca adjuntar cookies, tokens, contraseñas, PAN/CVV o payloads completos.

### F-04 — repetir la intención idempotente

- **Objetivo:** repetir la intención idempotente en Products y confirmar que la respuesta sea autoritativa.
- **Rol:** Cashier.
- **Precondiciones:** entorno preparado; Organization Alpha (dataset Café Horizonte); sucursal Centro, salvo el caso cross-branch.
- **Pasos:** 1) iniciar sesión; 2) abrir Products; 3) repetir la intención idempotente; 4) actualizar la vista; 5) copiar el correlation ID si aparece.
- **Resultado esperado:** la operación se bloquea con un código estable y no cambia datos.
- **Evidencia:** captura, hora, usuario, URL, request/correlation ID y resultado observado.
- **Severidad si falla:** Alta.
- **Módulo responsable:** Products.
- **Diagnóstico:** usar el bundle sanitizado; nunca adjuntar cookies, tokens, contraseñas, PAN/CVV o payloads completos.

### F-05 — cambiar de sucursal

- **Objetivo:** cambiar de sucursal en Products y confirmar que la respuesta sea autoritativa.
- **Rol:** Employee.
- **Precondiciones:** entorno preparado; Organization Alpha (dataset Café Horizonte); sucursal Centro, salvo el caso cross-branch.
- **Pasos:** 1) iniciar sesión; 2) abrir Products; 3) cambiar de sucursal; 4) actualizar la vista; 5) copiar el correlation ID si aparece.
- **Resultado esperado:** la operación se bloquea con un código estable y no cambia datos.
- **Evidencia:** captura, hora, usuario, URL, request/correlation ID y resultado observado.
- **Severidad si falla:** Alta.
- **Módulo responsable:** Products.
- **Diagnóstico:** usar el bundle sanitizado; nunca adjuntar cookies, tokens, contraseñas, PAN/CVV o payloads completos.

### F-06 — intentar sin permiso

- **Objetivo:** intentar sin permiso en Products y confirmar que la respuesta sea autoritativa.
- **Rol:** ReadOnly.
- **Precondiciones:** entorno preparado; Organization Alpha (dataset Café Horizonte); sucursal Centro, salvo el caso cross-branch.
- **Pasos:** 1) iniciar sesión; 2) abrir Products; 3) intentar sin permiso; 4) actualizar la vista; 5) copiar el correlation ID si aparece.
- **Resultado esperado:** la operación se bloquea con un código estable y no cambia datos.
- **Evidencia:** captura, hora, usuario, URL, request/correlation ID y resultado observado.
- **Severidad si falla:** Crítica.
- **Módulo responsable:** Products.
- **Diagnóstico:** usar el bundle sanitizado; nunca adjuntar cookies, tokens, contraseñas, PAN/CVV o payloads completos.

## G. Variants

### G-01 — consultar el estado autorizado

- **Objetivo:** consultar el estado autorizado en Variants y confirmar que la respuesta sea autoritativa.
- **Rol:** Owner.
- **Precondiciones:** entorno preparado; Organization Alpha (dataset Café Horizonte); sucursal Centro, salvo el caso cross-branch.
- **Pasos:** 1) iniciar sesión; 2) abrir Variants; 3) consultar el estado autorizado; 4) actualizar la vista; 5) copiar el correlation ID si aparece.
- **Resultado esperado:** la vista refleja el resultado persistido por el backend y el timeline conserva trazabilidad.
- **Evidencia:** captura, hora, usuario, URL, request/correlation ID y resultado observado.
- **Severidad si falla:** Media.
- **Módulo responsable:** Variants.
- **Diagnóstico:** usar el bundle sanitizado; nunca adjuntar cookies, tokens, contraseñas, PAN/CVV o payloads completos.

### G-02 — ejecutar el flujo principal

- **Objetivo:** ejecutar el flujo principal en Variants y confirmar que la respuesta sea autoritativa.
- **Rol:** Administrator.
- **Precondiciones:** entorno preparado; Organization Alpha (dataset Café Horizonte); sucursal Centro, salvo el caso cross-branch.
- **Pasos:** 1) iniciar sesión; 2) abrir Variants; 3) ejecutar el flujo principal; 4) actualizar la vista; 5) copiar el correlation ID si aparece.
- **Resultado esperado:** la vista refleja el resultado persistido por el backend y el timeline conserva trazabilidad.
- **Evidencia:** captura, hora, usuario, URL, request/correlation ID y resultado observado.
- **Severidad si falla:** Media.
- **Módulo responsable:** Variants.
- **Diagnóstico:** usar el bundle sanitizado; nunca adjuntar cookies, tokens, contraseñas, PAN/CVV o payloads completos.

### G-03 — validar un dato inválido

- **Objetivo:** validar un dato inválido en Variants y confirmar que la respuesta sea autoritativa.
- **Rol:** Supervisor.
- **Precondiciones:** entorno preparado; Organization Alpha (dataset Café Horizonte); sucursal Centro, salvo el caso cross-branch.
- **Pasos:** 1) iniciar sesión; 2) abrir Variants; 3) validar un dato inválido; 4) actualizar la vista; 5) copiar el correlation ID si aparece.
- **Resultado esperado:** la operación se bloquea con un código estable y no cambia datos.
- **Evidencia:** captura, hora, usuario, URL, request/correlation ID y resultado observado.
- **Severidad si falla:** Alta.
- **Módulo responsable:** Variants.
- **Diagnóstico:** usar el bundle sanitizado; nunca adjuntar cookies, tokens, contraseñas, PAN/CVV o payloads completos.

### G-04 — repetir la intención idempotente

- **Objetivo:** repetir la intención idempotente en Variants y confirmar que la respuesta sea autoritativa.
- **Rol:** Cashier.
- **Precondiciones:** entorno preparado; Organization Alpha (dataset Café Horizonte); sucursal Centro, salvo el caso cross-branch.
- **Pasos:** 1) iniciar sesión; 2) abrir Variants; 3) repetir la intención idempotente; 4) actualizar la vista; 5) copiar el correlation ID si aparece.
- **Resultado esperado:** la operación se bloquea con un código estable y no cambia datos.
- **Evidencia:** captura, hora, usuario, URL, request/correlation ID y resultado observado.
- **Severidad si falla:** Alta.
- **Módulo responsable:** Variants.
- **Diagnóstico:** usar el bundle sanitizado; nunca adjuntar cookies, tokens, contraseñas, PAN/CVV o payloads completos.

### G-05 — cambiar de sucursal

- **Objetivo:** cambiar de sucursal en Variants y confirmar que la respuesta sea autoritativa.
- **Rol:** Employee.
- **Precondiciones:** entorno preparado; Organization Alpha (dataset Café Horizonte); sucursal Centro, salvo el caso cross-branch.
- **Pasos:** 1) iniciar sesión; 2) abrir Variants; 3) cambiar de sucursal; 4) actualizar la vista; 5) copiar el correlation ID si aparece.
- **Resultado esperado:** la operación se bloquea con un código estable y no cambia datos.
- **Evidencia:** captura, hora, usuario, URL, request/correlation ID y resultado observado.
- **Severidad si falla:** Alta.
- **Módulo responsable:** Variants.
- **Diagnóstico:** usar el bundle sanitizado; nunca adjuntar cookies, tokens, contraseñas, PAN/CVV o payloads completos.

### G-06 — intentar sin permiso

- **Objetivo:** intentar sin permiso en Variants y confirmar que la respuesta sea autoritativa.
- **Rol:** ReadOnly.
- **Precondiciones:** entorno preparado; Organization Alpha (dataset Café Horizonte); sucursal Centro, salvo el caso cross-branch.
- **Pasos:** 1) iniciar sesión; 2) abrir Variants; 3) intentar sin permiso; 4) actualizar la vista; 5) copiar el correlation ID si aparece.
- **Resultado esperado:** la operación se bloquea con un código estable y no cambia datos.
- **Evidencia:** captura, hora, usuario, URL, request/correlation ID y resultado observado.
- **Severidad si falla:** Crítica.
- **Módulo responsable:** Variants.
- **Diagnóstico:** usar el bundle sanitizado; nunca adjuntar cookies, tokens, contraseñas, PAN/CVV o payloads completos.

## H. Pricing

### H-01 — consultar el estado autorizado

- **Objetivo:** consultar el estado autorizado en Pricing y confirmar que la respuesta sea autoritativa.
- **Rol:** Owner.
- **Precondiciones:** entorno preparado; Organization Alpha (dataset Café Horizonte); sucursal Centro, salvo el caso cross-branch.
- **Pasos:** 1) iniciar sesión; 2) abrir Pricing; 3) consultar el estado autorizado; 4) actualizar la vista; 5) copiar el correlation ID si aparece.
- **Resultado esperado:** la vista refleja el resultado persistido por el backend y el timeline conserva trazabilidad.
- **Evidencia:** captura, hora, usuario, URL, request/correlation ID y resultado observado.
- **Severidad si falla:** Media.
- **Módulo responsable:** Pricing.
- **Diagnóstico:** usar el bundle sanitizado; nunca adjuntar cookies, tokens, contraseñas, PAN/CVV o payloads completos.

### H-02 — ejecutar el flujo principal

- **Objetivo:** ejecutar el flujo principal en Pricing y confirmar que la respuesta sea autoritativa.
- **Rol:** Administrator.
- **Precondiciones:** entorno preparado; Organization Alpha (dataset Café Horizonte); sucursal Centro, salvo el caso cross-branch.
- **Pasos:** 1) iniciar sesión; 2) abrir Pricing; 3) ejecutar el flujo principal; 4) actualizar la vista; 5) copiar el correlation ID si aparece.
- **Resultado esperado:** la vista refleja el resultado persistido por el backend y el timeline conserva trazabilidad.
- **Evidencia:** captura, hora, usuario, URL, request/correlation ID y resultado observado.
- **Severidad si falla:** Media.
- **Módulo responsable:** Pricing.
- **Diagnóstico:** usar el bundle sanitizado; nunca adjuntar cookies, tokens, contraseñas, PAN/CVV o payloads completos.

### H-03 — validar un dato inválido

- **Objetivo:** validar un dato inválido en Pricing y confirmar que la respuesta sea autoritativa.
- **Rol:** Supervisor.
- **Precondiciones:** entorno preparado; Organization Alpha (dataset Café Horizonte); sucursal Centro, salvo el caso cross-branch.
- **Pasos:** 1) iniciar sesión; 2) abrir Pricing; 3) validar un dato inválido; 4) actualizar la vista; 5) copiar el correlation ID si aparece.
- **Resultado esperado:** la operación se bloquea con un código estable y no cambia datos.
- **Evidencia:** captura, hora, usuario, URL, request/correlation ID y resultado observado.
- **Severidad si falla:** Alta.
- **Módulo responsable:** Pricing.
- **Diagnóstico:** usar el bundle sanitizado; nunca adjuntar cookies, tokens, contraseñas, PAN/CVV o payloads completos.

### H-04 — repetir la intención idempotente

- **Objetivo:** repetir la intención idempotente en Pricing y confirmar que la respuesta sea autoritativa.
- **Rol:** Cashier.
- **Precondiciones:** entorno preparado; Organization Alpha (dataset Café Horizonte); sucursal Centro, salvo el caso cross-branch.
- **Pasos:** 1) iniciar sesión; 2) abrir Pricing; 3) repetir la intención idempotente; 4) actualizar la vista; 5) copiar el correlation ID si aparece.
- **Resultado esperado:** la operación se bloquea con un código estable y no cambia datos.
- **Evidencia:** captura, hora, usuario, URL, request/correlation ID y resultado observado.
- **Severidad si falla:** Alta.
- **Módulo responsable:** Pricing.
- **Diagnóstico:** usar el bundle sanitizado; nunca adjuntar cookies, tokens, contraseñas, PAN/CVV o payloads completos.

### H-05 — cambiar de sucursal

- **Objetivo:** cambiar de sucursal en Pricing y confirmar que la respuesta sea autoritativa.
- **Rol:** Employee.
- **Precondiciones:** entorno preparado; Organization Alpha (dataset Café Horizonte); sucursal Centro, salvo el caso cross-branch.
- **Pasos:** 1) iniciar sesión; 2) abrir Pricing; 3) cambiar de sucursal; 4) actualizar la vista; 5) copiar el correlation ID si aparece.
- **Resultado esperado:** la operación se bloquea con un código estable y no cambia datos.
- **Evidencia:** captura, hora, usuario, URL, request/correlation ID y resultado observado.
- **Severidad si falla:** Alta.
- **Módulo responsable:** Pricing.
- **Diagnóstico:** usar el bundle sanitizado; nunca adjuntar cookies, tokens, contraseñas, PAN/CVV o payloads completos.

### H-06 — intentar sin permiso

- **Objetivo:** intentar sin permiso en Pricing y confirmar que la respuesta sea autoritativa.
- **Rol:** ReadOnly.
- **Precondiciones:** entorno preparado; Organization Alpha (dataset Café Horizonte); sucursal Centro, salvo el caso cross-branch.
- **Pasos:** 1) iniciar sesión; 2) abrir Pricing; 3) intentar sin permiso; 4) actualizar la vista; 5) copiar el correlation ID si aparece.
- **Resultado esperado:** la operación se bloquea con un código estable y no cambia datos.
- **Evidencia:** captura, hora, usuario, URL, request/correlation ID y resultado observado.
- **Severidad si falla:** Crítica.
- **Módulo responsable:** Pricing.
- **Diagnóstico:** usar el bundle sanitizado; nunca adjuntar cookies, tokens, contraseñas, PAN/CVV o payloads completos.

## I. Inventory

### I-01 — consultar el estado autorizado

- **Objetivo:** consultar el estado autorizado en Inventory y confirmar que la respuesta sea autoritativa.
- **Rol:** Owner.
- **Precondiciones:** entorno preparado; Organization Alpha (dataset Café Horizonte); sucursal Centro, salvo el caso cross-branch.
- **Pasos:** 1) iniciar sesión; 2) abrir Inventory; 3) consultar el estado autorizado; 4) actualizar la vista; 5) copiar el correlation ID si aparece.
- **Resultado esperado:** la vista refleja el resultado persistido por el backend y el timeline conserva trazabilidad.
- **Evidencia:** captura, hora, usuario, URL, request/correlation ID y resultado observado.
- **Severidad si falla:** Media.
- **Módulo responsable:** Inventory.
- **Diagnóstico:** usar el bundle sanitizado; nunca adjuntar cookies, tokens, contraseñas, PAN/CVV o payloads completos.

### I-02 — ejecutar el flujo principal

- **Objetivo:** ejecutar el flujo principal en Inventory y confirmar que la respuesta sea autoritativa.
- **Rol:** Administrator.
- **Precondiciones:** entorno preparado; Organization Alpha (dataset Café Horizonte); sucursal Centro, salvo el caso cross-branch.
- **Pasos:** 1) iniciar sesión; 2) abrir Inventory; 3) ejecutar el flujo principal; 4) actualizar la vista; 5) copiar el correlation ID si aparece.
- **Resultado esperado:** la vista refleja el resultado persistido por el backend y el timeline conserva trazabilidad.
- **Evidencia:** captura, hora, usuario, URL, request/correlation ID y resultado observado.
- **Severidad si falla:** Media.
- **Módulo responsable:** Inventory.
- **Diagnóstico:** usar el bundle sanitizado; nunca adjuntar cookies, tokens, contraseñas, PAN/CVV o payloads completos.

### I-03 — validar un dato inválido

- **Objetivo:** validar un dato inválido en Inventory y confirmar que la respuesta sea autoritativa.
- **Rol:** Supervisor.
- **Precondiciones:** entorno preparado; Organization Alpha (dataset Café Horizonte); sucursal Centro, salvo el caso cross-branch.
- **Pasos:** 1) iniciar sesión; 2) abrir Inventory; 3) validar un dato inválido; 4) actualizar la vista; 5) copiar el correlation ID si aparece.
- **Resultado esperado:** la operación se bloquea con un código estable y no cambia datos.
- **Evidencia:** captura, hora, usuario, URL, request/correlation ID y resultado observado.
- **Severidad si falla:** Alta.
- **Módulo responsable:** Inventory.
- **Diagnóstico:** usar el bundle sanitizado; nunca adjuntar cookies, tokens, contraseñas, PAN/CVV o payloads completos.

### I-04 — repetir la intención idempotente

- **Objetivo:** repetir la intención idempotente en Inventory y confirmar que la respuesta sea autoritativa.
- **Rol:** Cashier.
- **Precondiciones:** entorno preparado; Organization Alpha (dataset Café Horizonte); sucursal Centro, salvo el caso cross-branch.
- **Pasos:** 1) iniciar sesión; 2) abrir Inventory; 3) repetir la intención idempotente; 4) actualizar la vista; 5) copiar el correlation ID si aparece.
- **Resultado esperado:** la operación se bloquea con un código estable y no cambia datos.
- **Evidencia:** captura, hora, usuario, URL, request/correlation ID y resultado observado.
- **Severidad si falla:** Alta.
- **Módulo responsable:** Inventory.
- **Diagnóstico:** usar el bundle sanitizado; nunca adjuntar cookies, tokens, contraseñas, PAN/CVV o payloads completos.

### I-05 — cambiar de sucursal

- **Objetivo:** cambiar de sucursal en Inventory y confirmar que la respuesta sea autoritativa.
- **Rol:** Employee.
- **Precondiciones:** entorno preparado; Organization Alpha (dataset Café Horizonte); sucursal Centro, salvo el caso cross-branch.
- **Pasos:** 1) iniciar sesión; 2) abrir Inventory; 3) cambiar de sucursal; 4) actualizar la vista; 5) copiar el correlation ID si aparece.
- **Resultado esperado:** la operación se bloquea con un código estable y no cambia datos.
- **Evidencia:** captura, hora, usuario, URL, request/correlation ID y resultado observado.
- **Severidad si falla:** Alta.
- **Módulo responsable:** Inventory.
- **Diagnóstico:** usar el bundle sanitizado; nunca adjuntar cookies, tokens, contraseñas, PAN/CVV o payloads completos.

### I-06 — intentar sin permiso

- **Objetivo:** intentar sin permiso en Inventory y confirmar que la respuesta sea autoritativa.
- **Rol:** ReadOnly.
- **Precondiciones:** entorno preparado; Organization Alpha (dataset Café Horizonte); sucursal Centro, salvo el caso cross-branch.
- **Pasos:** 1) iniciar sesión; 2) abrir Inventory; 3) intentar sin permiso; 4) actualizar la vista; 5) copiar el correlation ID si aparece.
- **Resultado esperado:** la operación se bloquea con un código estable y no cambia datos.
- **Evidencia:** captura, hora, usuario, URL, request/correlation ID y resultado observado.
- **Severidad si falla:** Crítica.
- **Módulo responsable:** Inventory.
- **Diagnóstico:** usar el bundle sanitizado; nunca adjuntar cookies, tokens, contraseñas, PAN/CVV o payloads completos.

## J. Sales

### J-01 — consultar el estado autorizado

- **Objetivo:** consultar el estado autorizado en Sales y confirmar que la respuesta sea autoritativa.
- **Rol:** Owner.
- **Precondiciones:** entorno preparado; Organization Alpha (dataset Café Horizonte); sucursal Centro, salvo el caso cross-branch.
- **Pasos:** 1) iniciar sesión; 2) abrir Sales; 3) consultar el estado autorizado; 4) actualizar la vista; 5) copiar el correlation ID si aparece.
- **Resultado esperado:** la vista refleja el resultado persistido por el backend y el timeline conserva trazabilidad.
- **Evidencia:** captura, hora, usuario, URL, request/correlation ID y resultado observado.
- **Severidad si falla:** Media.
- **Módulo responsable:** Sales.
- **Diagnóstico:** usar el bundle sanitizado; nunca adjuntar cookies, tokens, contraseñas, PAN/CVV o payloads completos.

### J-02 — ejecutar el flujo principal

- **Objetivo:** ejecutar el flujo principal en Sales y confirmar que la respuesta sea autoritativa.
- **Rol:** Administrator.
- **Precondiciones:** entorno preparado; Organization Alpha (dataset Café Horizonte); sucursal Centro, salvo el caso cross-branch.
- **Pasos:** 1) iniciar sesión; 2) abrir Sales; 3) ejecutar el flujo principal; 4) actualizar la vista; 5) copiar el correlation ID si aparece.
- **Resultado esperado:** la vista refleja el resultado persistido por el backend y el timeline conserva trazabilidad.
- **Evidencia:** captura, hora, usuario, URL, request/correlation ID y resultado observado.
- **Severidad si falla:** Media.
- **Módulo responsable:** Sales.
- **Diagnóstico:** usar el bundle sanitizado; nunca adjuntar cookies, tokens, contraseñas, PAN/CVV o payloads completos.

### J-03 — validar un dato inválido

- **Objetivo:** validar un dato inválido en Sales y confirmar que la respuesta sea autoritativa.
- **Rol:** Supervisor.
- **Precondiciones:** entorno preparado; Organization Alpha (dataset Café Horizonte); sucursal Centro, salvo el caso cross-branch.
- **Pasos:** 1) iniciar sesión; 2) abrir Sales; 3) validar un dato inválido; 4) actualizar la vista; 5) copiar el correlation ID si aparece.
- **Resultado esperado:** la operación se bloquea con un código estable y no cambia datos.
- **Evidencia:** captura, hora, usuario, URL, request/correlation ID y resultado observado.
- **Severidad si falla:** Alta.
- **Módulo responsable:** Sales.
- **Diagnóstico:** usar el bundle sanitizado; nunca adjuntar cookies, tokens, contraseñas, PAN/CVV o payloads completos.

### J-04 — repetir la intención idempotente

- **Objetivo:** repetir la intención idempotente en Sales y confirmar que la respuesta sea autoritativa.
- **Rol:** Cashier.
- **Precondiciones:** entorno preparado; Organization Alpha (dataset Café Horizonte); sucursal Centro, salvo el caso cross-branch.
- **Pasos:** 1) iniciar sesión; 2) abrir Sales; 3) repetir la intención idempotente; 4) actualizar la vista; 5) copiar el correlation ID si aparece.
- **Resultado esperado:** la operación se bloquea con un código estable y no cambia datos.
- **Evidencia:** captura, hora, usuario, URL, request/correlation ID y resultado observado.
- **Severidad si falla:** Alta.
- **Módulo responsable:** Sales.
- **Diagnóstico:** usar el bundle sanitizado; nunca adjuntar cookies, tokens, contraseñas, PAN/CVV o payloads completos.

### J-05 — cambiar de sucursal

- **Objetivo:** cambiar de sucursal en Sales y confirmar que la respuesta sea autoritativa.
- **Rol:** Employee.
- **Precondiciones:** entorno preparado; Organization Alpha (dataset Café Horizonte); sucursal Centro, salvo el caso cross-branch.
- **Pasos:** 1) iniciar sesión; 2) abrir Sales; 3) cambiar de sucursal; 4) actualizar la vista; 5) copiar el correlation ID si aparece.
- **Resultado esperado:** la operación se bloquea con un código estable y no cambia datos.
- **Evidencia:** captura, hora, usuario, URL, request/correlation ID y resultado observado.
- **Severidad si falla:** Alta.
- **Módulo responsable:** Sales.
- **Diagnóstico:** usar el bundle sanitizado; nunca adjuntar cookies, tokens, contraseñas, PAN/CVV o payloads completos.

### J-06 — intentar sin permiso

- **Objetivo:** intentar sin permiso en Sales y confirmar que la respuesta sea autoritativa.
- **Rol:** ReadOnly.
- **Precondiciones:** entorno preparado; Organization Alpha (dataset Café Horizonte); sucursal Centro, salvo el caso cross-branch.
- **Pasos:** 1) iniciar sesión; 2) abrir Sales; 3) intentar sin permiso; 4) actualizar la vista; 5) copiar el correlation ID si aparece.
- **Resultado esperado:** la operación se bloquea con un código estable y no cambia datos.
- **Evidencia:** captura, hora, usuario, URL, request/correlation ID y resultado observado.
- **Severidad si falla:** Crítica.
- **Módulo responsable:** Sales.
- **Diagnóstico:** usar el bundle sanitizado; nunca adjuntar cookies, tokens, contraseñas, PAN/CVV o payloads completos.

## K. Payments

### K-01 — consultar el estado autorizado

- **Objetivo:** consultar el estado autorizado en Payments y confirmar que la respuesta sea autoritativa.
- **Rol:** Owner.
- **Precondiciones:** entorno preparado; Organization Alpha (dataset Café Horizonte); sucursal Centro, salvo el caso cross-branch.
- **Pasos:** 1) iniciar sesión; 2) abrir Payments; 3) consultar el estado autorizado; 4) actualizar la vista; 5) copiar el correlation ID si aparece.
- **Resultado esperado:** la vista refleja el resultado persistido por el backend y el timeline conserva trazabilidad.
- **Evidencia:** captura, hora, usuario, URL, request/correlation ID y resultado observado.
- **Severidad si falla:** Media.
- **Módulo responsable:** Payments.
- **Diagnóstico:** usar el bundle sanitizado; nunca adjuntar cookies, tokens, contraseñas, PAN/CVV o payloads completos.

### K-02 — ejecutar el flujo principal

- **Objetivo:** ejecutar el flujo principal en Payments y confirmar que la respuesta sea autoritativa.
- **Rol:** Administrator.
- **Precondiciones:** entorno preparado; Organization Alpha (dataset Café Horizonte); sucursal Centro, salvo el caso cross-branch.
- **Pasos:** 1) iniciar sesión; 2) abrir Payments; 3) ejecutar el flujo principal; 4) actualizar la vista; 5) copiar el correlation ID si aparece.
- **Resultado esperado:** la vista refleja el resultado persistido por el backend y el timeline conserva trazabilidad.
- **Evidencia:** captura, hora, usuario, URL, request/correlation ID y resultado observado.
- **Severidad si falla:** Media.
- **Módulo responsable:** Payments.
- **Diagnóstico:** usar el bundle sanitizado; nunca adjuntar cookies, tokens, contraseñas, PAN/CVV o payloads completos.

### K-03 — validar un dato inválido

- **Objetivo:** validar un dato inválido en Payments y confirmar que la respuesta sea autoritativa.
- **Rol:** Supervisor.
- **Precondiciones:** entorno preparado; Organization Alpha (dataset Café Horizonte); sucursal Centro, salvo el caso cross-branch.
- **Pasos:** 1) iniciar sesión; 2) abrir Payments; 3) validar un dato inválido; 4) actualizar la vista; 5) copiar el correlation ID si aparece.
- **Resultado esperado:** la operación se bloquea con un código estable y no cambia datos.
- **Evidencia:** captura, hora, usuario, URL, request/correlation ID y resultado observado.
- **Severidad si falla:** Alta.
- **Módulo responsable:** Payments.
- **Diagnóstico:** usar el bundle sanitizado; nunca adjuntar cookies, tokens, contraseñas, PAN/CVV o payloads completos.

### K-04 — repetir la intención idempotente

- **Objetivo:** repetir la intención idempotente en Payments y confirmar que la respuesta sea autoritativa.
- **Rol:** Cashier.
- **Precondiciones:** entorno preparado; Organization Alpha (dataset Café Horizonte); sucursal Centro, salvo el caso cross-branch.
- **Pasos:** 1) iniciar sesión; 2) abrir Payments; 3) repetir la intención idempotente; 4) actualizar la vista; 5) copiar el correlation ID si aparece.
- **Resultado esperado:** la operación se bloquea con un código estable y no cambia datos.
- **Evidencia:** captura, hora, usuario, URL, request/correlation ID y resultado observado.
- **Severidad si falla:** Alta.
- **Módulo responsable:** Payments.
- **Diagnóstico:** usar el bundle sanitizado; nunca adjuntar cookies, tokens, contraseñas, PAN/CVV o payloads completos.

### K-05 — cambiar de sucursal

- **Objetivo:** cambiar de sucursal en Payments y confirmar que la respuesta sea autoritativa.
- **Rol:** Employee.
- **Precondiciones:** entorno preparado; Organization Alpha (dataset Café Horizonte); sucursal Centro, salvo el caso cross-branch.
- **Pasos:** 1) iniciar sesión; 2) abrir Payments; 3) cambiar de sucursal; 4) actualizar la vista; 5) copiar el correlation ID si aparece.
- **Resultado esperado:** la operación se bloquea con un código estable y no cambia datos.
- **Evidencia:** captura, hora, usuario, URL, request/correlation ID y resultado observado.
- **Severidad si falla:** Alta.
- **Módulo responsable:** Payments.
- **Diagnóstico:** usar el bundle sanitizado; nunca adjuntar cookies, tokens, contraseñas, PAN/CVV o payloads completos.

### K-06 — intentar sin permiso

- **Objetivo:** intentar sin permiso en Payments y confirmar que la respuesta sea autoritativa.
- **Rol:** ReadOnly.
- **Precondiciones:** entorno preparado; Organization Alpha (dataset Café Horizonte); sucursal Centro, salvo el caso cross-branch.
- **Pasos:** 1) iniciar sesión; 2) abrir Payments; 3) intentar sin permiso; 4) actualizar la vista; 5) copiar el correlation ID si aparece.
- **Resultado esperado:** la operación se bloquea con un código estable y no cambia datos.
- **Evidencia:** captura, hora, usuario, URL, request/correlation ID y resultado observado.
- **Severidad si falla:** Crítica.
- **Módulo responsable:** Payments.
- **Diagnóstico:** usar el bundle sanitizado; nunca adjuntar cookies, tokens, contraseñas, PAN/CVV o payloads completos.

## L. Suspended Sales

### L-01 — consultar el estado autorizado

- **Objetivo:** consultar el estado autorizado en Suspended Sales y confirmar que la respuesta sea autoritativa.
- **Rol:** Owner.
- **Precondiciones:** entorno preparado; Organization Alpha (dataset Café Horizonte); sucursal Centro, salvo el caso cross-branch.
- **Pasos:** 1) iniciar sesión; 2) abrir Suspended Sales; 3) consultar el estado autorizado; 4) actualizar la vista; 5) copiar el correlation ID si aparece.
- **Resultado esperado:** la vista refleja el resultado persistido por el backend y el timeline conserva trazabilidad.
- **Evidencia:** captura, hora, usuario, URL, request/correlation ID y resultado observado.
- **Severidad si falla:** Media.
- **Módulo responsable:** Suspended Sales.
- **Diagnóstico:** usar el bundle sanitizado; nunca adjuntar cookies, tokens, contraseñas, PAN/CVV o payloads completos.

### L-02 — ejecutar el flujo principal

- **Objetivo:** ejecutar el flujo principal en Suspended Sales y confirmar que la respuesta sea autoritativa.
- **Rol:** Administrator.
- **Precondiciones:** entorno preparado; Organization Alpha (dataset Café Horizonte); sucursal Centro, salvo el caso cross-branch.
- **Pasos:** 1) iniciar sesión; 2) abrir Suspended Sales; 3) ejecutar el flujo principal; 4) actualizar la vista; 5) copiar el correlation ID si aparece.
- **Resultado esperado:** la vista refleja el resultado persistido por el backend y el timeline conserva trazabilidad.
- **Evidencia:** captura, hora, usuario, URL, request/correlation ID y resultado observado.
- **Severidad si falla:** Media.
- **Módulo responsable:** Suspended Sales.
- **Diagnóstico:** usar el bundle sanitizado; nunca adjuntar cookies, tokens, contraseñas, PAN/CVV o payloads completos.

### L-03 — validar un dato inválido

- **Objetivo:** validar un dato inválido en Suspended Sales y confirmar que la respuesta sea autoritativa.
- **Rol:** Supervisor.
- **Precondiciones:** entorno preparado; Organization Alpha (dataset Café Horizonte); sucursal Centro, salvo el caso cross-branch.
- **Pasos:** 1) iniciar sesión; 2) abrir Suspended Sales; 3) validar un dato inválido; 4) actualizar la vista; 5) copiar el correlation ID si aparece.
- **Resultado esperado:** la operación se bloquea con un código estable y no cambia datos.
- **Evidencia:** captura, hora, usuario, URL, request/correlation ID y resultado observado.
- **Severidad si falla:** Alta.
- **Módulo responsable:** Suspended Sales.
- **Diagnóstico:** usar el bundle sanitizado; nunca adjuntar cookies, tokens, contraseñas, PAN/CVV o payloads completos.

### L-04 — repetir la intención idempotente

- **Objetivo:** repetir la intención idempotente en Suspended Sales y confirmar que la respuesta sea autoritativa.
- **Rol:** Cashier.
- **Precondiciones:** entorno preparado; Organization Alpha (dataset Café Horizonte); sucursal Centro, salvo el caso cross-branch.
- **Pasos:** 1) iniciar sesión; 2) abrir Suspended Sales; 3) repetir la intención idempotente; 4) actualizar la vista; 5) copiar el correlation ID si aparece.
- **Resultado esperado:** la operación se bloquea con un código estable y no cambia datos.
- **Evidencia:** captura, hora, usuario, URL, request/correlation ID y resultado observado.
- **Severidad si falla:** Alta.
- **Módulo responsable:** Suspended Sales.
- **Diagnóstico:** usar el bundle sanitizado; nunca adjuntar cookies, tokens, contraseñas, PAN/CVV o payloads completos.

### L-05 — cambiar de sucursal

- **Objetivo:** cambiar de sucursal en Suspended Sales y confirmar que la respuesta sea autoritativa.
- **Rol:** Employee.
- **Precondiciones:** entorno preparado; Organization Alpha (dataset Café Horizonte); sucursal Centro, salvo el caso cross-branch.
- **Pasos:** 1) iniciar sesión; 2) abrir Suspended Sales; 3) cambiar de sucursal; 4) actualizar la vista; 5) copiar el correlation ID si aparece.
- **Resultado esperado:** la operación se bloquea con un código estable y no cambia datos.
- **Evidencia:** captura, hora, usuario, URL, request/correlation ID y resultado observado.
- **Severidad si falla:** Alta.
- **Módulo responsable:** Suspended Sales.
- **Diagnóstico:** usar el bundle sanitizado; nunca adjuntar cookies, tokens, contraseñas, PAN/CVV o payloads completos.

### L-06 — intentar sin permiso

- **Objetivo:** intentar sin permiso en Suspended Sales y confirmar que la respuesta sea autoritativa.
- **Rol:** ReadOnly.
- **Precondiciones:** entorno preparado; Organization Alpha (dataset Café Horizonte); sucursal Centro, salvo el caso cross-branch.
- **Pasos:** 1) iniciar sesión; 2) abrir Suspended Sales; 3) intentar sin permiso; 4) actualizar la vista; 5) copiar el correlation ID si aparece.
- **Resultado esperado:** la operación se bloquea con un código estable y no cambia datos.
- **Evidencia:** captura, hora, usuario, URL, request/correlation ID y resultado observado.
- **Severidad si falla:** Crítica.
- **Módulo responsable:** Suspended Sales.
- **Diagnóstico:** usar el bundle sanitizado; nunca adjuntar cookies, tokens, contraseñas, PAN/CVV o payloads completos.

## M. Cancellations

### M-01 — consultar el estado autorizado

- **Objetivo:** consultar el estado autorizado en Cancellations y confirmar que la respuesta sea autoritativa.
- **Rol:** Owner.
- **Precondiciones:** entorno preparado; Organization Alpha (dataset Café Horizonte); sucursal Centro, salvo el caso cross-branch.
- **Pasos:** 1) iniciar sesión; 2) abrir Cancellations; 3) consultar el estado autorizado; 4) actualizar la vista; 5) copiar el correlation ID si aparece.
- **Resultado esperado:** la vista refleja el resultado persistido por el backend y el timeline conserva trazabilidad.
- **Evidencia:** captura, hora, usuario, URL, request/correlation ID y resultado observado.
- **Severidad si falla:** Media.
- **Módulo responsable:** Cancellations.
- **Diagnóstico:** usar el bundle sanitizado; nunca adjuntar cookies, tokens, contraseñas, PAN/CVV o payloads completos.

### M-02 — ejecutar el flujo principal

- **Objetivo:** ejecutar el flujo principal en Cancellations y confirmar que la respuesta sea autoritativa.
- **Rol:** Administrator.
- **Precondiciones:** entorno preparado; Organization Alpha (dataset Café Horizonte); sucursal Centro, salvo el caso cross-branch.
- **Pasos:** 1) iniciar sesión; 2) abrir Cancellations; 3) ejecutar el flujo principal; 4) actualizar la vista; 5) copiar el correlation ID si aparece.
- **Resultado esperado:** la vista refleja el resultado persistido por el backend y el timeline conserva trazabilidad.
- **Evidencia:** captura, hora, usuario, URL, request/correlation ID y resultado observado.
- **Severidad si falla:** Media.
- **Módulo responsable:** Cancellations.
- **Diagnóstico:** usar el bundle sanitizado; nunca adjuntar cookies, tokens, contraseñas, PAN/CVV o payloads completos.

### M-03 — validar un dato inválido

- **Objetivo:** validar un dato inválido en Cancellations y confirmar que la respuesta sea autoritativa.
- **Rol:** Supervisor.
- **Precondiciones:** entorno preparado; Organization Alpha (dataset Café Horizonte); sucursal Centro, salvo el caso cross-branch.
- **Pasos:** 1) iniciar sesión; 2) abrir Cancellations; 3) validar un dato inválido; 4) actualizar la vista; 5) copiar el correlation ID si aparece.
- **Resultado esperado:** la operación se bloquea con un código estable y no cambia datos.
- **Evidencia:** captura, hora, usuario, URL, request/correlation ID y resultado observado.
- **Severidad si falla:** Alta.
- **Módulo responsable:** Cancellations.
- **Diagnóstico:** usar el bundle sanitizado; nunca adjuntar cookies, tokens, contraseñas, PAN/CVV o payloads completos.

### M-04 — repetir la intención idempotente

- **Objetivo:** repetir la intención idempotente en Cancellations y confirmar que la respuesta sea autoritativa.
- **Rol:** Cashier.
- **Precondiciones:** entorno preparado; Organization Alpha (dataset Café Horizonte); sucursal Centro, salvo el caso cross-branch.
- **Pasos:** 1) iniciar sesión; 2) abrir Cancellations; 3) repetir la intención idempotente; 4) actualizar la vista; 5) copiar el correlation ID si aparece.
- **Resultado esperado:** la operación se bloquea con un código estable y no cambia datos.
- **Evidencia:** captura, hora, usuario, URL, request/correlation ID y resultado observado.
- **Severidad si falla:** Alta.
- **Módulo responsable:** Cancellations.
- **Diagnóstico:** usar el bundle sanitizado; nunca adjuntar cookies, tokens, contraseñas, PAN/CVV o payloads completos.

### M-05 — cambiar de sucursal

- **Objetivo:** cambiar de sucursal en Cancellations y confirmar que la respuesta sea autoritativa.
- **Rol:** Employee.
- **Precondiciones:** entorno preparado; Organization Alpha (dataset Café Horizonte); sucursal Centro, salvo el caso cross-branch.
- **Pasos:** 1) iniciar sesión; 2) abrir Cancellations; 3) cambiar de sucursal; 4) actualizar la vista; 5) copiar el correlation ID si aparece.
- **Resultado esperado:** la operación se bloquea con un código estable y no cambia datos.
- **Evidencia:** captura, hora, usuario, URL, request/correlation ID y resultado observado.
- **Severidad si falla:** Alta.
- **Módulo responsable:** Cancellations.
- **Diagnóstico:** usar el bundle sanitizado; nunca adjuntar cookies, tokens, contraseñas, PAN/CVV o payloads completos.

### M-06 — intentar sin permiso

- **Objetivo:** intentar sin permiso en Cancellations y confirmar que la respuesta sea autoritativa.
- **Rol:** ReadOnly.
- **Precondiciones:** entorno preparado; Organization Alpha (dataset Café Horizonte); sucursal Centro, salvo el caso cross-branch.
- **Pasos:** 1) iniciar sesión; 2) abrir Cancellations; 3) intentar sin permiso; 4) actualizar la vista; 5) copiar el correlation ID si aparece.
- **Resultado esperado:** la operación se bloquea con un código estable y no cambia datos.
- **Evidencia:** captura, hora, usuario, URL, request/correlation ID y resultado observado.
- **Severidad si falla:** Crítica.
- **Módulo responsable:** Cancellations.
- **Diagnóstico:** usar el bundle sanitizado; nunca adjuntar cookies, tokens, contraseñas, PAN/CVV o payloads completos.

## N. Refunds

### N-01 — consultar el estado autorizado

- **Objetivo:** consultar el estado autorizado en Refunds y confirmar que la respuesta sea autoritativa.
- **Rol:** Owner.
- **Precondiciones:** entorno preparado; Organization Alpha (dataset Café Horizonte); sucursal Centro, salvo el caso cross-branch.
- **Pasos:** 1) iniciar sesión; 2) abrir Refunds; 3) consultar el estado autorizado; 4) actualizar la vista; 5) copiar el correlation ID si aparece.
- **Resultado esperado:** la vista refleja el resultado persistido por el backend y el timeline conserva trazabilidad.
- **Evidencia:** captura, hora, usuario, URL, request/correlation ID y resultado observado.
- **Severidad si falla:** Media.
- **Módulo responsable:** Refunds.
- **Diagnóstico:** usar el bundle sanitizado; nunca adjuntar cookies, tokens, contraseñas, PAN/CVV o payloads completos.

### N-02 — ejecutar el flujo principal

- **Objetivo:** ejecutar el flujo principal en Refunds y confirmar que la respuesta sea autoritativa.
- **Rol:** Administrator.
- **Precondiciones:** entorno preparado; Organization Alpha (dataset Café Horizonte); sucursal Centro, salvo el caso cross-branch.
- **Pasos:** 1) iniciar sesión; 2) abrir Refunds; 3) ejecutar el flujo principal; 4) actualizar la vista; 5) copiar el correlation ID si aparece.
- **Resultado esperado:** la vista refleja el resultado persistido por el backend y el timeline conserva trazabilidad.
- **Evidencia:** captura, hora, usuario, URL, request/correlation ID y resultado observado.
- **Severidad si falla:** Media.
- **Módulo responsable:** Refunds.
- **Diagnóstico:** usar el bundle sanitizado; nunca adjuntar cookies, tokens, contraseñas, PAN/CVV o payloads completos.

### N-03 — validar un dato inválido

- **Objetivo:** validar un dato inválido en Refunds y confirmar que la respuesta sea autoritativa.
- **Rol:** Supervisor.
- **Precondiciones:** entorno preparado; Organization Alpha (dataset Café Horizonte); sucursal Centro, salvo el caso cross-branch.
- **Pasos:** 1) iniciar sesión; 2) abrir Refunds; 3) validar un dato inválido; 4) actualizar la vista; 5) copiar el correlation ID si aparece.
- **Resultado esperado:** la operación se bloquea con un código estable y no cambia datos.
- **Evidencia:** captura, hora, usuario, URL, request/correlation ID y resultado observado.
- **Severidad si falla:** Alta.
- **Módulo responsable:** Refunds.
- **Diagnóstico:** usar el bundle sanitizado; nunca adjuntar cookies, tokens, contraseñas, PAN/CVV o payloads completos.

### N-04 — repetir la intención idempotente

- **Objetivo:** repetir la intención idempotente en Refunds y confirmar que la respuesta sea autoritativa.
- **Rol:** Cashier.
- **Precondiciones:** entorno preparado; Organization Alpha (dataset Café Horizonte); sucursal Centro, salvo el caso cross-branch.
- **Pasos:** 1) iniciar sesión; 2) abrir Refunds; 3) repetir la intención idempotente; 4) actualizar la vista; 5) copiar el correlation ID si aparece.
- **Resultado esperado:** la operación se bloquea con un código estable y no cambia datos.
- **Evidencia:** captura, hora, usuario, URL, request/correlation ID y resultado observado.
- **Severidad si falla:** Alta.
- **Módulo responsable:** Refunds.
- **Diagnóstico:** usar el bundle sanitizado; nunca adjuntar cookies, tokens, contraseñas, PAN/CVV o payloads completos.

### N-05 — cambiar de sucursal

- **Objetivo:** cambiar de sucursal en Refunds y confirmar que la respuesta sea autoritativa.
- **Rol:** Employee.
- **Precondiciones:** entorno preparado; Organization Alpha (dataset Café Horizonte); sucursal Centro, salvo el caso cross-branch.
- **Pasos:** 1) iniciar sesión; 2) abrir Refunds; 3) cambiar de sucursal; 4) actualizar la vista; 5) copiar el correlation ID si aparece.
- **Resultado esperado:** la operación se bloquea con un código estable y no cambia datos.
- **Evidencia:** captura, hora, usuario, URL, request/correlation ID y resultado observado.
- **Severidad si falla:** Alta.
- **Módulo responsable:** Refunds.
- **Diagnóstico:** usar el bundle sanitizado; nunca adjuntar cookies, tokens, contraseñas, PAN/CVV o payloads completos.

### N-06 — intentar sin permiso

- **Objetivo:** intentar sin permiso en Refunds y confirmar que la respuesta sea autoritativa.
- **Rol:** ReadOnly.
- **Precondiciones:** entorno preparado; Organization Alpha (dataset Café Horizonte); sucursal Centro, salvo el caso cross-branch.
- **Pasos:** 1) iniciar sesión; 2) abrir Refunds; 3) intentar sin permiso; 4) actualizar la vista; 5) copiar el correlation ID si aparece.
- **Resultado esperado:** la operación se bloquea con un código estable y no cambia datos.
- **Evidencia:** captura, hora, usuario, URL, request/correlation ID y resultado observado.
- **Severidad si falla:** Crítica.
- **Módulo responsable:** Refunds.
- **Diagnóstico:** usar el bundle sanitizado; nunca adjuntar cookies, tokens, contraseñas, PAN/CVV o payloads completos.

## O. Receipts

### O-01 — consultar el estado autorizado

- **Objetivo:** consultar el estado autorizado en Receipts y confirmar que la respuesta sea autoritativa.
- **Rol:** Owner.
- **Precondiciones:** entorno preparado; Organization Alpha (dataset Café Horizonte); sucursal Centro, salvo el caso cross-branch.
- **Pasos:** 1) iniciar sesión; 2) abrir Receipts; 3) consultar el estado autorizado; 4) actualizar la vista; 5) copiar el correlation ID si aparece.
- **Resultado esperado:** la vista refleja el resultado persistido por el backend y el timeline conserva trazabilidad.
- **Evidencia:** captura, hora, usuario, URL, request/correlation ID y resultado observado.
- **Severidad si falla:** Media.
- **Módulo responsable:** Receipts.
- **Diagnóstico:** usar el bundle sanitizado; nunca adjuntar cookies, tokens, contraseñas, PAN/CVV o payloads completos.

### O-02 — ejecutar el flujo principal

- **Objetivo:** ejecutar el flujo principal en Receipts y confirmar que la respuesta sea autoritativa.
- **Rol:** Administrator.
- **Precondiciones:** entorno preparado; Organization Alpha (dataset Café Horizonte); sucursal Centro, salvo el caso cross-branch.
- **Pasos:** 1) iniciar sesión; 2) abrir Receipts; 3) ejecutar el flujo principal; 4) actualizar la vista; 5) copiar el correlation ID si aparece.
- **Resultado esperado:** la vista refleja el resultado persistido por el backend y el timeline conserva trazabilidad.
- **Evidencia:** captura, hora, usuario, URL, request/correlation ID y resultado observado.
- **Severidad si falla:** Media.
- **Módulo responsable:** Receipts.
- **Diagnóstico:** usar el bundle sanitizado; nunca adjuntar cookies, tokens, contraseñas, PAN/CVV o payloads completos.

### O-03 — validar un dato inválido

- **Objetivo:** validar un dato inválido en Receipts y confirmar que la respuesta sea autoritativa.
- **Rol:** Supervisor.
- **Precondiciones:** entorno preparado; Organization Alpha (dataset Café Horizonte); sucursal Centro, salvo el caso cross-branch.
- **Pasos:** 1) iniciar sesión; 2) abrir Receipts; 3) validar un dato inválido; 4) actualizar la vista; 5) copiar el correlation ID si aparece.
- **Resultado esperado:** la operación se bloquea con un código estable y no cambia datos.
- **Evidencia:** captura, hora, usuario, URL, request/correlation ID y resultado observado.
- **Severidad si falla:** Alta.
- **Módulo responsable:** Receipts.
- **Diagnóstico:** usar el bundle sanitizado; nunca adjuntar cookies, tokens, contraseñas, PAN/CVV o payloads completos.

### O-04 — repetir la intención idempotente

- **Objetivo:** repetir la intención idempotente en Receipts y confirmar que la respuesta sea autoritativa.
- **Rol:** Cashier.
- **Precondiciones:** entorno preparado; Organization Alpha (dataset Café Horizonte); sucursal Centro, salvo el caso cross-branch.
- **Pasos:** 1) iniciar sesión; 2) abrir Receipts; 3) repetir la intención idempotente; 4) actualizar la vista; 5) copiar el correlation ID si aparece.
- **Resultado esperado:** la operación se bloquea con un código estable y no cambia datos.
- **Evidencia:** captura, hora, usuario, URL, request/correlation ID y resultado observado.
- **Severidad si falla:** Alta.
- **Módulo responsable:** Receipts.
- **Diagnóstico:** usar el bundle sanitizado; nunca adjuntar cookies, tokens, contraseñas, PAN/CVV o payloads completos.

### O-05 — cambiar de sucursal

- **Objetivo:** cambiar de sucursal en Receipts y confirmar que la respuesta sea autoritativa.
- **Rol:** Employee.
- **Precondiciones:** entorno preparado; Organization Alpha (dataset Café Horizonte); sucursal Centro, salvo el caso cross-branch.
- **Pasos:** 1) iniciar sesión; 2) abrir Receipts; 3) cambiar de sucursal; 4) actualizar la vista; 5) copiar el correlation ID si aparece.
- **Resultado esperado:** la operación se bloquea con un código estable y no cambia datos.
- **Evidencia:** captura, hora, usuario, URL, request/correlation ID y resultado observado.
- **Severidad si falla:** Alta.
- **Módulo responsable:** Receipts.
- **Diagnóstico:** usar el bundle sanitizado; nunca adjuntar cookies, tokens, contraseñas, PAN/CVV o payloads completos.

### O-06 — intentar sin permiso

- **Objetivo:** intentar sin permiso en Receipts y confirmar que la respuesta sea autoritativa.
- **Rol:** ReadOnly.
- **Precondiciones:** entorno preparado; Organization Alpha (dataset Café Horizonte); sucursal Centro, salvo el caso cross-branch.
- **Pasos:** 1) iniciar sesión; 2) abrir Receipts; 3) intentar sin permiso; 4) actualizar la vista; 5) copiar el correlation ID si aparece.
- **Resultado esperado:** la operación se bloquea con un código estable y no cambia datos.
- **Evidencia:** captura, hora, usuario, URL, request/correlation ID y resultado observado.
- **Severidad si falla:** Crítica.
- **Módulo responsable:** Receipts.
- **Diagnóstico:** usar el bundle sanitizado; nunca adjuntar cookies, tokens, contraseñas, PAN/CVV o payloads completos.

## P. Cash Sessions

### P-01 — consultar el estado autorizado

- **Objetivo:** consultar el estado autorizado en Cash Sessions y confirmar que la respuesta sea autoritativa.
- **Rol:** Owner.
- **Precondiciones:** entorno preparado; Organization Alpha (dataset Café Horizonte); sucursal Centro, salvo el caso cross-branch.
- **Pasos:** 1) iniciar sesión; 2) abrir Cash Sessions; 3) consultar el estado autorizado; 4) actualizar la vista; 5) copiar el correlation ID si aparece.
- **Resultado esperado:** la vista refleja el resultado persistido por el backend y el timeline conserva trazabilidad.
- **Evidencia:** captura, hora, usuario, URL, request/correlation ID y resultado observado.
- **Severidad si falla:** Media.
- **Módulo responsable:** Cash Sessions.
- **Diagnóstico:** usar el bundle sanitizado; nunca adjuntar cookies, tokens, contraseñas, PAN/CVV o payloads completos.

### P-02 — ejecutar el flujo principal

- **Objetivo:** ejecutar el flujo principal en Cash Sessions y confirmar que la respuesta sea autoritativa.
- **Rol:** Administrator.
- **Precondiciones:** entorno preparado; Organization Alpha (dataset Café Horizonte); sucursal Centro, salvo el caso cross-branch.
- **Pasos:** 1) iniciar sesión; 2) abrir Cash Sessions; 3) ejecutar el flujo principal; 4) actualizar la vista; 5) copiar el correlation ID si aparece.
- **Resultado esperado:** la vista refleja el resultado persistido por el backend y el timeline conserva trazabilidad.
- **Evidencia:** captura, hora, usuario, URL, request/correlation ID y resultado observado.
- **Severidad si falla:** Media.
- **Módulo responsable:** Cash Sessions.
- **Diagnóstico:** usar el bundle sanitizado; nunca adjuntar cookies, tokens, contraseñas, PAN/CVV o payloads completos.

### P-03 — validar un dato inválido

- **Objetivo:** validar un dato inválido en Cash Sessions y confirmar que la respuesta sea autoritativa.
- **Rol:** Supervisor.
- **Precondiciones:** entorno preparado; Organization Alpha (dataset Café Horizonte); sucursal Centro, salvo el caso cross-branch.
- **Pasos:** 1) iniciar sesión; 2) abrir Cash Sessions; 3) validar un dato inválido; 4) actualizar la vista; 5) copiar el correlation ID si aparece.
- **Resultado esperado:** la operación se bloquea con un código estable y no cambia datos.
- **Evidencia:** captura, hora, usuario, URL, request/correlation ID y resultado observado.
- **Severidad si falla:** Alta.
- **Módulo responsable:** Cash Sessions.
- **Diagnóstico:** usar el bundle sanitizado; nunca adjuntar cookies, tokens, contraseñas, PAN/CVV o payloads completos.

### P-04 — repetir la intención idempotente

- **Objetivo:** repetir la intención idempotente en Cash Sessions y confirmar que la respuesta sea autoritativa.
- **Rol:** Cashier.
- **Precondiciones:** entorno preparado; Organization Alpha (dataset Café Horizonte); sucursal Centro, salvo el caso cross-branch.
- **Pasos:** 1) iniciar sesión; 2) abrir Cash Sessions; 3) repetir la intención idempotente; 4) actualizar la vista; 5) copiar el correlation ID si aparece.
- **Resultado esperado:** la operación se bloquea con un código estable y no cambia datos.
- **Evidencia:** captura, hora, usuario, URL, request/correlation ID y resultado observado.
- **Severidad si falla:** Alta.
- **Módulo responsable:** Cash Sessions.
- **Diagnóstico:** usar el bundle sanitizado; nunca adjuntar cookies, tokens, contraseñas, PAN/CVV o payloads completos.

### P-05 — cambiar de sucursal

- **Objetivo:** cambiar de sucursal en Cash Sessions y confirmar que la respuesta sea autoritativa.
- **Rol:** Employee.
- **Precondiciones:** entorno preparado; Organization Alpha (dataset Café Horizonte); sucursal Centro, salvo el caso cross-branch.
- **Pasos:** 1) iniciar sesión; 2) abrir Cash Sessions; 3) cambiar de sucursal; 4) actualizar la vista; 5) copiar el correlation ID si aparece.
- **Resultado esperado:** la operación se bloquea con un código estable y no cambia datos.
- **Evidencia:** captura, hora, usuario, URL, request/correlation ID y resultado observado.
- **Severidad si falla:** Alta.
- **Módulo responsable:** Cash Sessions.
- **Diagnóstico:** usar el bundle sanitizado; nunca adjuntar cookies, tokens, contraseñas, PAN/CVV o payloads completos.

### P-06 — intentar sin permiso

- **Objetivo:** intentar sin permiso en Cash Sessions y confirmar que la respuesta sea autoritativa.
- **Rol:** ReadOnly.
- **Precondiciones:** entorno preparado; Organization Alpha (dataset Café Horizonte); sucursal Centro, salvo el caso cross-branch.
- **Pasos:** 1) iniciar sesión; 2) abrir Cash Sessions; 3) intentar sin permiso; 4) actualizar la vista; 5) copiar el correlation ID si aparece.
- **Resultado esperado:** la operación se bloquea con un código estable y no cambia datos.
- **Evidencia:** captura, hora, usuario, URL, request/correlation ID y resultado observado.
- **Severidad si falla:** Crítica.
- **Módulo responsable:** Cash Sessions.
- **Diagnóstico:** usar el bundle sanitizado; nunca adjuntar cookies, tokens, contraseñas, PAN/CVV o payloads completos.

## Q. Deposits

### Q-01 — consultar el estado autorizado

- **Objetivo:** consultar el estado autorizado en Deposits y confirmar que la respuesta sea autoritativa.
- **Rol:** Owner.
- **Precondiciones:** entorno preparado; Organization Alpha (dataset Café Horizonte); sucursal Centro, salvo el caso cross-branch.
- **Pasos:** 1) iniciar sesión; 2) abrir Deposits; 3) consultar el estado autorizado; 4) actualizar la vista; 5) copiar el correlation ID si aparece.
- **Resultado esperado:** la vista refleja el resultado persistido por el backend y el timeline conserva trazabilidad.
- **Evidencia:** captura, hora, usuario, URL, request/correlation ID y resultado observado.
- **Severidad si falla:** Media.
- **Módulo responsable:** Deposits.
- **Diagnóstico:** usar el bundle sanitizado; nunca adjuntar cookies, tokens, contraseñas, PAN/CVV o payloads completos.

### Q-02 — ejecutar el flujo principal

- **Objetivo:** ejecutar el flujo principal en Deposits y confirmar que la respuesta sea autoritativa.
- **Rol:** Administrator.
- **Precondiciones:** entorno preparado; Organization Alpha (dataset Café Horizonte); sucursal Centro, salvo el caso cross-branch.
- **Pasos:** 1) iniciar sesión; 2) abrir Deposits; 3) ejecutar el flujo principal; 4) actualizar la vista; 5) copiar el correlation ID si aparece.
- **Resultado esperado:** la vista refleja el resultado persistido por el backend y el timeline conserva trazabilidad.
- **Evidencia:** captura, hora, usuario, URL, request/correlation ID y resultado observado.
- **Severidad si falla:** Media.
- **Módulo responsable:** Deposits.
- **Diagnóstico:** usar el bundle sanitizado; nunca adjuntar cookies, tokens, contraseñas, PAN/CVV o payloads completos.

### Q-03 — validar un dato inválido

- **Objetivo:** validar un dato inválido en Deposits y confirmar que la respuesta sea autoritativa.
- **Rol:** Supervisor.
- **Precondiciones:** entorno preparado; Organization Alpha (dataset Café Horizonte); sucursal Centro, salvo el caso cross-branch.
- **Pasos:** 1) iniciar sesión; 2) abrir Deposits; 3) validar un dato inválido; 4) actualizar la vista; 5) copiar el correlation ID si aparece.
- **Resultado esperado:** la operación se bloquea con un código estable y no cambia datos.
- **Evidencia:** captura, hora, usuario, URL, request/correlation ID y resultado observado.
- **Severidad si falla:** Alta.
- **Módulo responsable:** Deposits.
- **Diagnóstico:** usar el bundle sanitizado; nunca adjuntar cookies, tokens, contraseñas, PAN/CVV o payloads completos.

### Q-04 — repetir la intención idempotente

- **Objetivo:** repetir la intención idempotente en Deposits y confirmar que la respuesta sea autoritativa.
- **Rol:** Cashier.
- **Precondiciones:** entorno preparado; Organization Alpha (dataset Café Horizonte); sucursal Centro, salvo el caso cross-branch.
- **Pasos:** 1) iniciar sesión; 2) abrir Deposits; 3) repetir la intención idempotente; 4) actualizar la vista; 5) copiar el correlation ID si aparece.
- **Resultado esperado:** la operación se bloquea con un código estable y no cambia datos.
- **Evidencia:** captura, hora, usuario, URL, request/correlation ID y resultado observado.
- **Severidad si falla:** Alta.
- **Módulo responsable:** Deposits.
- **Diagnóstico:** usar el bundle sanitizado; nunca adjuntar cookies, tokens, contraseñas, PAN/CVV o payloads completos.

### Q-05 — cambiar de sucursal

- **Objetivo:** cambiar de sucursal en Deposits y confirmar que la respuesta sea autoritativa.
- **Rol:** Employee.
- **Precondiciones:** entorno preparado; Organization Alpha (dataset Café Horizonte); sucursal Centro, salvo el caso cross-branch.
- **Pasos:** 1) iniciar sesión; 2) abrir Deposits; 3) cambiar de sucursal; 4) actualizar la vista; 5) copiar el correlation ID si aparece.
- **Resultado esperado:** la operación se bloquea con un código estable y no cambia datos.
- **Evidencia:** captura, hora, usuario, URL, request/correlation ID y resultado observado.
- **Severidad si falla:** Alta.
- **Módulo responsable:** Deposits.
- **Diagnóstico:** usar el bundle sanitizado; nunca adjuntar cookies, tokens, contraseñas, PAN/CVV o payloads completos.

### Q-06 — intentar sin permiso

- **Objetivo:** intentar sin permiso en Deposits y confirmar que la respuesta sea autoritativa.
- **Rol:** ReadOnly.
- **Precondiciones:** entorno preparado; Organization Alpha (dataset Café Horizonte); sucursal Centro, salvo el caso cross-branch.
- **Pasos:** 1) iniciar sesión; 2) abrir Deposits; 3) intentar sin permiso; 4) actualizar la vista; 5) copiar el correlation ID si aparece.
- **Resultado esperado:** la operación se bloquea con un código estable y no cambia datos.
- **Evidencia:** captura, hora, usuario, URL, request/correlation ID y resultado observado.
- **Severidad si falla:** Crítica.
- **Módulo responsable:** Deposits.
- **Diagnóstico:** usar el bundle sanitizado; nunca adjuntar cookies, tokens, contraseñas, PAN/CVV o payloads completos.

## R. Transfers

### R-01 — consultar el estado autorizado

- **Objetivo:** consultar el estado autorizado en Transfers y confirmar que la respuesta sea autoritativa.
- **Rol:** Owner.
- **Precondiciones:** entorno preparado; Organization Alpha (dataset Café Horizonte); sucursal Centro, salvo el caso cross-branch.
- **Pasos:** 1) iniciar sesión; 2) abrir Transfers; 3) consultar el estado autorizado; 4) actualizar la vista; 5) copiar el correlation ID si aparece.
- **Resultado esperado:** la vista refleja el resultado persistido por el backend y el timeline conserva trazabilidad.
- **Evidencia:** captura, hora, usuario, URL, request/correlation ID y resultado observado.
- **Severidad si falla:** Media.
- **Módulo responsable:** Transfers.
- **Diagnóstico:** usar el bundle sanitizado; nunca adjuntar cookies, tokens, contraseñas, PAN/CVV o payloads completos.

### R-02 — ejecutar el flujo principal

- **Objetivo:** ejecutar el flujo principal en Transfers y confirmar que la respuesta sea autoritativa.
- **Rol:** Administrator.
- **Precondiciones:** entorno preparado; Organization Alpha (dataset Café Horizonte); sucursal Centro, salvo el caso cross-branch.
- **Pasos:** 1) iniciar sesión; 2) abrir Transfers; 3) ejecutar el flujo principal; 4) actualizar la vista; 5) copiar el correlation ID si aparece.
- **Resultado esperado:** la vista refleja el resultado persistido por el backend y el timeline conserva trazabilidad.
- **Evidencia:** captura, hora, usuario, URL, request/correlation ID y resultado observado.
- **Severidad si falla:** Media.
- **Módulo responsable:** Transfers.
- **Diagnóstico:** usar el bundle sanitizado; nunca adjuntar cookies, tokens, contraseñas, PAN/CVV o payloads completos.

### R-03 — validar un dato inválido

- **Objetivo:** validar un dato inválido en Transfers y confirmar que la respuesta sea autoritativa.
- **Rol:** Supervisor.
- **Precondiciones:** entorno preparado; Organization Alpha (dataset Café Horizonte); sucursal Centro, salvo el caso cross-branch.
- **Pasos:** 1) iniciar sesión; 2) abrir Transfers; 3) validar un dato inválido; 4) actualizar la vista; 5) copiar el correlation ID si aparece.
- **Resultado esperado:** la operación se bloquea con un código estable y no cambia datos.
- **Evidencia:** captura, hora, usuario, URL, request/correlation ID y resultado observado.
- **Severidad si falla:** Alta.
- **Módulo responsable:** Transfers.
- **Diagnóstico:** usar el bundle sanitizado; nunca adjuntar cookies, tokens, contraseñas, PAN/CVV o payloads completos.

### R-04 — repetir la intención idempotente

- **Objetivo:** repetir la intención idempotente en Transfers y confirmar que la respuesta sea autoritativa.
- **Rol:** Cashier.
- **Precondiciones:** entorno preparado; Organization Alpha (dataset Café Horizonte); sucursal Centro, salvo el caso cross-branch.
- **Pasos:** 1) iniciar sesión; 2) abrir Transfers; 3) repetir la intención idempotente; 4) actualizar la vista; 5) copiar el correlation ID si aparece.
- **Resultado esperado:** la operación se bloquea con un código estable y no cambia datos.
- **Evidencia:** captura, hora, usuario, URL, request/correlation ID y resultado observado.
- **Severidad si falla:** Alta.
- **Módulo responsable:** Transfers.
- **Diagnóstico:** usar el bundle sanitizado; nunca adjuntar cookies, tokens, contraseñas, PAN/CVV o payloads completos.

### R-05 — cambiar de sucursal

- **Objetivo:** cambiar de sucursal en Transfers y confirmar que la respuesta sea autoritativa.
- **Rol:** Employee.
- **Precondiciones:** entorno preparado; Organization Alpha (dataset Café Horizonte); sucursal Centro, salvo el caso cross-branch.
- **Pasos:** 1) iniciar sesión; 2) abrir Transfers; 3) cambiar de sucursal; 4) actualizar la vista; 5) copiar el correlation ID si aparece.
- **Resultado esperado:** la operación se bloquea con un código estable y no cambia datos.
- **Evidencia:** captura, hora, usuario, URL, request/correlation ID y resultado observado.
- **Severidad si falla:** Alta.
- **Módulo responsable:** Transfers.
- **Diagnóstico:** usar el bundle sanitizado; nunca adjuntar cookies, tokens, contraseñas, PAN/CVV o payloads completos.

### R-06 — intentar sin permiso

- **Objetivo:** intentar sin permiso en Transfers y confirmar que la respuesta sea autoritativa.
- **Rol:** ReadOnly.
- **Precondiciones:** entorno preparado; Organization Alpha (dataset Café Horizonte); sucursal Centro, salvo el caso cross-branch.
- **Pasos:** 1) iniciar sesión; 2) abrir Transfers; 3) intentar sin permiso; 4) actualizar la vista; 5) copiar el correlation ID si aparece.
- **Resultado esperado:** la operación se bloquea con un código estable y no cambia datos.
- **Evidencia:** captura, hora, usuario, URL, request/correlation ID y resultado observado.
- **Severidad si falla:** Crítica.
- **Módulo responsable:** Transfers.
- **Diagnóstico:** usar el bundle sanitizado; nunca adjuntar cookies, tokens, contraseñas, PAN/CVV o payloads completos.

## S. Reconciliation

### S-01 — consultar el estado autorizado

- **Objetivo:** consultar el estado autorizado en Reconciliation y confirmar que la respuesta sea autoritativa.
- **Rol:** Owner.
- **Precondiciones:** entorno preparado; Organization Alpha (dataset Café Horizonte); sucursal Centro, salvo el caso cross-branch.
- **Pasos:** 1) iniciar sesión; 2) abrir Reconciliation; 3) consultar el estado autorizado; 4) actualizar la vista; 5) copiar el correlation ID si aparece.
- **Resultado esperado:** la vista refleja el resultado persistido por el backend y el timeline conserva trazabilidad.
- **Evidencia:** captura, hora, usuario, URL, request/correlation ID y resultado observado.
- **Severidad si falla:** Media.
- **Módulo responsable:** Reconciliation.
- **Diagnóstico:** usar el bundle sanitizado; nunca adjuntar cookies, tokens, contraseñas, PAN/CVV o payloads completos.

### S-02 — ejecutar el flujo principal

- **Objetivo:** ejecutar el flujo principal en Reconciliation y confirmar que la respuesta sea autoritativa.
- **Rol:** Administrator.
- **Precondiciones:** entorno preparado; Organization Alpha (dataset Café Horizonte); sucursal Centro, salvo el caso cross-branch.
- **Pasos:** 1) iniciar sesión; 2) abrir Reconciliation; 3) ejecutar el flujo principal; 4) actualizar la vista; 5) copiar el correlation ID si aparece.
- **Resultado esperado:** la vista refleja el resultado persistido por el backend y el timeline conserva trazabilidad.
- **Evidencia:** captura, hora, usuario, URL, request/correlation ID y resultado observado.
- **Severidad si falla:** Media.
- **Módulo responsable:** Reconciliation.
- **Diagnóstico:** usar el bundle sanitizado; nunca adjuntar cookies, tokens, contraseñas, PAN/CVV o payloads completos.

### S-03 — validar un dato inválido

- **Objetivo:** validar un dato inválido en Reconciliation y confirmar que la respuesta sea autoritativa.
- **Rol:** Supervisor.
- **Precondiciones:** entorno preparado; Organization Alpha (dataset Café Horizonte); sucursal Centro, salvo el caso cross-branch.
- **Pasos:** 1) iniciar sesión; 2) abrir Reconciliation; 3) validar un dato inválido; 4) actualizar la vista; 5) copiar el correlation ID si aparece.
- **Resultado esperado:** la operación se bloquea con un código estable y no cambia datos.
- **Evidencia:** captura, hora, usuario, URL, request/correlation ID y resultado observado.
- **Severidad si falla:** Alta.
- **Módulo responsable:** Reconciliation.
- **Diagnóstico:** usar el bundle sanitizado; nunca adjuntar cookies, tokens, contraseñas, PAN/CVV o payloads completos.

### S-04 — repetir la intención idempotente

- **Objetivo:** repetir la intención idempotente en Reconciliation y confirmar que la respuesta sea autoritativa.
- **Rol:** Cashier.
- **Precondiciones:** entorno preparado; Organization Alpha (dataset Café Horizonte); sucursal Centro, salvo el caso cross-branch.
- **Pasos:** 1) iniciar sesión; 2) abrir Reconciliation; 3) repetir la intención idempotente; 4) actualizar la vista; 5) copiar el correlation ID si aparece.
- **Resultado esperado:** la operación se bloquea con un código estable y no cambia datos.
- **Evidencia:** captura, hora, usuario, URL, request/correlation ID y resultado observado.
- **Severidad si falla:** Alta.
- **Módulo responsable:** Reconciliation.
- **Diagnóstico:** usar el bundle sanitizado; nunca adjuntar cookies, tokens, contraseñas, PAN/CVV o payloads completos.

### S-05 — cambiar de sucursal

- **Objetivo:** cambiar de sucursal en Reconciliation y confirmar que la respuesta sea autoritativa.
- **Rol:** Employee.
- **Precondiciones:** entorno preparado; Organization Alpha (dataset Café Horizonte); sucursal Centro, salvo el caso cross-branch.
- **Pasos:** 1) iniciar sesión; 2) abrir Reconciliation; 3) cambiar de sucursal; 4) actualizar la vista; 5) copiar el correlation ID si aparece.
- **Resultado esperado:** la operación se bloquea con un código estable y no cambia datos.
- **Evidencia:** captura, hora, usuario, URL, request/correlation ID y resultado observado.
- **Severidad si falla:** Alta.
- **Módulo responsable:** Reconciliation.
- **Diagnóstico:** usar el bundle sanitizado; nunca adjuntar cookies, tokens, contraseñas, PAN/CVV o payloads completos.

### S-06 — intentar sin permiso

- **Objetivo:** intentar sin permiso en Reconciliation y confirmar que la respuesta sea autoritativa.
- **Rol:** ReadOnly.
- **Precondiciones:** entorno preparado; Organization Alpha (dataset Café Horizonte); sucursal Centro, salvo el caso cross-branch.
- **Pasos:** 1) iniciar sesión; 2) abrir Reconciliation; 3) intentar sin permiso; 4) actualizar la vista; 5) copiar el correlation ID si aparece.
- **Resultado esperado:** la operación se bloquea con un código estable y no cambia datos.
- **Evidencia:** captura, hora, usuario, URL, request/correlation ID y resultado observado.
- **Severidad si falla:** Crítica.
- **Módulo responsable:** Reconciliation.
- **Diagnóstico:** usar el bundle sanitizado; nunca adjuntar cookies, tokens, contraseñas, PAN/CVV o payloads completos.

## T. Approvals

### T-01 — consultar el estado autorizado

- **Objetivo:** consultar el estado autorizado en Approvals y confirmar que la respuesta sea autoritativa.
- **Rol:** Owner.
- **Precondiciones:** entorno preparado; Organization Alpha (dataset Café Horizonte); sucursal Centro, salvo el caso cross-branch.
- **Pasos:** 1) iniciar sesión; 2) abrir Approvals; 3) consultar el estado autorizado; 4) actualizar la vista; 5) copiar el correlation ID si aparece.
- **Resultado esperado:** la vista refleja el resultado persistido por el backend y el timeline conserva trazabilidad.
- **Evidencia:** captura, hora, usuario, URL, request/correlation ID y resultado observado.
- **Severidad si falla:** Media.
- **Módulo responsable:** Approvals.
- **Diagnóstico:** usar el bundle sanitizado; nunca adjuntar cookies, tokens, contraseñas, PAN/CVV o payloads completos.

### T-02 — ejecutar el flujo principal

- **Objetivo:** ejecutar el flujo principal en Approvals y confirmar que la respuesta sea autoritativa.
- **Rol:** Administrator.
- **Precondiciones:** entorno preparado; Organization Alpha (dataset Café Horizonte); sucursal Centro, salvo el caso cross-branch.
- **Pasos:** 1) iniciar sesión; 2) abrir Approvals; 3) ejecutar el flujo principal; 4) actualizar la vista; 5) copiar el correlation ID si aparece.
- **Resultado esperado:** la vista refleja el resultado persistido por el backend y el timeline conserva trazabilidad.
- **Evidencia:** captura, hora, usuario, URL, request/correlation ID y resultado observado.
- **Severidad si falla:** Media.
- **Módulo responsable:** Approvals.
- **Diagnóstico:** usar el bundle sanitizado; nunca adjuntar cookies, tokens, contraseñas, PAN/CVV o payloads completos.

### T-03 — validar un dato inválido

- **Objetivo:** validar un dato inválido en Approvals y confirmar que la respuesta sea autoritativa.
- **Rol:** Supervisor.
- **Precondiciones:** entorno preparado; Organization Alpha (dataset Café Horizonte); sucursal Centro, salvo el caso cross-branch.
- **Pasos:** 1) iniciar sesión; 2) abrir Approvals; 3) validar un dato inválido; 4) actualizar la vista; 5) copiar el correlation ID si aparece.
- **Resultado esperado:** la operación se bloquea con un código estable y no cambia datos.
- **Evidencia:** captura, hora, usuario, URL, request/correlation ID y resultado observado.
- **Severidad si falla:** Alta.
- **Módulo responsable:** Approvals.
- **Diagnóstico:** usar el bundle sanitizado; nunca adjuntar cookies, tokens, contraseñas, PAN/CVV o payloads completos.

### T-04 — repetir la intención idempotente

- **Objetivo:** repetir la intención idempotente en Approvals y confirmar que la respuesta sea autoritativa.
- **Rol:** Cashier.
- **Precondiciones:** entorno preparado; Organization Alpha (dataset Café Horizonte); sucursal Centro, salvo el caso cross-branch.
- **Pasos:** 1) iniciar sesión; 2) abrir Approvals; 3) repetir la intención idempotente; 4) actualizar la vista; 5) copiar el correlation ID si aparece.
- **Resultado esperado:** la operación se bloquea con un código estable y no cambia datos.
- **Evidencia:** captura, hora, usuario, URL, request/correlation ID y resultado observado.
- **Severidad si falla:** Alta.
- **Módulo responsable:** Approvals.
- **Diagnóstico:** usar el bundle sanitizado; nunca adjuntar cookies, tokens, contraseñas, PAN/CVV o payloads completos.

### T-05 — cambiar de sucursal

- **Objetivo:** cambiar de sucursal en Approvals y confirmar que la respuesta sea autoritativa.
- **Rol:** Employee.
- **Precondiciones:** entorno preparado; Organization Alpha (dataset Café Horizonte); sucursal Centro, salvo el caso cross-branch.
- **Pasos:** 1) iniciar sesión; 2) abrir Approvals; 3) cambiar de sucursal; 4) actualizar la vista; 5) copiar el correlation ID si aparece.
- **Resultado esperado:** la operación se bloquea con un código estable y no cambia datos.
- **Evidencia:** captura, hora, usuario, URL, request/correlation ID y resultado observado.
- **Severidad si falla:** Alta.
- **Módulo responsable:** Approvals.
- **Diagnóstico:** usar el bundle sanitizado; nunca adjuntar cookies, tokens, contraseñas, PAN/CVV o payloads completos.

### T-06 — intentar sin permiso

- **Objetivo:** intentar sin permiso en Approvals y confirmar que la respuesta sea autoritativa.
- **Rol:** ReadOnly.
- **Precondiciones:** entorno preparado; Organization Alpha (dataset Café Horizonte); sucursal Centro, salvo el caso cross-branch.
- **Pasos:** 1) iniciar sesión; 2) abrir Approvals; 3) intentar sin permiso; 4) actualizar la vista; 5) copiar el correlation ID si aparece.
- **Resultado esperado:** la operación se bloquea con un código estable y no cambia datos.
- **Evidencia:** captura, hora, usuario, URL, request/correlation ID y resultado observado.
- **Severidad si falla:** Crítica.
- **Módulo responsable:** Approvals.
- **Diagnóstico:** usar el bundle sanitizado; nunca adjuntar cookies, tokens, contraseñas, PAN/CVV o payloads completos.

## U. Outbox

### U-01 — consultar el estado autorizado

- **Objetivo:** consultar el estado autorizado en Outbox y confirmar que la respuesta sea autoritativa.
- **Rol:** Owner.
- **Precondiciones:** entorno preparado; Organization Alpha (dataset Café Horizonte); sucursal Centro, salvo el caso cross-branch.
- **Pasos:** 1) iniciar sesión; 2) abrir Outbox; 3) consultar el estado autorizado; 4) actualizar la vista; 5) copiar el correlation ID si aparece.
- **Resultado esperado:** la vista refleja el resultado persistido por el backend y el timeline conserva trazabilidad.
- **Evidencia:** captura, hora, usuario, URL, request/correlation ID y resultado observado.
- **Severidad si falla:** Media.
- **Módulo responsable:** Outbox.
- **Diagnóstico:** usar el bundle sanitizado; nunca adjuntar cookies, tokens, contraseñas, PAN/CVV o payloads completos.

### U-02 — ejecutar el flujo principal

- **Objetivo:** ejecutar el flujo principal en Outbox y confirmar que la respuesta sea autoritativa.
- **Rol:** Administrator.
- **Precondiciones:** entorno preparado; Organization Alpha (dataset Café Horizonte); sucursal Centro, salvo el caso cross-branch.
- **Pasos:** 1) iniciar sesión; 2) abrir Outbox; 3) ejecutar el flujo principal; 4) actualizar la vista; 5) copiar el correlation ID si aparece.
- **Resultado esperado:** la vista refleja el resultado persistido por el backend y el timeline conserva trazabilidad.
- **Evidencia:** captura, hora, usuario, URL, request/correlation ID y resultado observado.
- **Severidad si falla:** Media.
- **Módulo responsable:** Outbox.
- **Diagnóstico:** usar el bundle sanitizado; nunca adjuntar cookies, tokens, contraseñas, PAN/CVV o payloads completos.

### U-03 — validar un dato inválido

- **Objetivo:** validar un dato inválido en Outbox y confirmar que la respuesta sea autoritativa.
- **Rol:** Supervisor.
- **Precondiciones:** entorno preparado; Organization Alpha (dataset Café Horizonte); sucursal Centro, salvo el caso cross-branch.
- **Pasos:** 1) iniciar sesión; 2) abrir Outbox; 3) validar un dato inválido; 4) actualizar la vista; 5) copiar el correlation ID si aparece.
- **Resultado esperado:** la operación se bloquea con un código estable y no cambia datos.
- **Evidencia:** captura, hora, usuario, URL, request/correlation ID y resultado observado.
- **Severidad si falla:** Alta.
- **Módulo responsable:** Outbox.
- **Diagnóstico:** usar el bundle sanitizado; nunca adjuntar cookies, tokens, contraseñas, PAN/CVV o payloads completos.

### U-04 — repetir la intención idempotente

- **Objetivo:** repetir la intención idempotente en Outbox y confirmar que la respuesta sea autoritativa.
- **Rol:** Cashier.
- **Precondiciones:** entorno preparado; Organization Alpha (dataset Café Horizonte); sucursal Centro, salvo el caso cross-branch.
- **Pasos:** 1) iniciar sesión; 2) abrir Outbox; 3) repetir la intención idempotente; 4) actualizar la vista; 5) copiar el correlation ID si aparece.
- **Resultado esperado:** la operación se bloquea con un código estable y no cambia datos.
- **Evidencia:** captura, hora, usuario, URL, request/correlation ID y resultado observado.
- **Severidad si falla:** Alta.
- **Módulo responsable:** Outbox.
- **Diagnóstico:** usar el bundle sanitizado; nunca adjuntar cookies, tokens, contraseñas, PAN/CVV o payloads completos.

### U-05 — cambiar de sucursal

- **Objetivo:** cambiar de sucursal en Outbox y confirmar que la respuesta sea autoritativa.
- **Rol:** Employee.
- **Precondiciones:** entorno preparado; Organization Alpha (dataset Café Horizonte); sucursal Centro, salvo el caso cross-branch.
- **Pasos:** 1) iniciar sesión; 2) abrir Outbox; 3) cambiar de sucursal; 4) actualizar la vista; 5) copiar el correlation ID si aparece.
- **Resultado esperado:** la operación se bloquea con un código estable y no cambia datos.
- **Evidencia:** captura, hora, usuario, URL, request/correlation ID y resultado observado.
- **Severidad si falla:** Alta.
- **Módulo responsable:** Outbox.
- **Diagnóstico:** usar el bundle sanitizado; nunca adjuntar cookies, tokens, contraseñas, PAN/CVV o payloads completos.

### U-06 — intentar sin permiso

- **Objetivo:** intentar sin permiso en Outbox y confirmar que la respuesta sea autoritativa.
- **Rol:** ReadOnly.
- **Precondiciones:** entorno preparado; Organization Alpha (dataset Café Horizonte); sucursal Centro, salvo el caso cross-branch.
- **Pasos:** 1) iniciar sesión; 2) abrir Outbox; 3) intentar sin permiso; 4) actualizar la vista; 5) copiar el correlation ID si aparece.
- **Resultado esperado:** la operación se bloquea con un código estable y no cambia datos.
- **Evidencia:** captura, hora, usuario, URL, request/correlation ID y resultado observado.
- **Severidad si falla:** Crítica.
- **Módulo responsable:** Outbox.
- **Diagnóstico:** usar el bundle sanitizado; nunca adjuntar cookies, tokens, contraseñas, PAN/CVV o payloads completos.

## V. Quarantine

### V-01 — consultar el estado autorizado

- **Objetivo:** consultar el estado autorizado en Quarantine y confirmar que la respuesta sea autoritativa.
- **Rol:** Owner.
- **Precondiciones:** entorno preparado; Organization Alpha (dataset Café Horizonte); sucursal Centro, salvo el caso cross-branch.
- **Pasos:** 1) iniciar sesión; 2) abrir Quarantine; 3) consultar el estado autorizado; 4) actualizar la vista; 5) copiar el correlation ID si aparece.
- **Resultado esperado:** la vista refleja el resultado persistido por el backend y el timeline conserva trazabilidad.
- **Evidencia:** captura, hora, usuario, URL, request/correlation ID y resultado observado.
- **Severidad si falla:** Media.
- **Módulo responsable:** Quarantine.
- **Diagnóstico:** usar el bundle sanitizado; nunca adjuntar cookies, tokens, contraseñas, PAN/CVV o payloads completos.

### V-02 — ejecutar el flujo principal

- **Objetivo:** ejecutar el flujo principal en Quarantine y confirmar que la respuesta sea autoritativa.
- **Rol:** Administrator.
- **Precondiciones:** entorno preparado; Organization Alpha (dataset Café Horizonte); sucursal Centro, salvo el caso cross-branch.
- **Pasos:** 1) iniciar sesión; 2) abrir Quarantine; 3) ejecutar el flujo principal; 4) actualizar la vista; 5) copiar el correlation ID si aparece.
- **Resultado esperado:** la vista refleja el resultado persistido por el backend y el timeline conserva trazabilidad.
- **Evidencia:** captura, hora, usuario, URL, request/correlation ID y resultado observado.
- **Severidad si falla:** Media.
- **Módulo responsable:** Quarantine.
- **Diagnóstico:** usar el bundle sanitizado; nunca adjuntar cookies, tokens, contraseñas, PAN/CVV o payloads completos.

### V-03 — validar un dato inválido

- **Objetivo:** validar un dato inválido en Quarantine y confirmar que la respuesta sea autoritativa.
- **Rol:** Supervisor.
- **Precondiciones:** entorno preparado; Organization Alpha (dataset Café Horizonte); sucursal Centro, salvo el caso cross-branch.
- **Pasos:** 1) iniciar sesión; 2) abrir Quarantine; 3) validar un dato inválido; 4) actualizar la vista; 5) copiar el correlation ID si aparece.
- **Resultado esperado:** la operación se bloquea con un código estable y no cambia datos.
- **Evidencia:** captura, hora, usuario, URL, request/correlation ID y resultado observado.
- **Severidad si falla:** Alta.
- **Módulo responsable:** Quarantine.
- **Diagnóstico:** usar el bundle sanitizado; nunca adjuntar cookies, tokens, contraseñas, PAN/CVV o payloads completos.

### V-04 — repetir la intención idempotente

- **Objetivo:** repetir la intención idempotente en Quarantine y confirmar que la respuesta sea autoritativa.
- **Rol:** Cashier.
- **Precondiciones:** entorno preparado; Organization Alpha (dataset Café Horizonte); sucursal Centro, salvo el caso cross-branch.
- **Pasos:** 1) iniciar sesión; 2) abrir Quarantine; 3) repetir la intención idempotente; 4) actualizar la vista; 5) copiar el correlation ID si aparece.
- **Resultado esperado:** la operación se bloquea con un código estable y no cambia datos.
- **Evidencia:** captura, hora, usuario, URL, request/correlation ID y resultado observado.
- **Severidad si falla:** Alta.
- **Módulo responsable:** Quarantine.
- **Diagnóstico:** usar el bundle sanitizado; nunca adjuntar cookies, tokens, contraseñas, PAN/CVV o payloads completos.

### V-05 — cambiar de sucursal

- **Objetivo:** cambiar de sucursal en Quarantine y confirmar que la respuesta sea autoritativa.
- **Rol:** Employee.
- **Precondiciones:** entorno preparado; Organization Alpha (dataset Café Horizonte); sucursal Centro, salvo el caso cross-branch.
- **Pasos:** 1) iniciar sesión; 2) abrir Quarantine; 3) cambiar de sucursal; 4) actualizar la vista; 5) copiar el correlation ID si aparece.
- **Resultado esperado:** la operación se bloquea con un código estable y no cambia datos.
- **Evidencia:** captura, hora, usuario, URL, request/correlation ID y resultado observado.
- **Severidad si falla:** Alta.
- **Módulo responsable:** Quarantine.
- **Diagnóstico:** usar el bundle sanitizado; nunca adjuntar cookies, tokens, contraseñas, PAN/CVV o payloads completos.

### V-06 — intentar sin permiso

- **Objetivo:** intentar sin permiso en Quarantine y confirmar que la respuesta sea autoritativa.
- **Rol:** ReadOnly.
- **Precondiciones:** entorno preparado; Organization Alpha (dataset Café Horizonte); sucursal Centro, salvo el caso cross-branch.
- **Pasos:** 1) iniciar sesión; 2) abrir Quarantine; 3) intentar sin permiso; 4) actualizar la vista; 5) copiar el correlation ID si aparece.
- **Resultado esperado:** la operación se bloquea con un código estable y no cambia datos.
- **Evidencia:** captura, hora, usuario, URL, request/correlation ID y resultado observado.
- **Severidad si falla:** Crítica.
- **Módulo responsable:** Quarantine.
- **Diagnóstico:** usar el bundle sanitizado; nunca adjuntar cookies, tokens, contraseñas, PAN/CVV o payloads completos.

## W. Accessibility

### W-01 — consultar el estado autorizado

- **Objetivo:** consultar el estado autorizado en Accessibility y confirmar que la respuesta sea autoritativa.
- **Rol:** Owner.
- **Precondiciones:** entorno preparado; Organization Alpha (dataset Café Horizonte); sucursal Centro, salvo el caso cross-branch.
- **Pasos:** 1) iniciar sesión; 2) abrir Accessibility; 3) consultar el estado autorizado; 4) actualizar la vista; 5) copiar el correlation ID si aparece.
- **Resultado esperado:** la vista refleja el resultado persistido por el backend y el timeline conserva trazabilidad.
- **Evidencia:** captura, hora, usuario, URL, request/correlation ID y resultado observado.
- **Severidad si falla:** Media.
- **Módulo responsable:** Accessibility.
- **Diagnóstico:** usar el bundle sanitizado; nunca adjuntar cookies, tokens, contraseñas, PAN/CVV o payloads completos.

### W-02 — ejecutar el flujo principal

- **Objetivo:** ejecutar el flujo principal en Accessibility y confirmar que la respuesta sea autoritativa.
- **Rol:** Administrator.
- **Precondiciones:** entorno preparado; Organization Alpha (dataset Café Horizonte); sucursal Centro, salvo el caso cross-branch.
- **Pasos:** 1) iniciar sesión; 2) abrir Accessibility; 3) ejecutar el flujo principal; 4) actualizar la vista; 5) copiar el correlation ID si aparece.
- **Resultado esperado:** la vista refleja el resultado persistido por el backend y el timeline conserva trazabilidad.
- **Evidencia:** captura, hora, usuario, URL, request/correlation ID y resultado observado.
- **Severidad si falla:** Media.
- **Módulo responsable:** Accessibility.
- **Diagnóstico:** usar el bundle sanitizado; nunca adjuntar cookies, tokens, contraseñas, PAN/CVV o payloads completos.

### W-03 — validar un dato inválido

- **Objetivo:** validar un dato inválido en Accessibility y confirmar que la respuesta sea autoritativa.
- **Rol:** Supervisor.
- **Precondiciones:** entorno preparado; Organization Alpha (dataset Café Horizonte); sucursal Centro, salvo el caso cross-branch.
- **Pasos:** 1) iniciar sesión; 2) abrir Accessibility; 3) validar un dato inválido; 4) actualizar la vista; 5) copiar el correlation ID si aparece.
- **Resultado esperado:** la operación se bloquea con un código estable y no cambia datos.
- **Evidencia:** captura, hora, usuario, URL, request/correlation ID y resultado observado.
- **Severidad si falla:** Alta.
- **Módulo responsable:** Accessibility.
- **Diagnóstico:** usar el bundle sanitizado; nunca adjuntar cookies, tokens, contraseñas, PAN/CVV o payloads completos.

### W-04 — repetir la intención idempotente

- **Objetivo:** repetir la intención idempotente en Accessibility y confirmar que la respuesta sea autoritativa.
- **Rol:** Cashier.
- **Precondiciones:** entorno preparado; Organization Alpha (dataset Café Horizonte); sucursal Centro, salvo el caso cross-branch.
- **Pasos:** 1) iniciar sesión; 2) abrir Accessibility; 3) repetir la intención idempotente; 4) actualizar la vista; 5) copiar el correlation ID si aparece.
- **Resultado esperado:** la operación se bloquea con un código estable y no cambia datos.
- **Evidencia:** captura, hora, usuario, URL, request/correlation ID y resultado observado.
- **Severidad si falla:** Alta.
- **Módulo responsable:** Accessibility.
- **Diagnóstico:** usar el bundle sanitizado; nunca adjuntar cookies, tokens, contraseñas, PAN/CVV o payloads completos.

### W-05 — cambiar de sucursal

- **Objetivo:** cambiar de sucursal en Accessibility y confirmar que la respuesta sea autoritativa.
- **Rol:** Employee.
- **Precondiciones:** entorno preparado; Organization Alpha (dataset Café Horizonte); sucursal Centro, salvo el caso cross-branch.
- **Pasos:** 1) iniciar sesión; 2) abrir Accessibility; 3) cambiar de sucursal; 4) actualizar la vista; 5) copiar el correlation ID si aparece.
- **Resultado esperado:** la operación se bloquea con un código estable y no cambia datos.
- **Evidencia:** captura, hora, usuario, URL, request/correlation ID y resultado observado.
- **Severidad si falla:** Alta.
- **Módulo responsable:** Accessibility.
- **Diagnóstico:** usar el bundle sanitizado; nunca adjuntar cookies, tokens, contraseñas, PAN/CVV o payloads completos.

### W-06 — intentar sin permiso

- **Objetivo:** intentar sin permiso en Accessibility y confirmar que la respuesta sea autoritativa.
- **Rol:** ReadOnly.
- **Precondiciones:** entorno preparado; Organization Alpha (dataset Café Horizonte); sucursal Centro, salvo el caso cross-branch.
- **Pasos:** 1) iniciar sesión; 2) abrir Accessibility; 3) intentar sin permiso; 4) actualizar la vista; 5) copiar el correlation ID si aparece.
- **Resultado esperado:** la operación se bloquea con un código estable y no cambia datos.
- **Evidencia:** captura, hora, usuario, URL, request/correlation ID y resultado observado.
- **Severidad si falla:** Crítica.
- **Módulo responsable:** Accessibility.
- **Diagnóstico:** usar el bundle sanitizado; nunca adjuntar cookies, tokens, contraseñas, PAN/CVV o payloads completos.

## X. Responsive

### X-01 — consultar el estado autorizado

- **Objetivo:** consultar el estado autorizado en Responsive y confirmar que la respuesta sea autoritativa.
- **Rol:** Owner.
- **Precondiciones:** entorno preparado; Organization Alpha (dataset Café Horizonte); sucursal Centro, salvo el caso cross-branch.
- **Pasos:** 1) iniciar sesión; 2) abrir Responsive; 3) consultar el estado autorizado; 4) actualizar la vista; 5) copiar el correlation ID si aparece.
- **Resultado esperado:** la vista refleja el resultado persistido por el backend y el timeline conserva trazabilidad.
- **Evidencia:** captura, hora, usuario, URL, request/correlation ID y resultado observado.
- **Severidad si falla:** Media.
- **Módulo responsable:** Responsive.
- **Diagnóstico:** usar el bundle sanitizado; nunca adjuntar cookies, tokens, contraseñas, PAN/CVV o payloads completos.

### X-02 — ejecutar el flujo principal

- **Objetivo:** ejecutar el flujo principal en Responsive y confirmar que la respuesta sea autoritativa.
- **Rol:** Administrator.
- **Precondiciones:** entorno preparado; Organization Alpha (dataset Café Horizonte); sucursal Centro, salvo el caso cross-branch.
- **Pasos:** 1) iniciar sesión; 2) abrir Responsive; 3) ejecutar el flujo principal; 4) actualizar la vista; 5) copiar el correlation ID si aparece.
- **Resultado esperado:** la vista refleja el resultado persistido por el backend y el timeline conserva trazabilidad.
- **Evidencia:** captura, hora, usuario, URL, request/correlation ID y resultado observado.
- **Severidad si falla:** Media.
- **Módulo responsable:** Responsive.
- **Diagnóstico:** usar el bundle sanitizado; nunca adjuntar cookies, tokens, contraseñas, PAN/CVV o payloads completos.

### X-03 — validar un dato inválido

- **Objetivo:** validar un dato inválido en Responsive y confirmar que la respuesta sea autoritativa.
- **Rol:** Supervisor.
- **Precondiciones:** entorno preparado; Organization Alpha (dataset Café Horizonte); sucursal Centro, salvo el caso cross-branch.
- **Pasos:** 1) iniciar sesión; 2) abrir Responsive; 3) validar un dato inválido; 4) actualizar la vista; 5) copiar el correlation ID si aparece.
- **Resultado esperado:** la operación se bloquea con un código estable y no cambia datos.
- **Evidencia:** captura, hora, usuario, URL, request/correlation ID y resultado observado.
- **Severidad si falla:** Alta.
- **Módulo responsable:** Responsive.
- **Diagnóstico:** usar el bundle sanitizado; nunca adjuntar cookies, tokens, contraseñas, PAN/CVV o payloads completos.

### X-04 — repetir la intención idempotente

- **Objetivo:** repetir la intención idempotente en Responsive y confirmar que la respuesta sea autoritativa.
- **Rol:** Cashier.
- **Precondiciones:** entorno preparado; Organization Alpha (dataset Café Horizonte); sucursal Centro, salvo el caso cross-branch.
- **Pasos:** 1) iniciar sesión; 2) abrir Responsive; 3) repetir la intención idempotente; 4) actualizar la vista; 5) copiar el correlation ID si aparece.
- **Resultado esperado:** la operación se bloquea con un código estable y no cambia datos.
- **Evidencia:** captura, hora, usuario, URL, request/correlation ID y resultado observado.
- **Severidad si falla:** Alta.
- **Módulo responsable:** Responsive.
- **Diagnóstico:** usar el bundle sanitizado; nunca adjuntar cookies, tokens, contraseñas, PAN/CVV o payloads completos.

### X-05 — cambiar de sucursal

- **Objetivo:** cambiar de sucursal en Responsive y confirmar que la respuesta sea autoritativa.
- **Rol:** Employee.
- **Precondiciones:** entorno preparado; Organization Alpha (dataset Café Horizonte); sucursal Centro, salvo el caso cross-branch.
- **Pasos:** 1) iniciar sesión; 2) abrir Responsive; 3) cambiar de sucursal; 4) actualizar la vista; 5) copiar el correlation ID si aparece.
- **Resultado esperado:** la operación se bloquea con un código estable y no cambia datos.
- **Evidencia:** captura, hora, usuario, URL, request/correlation ID y resultado observado.
- **Severidad si falla:** Alta.
- **Módulo responsable:** Responsive.
- **Diagnóstico:** usar el bundle sanitizado; nunca adjuntar cookies, tokens, contraseñas, PAN/CVV o payloads completos.

### X-06 — intentar sin permiso

- **Objetivo:** intentar sin permiso en Responsive y confirmar que la respuesta sea autoritativa.
- **Rol:** ReadOnly.
- **Precondiciones:** entorno preparado; Organization Alpha (dataset Café Horizonte); sucursal Centro, salvo el caso cross-branch.
- **Pasos:** 1) iniciar sesión; 2) abrir Responsive; 3) intentar sin permiso; 4) actualizar la vista; 5) copiar el correlation ID si aparece.
- **Resultado esperado:** la operación se bloquea con un código estable y no cambia datos.
- **Evidencia:** captura, hora, usuario, URL, request/correlation ID y resultado observado.
- **Severidad si falla:** Crítica.
- **Módulo responsable:** Responsive.
- **Diagnóstico:** usar el bundle sanitizado; nunca adjuntar cookies, tokens, contraseñas, PAN/CVV o payloads completos.

## Y. Security

### Y-01 — consultar el estado autorizado

- **Objetivo:** consultar el estado autorizado en Security y confirmar que la respuesta sea autoritativa.
- **Rol:** Owner.
- **Precondiciones:** entorno preparado; Organization Alpha (dataset Café Horizonte); sucursal Centro, salvo el caso cross-branch.
- **Pasos:** 1) iniciar sesión; 2) abrir Security; 3) consultar el estado autorizado; 4) actualizar la vista; 5) copiar el correlation ID si aparece.
- **Resultado esperado:** la vista refleja el resultado persistido por el backend y el timeline conserva trazabilidad.
- **Evidencia:** captura, hora, usuario, URL, request/correlation ID y resultado observado.
- **Severidad si falla:** Media.
- **Módulo responsable:** Security.
- **Diagnóstico:** usar el bundle sanitizado; nunca adjuntar cookies, tokens, contraseñas, PAN/CVV o payloads completos.

### Y-02 — ejecutar el flujo principal

- **Objetivo:** ejecutar el flujo principal en Security y confirmar que la respuesta sea autoritativa.
- **Rol:** Administrator.
- **Precondiciones:** entorno preparado; Organization Alpha (dataset Café Horizonte); sucursal Centro, salvo el caso cross-branch.
- **Pasos:** 1) iniciar sesión; 2) abrir Security; 3) ejecutar el flujo principal; 4) actualizar la vista; 5) copiar el correlation ID si aparece.
- **Resultado esperado:** la vista refleja el resultado persistido por el backend y el timeline conserva trazabilidad.
- **Evidencia:** captura, hora, usuario, URL, request/correlation ID y resultado observado.
- **Severidad si falla:** Media.
- **Módulo responsable:** Security.
- **Diagnóstico:** usar el bundle sanitizado; nunca adjuntar cookies, tokens, contraseñas, PAN/CVV o payloads completos.

### Y-03 — validar un dato inválido

- **Objetivo:** validar un dato inválido en Security y confirmar que la respuesta sea autoritativa.
- **Rol:** Supervisor.
- **Precondiciones:** entorno preparado; Organization Alpha (dataset Café Horizonte); sucursal Centro, salvo el caso cross-branch.
- **Pasos:** 1) iniciar sesión; 2) abrir Security; 3) validar un dato inválido; 4) actualizar la vista; 5) copiar el correlation ID si aparece.
- **Resultado esperado:** la operación se bloquea con un código estable y no cambia datos.
- **Evidencia:** captura, hora, usuario, URL, request/correlation ID y resultado observado.
- **Severidad si falla:** Alta.
- **Módulo responsable:** Security.
- **Diagnóstico:** usar el bundle sanitizado; nunca adjuntar cookies, tokens, contraseñas, PAN/CVV o payloads completos.

### Y-04 — repetir la intención idempotente

- **Objetivo:** repetir la intención idempotente en Security y confirmar que la respuesta sea autoritativa.
- **Rol:** Cashier.
- **Precondiciones:** entorno preparado; Organization Alpha (dataset Café Horizonte); sucursal Centro, salvo el caso cross-branch.
- **Pasos:** 1) iniciar sesión; 2) abrir Security; 3) repetir la intención idempotente; 4) actualizar la vista; 5) copiar el correlation ID si aparece.
- **Resultado esperado:** la operación se bloquea con un código estable y no cambia datos.
- **Evidencia:** captura, hora, usuario, URL, request/correlation ID y resultado observado.
- **Severidad si falla:** Alta.
- **Módulo responsable:** Security.
- **Diagnóstico:** usar el bundle sanitizado; nunca adjuntar cookies, tokens, contraseñas, PAN/CVV o payloads completos.

### Y-05 — cambiar de sucursal

- **Objetivo:** cambiar de sucursal en Security y confirmar que la respuesta sea autoritativa.
- **Rol:** Employee.
- **Precondiciones:** entorno preparado; Organization Alpha (dataset Café Horizonte); sucursal Centro, salvo el caso cross-branch.
- **Pasos:** 1) iniciar sesión; 2) abrir Security; 3) cambiar de sucursal; 4) actualizar la vista; 5) copiar el correlation ID si aparece.
- **Resultado esperado:** la operación se bloquea con un código estable y no cambia datos.
- **Evidencia:** captura, hora, usuario, URL, request/correlation ID y resultado observado.
- **Severidad si falla:** Alta.
- **Módulo responsable:** Security.
- **Diagnóstico:** usar el bundle sanitizado; nunca adjuntar cookies, tokens, contraseñas, PAN/CVV o payloads completos.

### Y-06 — intentar sin permiso

- **Objetivo:** intentar sin permiso en Security y confirmar que la respuesta sea autoritativa.
- **Rol:** ReadOnly.
- **Precondiciones:** entorno preparado; Organization Alpha (dataset Café Horizonte); sucursal Centro, salvo el caso cross-branch.
- **Pasos:** 1) iniciar sesión; 2) abrir Security; 3) intentar sin permiso; 4) actualizar la vista; 5) copiar el correlation ID si aparece.
- **Resultado esperado:** la operación se bloquea con un código estable y no cambia datos.
- **Evidencia:** captura, hora, usuario, URL, request/correlation ID y resultado observado.
- **Severidad si falla:** Crítica.
- **Módulo responsable:** Security.
- **Diagnóstico:** usar el bundle sanitizado; nunca adjuntar cookies, tokens, contraseñas, PAN/CVV o payloads completos.

## Z. Recovery

### Z-01 — consultar el estado autorizado

- **Objetivo:** consultar el estado autorizado en Recovery y confirmar que la respuesta sea autoritativa.
- **Rol:** Owner.
- **Precondiciones:** entorno preparado; Organization Alpha (dataset Café Horizonte); sucursal Centro, salvo el caso cross-branch.
- **Pasos:** 1) iniciar sesión; 2) abrir Recovery; 3) consultar el estado autorizado; 4) actualizar la vista; 5) copiar el correlation ID si aparece.
- **Resultado esperado:** la vista refleja el resultado persistido por el backend y el timeline conserva trazabilidad.
- **Evidencia:** captura, hora, usuario, URL, request/correlation ID y resultado observado.
- **Severidad si falla:** Media.
- **Módulo responsable:** Recovery.
- **Diagnóstico:** usar el bundle sanitizado; nunca adjuntar cookies, tokens, contraseñas, PAN/CVV o payloads completos.

### Z-02 — ejecutar el flujo principal

- **Objetivo:** ejecutar el flujo principal en Recovery y confirmar que la respuesta sea autoritativa.
- **Rol:** Administrator.
- **Precondiciones:** entorno preparado; Organization Alpha (dataset Café Horizonte); sucursal Centro, salvo el caso cross-branch.
- **Pasos:** 1) iniciar sesión; 2) abrir Recovery; 3) ejecutar el flujo principal; 4) actualizar la vista; 5) copiar el correlation ID si aparece.
- **Resultado esperado:** la vista refleja el resultado persistido por el backend y el timeline conserva trazabilidad.
- **Evidencia:** captura, hora, usuario, URL, request/correlation ID y resultado observado.
- **Severidad si falla:** Media.
- **Módulo responsable:** Recovery.
- **Diagnóstico:** usar el bundle sanitizado; nunca adjuntar cookies, tokens, contraseñas, PAN/CVV o payloads completos.

### Z-03 — validar un dato inválido

- **Objetivo:** validar un dato inválido en Recovery y confirmar que la respuesta sea autoritativa.
- **Rol:** Supervisor.
- **Precondiciones:** entorno preparado; Organization Alpha (dataset Café Horizonte); sucursal Centro, salvo el caso cross-branch.
- **Pasos:** 1) iniciar sesión; 2) abrir Recovery; 3) validar un dato inválido; 4) actualizar la vista; 5) copiar el correlation ID si aparece.
- **Resultado esperado:** la operación se bloquea con un código estable y no cambia datos.
- **Evidencia:** captura, hora, usuario, URL, request/correlation ID y resultado observado.
- **Severidad si falla:** Alta.
- **Módulo responsable:** Recovery.
- **Diagnóstico:** usar el bundle sanitizado; nunca adjuntar cookies, tokens, contraseñas, PAN/CVV o payloads completos.

### Z-04 — repetir la intención idempotente

- **Objetivo:** repetir la intención idempotente en Recovery y confirmar que la respuesta sea autoritativa.
- **Rol:** Cashier.
- **Precondiciones:** entorno preparado; Organization Alpha (dataset Café Horizonte); sucursal Centro, salvo el caso cross-branch.
- **Pasos:** 1) iniciar sesión; 2) abrir Recovery; 3) repetir la intención idempotente; 4) actualizar la vista; 5) copiar el correlation ID si aparece.
- **Resultado esperado:** la operación se bloquea con un código estable y no cambia datos.
- **Evidencia:** captura, hora, usuario, URL, request/correlation ID y resultado observado.
- **Severidad si falla:** Alta.
- **Módulo responsable:** Recovery.
- **Diagnóstico:** usar el bundle sanitizado; nunca adjuntar cookies, tokens, contraseñas, PAN/CVV o payloads completos.

### Z-05 — cambiar de sucursal

- **Objetivo:** cambiar de sucursal en Recovery y confirmar que la respuesta sea autoritativa.
- **Rol:** Employee.
- **Precondiciones:** entorno preparado; Organization Alpha (dataset Café Horizonte); sucursal Centro, salvo el caso cross-branch.
- **Pasos:** 1) iniciar sesión; 2) abrir Recovery; 3) cambiar de sucursal; 4) actualizar la vista; 5) copiar el correlation ID si aparece.
- **Resultado esperado:** la operación se bloquea con un código estable y no cambia datos.
- **Evidencia:** captura, hora, usuario, URL, request/correlation ID y resultado observado.
- **Severidad si falla:** Alta.
- **Módulo responsable:** Recovery.
- **Diagnóstico:** usar el bundle sanitizado; nunca adjuntar cookies, tokens, contraseñas, PAN/CVV o payloads completos.

### Z-06 — intentar sin permiso

- **Objetivo:** intentar sin permiso en Recovery y confirmar que la respuesta sea autoritativa.
- **Rol:** ReadOnly.
- **Precondiciones:** entorno preparado; Organization Alpha (dataset Café Horizonte); sucursal Centro, salvo el caso cross-branch.
- **Pasos:** 1) iniciar sesión; 2) abrir Recovery; 3) intentar sin permiso; 4) actualizar la vista; 5) copiar el correlation ID si aparece.
- **Resultado esperado:** la operación se bloquea con un código estable y no cambia datos.
- **Evidencia:** captura, hora, usuario, URL, request/correlation ID y resultado observado.
- **Severidad si falla:** Crítica.
- **Módulo responsable:** Recovery.
- **Diagnóstico:** usar el bundle sanitizado; nunca adjuntar cookies, tokens, contraseñas, PAN/CVV o payloads completos.
