# Seguridad, privacidad y cumplimiento

## Baseline y alcance

NEXO aplica secure-by-design, mínimo privilegio, defensa en profundidad, default deny, minimización y trazabilidad. Objetivo contractual interno: verificar **OWASP ASVS 5.0.0 nivel 2** completo; seleccionar nivel 3 para consola de plataforma, acceso de soporte, material criptográfico, aislamiento multi-tenant, administración y recuperación. Los IDs siempre se registran con versión (`v5.0.0-x.y.z`) en la matriz viva de verificación, importada del CSV oficial; este documento no reemplaza el estándar.

Top 10 es un modelo de conciencia de riesgos, no checklist de conformidad. ASVS, threat model, pruebas y revisión operacional aportan evidencia. Se revisan además OWASP Cheat Sheets de Multi-Tenant, Authentication, Session, Authorization, Password Storage, Logging, Input Validation, REST, File Upload, Secrets, CI/CD y Supply Chain.

## Activos, fronteras y amenazas prioritarias

Activos: identidad/sesiones, datos personales, ventas/caja/inventario, secretos, backups, configuración fiscal, auditoría y disponibilidad del POS. Fronteras: navegador–edge–API, API–datos/cola, worker–terceros, tenant–tenant, soporte–cliente y dispositivo offline–sincronización.

Abusos prioritarios: usuario accede a otro tenant/sucursal; cajero eleva rol o oculta devolución; doble envío duplica venta; atacante roba sesión; XSS exfiltra datos offline; importación inyecta fórmula/malware; tercero/webhook repite mensajes; dependencia/build comprometido; administrador interno abusa soporte; caída parcial deja transacción ambigua; bot agota POS; backup no restaura.

Threat modeling usa diagrama de flujo + STRIDE/abuse cases al crear módulo/integración y antes de release mayor. Cada amenaza registra activo, actor, precondición, impacto, control, prueba, owner y riesgo residual.

## Requisitos de seguridad `RS`

### Gobierno y diseño

- RS-001: clasificación de datos (`public`, `internal`, `confidential`, `restricted`), owner, finalidad, residencia, retención y acceso antes de persistirlos.
- RS-002: threat model y security acceptance criteria para flujos de venta, acceso, tenant, offline, importación y soporte.
- RS-003: inventario de activos, endpoints, integraciones, dependencias y flujo de datos actualizado automáticamente cuando sea posible.
- RS-004: default deny; fallos de autorización, configuración, dependencia o validación cierran de forma segura sin estado parcial.
- RS-005: segregación de funciones para release, secretos, producción y soporte; excepciones caducan y se auditan.

### Identidad, autenticación y sesión

- RS-010: identificadores de usuario opacos; mensajes y tiempos no permiten enumeración práctica.
- RS-011: contraseña, si existe, admite gestores/pegar, longitud ≥15 sin MFA o ≥8 con MFA, máximo ≥64, Unicode, sin reglas arbitrarias; se compara contra contraseñas comprometidas y no rota periódicamente sin causa.
- RS-012: hash con Argon2id y parámetros calibrados; salt automático y pepper opcional en vault. Migración transparente al autenticar.
- RS-013: MFA resistente a phishing (passkey/WebAuthn preferida) para propietarios/administradores y obligatorio para plataforma/soporte; recuperación no es bypass débil.
- RS-014: tokens de verificación/recuperación aleatorios, un solo uso, propósito/audiencia ligados, TTL corto y revocación; el cambio invalida sesiones según riesgo y notifica.
- RS-015: sesión web mediante cookie `Secure`, `HttpOnly`, `SameSite` apropiado, prefijo seguro, ID rotado al autenticar/cambiar privilegio; tokens no en localStorage.
- RS-016: CSRF para toda escritura basada en cookie; CORS allowlist exacta, sin reflejo de origen con credenciales.
- RS-017: timeouts idle/absoluto por riesgo, reautenticación para cambio de correo/MFA/roles, exportación, soporte, devolución sensible y secretos.
- RS-018: usuario ve/revoca sesiones; suspensión, retiro de tenant o cambio crítico revoca capacidad y sesiones pertinentes.
- RS-019: rate limit y detección por cuenta, IP/dispositivo y tenant con respuestas que no facilitan enumeración; lockout evita DoS permanente.

### Autorización y aislamiento

- RS-020: autorización server-side en cada operación y objeto; combina rol, permiso, tenant, sucursal, propiedad/estado y monto (RBAC + atributos).
- RS-021: contexto tenant se deriva de identidad+membresía activa y se propaga explícitamente; ID suministrado se valida contra contexto.
- RS-022: toda tabla/objeto/cache/cola/búsqueda incluye tenant; RLS default deny y constraints compuestas son defensa adicional.
- RS-023: pruebas automatizadas intentan cada operación con tenant, sucursal, rol y objeto ajenos; no se aceptan rutas sólo protegidas por UI.
- RS-024: acceso de soporte es JIT, con ticket/motivo, alcance, expiración, aprobación cuando corresponda, banner visible y log inmutable; no impersonación silenciosa.
- RS-025: rate limits/cuotas por tenant evitan noisy neighbor; acciones masivas tienen límite y cancelación.

