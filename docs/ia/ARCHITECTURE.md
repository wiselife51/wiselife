# Arquitectura de referencia

## Objetivo
Añadir capacidades de IA sin mover la autorización, la persistencia ni la lógica clínica al modelo. La SPA solicita una capacidad; una capa backend valida identidad, consentimiento, políticas, contexto permitido, presupuesto y herramientas.

## Capas
1. **Experiencia:** SPA actual, streaming opcional, estados de consentimiento, feedback y derivación.
2. **Orquestación IA:** API de sesiones, router por intención/riesgo, prompts versionados, structured output, guardrails, políticas y tool broker.
3. **Conocimiento:** ingestión, extracción, embeddings, índice híbrido, reranking, citaciones y filtro ACL.
4. **Datos:** Supabase Auth, Postgres, RLS, Storage y auditoría. Entidades IA futuras son propuestas, no migraciones aplicadas.
5. **Operación:** colas, retries, DLQ, observabilidad, evaluación, feature flags y kill switch.

## Límites de confianza
- El cliente es no confiable: nunca entrega `user_id`, rol o permisos como autoridad.
- El backend verifica sesión y consentimiento con Supabase.
- RLS limita filas; el broker limita herramientas y campos.
- El modelo trata todo texto recuperado como datos no confiables, no como instrucciones.
- Los logs deben usar redacción PII/PHI y no guardar prompts clínicos completos por defecto.

## Flujo de una solicitud
1. Autenticar y resolver tenant/actor desde sesión.
2. Clasificar intención, sensibilidad, urgencia y riesgo.
3. Aplicar política: permitir, limitar, pedir consentimiento o escalar.
4. Recuperar únicamente contexto autorizado y fresco.
5. Ejecutar modelo con prompt versionado y esquema de salida.
6. Validar salida, acciones y enlaces antes de responder.
7. Registrar decisión, versión, latencia, costo, fuentes y resultado resumido.
8. Ofrecer corrección, feedback o derivación humana.

## Memoria
- **Conversación:** temporal y con retención limitada.
- **Preferencias:** solo con consentimiento, minimizadas y editables.
- **Clínica:** nunca memoria implícita; solo datos del expediente autorizado y propósito explícito.
- **Operativa:** eventos idempotentes y auditables.

## Entidades candidatas
`ai_sessions`, `ai_messages`, `ai_consents`, `ai_runs`, `ai_tool_calls`, `knowledge_documents`, `knowledge_chunks`, `ai_feedback`, `automation_jobs` y `safety_events`. Deben revisarse contra el esquema vivo, RLS y retención antes de migrar.

## No funcionales
Presupuesto por usuario y tarea, timeout por herramienta, circuit breaker por proveedor, streaming solo cuando sea seguro, cifrado en tránsito/reposo, trazas correlacionadas sin contenido sensible, rollback por prompt/modelo y disponibilidad degradada con respuestas deterministas.
