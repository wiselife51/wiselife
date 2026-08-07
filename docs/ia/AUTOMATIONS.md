# Automatizaciones event-driven

## Flujos prioritarios
- **Onboarding:** evento de alta → consentimiento → preferencias mínimas → recursos personalizados; detener si no hay consentimiento.
- **Diario emocional:** entrada del usuario → clasificación de tono/riesgo → reflexión segura → alerta humana solo con política y consentimiento.
- **Recordatorios:** cita próxima → preferencias de canal → aviso → confirmación; nunca duplicar.
- **No-show:** ausencia confirmada → mensaje empático → opciones de reprogramación → escalamiento si patrón o vulnerabilidad.
- **Referidos:** solicitud → resumen no clínico mínimo → asignación a profesional → trazabilidad.
- **Soporte:** consulta → clasificación → respuesta RAG → ticket si no resuelto.
- **Ingestión:** documento aprobado → pipeline RAG → evaluación → publicación controlada.
- **Monitoreo:** métrica/anomalía → alerta → pausa de modelo o flujo → revisión.

## Controles de ejecución
Cada evento tiene `event_id`, `tenant_id`, `actor_id` resuelto, `correlation_id`, `idempotency_key`, versión de flujo y timestamp. Usar outbox, deduplicación, retries con backoff y jitter, timeout, DLQ, replay controlado y límites de concurrencia. Acciones externas requieren idempotencia y compensación.

## Human-in-the-loop
Siempre para crisis, contenido clínico, cambios de expediente, comunicaciones sensibles, reembolsos, decisiones de acceso y publicación de conocimiento clínico. El humano ve evidencia, propuesta, política aplicable y puede aprobar/rechazar.

## Auditoría y métricas
Registrar estado, actor técnico, versión de prompt/modelo, herramientas, costo, duración y resultado resumido. Medir entrega, duplicados, retries, DLQ, errores por proveedor, tasa de escalamiento y daño evitado. Kill switch por agente, tenant y proveedor.
