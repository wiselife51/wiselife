# Modelos recomendados

La selección es por tarea y evidencia, no por marca. Debe operar mediante un gateway/proveedor agnóstico con límites, observabilidad, fallback y evaluación; no se fijan secretos ni claves en código.

| Tarea | Perfil recomendado | Criterio de elección | Fallback |
|---|---|---|---|
| Clasificación, routing y FAQ | modelo rápido pequeño | latencia, español, costo y JSON válido | reglas deterministas |
| Conversación de bienestar | modelo general rápido | tono seguro, groundedness y rechazo correcto | plantilla segura + recursos |
| Resumen profesional | modelo de razonamiento | fidelidad, citaciones, contexto largo | modelo general con revisión |
| Embeddings | modelo multilingüe | recall español, costo y aislamiento | reindexación con modelo aprobado |
| Reranker | cross-encoder multilingüe | precision de fuentes sensibles | búsqueda híbrida sin rerank |
| Moderación/riesgo | clasificador dedicado + reglas | recall de crisis y abuso, calibración | escalamiento conservador |
| Voz futura | ASR/TTS con retención mínima | consentimiento, español regional, privacidad | canal texto |

## Política de selección
Benchmark con tráfico representativo anonimizado, presupuesto por caso, p50/p95 de latencia, calidad en español, tasa de JSON válido, costo por 1.000 ejecuciones, disponibilidad, residencia y uso de datos para entrenamiento. Cambios requieren evaluación offline, canary y rollback.

## Optimización
Prompts compactos y reutilizables, cache de respuestas no sensibles, contexto top-k limitado, summarization de conversación, batch para evaluación/embeddings, tool calls solo cuando aporten valor y budgets por usuario/tenant.

## Guardrails
Temperature baja para clasificación, schema validation, límites de tokens, timeout, circuit breaker, redacción de PII antes del proveedor cuando sea posible, no retención por defecto y registro de modelo/versión sin contenido sensible.
