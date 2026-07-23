# UMI Experience Integration Blueprint

UMI is the ecosystem shell; NEXO is a capability. No integration architecture is selected without UMI contracts.

| Opción                            | Ventajas                                 | Riesgos/requisitos                                                          |
| --------------------------------- | ---------------------------------------- | --------------------------------------------------------------------------- |
| App separada + deep link/contexto | boundary claro, despliegue independiente | transición visual; contexto debe firmarse y revalidarse                     |
| SSO + navegación coordinada       | experiencia continua sin acoplar builds  | protocolo, logout y tenant mapping conjuntos                                |
| BFF                               | adapta contratos y políticas             | operación adicional y ownership claro                                       |
| Shell/tokens coordinados          | coherencia visual                        | versionado y accesibilidad compartidos                                      |
| Microfrontend                     | integración profunda                     | alto acoplamiento, runtime/dependency/focus complexity                      |
| iframe                            | aislamiento rápido                       | cookies, CSP, focus, screen reader y navegación; no recomendado por defecto |

Preguntas: proveedor/protocolo SSO, claims y su no-autoridad, mapping org/branch, shell ownership, deep-link allowlist, CSP/orígenes, logout global, tokens/licencias, telemetry/correlation, soporte/branding y política de embedding. Toda entrada re-resuelve Membership/Tenant/Authorization en PostgreSQL. Se muestra origen y retorno seguro; NEXO no duplica navegación global.