### Entrada, salida, frontend, archivos y API

- RS-030: validar tipo, longitud, rango, formato, cardinalidad y reglas de negocio en frontera y dominio; rechazar propiedades inesperadas cuando el contrato lo define.
- RS-031: queries parametrizadas y APIs seguras; ningún input forma SQL, comando, ruta, plantilla o expresión sin control contextual.
- RS-032: codificación de salida contextual y sanitización allowlist sólo cuando se admite contenido enriquecido; CSP estricta sin `unsafe-eval`, Trusted Types donde sea viable.
- RS-033: headers: HSTS tras validar subdominios, CSP, `nosniff`, Referrer-Policy restrictiva, Permissions-Policy y anti-framing CSP; no revelar stack/versiones.
- RS-034: API valida content type/size, método, auth, schema y rate; errores RFC 9457 no exponen internals. IDs no son control de acceso.
- RS-035: importaciones tienen tamaño/filas límite, nombre generado, storage aislado, tipo por contenido, análisis antimalware si archivos, parser endurecido y procesamiento asíncrono.
- RS-036: exportación CSV neutraliza celdas que inician fórmula; descargas usan URL de un uso/TTL y reautorización al solicitar, no sólo al generar.
- RS-037: service worker tiene scope mínimo, assets versionados e integridad del origen; cache nunca mezcla tenant/usuario y se purga en logout/revocación.

### Transacciones y lógica de negocio

- RS-040: claves idempotentes ligadas a actor, tenant, endpoint y hash de petición; reutilización distinta se rechaza.
- RS-041: constraints/transacciones impiden devolución excesiva, cita solapada, folio duplicado, doble cierre y movimiento duplicado.
- RS-042: descuentos, ajustes, devoluciones, exportaciones y cambios de permiso registran actor, antes/después o referencia, motivo y aprobación.
- RS-043: cálculo monetario canónico ocurre en servidor con snapshot y límites; cliente manipulado no cambia total.
- RS-044: timeouts/excepciones producen estado definido y compensación/reconciliación; nunca “éxito” ambiguo.
- RS-045: automatización antiabuso no bloquea accesibilidad; operaciones offline tienen límites de monto, edad, cantidad y método configurables.

### Criptografía, secretos y comunicaciones

- RS-050: TLS 1.2+ con preferencia 1.3, suites actuales, validación completa y HSTS; mTLS/identidad de workload para canales internos de alto riesgo según plataforma.
- RS-051: cifrado administrado AES-256 o equivalente en BD, backups y objetos; cifrado de campo/envelope para secretos y material fiscal futuro.
- RS-052: algoritmos/protocolos aprobados y bibliotecas mantenidas; no criptografía propia. Aleatoriedad CSPRNG para tokens/IDs sensibles.
- RS-053: secretos en secret manager/KMS, separados por ambiente y mínimo privilegio; rotación, versión, auditoría y procedimiento de emergencia.
- RS-054: datos `restricted` no aparecen en URL, analytics, trazas, errores o logs; PAN completo, CVV, contraseñas, tokens y claves están prohibidos.
- RS-055: webhooks futuros usan firma MAC/asimétrica, timestamp, ID, ventana anti-replay y comparación constante; rotación admite solapamiento corto.

### Supply chain, configuración y entrega

- RS-060: lockfiles inmutables, fuentes allowlist, verificación de integridad, revisión de paquetes nuevos y actualización automatizada controlada.
- RS-061: CI genera SBOM y ejecuta secret scanning, SAST, SCA, IaC/container scan y pruebas; artefacto firmado con provenance se promueve sin rebuild.
- RS-062: ramas/release protegidos, revisión de dos personas en seguridad/IaC, runners efímeros y permisos OIDC breves; PR no confiable no recibe secretos.
- RS-063: imágenes mínimas, non-root, filesystem read-only cuando viable, capabilities retiradas, network policies y parcheo con SLA.
- RS-064: configuración segura validada al arranque; debug, endpoints administrativos, listados y defaults de proveedor no llegan a producción.
- RS-065: vulnerabilidad crítica explotable bloquea release; SLA: crítica 24 h mitigación/72 h corrección, alta 7 días, media 30, baja 90, con excepción firmada y caducidad.

### Logging, detección y respuesta

- RS-070: registrar éxitos/fallos de autenticación, autorización, sesión, cambios de privilegio/configuración, operaciones críticas, soporte, exportación, validaciones anómalas y fallos de integridad.
- RS-071: evento incluye UTC, tipo, resultado, severidad, servicio/ambiente, correlation/trace, tenant y actor seudónimo cuando proceda; sanitiza CR/LF y datos sensibles.
- RS-072: logs se centralizan con transporte cifrado, acceso segregado, integridad/retención y alerta si deja de fluir; reloj sincronizado.
- RS-073: alertas para cross-tenant, credential stuffing, MFA/recovery, soporte, exportación masiva, reembolsos/anulaciones atípicos y cambios críticos.
- RS-074: plan de respuesta define clasificación, guardia, contención, evidencia, comunicación, lecciones y obligaciones contractuales/legales; simulacro semestral.
- RS-075: errores inesperados tienen correlation ID, respuesta genérica y telemetría; manejadores distinguen fallo transitorio, validación y defecto.

