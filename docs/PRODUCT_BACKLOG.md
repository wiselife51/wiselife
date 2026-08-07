# PRODUCT_BACKLOG.md — WiseLife

**Propósito:** producto, épicas, historias, prioridades y criterios de aceptación.
**Responsable:** Product Owner. **Estado:** Requiere validación de Producto, Seguridad, QA y Legal.

## Alcance MVP
Plataforma colombiana para que pacientes creen su cuenta, completen su perfil, encuentren un psicólogo, reserven y reporten el pago de una sesión; el psicólogo gestiona disponibilidad, agenda y documentación clínica autorizada.

## Épicas priorizadas

| Módulo | Historias principales | Prioridad |
|---|---|---|
| Identidad y acceso | Registro, login, logout, recuperación y callback | P0 Must |
| Perfiles | Onboarding y edición de paciente; onboarding profesional | P0 Must |
| Descubrimiento | Catálogo, filtros, perfil y disponibilidad | P0/P1 |
| Agenda y pagos | Reserva atómica, estados, reporte de pago, cancelación | P0 Must |
| Operación profesional | Agenda, bloqueos, aprobación de pagos y cierre de sesión | P0 Must |
| Experiencia clínica | Historia, notas de evolución y CIE-10 | P0/P1 |
| Seguridad y cumplimiento | RLS, consentimientos y auditoría | P0/P1 |
| Notificaciones y administración | Recordatorios y consola administrativa | P1 Should |

## Criterios de aceptación transversales
- Validación de entradas, estados de carga/error/vacío y persistencia comprobable.
- Aislamiento por usuario, rol y relación profesional-paciente mediante RLS.
- Doble reserva, pagos duplicados, reintentos e idempotencia controlados en servidor.
- Datos clínicos fuera de logs, analytics y respuestas no autorizadas.
- Pruebas funcionales, negativas, accesibilidad y responsive antes de Done.

## MVP Must Have
Autenticación, perfiles, disponibilidad, catálogo, reserva, pago reportado, citas, agenda profesional, historia clínica, notas, permisos, RLS y consentimiento.

## MVP ampliado
Filtros avanzados, reprogramación, diario emocional, CIE-10, notificaciones, auditoría y administración.

## Fuera de alcance
Videollamadas propias, chat en tiempo real, app nativa, diagnóstico/recomendaciones clínicas mediante IA, suscripciones, cuentas familiares e integraciones empresariales.

## Decisiones pendientes `[POR DEFINIR]`
- Comprobación, expiración, fraude y reembolso de pagos Nequi — **Responsable:** Product Owner + Finanzas/Legal.
- Política de cancelación, anticipación y duración — **Responsable:** Product Owner.
- Retención, exportación y corrección de historias clínicas — **Responsable:** Legal + Seguridad.
- Roles definitivos y permisos administrativos — **Responsable:** Arquitecto de Seguridad.
- Proveedor y plantillas de notificaciones — **Responsable:** Product Owner + DevOps.

## Referencias
`ROADMAP.md`, `SPRINT_01.md`, `ARQUITECTURA.md`, `BASE_DATOS.md`, `API.md`, `SEGURIDAD.md`, `PLAN_PRUEBAS.md`.
