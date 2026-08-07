# SEGURIDAD.md — WiseLife

**Propósito:** seguridad de aplicación, infraestructura, autenticación, autorización y controles.
**Responsable:** Arquitecto de Seguridad y Ciberseguridad. **Estado:** Requiere auditoría y validación legal.

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
