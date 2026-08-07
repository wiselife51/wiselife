# API.md — WiseLife

**Propósito:** registrar las interfaces de datos y contratos de integración.
**Responsable:** Desarrollo Backend.
**Estado:** inventario actualizado contra el frontend; no existe catálogo HTTP propio aprobado.

## Interfaz actualmente implementada
La aplicación usa `@supabase/supabase-js` desde el frontend para autenticación y consultas a la Data API de Supabase. Los módulos acceden directamente a tablas como perfiles, psicólogos, disponibilidad, citas, historia clínica y notas.

Por tanto, la interfaz vigente es:

`SPA → Supabase Auth/Data API → Postgres → RLS`

No se identificaron en el repositorio endpoints propios, route handlers, funciones Edge, contrato OpenAPI, webhooks de pago ni una capa server-side uniforme.

## Capacidades funcionales
El frontend integra operaciones relacionadas con autenticación, perfiles/onboarding, especialistas, disponibilidad, citas, diarios/evaluaciones, historia clínica, notas y pagos reportados. El detalle exacto de cada consulta está distribuido en las páginas y componentes; debe extraerse a un catálogo versionado antes de tratarlo como API pública.

## Inventario observado de operaciones Supabase
Este inventario describe dominios usados por la SPA, no endpoints HTTP propios ni un contrato público estable:

| Dominio | Operaciones observadas | Fuente de autoridad |
| --- | --- | --- |
| Auth | registro, inicio/cierre de sesión, recuperación/callback | Supabase Auth y sesión del cliente |
| Perfiles | lectura y actualización del perfil del usuario | Data API + RLS |
| Especialistas | listado, detalle, favoritos y disponibilidad | Data API + RLS |
| Agenda | disponibilidad, bloques y citas | Data API + RLS; concurrencia pendiente |
| Clínico | historia clínica y notas de sesión | Data API + RLS; PHI sensible |
| Bienestar | diarios y encuestas | Data API + RLS |
| Pagos | consulta/registro relacionado con transacciones | Data API + RLS; idempotencia pendiente |

Los nombres exactos de tablas, columnas, filtros y payloads deben mantenerse sincronizados con `BASE_DATOS.md` y el código fuente. No asumir que esta tabla autoriza acceso: la autorización efectiva depende de sesión, policies y restricciones del esquema.

## Contrato objetivo
Cuando se incorpore una API server-side:
- derivar identidad de la sesión y no aceptar `user_id`, rol o autorización del cliente como autoridad;
- validar esquema, ownership, estado y concurrencia en servidor/RLS;
- devolver datos mínimos, errores seguros y un identificador de correlación;
- hacer idempotentes reservas, pagos y movimientos de saldo;
- definir paginación, límites, versionado y política de compatibilidad.

Estos puntos son requisitos de diseño, no capacidades actualmente verificadas.

## Errores objetivo
`401` no autenticado, `403` no autorizado, `404` inexistente/no revelable, `409` conflicto o repetición idempotente, `422` validación y `500` error interno sin detalles SQL.

La Data API de Supabase puede devolver formatos y códigos propios; no debe documentarse como si ya siguiera este contrato común.

## Seguridad
No exponer service role ni claves secretas en el cliente. No incluir PHI en logs. Antes de publicar endpoints propios deben definirse CORS, rate limiting, CSRF/cookies, validación, URLs firmadas y webhooks autenticados según el caso.

## Pendientes
- catálogo de consultas/mutaciones actuales;
- decisión sobre API server-side o continuidad con Data API;
- OpenAPI, versionado y payloads;
- límites, paginación y webhooks de pagos;
- estrategia de autenticación y observabilidad server-side.

**Responsables:** Desarrollo Backend + Seguridad.

## Referencias
`ARQUITECTURA.md`, `BASE_DATOS.md` y `DEVOPS.md`.
