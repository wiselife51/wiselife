# API.md — WiseLife

**Propósito:** APIs, endpoints, contratos, autenticación, respuestas y errores.
**Responsable:** Desarrollador Backend. **Estado:** Inventario parcial; requiere contrato de backend aprobado.

## Estado actual
La aplicación usa cliente Supabase desde frontend en varios módulos. No se encontró un catálogo único de endpoints HTTP implementados en la documentación auditada. Este documento no inventa endpoints.

## Capacidades a contratar
Auth/callback, perfiles y onboarding, especialistas, disponibilidad, citas, pagos reportados, historia clínica, notas, consentimientos y administración.

## Contrato común
- Identidad derivada de sesión; nunca aceptar `user_id`, rol o autorización como autoridad desde el cliente.
- Respuestas con estado, datos mínimos, `request_id` y error seguro.
- Validar esquema, ownership, estado y concurrencia en servidor/RLS.
- Operaciones de reserva/pago idempotentes; paginación y límites explícitos.

## Errores mínimos
`401` no autenticado, `403` no autorizado, `404` inexistente/no revelable, `409` conflicto de agenda/idempotencia, `422` validación y `500` error interno sin detalles SQL.

## Seguridad
Nunca exponer service role; no incluir PHI en logs; revisar CORS, rate limiting, CSRF/cookies y URLs firmadas si aplica.

## Pendientes `[POR DEFINIR]`
Lista de rutas reales, OpenAPI, versionado, proveedor de API, payloads, límites, webhooks de pago y autenticación server-side — **Responsable:** Desarrollador Backend + Seguridad.

## Referencias
`ARQUITECTURA.md`, `BASE_DATOS.md`, `SEGURIDAD.md`, `PLAN_PRUEBAS.md`.
