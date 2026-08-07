# IA.md — WiseLife

**Propósito:** arquitectura de IA, modelos, agentes, automatizaciones, RAG e integraciones.
**Responsable:** Ingeniero de IA y Automatización. **Estado:** Propuesta; no hay funcionalidad IA clínica implementada.

## Principios
La IA no autoriza, persiste ni decide clínicamente. Backend valida identidad, consentimiento, política, contexto permitido y herramientas. El modelo trata texto recuperado como datos no confiables.

## Capas
Experiencia SPA; orquestación con router de intención/riesgo, prompts versionados y structured output; conocimiento con ingestión/embeddings/índice híbrido/citaciones; datos Supabase/RLS/auditoría; operación con retries, DLQ, evaluación, flags y kill switch.

## Flujo seguro
Autenticar → clasificar sensibilidad/riesgo → permitir/limitar/escalar → recuperar contexto ACL → ejecutar modelo → validar salida/acciones → registrar versión/latencia/costo/fuentes resumidos → feedback o derivación humana.

## Memoria y RAG
Conversación temporal; preferencias sólo con consentimiento; memoria clínica nunca implícita; documentos con ACL, frescura, citaciones y redacción PII/PHI. Entidades candidatas `ai_sessions`, `ai_messages`, `ai_consents`, `ai_runs`, `ai_tool_calls`, `knowledge_documents`, `knowledge_chunks`, `ai_feedback`, `automation_jobs` y `safety_events` no son migraciones aplicadas.

## Fuera de alcance
Diagnóstico, recomendación clínica autónoma y automatizaciones que modifiquen expediente sin revisión humana.

## Pendientes `[POR DEFINIR]`
Proveedor/modelos, presupuesto, retención, evaluación, base de conocimiento y criterios de escalamiento — **Responsable:** Ingeniero de IA + Seguridad + Legal.

## Referencias
`ARQUITECTURA.md`, `SEGURIDAD.md`, `API.md`, `PLAN_PRUEBAS.md`.
