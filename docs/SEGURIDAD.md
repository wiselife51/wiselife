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

## Controles obligatorios
Supabase Auth, sesiones seguras, RLS en toda tabla expuesta, mínimo privilegio, validación de entradas, secrets sólo server-side, HTTPS, headers y separación de ambientes.

## Autorización
Permisos basados en sesión/rol confiable y relación profesional-paciente. Probar permitido y denegado, BOLA/IDOR, reasignación de propietario, acceso a historia ajena y mutaciones de hijos.

## Datos sensibles
Historia, notas, diagnósticos, consentimientos, pagos y teléfonos requieren minimización, retención, auditoría, exportación y eliminación conforme a la política legal. Nunca enviar PHI a logs, analytics o modelos sin propósito/consentimiento.

## Supabase
No exponer `service_role`; políticas con `TO authenticated`, `USING` y `WITH CHECK`; funciones `SECURITY DEFINER` con `search_path` fijo; revisar advisors, grants y Storage privado.

## Operación
Secret scanning, dependencias actualizadas, MFA/SSO cuando corresponda, protección de `main`, rollback y respuesta a incidentes documentada.

## Pendientes `[POR DEFINIR]`
Clasificación formal, retención colombiana, DPIA, matriz de roles, proveedor de notificaciones, rate limits y calendario de auditoría — **Responsable:** Seguridad + Legal + DevOps.

## Referencias
`API.md`, `BASE_DATOS.md`, `DEVOPS.md`, `PLAN_PRUEBAS.md`.
