# PLAN_PRUEBAS.md — WiseLife

**Propósito:** estrategia ejecutable de pruebas, casos, criterios y evidencias QA.
**Responsable:** Ingeniero QA, con validación de Producto, Seguridad y DevOps.
**Estado:** aprobado como plan rector; la ejecución queda condicionada a staging, datos sintéticos y credenciales de prueba.
**Base documental:** `PRODUCT_BACKLOG.md`, `ARQUITECTURA.md`, `API.md`, `BASE_DATOS.md`, `SEGURIDAD.md` y `COMPONENTES.md`.

## Alcance alineado al producto

La cobertura corresponde al MVP y sus riesgos documentados: autenticación y callback, onboarding y perfiles, catálogo y disponibilidad de especialistas, reserva atómica, reporte de pago, cancelación, citas, agenda profesional, historia clínica, notas, CIE-10, consentimientos, RLS y auditoría. Notificaciones, administración y filtros avanzados se cubren como P1; videollamadas, chat en tiempo real, app nativa, IA clínica, suscripciones y cuentas familiares quedan fuera de esta campaña.

## Estrategia por nivel

| Nivel | Objetivo | Evidencia mínima |
|---|---|---|
| Smoke | Confirmar que la SPA carga y permite navegar, iniciar sesión y cerrar sesión | URL, commit, navegador y captura |
| Funcional | Validar criterios de aceptación y estados happy/negative/loading/empty/error/retry/refresh | Caso, resultado, datos y captura/log |
| Integración | Validar Auth, Data API, Postgres/RLS, concurrencia de agenda y pagos reportados | Query/response, usuario/rol y resultado |
| Seguridad | Probar aislamiento, IDOR/BOLA, roles, XSS, secretos, redirects y PHI | Request sanitizada, usuario atacante/víctima y evidencia |
| Regresión | Reejecutar P0/P1 afectados por cada cambio | Matriz de regresión y retest |

## Matriz de cobertura funcional

| ID | Área | Casos críticos | Prioridad |
|---|---|---|---|
| F-01 | Identidad | registro, login, logout, recuperación, callback, sesión expirada y reintento | P0 |
| F-02 | Perfiles | onboarding paciente/profesional, edición, validación, refresh y persistencia | P0 |
| F-03 | Descubrimiento | listado, filtros, detalle, disponibilidad, vacío y error de consulta | P0/P1 |
| F-04 | Agenda | reservar slot libre, slot pasado, doble reserva concurrente, cancelación y reprogramación | P0 |
| F-05 | Pagos | reporte válido/inválido, duplicado, reintento, estado pendiente/aprobado/rechazado | P0 |
| F-06 | Operación profesional | disponibilidad, bloqueos, agenda, aprobación de pago y cierre de sesión | P0 |
| F-07 | Clínico | acceso autorizado, historia, nota, CIE-10, actualización y datos sensibles | P0/P1 |
| F-08 | Cumplimiento | consentimiento, auditoría y no exposición de PHI | P0/P1 |
| F-09 | P1 | diario emocional, notificaciones, filtros avanzados y administración | P1 |

Cada caso debe comprobar también entradas inválidas, estados de carga/vacío/error, navegación directa, refresh, back/forward y recuperación tras fallo de red.

## Integración Supabase y contrato vigente

La arquitectura actual es `SPA → Supabase Auth/Data API → Postgres → RLS`; no existe API HTTP server-side aprobada. Por ello, los tests de integración deben registrar la tabla/operación Supabase, sesión, rol, policy aplicada y respuesta observada. No se deben inventar códigos HTTP del contrato objetivo de `API.md` hasta que exista una API propia.

Casos obligatorios:

- Auth y callback: sesión creada, confirmación requerida, logout y sesión expirada.
- RLS: paciente/profesional sólo acceden a filas permitidas por ownership y relación profesional-paciente.
- Agenda: dos usuarios intentan reservar el mismo slot; sólo uno confirma y el otro recibe conflicto seguro.
- Pagos: repetición del mismo intento no crea duplicados; el servidor/RLS conserva consistencia.
- Clínico: historia y notas no aparecen en consultas, logs, analytics ni respuestas de otro rol.
- Integridad: claves foráneas, estados válidos, eliminación/actualización y datos huérfanos.

## Seguridad

