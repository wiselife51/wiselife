# ROADMAP.md — WiseLife

**Propósito:** evolución del producto, versiones, objetivos y entregables.
**Responsable:** Product Owner. **Estado:** Requiere validación de fechas y alcance.

## Línea base
La documentación describe un MVP de atención psicológica: identidad, onboarding, descubrimiento, agenda, pagos reportados y operación clínica segura. No se cambian decisiones del producto durante esta consolidación.

## Fases

| Fase | Objetivo | Entregables | Dependencias |
|---|---|---|---|
| MVP-1 | Acceso y descubrimiento | Auth, perfiles, onboarding, catálogo, perfil profesional y disponibilidad | Supabase Auth, RLS, UX |
| MVP-2 | Reserva y operación | Horarios, reserva atómica, pago, citas, agenda, cancelación y notificaciones | Reglas de agenda y pagos |
| MVP-3 | Operación clínica | Historia, notas, CIE-10, auditoría, consentimientos y administración | Legal, Seguridad, QA |
| Evolución | Escala controlada | Cache, observabilidad, evaluación IA y automatizaciones seguras | Validación técnica |

## Release gates
Cada fase requiere criterios de aceptación del backlog, pruebas P0/P1 verdes, revisión de seguridad, documentación actualizada y despliegue trazable a PR, commit y Vercel.

## Fuera de roadmap actual
Videollamada propia, chat clínico en tiempo real, app nativa, IA clínica, suscripciones, cuentas familiares e integraciones empresariales.

## Pendientes `[POR DEFINIR]`
Fechas objetivo, métricas de éxito, proveedor de notificaciones y definición final de la política de pagos — **Responsable:** Product Owner.

## Referencias
`PRODUCT_BACKLOG.md`, `SPRINT_01.md`, `PLAN_PRUEBAS.md`, `DEVOPS.md`.
