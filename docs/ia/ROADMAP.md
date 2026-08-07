# Roadmap

## Fase 0 — Fundación
Catálogo de datos y consentimiento, gateway, contratos estructurados, redacción, observabilidad, evaluación base, RLS revisado y kill switch. **Salida:** threat model, dataset anonimizado y controles aprobados.

## Fase 1 — Bienestar no clínico
Asistente de bienestar con RAG público, recursos por región, derivación segura y feedback. **Salida:** groundedness, rechazo y crisis evaluados; sin escritura clínica.

## Fase 2 — Operación
Soporte, navegación y agenda con herramientas idempotentes, notificaciones y escalamiento. **Salida:** auditoría completa, duplicados controlados y rollback probado.

## Fase 3 — Automatización interna
Onboarding, recordatorios, no-show, ingestión y monitoreo event-driven. **Salida:** DLQ, replay, budgets y responsables operativos.

## Fase 4 — Copiloto profesional
Resumen y preparación para profesionales autorizados, solo borradores con fuentes y aprobación humana. **Salida:** revisión clínica, pruebas de sesgo, control de expediente y consentimiento.

## Fase 5 — RAG clínico restringido
Índices segregados, permisos por paciente/rol/propósito y trazabilidad reforzada. **Salida:** validación legal/clínica, seguridad independiente y operación degradada segura.

## Riesgos principales
Alucinación, falsa tranquilidad en crisis, fuga cross-tenant, dependencia de proveedor, costos descontrolados, sesgo por idioma/región, automatización duplicada y retención excesiva.

## Métricas
Producto: activación, resolución, satisfacción y derivación. IA: groundedness, exactitud, rechazo seguro, recall de riesgo, citación y costo. Operación: p95, disponibilidad, tool errors, DLQ, incidentes y tiempo de recuperación.

## Preguntas abiertas
Reconciliar esquema/RLS vivo; definir responsable clínico; confirmar países y rutas de emergencia; aprobar retención/consentimiento; elegir proveedor bajo DPA; decidir si vectorial vive en Supabase o servicio dedicado.