- No se usan `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_SECRET_KEY` ni secretos en el bundle público.
- Ejecutar pruebas autenticado como paciente, psicólogo, anónimo y usuario no relacionado.
- Intentar IDOR/BOLA modificando IDs de perfil, especialista, cita, historia y nota.
- Validar XSS en campos de perfil, notas y diarios; confirmar escape al renderizar.
- Validar redirects sólo a destinos permitidos; probar callback con `code` ausente, inválido y expirado.
- Verificar ausencia de PHI en consola, errores, URLs, analytics y capturas.
- Revisar RLS con una cuenta víctima y una cuenta atacante; una respuesta vacía no sustituye la verificación de policy.
- Revisar dependencias, headers de despliegue, cookies seguras en producción y rate limiting de auth/pagos cuando exista capa server-side.

## Accesibilidad

Validar teclado completo, orden de foco, foco visible, labels asociados, mensajes de error anunciables, nombres accesibles, contraste WCAG AA, zoom 200%, lector de pantalla y ausencia de contenido dependiente sólo del color. Probar login, onboarding, filtros, modal de nota, reserva, cancelación y navegación del dashboard.

## Responsive y compatibilidad

Probar 320, 375, 768, 1024 y 1440 px en Chrome/Chromium, Firefox y Safari/WebKit cuando esté disponible. Validar overflow horizontal, menú/sidebar, tablas, formularios, modales, tarjetas de especialistas, calendario, botones táctiles y orientación vertical/horizontal.

## Rendimiento

Objetivos iniciales: LCP ≤ 2.5 s, CLS ≤ 0.1 e INP ≤ 200 ms en staging; registrar TTFB, FCP, LCP, CLS, INP, tamaño de bundles y errores de consola. Ejecutar cold load y navegación autenticada. El presupuesto de alerta para chunks JavaScript es 500 KB; cualquier excedente requiere justificación o code-splitting.

## Ambientes, datos y roles

- **Local/preview:** smoke y regresión visual sin datos clínicos reales.
- **Staging aislado:** integración, seguridad, carga y compatibilidad.
- **Datos:** usuarios sintéticos confirmados, especialistas sintéticos, slots controlados y pagos ficticios; nunca PHI real.
- **Roles:** anónimo, paciente A, paciente B, psicólogo relacionado, psicólogo no relacionado y administrador explícitamente autorizado.

## Herramientas y evidencias

Herramientas propuestas: Vitest/Testing Library para unidades, Playwright o `agent-browser` para E2E, Supabase MCP/queries controladas para RLS, Lighthouse o Web Vitals para rendimiento y axe/WAVE para accesibilidad. La herramienta definitiva debe confirmarse por QA + DevOps antes de automatizar. Cada ejecución registra commit, ambiente, navegador/viewport, datos, pasos, resultado, evidencia y severidad.

## Criterios de salida y defectos

- Cero defectos P0/P1 abiertos.
- Todos los casos P0 ejecutados y con evidencia.
- P2 sólo puede quedar abierto con aceptación explícita de Producto.
- Sin fallos críticos de RLS, IDOR/BOLA, exposición de secretos o PHI.
- Objetivos de rendimiento, accesibilidad y responsive medidos y documentados.
- Todo defecto incluye pasos reproducibles, esperado/actual, ambiente, evidencia, severidad, responsable y retest.

## Pendientes bloqueantes `[POR DEFINIR]`

| Pendiente | Responsable | Condición para cerrar |
|---|---|---|
| Herramienta oficial y cobertura mínima | QA + DevOps | Suite y umbrales versionados |
| Staging aislado y variables | DevOps | Ambiente reproducible |
| Datos sintéticos y cuentas confirmadas | QA + Seguridad | Dataset sin PHI y roles disponibles |
| Pruebas de carga y concurrencia | QA + Backend | Perfil de carga, umbral y evidencia |
| Política de pago Nequi, expiración, fraude y reembolso | Producto + Finanzas/Legal | Reglas aprobadas y casos F-05 |
| Política de cancelación y reprogramación | Producto | Reglas aprobadas y casos F-04 |
| Retención/exportación/corrección clínica | Legal + Seguridad | Reglas aprobadas y casos F-07/F-08 |
| Roles administrativos definitivos | Arquitectura de Seguridad | Matriz de permisos aprobada |
| Catálogo de operaciones Supabase/API | Backend | Inventario sincronizado con código y `BASE_DATOS.md` |
| Referencia de commit en documentación | Arquitectura | `ARQUITECTURA.md` actualizado al commit liberado |

## Aprobación

Este documento es el plan maestro de pruebas aprobado para orientar la ejecución. La aprobación de una versión/release requiere completar los pendientes bloqueantes, adjuntar resultados y cumplir los criterios de salida; el plan por sí solo no constituye evidencia de release.

**Referencias:** `PRODUCT_BACKLOG.md`, `ARQUITECTURA.md`, `API.md`, `BASE_DATOS.md`, `SEGURIDAD.md`, `COMPONENTES.md`.
