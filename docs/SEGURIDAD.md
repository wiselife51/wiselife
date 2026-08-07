# SEGURIDAD.md — WiseLife

**Propósito:** seguridad de aplicación, infraestructura, autenticación, autorización y controles.
**Responsable:** Arquitecto de Seguridad y Ciberseguridad. **Estado:** Contraste documental realizado contra `main` en `a763ffd` (07-08-2026); requiere validación técnica y legal antes de producción.

## Resultado del contraste documental

| Documento | Confirmación de seguridad | Brecha o acción requerida |
| --- | --- | --- |
| `ARQUITECTURA.md` | Confirma SPA, acceso directo del frontend a Supabase, ausencia de backend uniforme y riesgo de IDOR clínico. | Actualizar su referencia al commit `a763ffd`; la protección de `main`, CODEOWNERS y checks deben verificarse en GitHub. |
| `API.md` | Confirma que no existe API HTTP propia ni contrato server-side; la autorización depende de Auth/Data API/RLS. | Catalogar consultas y mutaciones, definir validación server-side, límites, rate limiting, idempotencia y errores seguros antes de exponer API. |
| `BASE_DATOS.md` | Confirma RLS habilitado en las tablas públicas y que el estado `rls_forced = false` no equivale a RLS deshabilitado. | Auditar policies por operación, `USING`/`WITH CHECK`, grants de Data API, ownership padre-hijo, migraciones y Storage; RLS habilitado no prueba autorización correcta. |
| `DEVOPS.md` | Confirma ausencia de workflows, tests/typecheck declarados y controles CI activos; distingue `VITE_*` públicos de secretos server-side. | Formalizar CI, lockfile/Node/package manager, secret scanning, Dependabot, protección de ramas, variables por ambiente, observabilidad y rollback probado. |

**Conclusión:** los cuatro documentos son coherentes con los controles preventivos de esta política. No obstante, la seguridad no puede considerarse aprobada: las policies de Supabase, los controles remotos de GitHub/Vercel y la clasificación/retención legal de datos siguen sin evidencia suficiente.

## Plan de remediación por área o rol

| Prioridad | Brecha / control requerido | Entregable verificable | Área o rol responsable | Aprobador / dependencia |
| --- | --- | --- | --- | --- |
| P0 | Autorización clínica e IDOR/BOLA | Matriz paciente-profesional-admin; policies y pruebas negativas por tabla y operación | Backend/Supabase + Arquitecto de Seguridad | Seguridad y Responsable Clínico |
| P0 | RLS incompleto o incorrecto | Inventario de tablas expuestas, `GRANT`, policies `SELECT/INSERT/UPDATE/DELETE`, `USING` y `WITH CHECK`; resultado de Security Advisors | DBA/Supabase | Arquitecto de Seguridad |
| P0 | Exposición de secretos | Rotación de claves potencialmente expuestas; `service_role` sólo server-side; revisión de variables Vercel por ambiente | DevOps/Plataforma | Seguridad |
| P0 | Datos clínicos sin gobierno formal | Clasificación, base legal/consentimiento, minimización, retención, eliminación y procedimiento de derechos del titular | Legal/Privacidad + Responsable Clínico | DPO/Responsable de Privacidad |
| P1 | API y mutaciones sin contrato seguro | Catálogo de consultas/mutaciones, esquemas de validación, errores genéricos, límites, rate limiting e idempotencia | Backend | Seguridad + QA |
| P1 | CI/CD sin controles obligatorios | Workflow con lint, typecheck, build, tests, audit, secret scanning y bloqueo de merge | DevOps/Plataforma | Tech Lead + Seguridad |
| P1 | Rama y repositorio sin gobierno demostrado | Protección de `main`, revisión obligatoria, CODEOWNERS, MFA y mínimo privilegio | DevOps/GitHub Admin | Tech Lead + Seguridad |
| P1 | Dependencias vulnerables | SBOM, Dependabot/Renovate, lockfile reproducible, SLA de parchado y `npm audit` limpio o excepción aprobada | DevOps + Desarrollo | Seguridad |
| P1 | Observabilidad y respuesta insuficientes | Logs sin PHI, alertas, trazabilidad de accesos, playbook, severidades, contactos y simulacro | DevOps/SRE + Seguridad | Comité de Incidentes |
| P1 | Backup y continuidad no demostrados | RPO/RTO, backups cifrados, restauración probada y rollback documentado | DevOps/SRE + DBA | Dirección Técnica |
| P2 | Storage y archivos clínicos | Buckets privados, policies por propietario/relación, URLs temporales, límites MIME/tamaño y antivirus | Backend/Supabase | Seguridad |
| P2 | Frontend y sesión | CSP aplicada, headers, cookies seguras, expiración/revocación, protección de rutas y ausencia de PHI en cliente/logs | Frontend + DevOps | Seguridad |
| P2 | Pruebas de seguridad ausentes | Casos autenticados/no autenticados, tenant isolation, abuso de flujos, SAST/DAST y evidencia archivada | QA + Seguridad | Tech Lead |
| P2 | Proveedores y notificaciones | Evaluación de terceros, DPA, cifrado, minimización y prohibición de PHI en SMS/email sin autorización | Compras + Legal + Seguridad | DPO |

