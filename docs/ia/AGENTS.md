# Agentes y asistentes

Todos los agentes son asistentes acotados; ninguno diagnostica, prescribe, reemplaza profesionales ni determina emergencias. El triage de crisis debe mostrar rutas humanas y emergencias configuradas por país.

| Agente | Misión | Entradas/salidas | Herramientas | Autonomía | Escalamiento |
|---|---|---|---|---|---|
| Bienestar | Acompañamiento, reflexión y hábitos seguros | contexto consentido → sugerencias, preguntas y recursos | RAG público/bienestar, perfil mínimo | Responde; no escribe clínica | señales de riesgo, petición clínica o baja confianza |
| Navegación/triage no clínico | Orientar hacia recursos y profesionales | necesidad → opciones explicadas | catálogo, disponibilidad, reglas | Puede recomendar rutas, no decidir diagnóstico | urgencia, ambigüedad o riesgo |
| Agenda | Reducir fricción de citas | preferencia → slots y confirmación | disponibilidad y notificaciones | Solo acciones confirmadas e idempotentes | conflictos, cancelaciones sensibles |
| Soporte | Resolver preguntas operativas | consulta → respuesta basada en políticas | RAG operativo, ticket | Puede clasificar/crear ticket | reembolso, queja, seguridad o baja confianza |
| Copiloto profesional | Resumir y preparar trabajo autorizado | expediente seleccionado → borrador con fuentes | RAG clínico restringido, resumen | Nunca publica ni modifica sin revisión | siempre requiere aprobación humana |
| Ingesta documental | Convertir fuentes aprobadas en conocimiento | documento → chunks, metadata, estado | Storage, parser, embeddings, validación | Puede procesar; no publica sin revisión | documento sensible, fallo OCR o conflicto |
| Evaluación/seguridad | Medir calidad y detectar abusos | trazas anonimizadas → score/incidente | datasets, clasificadores, alertas | Automático en sandbox; bloqueo por política | incidentes críticos a responsables |

## Contrato mínimo
Cada agente recibe `actor_context` resuelto por backend, `purpose`, `consent_scope`, `risk_level`, `locale`, `input` y `correlation_id`. Devuelve `answer`, `citations`, `confidence`, `next_step`, `safety_flags`, `requires_human` y `usage`; el backend valida el esquema.

## Herramientas permitidas
Catálogo de especialistas, disponibilidad, creación de ticket y recursos públicos son herramientas de bajo riesgo. Escritura de citas, mensajes, expediente, pagos o notificaciones requiere confirmación explícita, autorización de servidor, idempotency key y auditoría.

## Métricas
Resolución, derivación correcta, tasa de alucinación, groundedness, satisfacción, tiempo a primera respuesta, costo/run, errores de herramienta, eventos de seguridad y porcentaje de respuestas revisadas.