## OWASP Top 10:2025 — tratamiento explícito

| Riesgo                                     | Aplicación en NEXO                   | Controles/evidencia principales        |
| ------------------------------------------ | ------------------------------------ | -------------------------------------- |
| A01 Broken Access Control                  | tenant/sucursal/rol/objeto           | RS-020..25, RLS, matrices negativas    |
| A02 Security Misconfiguration              | nube, cache, headers, debug          | RS-033, RS-063..64, IaC/DAST           |
| A03 Software Supply Chain Failures         | npm, imágenes, CI                    | RS-060..65, SBOM/provenance/SCA        |
| A04 Cryptographic Failures                 | sesiones, PII, backups, certificados | RS-050..55, inventario/rotación        |
| A05 Injection                              | SQL, XSS, CSV, plantillas            | RS-030..37, tests SAST/DAST            |
| A06 Insecure Design                        | lógica/offline/soporte               | RS-001..05, RS-040..45, threat model   |
| A07 Authentication Failures                | takeover/recovery/sesión             | RS-010..19, MFA y pruebas              |
| A08 Software or Data Integrity Failures    | eventos, updates, artefactos         | RS-040, 055, 061..62, firmas           |
| A09 Security Logging and Alerting Failures | fraude/fuga sin detectar             | RS-070..75, casos de alerta/simulacro  |
| A10 Mishandling of Exceptional Conditions  | caída parcial/doble efecto           | RS-004, 044, 075, chaos/reconciliación |

## ASVS 5.0.0 — estrategia de verificación

La matriz de QA debe importar todos los requisitos L2 aplicables de la versión estable, conservar texto/licencia/origen y marcar: aplicable, control NEXO, evidencia, owner, release y excepción. Cobertura esperada por capítulos: encoding/sanitization; validación/lógica; frontend web; API; archivos; autenticación; sesión; autorización; tokens autocontenidos; OAuth/OIDC si se usa; criptografía; comunicación segura; configuración; protección de datos; arquitectura/código seguro; logging/errores. “No aplica” necesita justificación revisada por Seguridad.

## Privacidad y regulación mexicana

La LFPDPPP vigente (nueva ley publicada 20-03-2025, reforma 14-11-2025 a la fecha de corte) exige tratamiento legítimo, controlado e informado. Antes de GA, asesoría jurídica mexicana debe validar roles, contratos, aviso, transferencias, encargados, conservación, medidas y procedimiento de derechos; esta especificación no es opinión legal.

- PRIV-01: inventario y registro de actividades por dato/finalidad/base/flujo/encargado/retención.
- PRIV-02: avisos integral/simplificado versionados, accesibles antes de capturar, con evidencia de versión mostrada/aceptada cuando proceda.
- PRIV-03: privacidad por defecto: cliente puede ser anónimo; teléfono, cumpleaños, notas y datos sensibles no son obligatorios.
- PRIV-04: contrato SaaS define responsable/encargado, instrucciones, subencargados, confidencialidad, retorno/eliminación e incidentes.
- PRIV-05: flujo autenticado para derechos de acceso, rectificación, cancelación y oposición, con identidad proporcional, SLA legal y bitácora.
- PRIV-06: retención configurable con mínimo legal/contractual; al vencer, borrar o anonimizar también caches, objetos y proyecciones; backups expiran por ciclo y aplican supresión al restaurar.
- PRIV-07: transferencias y residencia se documentan; subencargados se evalúan y notifican conforme contrato/ley.
- PRIV-08: datos de empleados/clientes se segregan; notas libres advierten y restringen datos sensibles.
- PRIV-09: analítica de producto usa eventos minimizados/seudónimos; no session replay en POS ni formularios sensibles por defecto.
- PRIV-10: breach runbook incluye evaluación, contención y notificación a titulares/autoridad cuando jurídicamente corresponda.

## Pagos y fiscal

MVP registra medio (“efectivo”, “terminal externa”, etc.) pero no adquiere datos de tarjeta; formularios prohíben PAN/CVV y soporte los redacta. Una integración futura usa checkout/terminal alojada y tokens del PSP; antes de activarla se determina alcance PCI DSS 4.0.1 con QSA/SAQ aplicable.

Un recibo NEXO no es CFDI. La futura capacidad fiscal seguirá Anexo 20/CFDI vigente, catálogos y PAC autorizado; almacenará XML/acuse íntegros, estado y eventos, y hará rotación segura de CSD. Normativa SAT se revisa en cada release fiscal.

## Evidencia mínima de release

Threat model actualizado, matriz ASVS, revisión de aislamiento, SAST/SCA/DAST, SBOM/provenance, pentest antes de GA y anual/tras cambio material, secretos/config revisados, restauración comprobada, alertas probadas y riesgos residuales aceptados por owner. Hallazgo crítico/alto explotable o fallo cross-tenant impide producción.