## Controles obligatorios antes de desarrollo

1. **Gobierno:** Legal/Privacidad debe aprobar clasificación de datos, base legal, consentimiento, retención colombiana, DPIA y derechos del titular.
2. **Modelo de acceso:** Seguridad, Backend y Responsable Clínico deben aprobar la matriz de roles y relaciones paciente-profesional antes de crear nuevas tablas o pantallas.
3. **Base de datos:** DBA/Supabase debe entregar inventario de tablas, grants, RLS por operación, integridad referencial, políticas para filas hijas, Storage y resultado de advisors.
4. **Aplicación:** Backend/Frontend debe definir validación server-side, manejo de errores sin enumeración, rate limits, idempotencia, protección de rutas y no exposición de PHI.
5. **Entrega:** DevOps debe implementar CI/CD con lockfile, lint, typecheck, build, tests, SCA, secret scanning, SBOM, environments separados y aprobación de seguridad.
6. **Operación:** DevOps/SRE debe documentar logging seguro, alertas, backups, RPO/RTO, restauración, rollback y respuesta a incidentes.
7. **Aceptación:** QA debe conservar evidencia de pruebas positivas y negativas de autenticación, autorización, IDOR/BOLA, RLS, Storage, abuso y regresión.

## Autorización y pruebas mínimas

Permisos basados en sesión y claims confiables; nunca en `user_metadata` editable. Probar explícitamente: acceso anónimo rechazado, paciente aislado de otro paciente, profesional limitado a su relación clínica, admin con privilegio mínimo, reasignación de propietario rechazada, mutación de filas hijas sin acceso al padre rechazada y revocación de sesión efectiva.

**Responsables:** Arquitecto de Seguridad define controles; Backend/Supabase los implementa; QA los prueba; Responsable Clínico valida el modelo asistencial.

## Datos sensibles y privacidad

Historia, notas, diagnósticos, consentimientos, pagos y teléfonos requieren minimización, cifrado en tránsito/reposo, clasificación, retención y eliminación aprobadas por Legal/Privacidad. Nunca enviar PHI a logs, analytics, soporte, proveedores de notificaciones o modelos sin finalidad, autorización y contrato aplicable. Legal/Privacidad debe definir el procedimiento para titulares, incidentes y transferencias internacionales.

## Supabase y almacenamiento

No exponer `service_role`; usar claves públicas sólo en cliente. Cada tabla expuesta debe tener RLS y policies específicas con `TO authenticated`, `USING` y `WITH CHECK`; revisar `UPDATE` con SELECT policy, grants del Data API y vistas con `security_invoker`. Las funciones `SECURITY DEFINER` deben ser excepcionales, fijar `search_path`, calificar nombres y restringir `EXECUTE`. DBA/Supabase debe ejecutar advisors y documentar evidencia. Storage debe ser privado, con acceso temporal y validación de tipo/tamaño.

## Operación, CI/CD y respuesta

DevOps debe establecer protección de `main`, CODEOWNERS, MFA, revisión de cambios, secret scanning, Dependabot/Renovate, SBOM, lockfile reproducible, parches con SLA y variables separadas por ambiente. SRE debe impedir PHI en logs, configurar alertas, backups cifrados, restauración probada, RPO/RTO y rollback. Seguridad debe mantener el playbook de incidentes, clasificación, notificación, preservación de evidencia y calendario de revisiones.

## Evidencia de cierre requerida

Ningún control se considera cerrado por declaración. Cada responsable debe adjuntar al PR o registro de cambio: configuración/policy, prueba reproducible, resultado, fecha, ambiente, riesgo residual y aprobador. Seguridad emitirá la aprobación final sólo cuando los P0 estén cerrados y los P1 tengan excepción formal, responsable y fecha límite.

## Pendientes `[POR DEFINIR]`

Clasificación y retención colombiana, DPIA, matriz de roles, proveedor de notificaciones, límites por endpoint, RPO/RTO, SLA de vulnerabilidades, calendario de auditoría y propietario del registro de incidentes. **Responsables:** Legal/Privacidad, Seguridad, Backend, DBA/Supabase, DevOps/SRE, QA y Responsable Clínico según la matriz anterior.

## Referencias
`ARQUITECTURA.md`, `API.md`, `BASE_DATOS.md`, `DEVOPS.md`, `PLAN_PRUEBAS.md`.
